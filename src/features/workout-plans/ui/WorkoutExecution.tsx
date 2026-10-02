import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Save,
  ScanLine,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { getWorkoutDay } from '../model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type {
  DistanceExercise,
  DurationExercise,
  ExerciseLog,
  IntervalExercise,
  StrengthExercise,
  WorkoutExercise,
} from '../model/workoutFlowTypes';

import { ROUTES } from '@/shared/config/constants';

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="workout-log-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function LiveTimer({ onUse }: { onUse?: (seconds: number) => void }) {
  const { t } = useTranslation('workout');
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <div className="workout-live-timer">
      <span>{t('flow.execution.liveTimer')}</span>
      <strong>{formatted}</strong>
      <div>
        <button type="button" onClick={() => setRunning((value) => !value)}>
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? t('flow.execution.pause') : t('flow.execution.start')}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
        >
          <RotateCcw size={15} /> {t('flow.execution.reset')}
        </button>
        {onUse && (
          <button type="button" disabled={seconds === 0} onClick={() => onUse(seconds)}>
            <Check size={15} /> {t('flow.execution.useTime')}
          </button>
        )}
      </div>
    </div>
  );
}

function StrengthTracker({
  exercise,
  onSave,
}: {
  exercise: StrengthExercise;
  onSave: (log: ExerciseLog) => void;
}) {
  const { t } = useTranslation('workout');
  const [sets, setSets] = useState(() =>
    Array.from({ length: exercise.target.sets }, (_, index) => ({
      setNumber: index + 1,
      reps: exercise.target.reps,
      loadKg: exercise.target.loadKg,
      rpe: 0,
      completed: true,
    })),
  );
  const update = (index: number, field: 'reps' | 'loadKg' | 'rpe', value: number) =>
    setSets((current) =>
      current.map((set, setIndex) => (setIndex === index ? { ...set, [field]: value } : set)),
    );
  return (
    <form
      className="workout-log-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          trackingType: 'strength',
          sets: sets.map((set) => ({ ...set, rpe: set.rpe || undefined })),
        });
      }}
    >
      <header>
        <div>
          <span>{t('flow.execution.strength')}</span>
          <h2>{t('flow.execution.recordSets')}</h2>
        </div>
        <small>
          {t('flow.detail.target')} {exercise.target.sets} × {exercise.target.reps} @{' '}
          {exercise.target.loadKg} kg
        </small>
      </header>
      <div className="workout-set-table">
        <div className="workout-set-row is-heading">
          <span>{t('flow.execution.set')}</span>
          <span>{t('flow.execution.load')}</span>
          <span>{t('flow.execution.reps')}</span>
          <span>{t('flow.execution.rpe')}</span>
        </div>
        {sets.map((set, index) => (
          <div className="workout-set-row" key={set.setNumber}>
            <strong>{String(set.setNumber).padStart(2, '0')}</strong>
            <input
              aria-label={`Set ${set.setNumber} load`}
              type="number"
              min="0"
              step="0.5"
              value={set.loadKg}
              onChange={(event) => update(index, 'loadKg', Number(event.target.value))}
            />
            <input
              aria-label={`Set ${set.setNumber} reps`}
              type="number"
              min="0"
              value={set.reps}
              onChange={(event) => update(index, 'reps', Number(event.target.value))}
            />
            <input
              aria-label={`Set ${set.setNumber} RPE`}
              type="number"
              min="1"
              max="10"
              placeholder="—"
              value={set.rpe || ''}
              onChange={(event) => update(index, 'rpe', Number(event.target.value))}
            />
          </div>
        ))}
      </div>
      <button className="workout-flow__primary" type="submit">
        <Save size={16} /> {t('flow.execution.saveContinue')}
      </button>
    </form>
  );
}

function DurationTracker({
  exercise,
  onSave,
}: {
  exercise: DurationExercise;
  onSave: (log: ExerciseLog) => void;
}) {
  const { t } = useTranslation('workout');
  const [durations, setDurations] = useState(
    () => Array(exercise.target.sets).fill(exercise.target.durationSeconds) as number[],
  );
  const [activeSet, setActiveSet] = useState(0);
  const update = (index: number, value: number) =>
    setDurations((current) => current.map((duration, i) => (i === index ? value : duration)));
  return (
    <form
      className="workout-log-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          trackingType: 'duration',
          sets: durations.map((durationSeconds, index) => ({
            setNumber: index + 1,
            durationSeconds,
            completed: durationSeconds > 0,
          })),
        });
      }}
    >
      <header>
        <div>
          <span>{t('flow.execution.duration')}</span>
          <h2>{t('flow.execution.recordTime')}</h2>
        </div>
        <small>
          {t('flow.detail.target')} {exercise.target.sets} × {exercise.target.durationSeconds}{' '}
          {t('flow.execution.seconds')}
        </small>
      </header>
      <LiveTimer onUse={(seconds) => update(activeSet, seconds)} />
      <div className="workout-duration-grid">
        {durations.map((duration, index) => (
          <button
            className={activeSet === index ? 'is-active' : ''}
            type="button"
            key={index}
            onClick={() => setActiveSet(index)}
          >
            <span>Set {index + 1}</span>
            <input
              aria-label={`Set ${index + 1} duration`}
              type="number"
              min="0"
              value={duration}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => update(index, Number(event.target.value))}
            />
            <small>{t('flow.execution.seconds')}</small>
          </button>
        ))}
      </div>
      <button className="workout-flow__primary" type="submit">
        <Save size={16} /> {t('flow.execution.saveContinue')}
      </button>
    </form>
  );
}

function DistanceTracker({
  exercise,
  onSave,
}: {
  exercise: DistanceExercise;
  onSave: (log: ExerciseLog) => void;
}) {
  const { t } = useTranslation('workout');
  const [distance, setDistance] = useState(exercise.target.distanceKm);
  const [minutes, setMinutes] = useState(Math.floor((exercise.target.durationSeconds ?? 0) / 60));
  const [seconds, setSeconds] = useState((exercise.target.durationSeconds ?? 0) % 60);
  const totalSeconds = minutes * 60 + seconds;
  const pace = distance > 0 && totalSeconds > 0 ? totalSeconds / distance : 0;
  const paceLabel = pace
    ? `${Math.floor(pace / 60)}:${String(Math.round(pace % 60)).padStart(2, '0')} /km`
    : '—';
  return (
    <form
      className="workout-log-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ trackingType: 'distance', distanceKm: distance, durationSeconds: totalSeconds });
      }}
    >
      <header>
        <div>
          <span>{t('flow.execution.distance')}</span>
          <h2>{t('flow.execution.recordDistance')}</h2>
        </div>
        <small>
          {t('flow.detail.target')} {exercise.target.distanceKm} km
        </small>
      </header>
      <div className="workout-distance-fields">
        <NumberField
          label={t('flow.execution.actualDistance')}
          value={distance}
          step={0.1}
          onChange={setDistance}
        />
        <NumberField label={t('flow.execution.minutes')} value={minutes} onChange={setMinutes} />
        <NumberField
          label={t('flow.execution.seconds')}
          value={seconds}
          min={0}
          onChange={(value) => setSeconds(Math.min(59, value))}
        />
        <div className="workout-computed">
          <span>{t('flow.execution.computedPace')}</span>
          <strong>{paceLabel}</strong>
        </div>
      </div>
      <button
        className="workout-flow__primary"
        type="submit"
        disabled={distance <= 0 || totalSeconds <= 0}
      >
        <Save size={16} /> {t('flow.execution.saveContinue')}
      </button>
    </form>
  );
}

function IntervalTracker({
  exercise,
  onSave,
}: {
  exercise: IntervalExercise;
  onSave: (log: ExerciseLog) => void;
}) {
  const { t } = useTranslation('workout');
  const [rounds, setRounds] = useState(exercise.target.rounds);
  return (
    <form
      className="workout-log-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          trackingType: 'interval',
          completedRounds: rounds,
          workSeconds: exercise.target.workSeconds,
          restSeconds: exercise.target.restSeconds,
        });
      }}
    >
      <header>
        <div>
          <span>{t('flow.execution.interval')}</span>
          <h2>{t('flow.execution.recordRounds')}</h2>
        </div>
        <small>
          {t('flow.detail.target')} {exercise.target.rounds} · {exercise.target.workSeconds}s /{' '}
          {exercise.target.restSeconds}s
        </small>
      </header>
      <LiveTimer />
      <div className="workout-round-counter">
        <button type="button" onClick={() => setRounds((value) => Math.max(0, value - 1))}>
          −
        </button>
        <div>
          <span>{t('flow.execution.completedRounds')}</span>
          <strong>{rounds}</strong>
          <small>{t('flow.execution.targetRounds', { count: exercise.target.rounds })}</small>
        </div>
        <button
          type="button"
          onClick={() => setRounds((value) => Math.min(exercise.target.rounds, value + 1))}
        >
          +
        </button>
      </div>
      <button className="workout-flow__primary" type="submit" disabled={rounds <= 0}>
        <Save size={16} /> {t('flow.execution.saveFinish')}
      </button>
    </form>
  );
}

function Tracker({
  exercise,
  onSave,
}: {
  exercise: WorkoutExercise;
  onSave: (log: ExerciseLog) => void;
}) {
  if (exercise.trackingType === 'strength')
    return <StrengthTracker exercise={exercise} onSave={onSave} />;
  if (exercise.trackingType === 'duration')
    return <DurationTracker exercise={exercise} onSave={onSave} />;
  if (exercise.trackingType === 'distance')
    return <DistanceTracker exercise={exercise} onSave={onSave} />;
  return <IntervalTracker exercise={exercise} onSave={onSave} />;
}

export function WorkoutExecution() {
  const { t } = useTranslation('workout');
  const { dayId = '' } = useParams();
  const navigate = useNavigate();
  const completionPath = useRef<string | null>(null);
  const day = getWorkoutDay(dayId);
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const saveExerciseLog = useWorkoutSessionStore((state) => state.saveExerciseLog);
  const goToExercise = useWorkoutSessionStore((state) => state.goToExercise);
  const finishSession = useWorkoutSessionStore((state) => state.finishSession);
  const exercises = day?.exercises ?? [];
  const currentIndex = Math.min(
    activeSession?.currentExerciseIndex ?? 0,
    Math.max(0, exercises.length - 1),
  );
  const exercise = exercises[currentIndex];
  const completedCount = useMemo(
    () => (activeSession ? Object.keys(activeSession.logs).length : 0),
    [activeSession],
  );

  if (!day || exercises.length === 0)
    return <Navigate to={ROUTES.member.workoutSchedule} replace />;
  if (!activeSession || activeSession.dayId !== day.id) {
    if (completionPath.current) return <Navigate to={completionPath.current} replace />;
    return <Navigate to={ROUTES.member.workoutDayPath(day.id)} replace />;
  }
  if (!exercise) return <Navigate to={ROUTES.member.workoutDayPath(day.id)} replace />;

  const handleSave = (log: ExerciseLog) => {
    saveExerciseLog(exercise.id, log);
    if (currentIndex < exercises.length - 1) goToExercise(currentIndex + 1);
    else {
      const completed = finishSession();
      if (completed) {
        completionPath.current = ROUTES.member.workoutCompletionPath(completed.id);
        void navigate(completionPath.current);
      }
    }
  };

  return (
    <div className="workout-execution">
      <header className="workout-execution__header">
        <div>
          <button type="button" onClick={() => navigate(ROUTES.member.workoutDayPath(day.id))}>
            <ChevronLeft size={17} /> {t('flow.execution.exit')}
          </button>
          <span>
            {t('flow.execution.liveSession')} / {t(`flow.days.${day.id}`)}
          </span>
        </div>
        <div>
          <span>
            {t('flow.execution.complete', { completed: completedCount, total: exercises.length })}
          </span>
          <div className="workout-flow__progress">
            <span style={{ width: `${(completedCount / exercises.length) * 100}%` }} />
          </div>
        </div>
      </header>
      <main className="workout-execution__main">
        <section className="workout-exercise-context">
          <span>
            {t('flow.execution.station', {
              current: String(currentIndex + 1).padStart(2, '0'),
              total: String(exercises.length).padStart(2, '0'),
            })}
          </span>
          <h1>{t(`flow.exercises.${exercise.id}`)}</h1>
          <button
            className="workout-exercise-assessment"
            type="button"
            onClick={() =>
              navigate(ROUTES.member.aiAssessmentPath(exercise.id), {
                state: { returnTo: ROUTES.member.workoutSessionPath(day.id) },
              })
            }
          >
            <ScanLine aria-hidden="true" size={17} />
            {t('flow.execution.assessExercise')}
          </button>
          <div className="workout-exercise-video" role="img" aria-label={t('flow.execution.video')}>
            <Play aria-hidden="true" size={44} />
          </div>
        </section>
        <Tracker key={exercise.id} exercise={exercise} onSave={handleSave} />
      </main>
      <nav className="workout-exercise-nav" aria-label={t('flow.execution.sessionExercises')}>
        {exercises.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === currentIndex ? 'is-active' : undefined}
            onClick={() => goToExercise(index)}
          >
            <span>
              {activeSession.logs[item.id] ? (
                <Check size={13} />
              ) : (
                String(index + 1).padStart(2, '0')
              )}
            </span>
            {t(`flow.exercises.${item.id}`)}
            {index === currentIndex && <ChevronRight size={14} />}
          </button>
        ))}
      </nav>
    </div>
  );
}
