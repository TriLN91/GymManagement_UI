import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { SessionAssignmentDto } from '../api/types';
import { errorText } from '../model/format';
import { useRequestTrainerChange, useRespondTrainerChange } from '../model/useAppointments';

import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

function AssignmentChange({ assignment }: { assignment: SessionAssignmentDto }) {
  const { t } = useTranslation('appointments');
  const request = useRequestTrainerChange();
  const respond = useRespondTrainerChange();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const change = assignment.openTrainerChange;

  const send = async () => {
    try {
      await request.mutateAsync({ assignmentId: assignment.id, reason });
      toast.success(t('trainerChange.sent'));
      setOpen(false);
      setReason('');
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  const answer = async (accept: boolean) => {
    if (!change) return;
    try {
      await respond.mutateAsync({ changeId: change.id, accept });
      toast.success(accept ? t('trainerChange.accepted') : t('trainerChange.declined'));
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  return (
    <div className="appointment-trainer-change">
      <h3>{assignment.trainerName}</h3>
      {change?.status === 'PendingManager' ? <p>{t('trainerChange.waitingManager')}</p> : null}
      {change?.status === 'PendingMember' ? (
        <>
          <p>{t('trainerChange.proposed', { name: change.proposedTrainerName ?? '' })}</p>
          <p className="appointment-hint">{t('trainerChange.carryOver')}</p>
          <div className="appointment-actions">
            <Button size="sm" disabled={respond.isPending} onClick={() => void answer(true)}>
              {t('trainerChange.accept')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={respond.isPending}
              onClick={() => void answer(false)}
            >
              {t('trainerChange.decline')}
            </Button>
          </div>
        </>
      ) : null}
      {!change ? (
        open ? (
          <form
            className="appointment-form"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <label>
              {t('trainerChange.reason')}
              <Textarea
                required
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <div className="appointment-actions">
              <Button type="submit" size="sm" disabled={request.isPending}>
                {t('trainerChange.submit')}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
                {t('action.back')}
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {t('trainerChange.request')}
          </Button>
        )
      ) : null}
    </div>
  );
}

/** Member asks for another Trainer and confirms the one the gym proposes (CF04 BF05). */
export function TrainerChangePanel({ assignments }: { assignments: SessionAssignmentDto[] }) {
  const { t } = useTranslation('appointments');
  if (assignments.length === 0) return null;
  return (
    <section className="appointment-section" aria-label={t('trainerChange.heading')}>
      <h2>{t('trainerChange.heading')}</h2>
      {assignments.map((item) => (
        <AssignmentChange key={item.id} assignment={item} />
      ))}
    </section>
  );
}
