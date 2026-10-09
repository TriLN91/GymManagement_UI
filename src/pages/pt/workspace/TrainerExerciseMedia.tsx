import { Dumbbell, Film, Play } from 'lucide-react';

import type { TrainerExercise } from '@/features/trainer-workspace';
import { getExerciseGoal } from '@/features/trainer-workspace';
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
        {!compact && <small>{exercise.muscle}</small>}
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
  lang,
}: {
  exercise: TrainerExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: 'vi' | 'en';
}) {
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
              aria-label={
                lang === 'vi'
                  ? `Video hướng dẫn ${exercise.name}`
                  : `${exercise.name} demonstration video`
              }
            />
          ) : (
            <div className="trainer-exercise-preview-dialog__fallback">
              <Film aria-hidden="true" />
              <strong>
                {lang === 'vi' ? 'Chưa có video hướng dẫn' : 'Preview video unavailable'}
              </strong>
              <span>
                {lang === 'vi'
                  ? 'Dữ liệu bài tập hiện chưa cung cấp video 16:9.'
                  : 'The current exercise data does not include a 16:9 preview video.'}
              </span>
            </div>
          )}
        </div>
        <div className="trainer-exercise-preview-dialog__meta">
          {muscles.slice(0, 3).map((muscle) => (
            <span key={muscle}>{muscle}</span>
          ))}
        </div>
        {exercise.description ? <p>{exercise.description}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
