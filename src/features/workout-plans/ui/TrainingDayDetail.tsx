import { ArrowRight, Clock3, Dumbbell, Gauge, Layers3 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { freeWorkoutExercises } from '../model/liveWorkout';
import { useLiveWorkoutWeek } from '../model/useLiveWorkout';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type { WorkoutExercise, WorkoutSource } from '../model/workoutFlowTypes';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import { formatBusinessDate } from '@/features/gamification/model/presentation';
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

export function TrainingDayDetail() {
  const { t } = useTranslation('workout');
  const { dayId = '' } = useParams();
  const live = useLiveWorkoutWeek();

  if (live.isPending)
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
  if (live.isError) return <Navigate to={ROUTES.member.workoutSchedule} replace />;
  if (dayId === FREE_DAY_ID) return <FreeWorkoutPicker live={live} />;

  const day = live.week.find((item) => item.id === dayId);
  // Only today's scheduled main session can be started: past days are locked and future days are not open yet.
  if (
    !day ||
    !day.isToday ||
    day.status !== 'ready' ||
    day.exercises.length === 0 ||
    !day.versionId
  )
    return <Navigate to={ROUTES.member.workoutSchedule} replace />;
  return (
    <DayOverview
      dayId={day.id}
      title={t('flow.live.day', { day: day.dayNumber })}
      subtitle={t('flow.live.mainSession')}
      durationMinutes={day.durationMinutes}
      exercises={day.exercises}
      start={{
        source: {
          kind: 'plan',
          versionId: day.versionId,
          planDayNumber: day.dayNumber ?? 0,
          businessDate: day.id,
        },
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
  const { t } = useTranslation('workout');
  const { locale } = useLocale();
  const navigate = useNavigate();
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const startSession = useWorkoutSessionStore((state) => state.startSession);
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
        <button className="workout-flow__primary" type="button" onClick={handleStart}>
          {hasCurrentSession ? t('flow.detail.continue') : t('flow.detail.start')}{' '}
          <ArrowRight size={16} />
        </button>
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
          <strong>{dayId === FREE_DAY_ID ? title : formatBusinessDate(dayId, locale)}</strong>
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
              <h2>{exercise.name}</h2>
            </div>
            <div className="workout-station__target">
              <small>{t('flow.detail.target')}</small>
              <strong>{targetLabel(exercise)}</strong>
            </div>
          </article>
        ))}
      </section>
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
    >
      <section className="workout-free-picker" aria-labelledby="free-workout-title">
        <h2 id="free-workout-title">{t('flow.live.freeTitle')}</h2>
        <p>{t('flow.live.freeHint')}</p>
        <fieldset>
          <legend>{t('flow.live.pickExercises')}</legend>
          {live.exercises.map((exercise) => (
            <label key={exercise.id}>
              <input
                type="checkbox"
                checked={selected.includes(exercise.id)}
                onChange={() =>
                  setSelected((current) =>
                    current.includes(exercise.id)
                      ? current.filter((id) => id !== exercise.id)
                      : [...current, exercise.id],
                  )
                }
              />
              <span>{exercise.name}</span>
              {exercise.equipment && <small>{exercise.equipment}</small>}
            </label>
          ))}
        </fieldset>
        {selected.length === 0 && (
          <p className="workout-live-notice is-quiet">{t('flow.live.pick')}</p>
        )}
        <button
          className="workout-flow__primary"
          type="button"
          disabled={selected.length === 0}
          onClick={() => setConfirmed(true)}
        >
          {t('flow.live.review')} <ArrowRight size={16} />
        </button>
      </section>
    </WorkoutFlowShell>
  );
}
