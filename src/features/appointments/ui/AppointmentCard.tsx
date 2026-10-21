import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { AppointmentDto } from '../api/types';
import { errorText, formatDateTime, localInputToUtcIso } from '../model/format';
import {
  useAcceptAppointment,
  useAnswerReschedule,
  useCancelAppointment,
  useCompleteAppointment,
  useConsentReassign,
  useDeclineAppointment,
  useNoShowAppointment,
  useRescheduleAppointment,
  useTrainerNoShowAppointment,
} from '../model/useAppointments';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type Role = 'Member' | 'Trainer';
type Panel = 'cancel' | 'reschedule' | null;

interface Props {
  appointment: AppointmentDto;
  role: Role;
  locale: string;
  /** Called when the user wants to book the replacement for a session that has `needsMakeup`. */
  onBookMakeup?: (appointment: AppointmentDto) => void;
}

/** One session with the actions the signed-in Member or Trainer may take on it. */
export function AppointmentCard({ appointment, role, locale, onBookMakeup }: Props) {
  const { t } = useTranslation('appointments');
  const [panel, setPanel] = useState<Panel>(null);
  const [reason, setReason] = useState('');
  const [newTime, setNewTime] = useState('');
  const [emergency, setEmergency] = useState(false);

  const accept = useAcceptAppointment();
  const decline = useDeclineAppointment();
  const cancel = useCancelAppointment();
  const complete = useCompleteAppointment();
  const noShow = useNoShowAppointment();
  const trainerNoShow = useTrainerNoShowAppointment();
  const reschedule = useRescheduleAppointment();
  const answer = useAnswerReschedule();
  const consent = useConsentReassign();

  const a = appointment;
  const change = a.pendingChange;
  const isTrainer = role === 'Trainer';
  const busy =
    accept.isPending ||
    decline.isPending ||
    cancel.isPending ||
    complete.isPending ||
    noShow.isPending ||
    trainerNoShow.isPending ||
    reschedule.isPending ||
    answer.isPending ||
    consent.isPending;
  const open = a.status === 'Scheduled' || a.status === 'Proposed' || a.status === 'Reassigned';
  const started = new Date(a.scheduledAtUtc).getTime() <= Date.now();

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
      setPanel(null);
      setReason('');
      setNewTime('');
      setEmergency(false);
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  return (
    <article className={`appointment-card is-${a.status.toLowerCase()}`} data-testid="appointment">
      <header>
        <div>
          <h3>{formatDateTime(a.scheduledAtUtc, locale)}</h3>
          <p>
            {isTrainer ? a.memberName : t('list.with', { name: a.trainerName })}
            {' · '}
            {t('list.duration', { minutes: a.durationMinutes })}
          </p>
        </div>
        <span className="appointment-status">{t(`status.${a.status}`)}</span>
      </header>

      {a.status === 'Proposed' && a.proposedByRole ? (
        <p className="appointment-note">
          {t('list.proposedBy', { role: t(`role.${a.proposedByRole}`, a.proposedByRole) })}
        </p>
      ) : null}
      {a.isReassigned && a.status === 'Reassigned' ? (
        <p className="appointment-note">
          {t('list.substitute', { name: a.originalTrainerName })}
          {a.reassignmentReason ? ` · ${a.reassignmentReason}` : ''}
        </p>
      ) : null}
      {a.notes ? <p className="appointment-note">{a.notes}</p> : null}
      {a.makeupOfAppointmentId ? <p className="appointment-note">{t('list.makeupOf')}</p> : null}
      {a.needsMakeup ? (
        <p className="appointment-note" role="status">
          {t('list.needsMakeup')}
        </p>
      ) : null}
      {a.status === 'Cancelled' && a.cancelReason ? (
        <p className="appointment-note">{t('list.cancelReason', { reason: a.cancelReason })}</p>
      ) : null}
      {!open ? (
        <p className="appointment-note">{a.consumedSession ? t('list.charged') : t('list.free')}</p>
      ) : null}

      {change ? (
        <div className="appointment-change" role="group">
          <p>
            {t('change.pending', {
              from: formatDateTime(change.oldScheduledAtUtc, locale),
              to: formatDateTime(change.newScheduledAtUtc, locale),
            })}
            {change.isEmergency ? ` (${t('change.emergency')})` : ''}
          </p>
          <p>{t('change.reason', { reason: change.reason })}</p>
          {change.awaitingMyResponse ? (
            <div className="appointment-actions">
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  run(
                    () => answer.mutateAsync({ changeId: change.id, action: 'accept' }),
                    t('toast.rescheduleAccepted'),
                  )
                }
              >
                {t('action.accept')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    () => answer.mutateAsync({ changeId: change.id, action: 'decline' }),
                    t('toast.rescheduleDeclined'),
                  )
                }
              >
                {t('action.decline')}
              </Button>
            </div>
          ) : (
            <div className="appointment-actions">
              <small>{t('change.waiting')}</small>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    () => answer.mutateAsync({ changeId: change.id, action: 'withdraw' }),
                    t('toast.rescheduleWithdrawn'),
                  )
                }
              >
                {t('action.withdraw')}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {panel ? (
        <form
          className="appointment-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (panel === 'cancel') {
              void run(
                () => cancel.mutateAsync({ id: a.id, body: { reason, isEmergency: emergency } }),
                t('toast.cancelled'),
              );
            } else {
              void run(
                () =>
                  reschedule.mutateAsync({
                    id: a.id,
                    body: {
                      newScheduledAtUtc: localInputToUtcIso(newTime),
                      reason,
                      isEmergency: emergency,
                    },
                  }),
                t('toast.rescheduleSent'),
              );
            }
          }}
        >
          {panel === 'reschedule' ? (
            <label>
              {t('action.newTime')}
              <Input
                type="datetime-local"
                required
                value={newTime}
                onChange={(event) => setNewTime(event.target.value)}
              />
            </label>
          ) : null}
          <label>
            {t('action.reason')}
            <Textarea
              required
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          {isTrainer ? (
            <label className="appointment-check">
              <input
                type="checkbox"
                checked={emergency}
                onChange={(event) => setEmergency(event.target.checked)}
              />
              {t('action.emergency')}
            </label>
          ) : null}
          <div className="appointment-actions">
            <Button type="submit" size="sm" disabled={busy}>
              {t('action.confirm')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPanel(null)}>
              {t('action.back')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="appointment-actions">
          {a.status === 'Proposed' && a.awaitingMyResponse ? (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => run(() => accept.mutateAsync(a.id), t('toast.accepted'))}
              >
                {t('action.accept')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => run(() => decline.mutateAsync({ id: a.id }), t('toast.declined'))}
              >
                {t('action.decline')}
              </Button>
            </>
          ) : null}
          {a.status === 'Reassigned' && a.awaitingMyResponse ? (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  run(() => consent.mutateAsync({ id: a.id, accept: true }), t('toast.accepted'))
                }
              >
                {t('action.accept')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(() => consent.mutateAsync({ id: a.id, accept: false }), t('toast.declined'))
                }
              >
                {t('action.decline')}
              </Button>
            </>
          ) : null}
          {a.status === 'Scheduled' && !change ? (
            <>
              {isTrainer && started ? (
                <>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => run(() => complete.mutateAsync(a.id), t('toast.completed'))}
                  >
                    {t('action.complete')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => run(() => noShow.mutateAsync(a.id), t('toast.noShow'))}
                  >
                    {t('action.noShow')}
                  </Button>
                </>
              ) : null}
              {!started ? (
                <Button size="sm" variant="outline" onClick={() => setPanel('reschedule')}>
                  {t('action.reschedule')}
                </Button>
              ) : null}
            </>
          ) : null}
          {a.needsMakeup && onBookMakeup && role === 'Member' ? (
            <Button size="sm" disabled={busy} onClick={() => onBookMakeup(a)}>
              {t('action.bookMakeup')}
            </Button>
          ) : null}
          {!isTrainer && a.status === 'Scheduled' && started && !change ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => run(() => trainerNoShow.mutateAsync(a.id), t('toast.trainerNoShow'))}
            >
              {t('action.reportTrainerNoShow')}
            </Button>
          ) : null}
          {open && !started ? (
            <Button size="sm" variant="outline" onClick={() => setPanel('cancel')}>
              {t('action.cancel')}
            </Button>
          ) : null}
        </div>
      )}
    </article>
  );
}
