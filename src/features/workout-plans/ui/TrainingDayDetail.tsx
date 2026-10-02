import { ArrowRight, Clock3, Dumbbell, Gauge, Layers3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { getWorkoutDay } from '../model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type { WorkoutExercise } from '../model/workoutFlowTypes';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import {
  memberExerciseCatalog,
  useMemberWorkoutBuilderStore,
  type BuilderExercise,
  type ExerciseCatalogItem,
  type Weekday,
} from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';
import { ROUTES } from '@/shared/config/constants';

function targetLabel(exercise: WorkoutExercise) {
  if (exercise.trackingType === 'strength')
    return `${exercise.target.sets} × ${exercise.target.reps} @ ${exercise.target.loadKg} kg`;
  if (exercise.trackingType === 'duration')
    return `${exercise.target.sets} × ${exercise.target.durationSeconds} sec`;
  if (exercise.trackingType === 'distance') return `${exercise.target.distanceKm} km`;
  return `${exercise.target.rounds} rounds · ${exercise.target.workSeconds}s / ${exercise.target.restSeconds}s`;
}

function optionalTargetLabel(exercise: BuilderExercise, item: ExerciseCatalogItem) {
  if (item.trackingType === 'strength')
    return `${exercise.sets} × ${exercise.reps} @ ${exercise.loadKg} kg`;
  if (item.trackingType === 'duration') return `${exercise.sets} × ${exercise.durationSeconds} sec`;
  if (item.trackingType === 'distance') return `${exercise.distanceKm} km`;
  return `${exercise.rounds} rounds · ${exercise.workSeconds}s / ${exercise.restSeconds}s`;
}

export function TrainingDayDetail() {
  const { t, i18n } = useTranslation('workout');
  const isVi = i18n.resolvedLanguage === 'vi';
  const { dayId = '' } = useParams();
  const navigate = useNavigate();
  const day = getWorkoutDay(dayId);
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const startSession = useWorkoutSessionStore((state) => state.startSession);
  const optionalAddons = useMemberWorkoutBuilderStore((state) => state.optionalAddons);
  const dayKey = day?.weekday.toLowerCase() as Weekday | undefined;
  const optionalExercises = dayKey
    ? optionalAddons.flatMap((addon) =>
        addon.exercises
          .filter((exercise) => exercise.days.includes(dayKey))
          .flatMap((exercise) => {
            const item = memberExerciseCatalog.find(
              (candidate) => candidate.id === exercise.exerciseId,
            );
            return item ? [{ addon, exercise, item }] : [];
          }),
      )
    : [];

  if (!day || (day.exercises.length === 0 && optionalExercises.length === 0))
    return <Navigate to={ROUTES.member.workoutSchedule} replace />;

  const hasCurrentSession = activeSession?.dayId === day.id;
  const handleStart = () => {
    startSession(day.id);
    void navigate(ROUTES.member.workoutSessionPath(day.id));
  };

  return (
    <WorkoutFlowShell
      backTo={ROUTES.member.workoutSchedule}
      backLabel={t('flow.detail.weeklySchedule')}
      actions={
        day.exercises.length > 0 ? (
          <button className="workout-flow__primary" type="button" onClick={handleStart}>
            {hasCurrentSession ? t('flow.detail.continue') : t('flow.detail.start')}{' '}
            <ArrowRight size={16} />
          </button>
        ) : undefined
      }
    >
      <section className="workout-day-overview">
        <div>
          <Dumbbell />
          <span>{t('flow.detail.stations')}</span>
          <strong>{day.exercises.length}</strong>
        </div>
        <div>
          <Clock3 />
          <span>{t('flow.detail.targetTime')}</span>
          <strong>{day.durationMinutes} min</strong>
        </div>
        <div>
          <Layers3 />
          <span>{t('flow.detail.protocol')}</span>
          <strong>{t('flow.detail.mixedTracking')}</strong>
        </div>
        <div>
          <Gauge />
          <span>{t('flow.detail.source')}</span>
          <strong>{t('flow.detail.coachPlan')}</strong>
        </div>
      </section>

      <section className="workout-stations" aria-label="Training stations">
        <header>
          <span>{t('flow.detail.pipeline')}</span>
          <span>{t('flow.detail.targets')}</span>
        </header>
        {day.exercises.map((exercise, index) => (
          <article className="workout-station" key={exercise.id}>
            <span className="workout-station__number">{String(index + 1).padStart(2, '0')}</span>
            <div className="workout-station__copy">
              <h2>{t(`flow.exercises.${exercise.id}`)}</h2>
            </div>
            <div className="workout-station__target">
              <small>{t('flow.detail.target')}</small>
              <strong>{targetLabel(exercise)}</strong>
            </div>
          </article>
        ))}
      </section>
      {optionalExercises.length > 0 && (
        <section className="workout-stations is-optional" aria-label={t('flow.detail.optional')}>
          <header>
            <span>{t('flow.detail.optional')}</span>
            <span>{t('flow.detail.optionalProtected')}</span>
          </header>
          {optionalExercises.map(({ addon, exercise, item }, index) => (
            <article className="workout-station" key={`${addon.id}-${exercise.uid}`}>
              <span className="workout-station__number">+{String(index + 1).padStart(2, '0')}</span>
              <div className="workout-station__copy">
                <h2>{item.name[isVi ? 'vi' : 'en']}</h2>
              </div>
              <div className="workout-station__target">
                <small>{t('flow.detail.target')}</small>
                <strong>{optionalTargetLabel(exercise, item)}</strong>
              </div>
            </article>
          ))}
        </section>
      )}
    </WorkoutFlowShell>
  );
}
