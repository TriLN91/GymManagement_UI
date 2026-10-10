import { Dumbbell, Film, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { TrainerExercise } from '@/features/trainer-workspace';
import { getExerciseGoal, useTrainerText } from '@/features/trainer-workspace';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

export function TrainerExerciseArtwork({
  exercise,
  compact = false,
}: {
  exercise: TrainerExercise;
  compact?: boolean;
}) {
  const tr = useTrainerText();
  return (
    <span
      className={`trainer-exercise-artwork trainer-exercise-artwork--${exercise.id}${compact ? 'is-compact' : ''}`}
    >
      {exercise.imageUrl ? (
        <img
          src={exercise.imageUrl}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.hidden = true;
            event.currentTarget.nextElementSibling?.removeAttribute('hidden');
          }}
        />
      ) : null}
      <span className="trainer-exercise-artwork__fallback" hidden={Boolean(exercise.imageUrl)}>
        <Dumbbell aria-hidden="true" />
        {!compact && <small>{tr(exercise.muscle)}</small>}
      </span>
      <span className="trainer-exercise-artwork__play" aria-hidden="true">
        <Play fill="currentColor" />
      </span>
    </span>
  );
}

export function TrainerExercisePreviewDialog({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: TrainerExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const tr = useTrainerText();
  if (!exercise) return null;
  const muscles = [exercise.muscle, ...(exercise.secondaryMuscles ?? [])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="trainer-exercise-preview-dialog">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          <DialogDescription>
            {exercise.equipment} · {exercise.difficulty} · {getExerciseGoal(exercise)}
          </DialogDescription>
        </DialogHeader>
        <div className="trainer-exercise-preview-dialog__media">
          {exercise.previewVideoUrl ? (
            <video
              src={exercise.previewVideoUrl}
              poster={exercise.imageUrl}
              autoPlay
              muted
              loop
              playsInline
              controls
              onTimeUpdate={(event) => {
                if (event.currentTarget.currentTime >= 5) event.currentTarget.currentTime = 0;
              }}
              aria-label={t('trainer:trainerExerciseMedia.nameDemonstrationVideo', {
                name: exercise.name,
              })}
            />
          ) : (
            <div className="trainer-exercise-preview-dialog__fallback">
              <Film aria-hidden="true" />
              <strong>{t('trainer:trainerExerciseMedia.previewVideoUnavailable')}</strong>
              <span>{t('trainer:trainerExerciseMedia.theCurrentExerciseData')}</span>
            </div>
          )}
        </div>
        <div className="trainer-exercise-preview-dialog__meta">
          {muscles.slice(0, 3).map((muscle) => (
            <span key={muscle}>{tr(muscle)}</span>
          ))}
        </div>
        {exercise.description ? <p>{exercise.description}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
