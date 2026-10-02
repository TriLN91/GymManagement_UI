import { ArrowLeft, CheckCircle2, CircleAlert, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useGymOwnerTrainingStore } from '../model/useGymOwnerTrainingStore';

import { gymOwnerTrainingCopy } from './copy';
import { OperationalBadge, TrainerAvatar } from './TrainingShared';

import { ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Select } from '@/shared/ui/select';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

import './gym-owner-training.css';

export function GymOwnerAssignmentExceptionsPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = gymOwnerTrainingCopy[isVi ? 'vi' : 'en'];
  const trainers = useGymOwnerTrainingStore((state) => state.trainers);
  const exceptions = useGymOwnerTrainingStore((state) => state.assignmentExceptions);
  const resolveException = useGymOwnerTrainingStore((state) => state.resolveAssignmentException);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  const activeTrainers = trainers.filter(
    (trainer) => trainer.approvalStatus === 'approved' && trainer.operationalStatus === 'active',
  );
  const orderedExceptions = [...exceptions].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const confirming = exceptions.find((item) => item.id === confirmationId);
  const confirmingTrainer = activeTrainers.find(
    (trainer) => trainer.id === (confirmationId ? selection[confirmationId] : ''),
  );

  const trainerName = (trainerId: string | null) =>
    trainers.find((trainer) => trainer.id === trainerId)?.fullName ?? '—';

  return (
    <WorkspacePage width="wide" className="gym-training-page">
      <h1 className="sr-only">{copy.assignmentExceptions}</h1>
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.pts}>
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.back}
          </Link>
        </Button>
      </div>

      <div className="gym-assignment-exception-list">
        {orderedExceptions.map((exception) => {
          const isOpen = exception.status === 'open';
          return (
            <WorkspacePanel key={exception.id} className={isOpen ? 'is-priority' : undefined}>
              <div className="gym-training-section-head gym-assignment-exception-head">
                <div>
                  {isOpen ? (
                    <CircleAlert aria-hidden="true" size={19} />
                  ) : (
                    <CheckCircle2 aria-hidden="true" size={19} />
                  )}
                  <strong>{exception.memberName}</strong>
                </div>
                <Badge variant={isOpen ? 'destructive' : 'accent'}>
                  {isOpen ? copy.exceptionOpen : copy.exceptionResolved}
                </Badge>
              </div>
              <WorkspacePanelContent className="gym-assignment-exception-content">
                <dl className="gym-assignment-facts">
                  <div>
                    <dt>{copy.member}</dt>
                    <dd>
                      <strong>{exception.memberName}</strong>
                      <span>{exception.memberEmail}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>{copy.packages}</dt>
                    <dd>{exception.packageName}</dd>
                  </div>
                  <div>
                    <dt>{copy.originalTrainer}</dt>
                    <dd>{trainerName(exception.originalTrainerId)}</dd>
                  </div>
                  <div>
                    <dt>{copy.exceptionOpen}</dt>
                    <dd>{copy.exceptionReason[exception.reason]}</dd>
                  </div>
                </dl>

                {isOpen ? (
                  <div className="gym-assignment-resolution">
                    <label htmlFor={`replacement-${exception.id}`}>{copy.replacementTrainer}</label>
                    <Select
                      id={`replacement-${exception.id}`}
                      value={selection[exception.id] ?? ''}
                      onChange={(event) =>
                        setSelection((current) => ({
                          ...current,
                          [exception.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">{copy.chooseTrainer}</option>
                      {activeTrainers
                        .filter((trainer) => trainer.id !== exception.originalTrainerId)
                        .map((trainer) => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.fullName}
                          </option>
                        ))}
                    </Select>
                    <Button
                      type="button"
                      disabled={!selection[exception.id]}
                      onClick={() => setConfirmationId(exception.id)}
                    >
                      <UserRoundCheck aria-hidden="true" size={16} />
                      {copy.confirmAssignment}
                    </Button>
                  </div>
                ) : (
                  <div className="gym-assignment-resolved-trainer">
                    <span>{copy.replacementTrainer}</span>
                    {(() => {
                      const replacement = trainers.find(
                        (trainer) => trainer.id === exception.replacementTrainerId,
                      );
                      return replacement ? (
                        <div>
                          <TrainerAvatar
                            name={replacement.fullName}
                            source={replacement.avatarDataUrl}
                          />
                          <strong>{replacement.fullName}</strong>
                          <OperationalBadge status={replacement.operationalStatus} copy={copy} />
                        </div>
                      ) : (
                        <strong>—</strong>
                      );
                    })()}
                  </div>
                )}
              </WorkspacePanelContent>
            </WorkspacePanel>
          );
        })}
      </div>

      <Dialog
        open={Boolean(confirming && confirmingTrainer)}
        onOpenChange={(open) => {
          if (!open) setConfirmationId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.resolveTitle}</DialogTitle>
            <DialogDescription>{copy.resolveBody}</DialogDescription>
          </DialogHeader>
          {confirming && confirmingTrainer ? (
            <div className="gym-assignment-confirmation">
              <span>{confirming.memberName}</span>
              <strong>→</strong>
              <span>{confirmingTrainer.fullName}</span>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {copy.cancel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                if (
                  confirming &&
                  confirmingTrainer &&
                  resolveException(confirming.id, confirmingTrainer.id)
                ) {
                  toast.success(copy.assignmentResolved);
                }
                setConfirmationId(null);
              }}
            >
              {copy.confirmAssignment}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
