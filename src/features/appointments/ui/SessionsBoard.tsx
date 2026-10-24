import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { AppointmentDto, SessionAssignmentDto } from '../api/types';
import { errorText, formatDate, formatDateTime, localInputToUtcIso } from '../model/format';
import {
  useAssignmentAvailability,
  useMyAppointments,
  useProposeAppointment,
  useSessionAssignments,
} from '../model/useAppointments';

import { AppointmentCard } from './AppointmentCard';
import { PlanFeedbackPanel } from './PlanFeedbackPanel';
import { TrainerChangePanel } from './TrainerChangePanel';

import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import './appointments.css';

type Role = 'Member' | 'Trainer';

function AssignmentSummary({
  assignment,
  role,
  locale,
}: {
  assignment: SessionAssignmentDto;
  role: Role;
  locale: string;
}) {
  const { t } = useTranslation('appointments');
  return (
    <li className="appointment-package">
      <strong>{role === 'Trainer' ? assignment.memberName : assignment.trainerName}</strong>
      <span>
        {t('assignments.period', {
          from: formatDate(assignment.startsAtUtc, locale),
          to: formatDate(assignment.endsAtUtc, locale),
        })}
      </span>
      <span>
        {assignment.sessionsRemaining === null
          ? t('assignments.unlimited', { used: assignment.sessionsUsed })
          : t('assignments.remaining', {
              count: assignment.sessionsRemaining,
              used: assignment.sessionsUsed,
              total: assignment.totalSessions,
            })}
      </span>
      <span>{t('assignments.minNotice', { hours: assignment.minNoticeHours })}</span>
    </li>
  );
}

function ProposeForm({
  assignments,
  makeupOf,
  locale,
  onDone,
}: {
  assignments: SessionAssignmentDto[];
  /** The session this proposal replaces (not charged); null for a normal proposal. */
  makeupOf: AppointmentDto | null;
  locale: string;
  onDone: () => void;
}) {
  const { t } = useTranslation('appointments');
  const propose = useProposeAppointment();
  const formRef = useRef<HTMLFormElement>(null);
  const [assignmentId, setAssignmentId] = useState(
    makeupOf?.coachingAssignmentId ?? assignments[0]?.id ?? '',
  );
  const [when, setWhen] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const availability = useAssignmentAvailability(assignmentId);

  useEffect(() => {
    if (makeupOf) formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [makeupOf]);

  const submit = async () => {
    try {
      await propose.mutateAsync({
        coachingAssignmentId: assignmentId,
        scheduledAtUtc: localInputToUtcIso(when),
        durationMinutes: duration,
        notes: notes.trim() || undefined,
        makeupOfAppointmentId: makeupOf?.id,
      });
      toast.success(t('propose.sent'));
      setWhen('');
      setNotes('');
      onDone();
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  const slots = availability.data?.slots ?? [];

  return (
    <form
      ref={formRef}
      className="appointment-form appointment-propose"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2>{t('propose.heading')}</h2>
      {makeupOf ? (
        <p className="appointment-note" role="status">
          {t('propose.makeupFor', { when: formatDateTime(makeupOf.scheduledAtUtc, locale) })}{' '}
          <Button type="button" size="sm" variant="outline" onClick={onDone}>
            {t('propose.makeupCancel')}
          </Button>
        </p>
      ) : null}
      {assignments.length > 1 ? (
        <label>
          {t('propose.assignment')}
          <Select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>
            {assignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.memberName} · {item.trainerName}
              </option>
            ))}
          </Select>
        </label>
      ) : null}
      <label>
        {t('propose.when')}
        <Input
          type="datetime-local"
          required
          value={when}
          onChange={(event) => setWhen(event.target.value)}
        />
      </label>
      <label>
        {t('propose.duration')}
        <Input
          type="number"
          min={15}
          max={240}
          step={15}
          required
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
        />
      </label>
      <label>
        {t('propose.notes')}
        <Textarea
          maxLength={1000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <p className="appointment-hint">
        {slots.length === 0
          ? t('propose.noAvailability')
          : `${t('propose.availability')}: ${slots
              .map((s) => `${t(`propose.dayShort.${s.dayOfWeek}`)} ${s.startTime}–${s.endTime}`)
              .join(', ')}`}
      </p>
      <Button type="submit" disabled={propose.isPending || assignmentId === ''}>
        {t('propose.submit')}
      </Button>
    </form>
  );
}

function groupAppointments(items: AppointmentDto[]) {
  const awaiting = items.filter((a) => a.awaitingMyResponse || a.pendingChange?.awaitingMyResponse);
  const awaitingIds = new Set(awaiting.map((a) => a.id));
  const rest = items.filter((a) => !awaitingIds.has(a.id));
  const upcoming = rest.filter((a) => ['Proposed', 'Scheduled', 'Reassigned'].includes(a.status));
  const history = rest.filter((a) => !upcoming.includes(a));
  const byTime = (x: AppointmentDto, y: AppointmentDto) =>
    x.scheduledAtUtc.localeCompare(y.scheduledAtUtc);
  return {
    awaiting: awaiting.sort(byTime),
    upcoming: upcoming.sort(byTime),
    history: history.sort((x, y) => byTime(y, x)),
  };
}

/** Sessions of the signed-in Member or Trainer, with the form to propose a new one. */
export function SessionsBoard({ role }: { role: Role }) {
  const { t } = useTranslation('appointments');
  const { locale } = useLocale();
  const appointments = useMyAppointments();
  const assignments = useSessionAssignments();
  const [makeup, setMakeup] = useState<AppointmentDto | null>(null);

  const active = (assignments.data ?? []).filter((a) => a.status === 'Active');
  const groups = groupAppointments(appointments.data ?? []);

  return (
    <div className="appointments-page">
      <h1>{role === 'Member' ? t('title.member') : t('title.trainer')}</h1>

      <section className="appointment-section">
        <h2>{t('assignments.heading')}</h2>
        {assignments.isPending ? (
          <p role="status">{t('list.loading')}</p>
        ) : active.length === 0 ? (
          <p>{t('assignments.empty')}</p>
        ) : (
          <ul className="appointment-packages">
            {active.map((item) => (
              <AssignmentSummary key={item.id} assignment={item} role={role} locale={locale} />
            ))}
          </ul>
        )}
      </section>

      {active.length > 0 ? (
        <ProposeForm
          key={`${active[0]?.id}-${makeup?.id ?? ''}`}
          assignments={active}
          makeupOf={makeup}
          locale={locale}
          onDone={() => setMakeup(null)}
        />
      ) : null}

      {appointments.isPending ? <p role="status">{t('list.loading')}</p> : null}
      {appointments.isError ? <p role="alert">{t('list.error')}</p> : null}
      {appointments.isSuccess && appointments.data.length === 0 ? <p>{t('list.empty')}</p> : null}

      {(['awaiting', 'upcoming', 'history'] as const).map((key) =>
        groups[key].length > 0 ? (
          <section key={key} className="appointment-section" aria-label={t(`list.${key}`)}>
            <h2>{t(`list.${key}`)}</h2>
            {groups[key].map((item) => (
              <AppointmentCard
                key={item.id}
                appointment={item}
                role={role}
                locale={locale}
                onBookMakeup={setMakeup}
              />
            ))}
          </section>
        ) : null,
      )}

      <PlanFeedbackPanel role={role} assignments={active} locale={locale} />

      {role === 'Member' ? <TrainerChangePanel assignments={active} /> : null}
    </div>
  );
}
