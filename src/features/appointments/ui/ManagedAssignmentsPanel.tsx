import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { ManagedAssignmentDto } from '../api/types';
import { errorText } from '../model/format';
import { useManagedAssignments, useProposeTrainerChange } from '../model/useAppointments';

import { useOwnerTrainers } from '@/features/gym-owner-training';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import './appointments.css';

function ManagedRow({ assignment }: { assignment: ManagedAssignmentDto }) {
  const { t } = useTranslation('appointments');
  const trainers = useOwnerTrainers();
  const propose = useProposeTrainerChange();
  const [open, setOpen] = useState(false);
  const [trainerId, setTrainerId] = useState('');
  const [reason, setReason] = useState('');
  const change = assignment.openTrainerChange;

  const candidates = (trainers.data ?? []).filter(
    (trainer) =>
      trainer.status === 'Active' && trainer.trainerProfileId !== assignment.trainerProfileId,
  );

  const submit = async () => {
    try {
      await propose.mutateAsync({
        assignmentId: assignment.id,
        body: {
          newTrainerProfileId: trainerId,
          reason: reason.trim() || undefined,
          changeId: change?.status === 'PendingManager' ? change.id : undefined,
        },
      });
      toast.success(t('managed.proposed'));
      setOpen(false);
      setTrainerId('');
      setReason('');
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  return (
    <article className="appointment-card" data-testid="managed-assignment">
      <header>
        <div>
          <h3>{assignment.memberName}</h3>
          <p>
            {assignment.trainerName}
            {assignment.gymBranchName
              ? ` · ${t('managed.branch', { name: assignment.gymBranchName })}`
              : ''}
          </p>
        </div>
        <span className="appointment-status">
          {assignment.totalSessions === 0
            ? t('managed.unlimited', { used: assignment.sessionsUsed })
            : t('managed.sessions', {
                used: assignment.sessionsUsed,
                total: assignment.totalSessions,
              })}
        </span>
      </header>
      {change?.status === 'PendingManager' ? (
        <p className="appointment-note">
          {t('managed.memberRequested', { reason: change.reason })}
        </p>
      ) : null}
      {change?.status === 'PendingMember' ? (
        <p className="appointment-note">
          {t('managed.awaitingMember', { name: change.proposedTrainerName ?? '' })}
        </p>
      ) : null}

      {change?.status === 'PendingMember' || assignment.status !== 'Active' ? null : open ? (
        <form
          className="appointment-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label>
            {t('managed.newTrainer')}
            <Select
              required
              value={trainerId}
              onChange={(event) => setTrainerId(event.target.value)}
            >
              <option value="">{t('managed.pick')}</option>
              {candidates.map((trainer) => (
                <option key={trainer.trainerProfileId} value={trainer.trainerProfileId}>
                  {trainer.fullName}
                </option>
              ))}
            </Select>
          </label>
          <label>
            {t('managed.reason')}
            <Textarea
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <div className="appointment-actions">
            <Button type="submit" size="sm" disabled={propose.isPending || trainerId === ''}>
              {t('managed.submit')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
              {t('action.back')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="appointment-actions">
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {t('managed.change')}
          </Button>
        </div>
      )}
    </article>
  );
}

/** Assignments of the Gym Admin's / Branch Manager's branches, with the change-Trainer action (CF04 BF05). */
export function ManagedAssignmentsPanel() {
  const { t } = useTranslation('appointments');
  const managed = useManagedAssignments();

  return (
    <section className="appointment-section" aria-label={t('managed.heading')}>
      <h2>{t('managed.heading')}</h2>
      {managed.isPending ? <p role="status">{t('managed.loading')}</p> : null}
      {managed.isError ? <p role="alert">{t('managed.error')}</p> : null}
      {managed.isSuccess && managed.data.length === 0 ? <p>{t('managed.empty')}</p> : null}
      {managed.data?.map((item) => (
        <ManagedRow key={item.id} assignment={item} />
      ))}
    </section>
  );
}
