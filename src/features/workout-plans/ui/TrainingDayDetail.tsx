import { ArrowRight, Clock3, Dumbbell, Gauge, Layers3 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { getWorkoutDay } from '../model/demoWorkoutFlow';
import { freeWorkoutExercises } from '../model/liveWorkout';
import { useLiveWorkoutWeek } from '../model/useLiveWorkout';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type { WorkoutExercise, WorkoutSource } from '../model/workoutFlowTypes';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import { formatBusinessDate } from '@/features/gamification/model/presentation';
import {
  memberExerciseCatalog,
  useMemberWorkoutBuilderStore,
  type BuilderExercise,
  type ExerciseCatalogItem,
  type Weekday,
} from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';

export const FREE_DAY_ID = 'free';

function targetLabel(exercise: WorkoutExercise) {
  if (exercise.trackingType === 'strength')
    return `${exercise.target.sets} × ${exercise.target.reps}`;
  if (exercise.trackingType === 'duration')
    return `${exercise.target.sets} × ${exercise.target.durationSeconds} sec`;
  if (exercise.trackingType === 'distance') return `${exercise.target.distanceKm} km`;
  return `${exercise.target.rounds} rounds`;
}

function optionalTargetLabel(exercise: BuilderExercise, item: ExerciseCatalogItem) {
  if (item.trackingType === 'strength')
    return `${exercise.sets} × ${exercise.reps} @ ${exercise.loadKg} kg`;
  if (item.trackingType === 'duration') return `${exercise.sets} × ${exercise.durationSeconds} sec`;
  if (item.trackingType === 'distance') return `${exercise.distanceKm} km`;
  return `${exercise.rounds} rounds · ${exercise.workSeconds}s / ${exercise.restSeconds}s`;
}

export function TrainingDayDetail() {
  const { t } = useTranslation('workout');
  const { dayId = '' } = useParams();
  const live = useLiveWorkoutWeek();

  const demoDay = getWorkoutDay(dayId);

  if (live.isPending && !demoDay)
    return (
      <WorkoutFlowShell
        backTo={ROUTES.member.workoutSchedule}
        backLabel={t('flow.detail.weeklySchedule')}
      >
        <p className="workout-live-notice" role="status">
          {t('flow.live.loading')}
        </p>
      </WorkoutFlowShell>
    );

  if (dayId === FREE_DAY_ID) return <FreeWorkoutPicker live={live} />;

  const liveDay = live.week.find((item) => item.id === dayId);
  const day = liveDay ?? demoDay;

  if (!day) return <Navigate to={ROUTES.member.workoutSchedule} replace />;
  if (
    liveDay &&
    (!day.isToday || day.status !== 'ready' || day.exercises.length === 0 || !day.versionId)
  )
    return <Navigate to={ROUTES.member.workoutSchedule} replace />;

  return (
    <DayOverview
      dayId={day.id}
      title={
        t(`flow.days.${day.id}`, {
          defaultValue:
            day.title ??
            (day.dayNumber !== null
              ? t('flow.live.day', { day: day.dayNumber })
              : day.id),
        })
      }
      subtitle={t('flow.live.mainSession')}
      durationMinutes={day.durationMinutes}
      exercises={day.exercises}
      start={{
        source: day.versionId
          ? {
              kind: 'plan',
              versionId: day.versionId,
              planDayNumber: day.dayNumber ?? 0,
              businessDate: day.id,
            }
          : { kind: 'free' },
      }}
    />
  );
}

function DayOverview({
  dayId,
  title,
  subtitle,
  durationMinutes,
  exercises,
  start,
}: {
  dayId: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  exercises: ReadonlyArray<WorkoutExercise>;
  start: { source: WorkoutSource };
}) {
  const { language } = useLocale();
  const { t } = useTranslation('workout');
  const { locale } = useLocale();
  const navigate = useNavigate();
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const startSession = useWorkoutSessionStore((state) => state.startSession);
  const optionalAddons = useMemberWorkoutBuilderStore((state) => state.optionalAddons);
  const day = getWorkoutDay(dayId);
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

  const hasCurrentSession = activeSession?.dayId === dayId;
  const handleStart = () => {
    startSession({ dayId, source: start.source, title, exercises });
    void navigate(ROUTES.member.workoutSessionPath(dayId));
  };

  return (
    <WorkoutFlowShell
      backTo={ROUTES.member.workoutSchedule}
      backLabel={t('flow.detail.weeklySchedule')}
      actions={
        exercises.length > 0 ? (
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
          <strong>{exercises.length}</strong>
        </div>
        <div>
          <Clock3 />
          <span>{t('flow.detail.targetTime')}</span>
          <strong>{durationMinutes > 0 ? `${durationMinutes} min` : '—'}</strong>
        </div>
        <div>
          <Layers3 />
          <span>{t('flow.detail.day')}</span>
          <strong>{dayId === FREE_DAY_ID ? title : t(`flow.days.${dayId}`, { defaultValue: formatBusinessDate(dayId, locale) })}</strong>
        </div>
        <div>
          <Gauge />
          <span>{t('flow.detail.source')}</span>
          <strong>{subtitle}</strong>
        </div>
      </section>

      <section className="workout-stations" aria-label={t('aria.trainingStations')}>
        <header>
          <span>{t('flow.detail.pipeline')}</span>
          <span>{t('flow.detail.targets')}</span>
        </header>
        {exercises.map((exercise, index) => (
          <article className="workout-station" key={exercise.id}>
            <span className="workout-station__number">{String(index + 1).padStart(2, '0')}</span>
            <div className="workout-station__copy">
              <h2>{t(`flow.exercises.${exercise.id}`, { defaultValue: exercise.name })}</h2>
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
                <h2>{item.name[language]}</h2>
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

function FreeWorkoutPicker({ live }: { live: ReturnType<typeof useLiveWorkoutWeek> }) {
  const { t } = useTranslation('workout');
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  if (activeSession?.dayId === FREE_DAY_ID || confirmed) {
    const exercises =
      activeSession?.dayId === FREE_DAY_ID
        ? activeSession.exercises
        : freeWorkoutExercises(selected, live.catalog);
    return (
      <DayOverview
        dayId={FREE_DAY_ID}
        title={t('flow.live.freeTitle')}
        subtitle={t('flow.live.freeSource')}
        durationMinutes={0}
        exercises={exercises}
        start={{ source: { kind: 'free' } }}
      />
    );
  }
  return (
    <WorkoutFlowShell
      backTo={ROUTES.member.workoutSchedule}
      backLabel={t('flow.detail.weeklySchedule')}
      actions={
        <button
          className="workout-flow__primary"
          type="button"
          disabled={selected.length === 0}
          onClick={() => setConfirmed(true)}
        >
          {t('flow.live.startFree')} <ArrowRight size={16} />
        </button>
      }
    >
      <section className="workout-free-picker" aria-label={t('flow.live.freePicker')}>
        <p>{t('flow.live.freeHint')}</p>
        <div className="workout-free-picker__grid">
          {live.exercises.map((exercise) => {
            const checked = selected.includes(exercise.id);
            return (
              <label
                className={`workout-free-card${checked ? ' is-selected' : ''}`}
                key={exercise.id}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    setSelected((prev) =>
                      event.target.checked
                        ? [...prev, exercise.id]
                        : prev.filter((id) => id !== exercise.id),
                    )
                  }
                />
                <div className="workout-free-card__body">
                  <strong>{t(`flow.exercises.${exercise.id}`, { defaultValue: exercise.name })}</strong>
                  <span>
                    {exercise.muscleGroup} · {exercise.equipment}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </WorkoutFlowShell>
  );
}
