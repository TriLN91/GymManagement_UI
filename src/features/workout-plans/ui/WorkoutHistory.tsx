import { ChevronDown, Clock3, Dumbbell, History, MapPin, Repeat2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getWorkoutDay } from '../model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type { ExerciseLog } from '../model/workoutFlowTypes';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import { ROUTES } from '@/shared/config/constants';

function summarize(log: ExerciseLog, isVi: boolean) {
  if (log.trackingType === 'strength') {
    const sets = log.sets.filter((set) => set.completed);
    const volume = sets.reduce((sum, set) => sum + set.reps * set.loadKg, 0);
    return `${sets.length} ${isVi ? 'hiệp' : 'sets'} · ${volume.toLocaleString()} kg`;
  }
  if (log.trackingType === 'duration') {
    const seconds = log.sets.reduce((sum, set) => sum + set.durationSeconds, 0);
    return `${log.sets.length} ${isVi ? 'hiệp' : 'sets'} · ${Math.round(seconds / 60)} min`;
  }
  if (log.trackingType === 'distance')
    return `${log.distanceKm.toFixed(2)} km · ${Math.round(log.durationSeconds / 60)} min`;
  return `${log.completedRounds} ${isVi ? 'vòng' : 'rounds'}`;
}

export function WorkoutHistory() {
  const { i18n, t } = useTranslation('workout');
  const isVi = i18n.resolvedLanguage === 'vi';
  const sessions = useWorkoutSessionStore((state) => state.completedSessions);
  const [expanded, setExpanded] = useState<string | null>(sessions[0]?.id ?? null);
  const copy = isVi
    ? {
        title: 'Lịch sử tập luyện',
        back: 'Về lịch tập',
        empty: 'Chưa có buổi tập hoàn thành.',
        exercises: 'bài đã ghi nhận',
        volume: 'Tổng tải',
        duration: 'Thời lượng',
        distance: 'Quãng đường',
        rounds: 'Số vòng',
      }
    : {
        title: 'Workout history',
        back: 'Back to schedule',
        empty: 'No completed workouts yet.',
        exercises: 'logged exercises',
        volume: 'Volume',
        duration: 'Duration',
        distance: 'Distance',
        rounds: 'Rounds',
      };

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={copy.back}>
      {sessions.length === 0 ? (
        <section className="workout-history__empty">
          <History size={32} />
          <span>{copy.empty}</span>
        </section>
      ) : (
        <section className="workout-history__list">
          {sessions.map((session) => {
            const day = getWorkoutDay(session.dayId);
            const isOpen = expanded === session.id;
            return (
              <article key={session.id}>
                <button
                  type="button"
                  className="workout-history__summary"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : session.id)}
                >
                  <div>
                    <span>
                      {new Date(session.completedAt).toLocaleDateString(
                        i18n.resolvedLanguage ?? i18n.language,
                      )}
                    </span>
                    <h2>{day ? t(`flow.days.${day.id}`) : session.dayId}</h2>
                    <small>
                      {Object.keys(session.logs).length} {copy.exercises}
                    </small>
                  </div>
                  <div className="workout-history__totals">
                    {session.totals.totalVolumeKg > 0 && (
                      <span>
                        <Dumbbell size={13} />
                        {session.totals.totalVolumeKg.toLocaleString()} kg
                      </span>
                    )}
                    {session.totals.totalDurationSeconds > 0 && (
                      <span>
                        <Clock3 size={13} />
                        {Math.round(session.totals.totalDurationSeconds / 60)} min
                      </span>
                    )}
                    {session.totals.totalDistanceKm > 0 && (
                      <span>
                        <MapPin size={13} />
                        {session.totals.totalDistanceKm.toFixed(1)} km
                      </span>
                    )}
                    {session.totals.completedRounds > 0 && (
                      <span>
                        <Repeat2 size={13} />
                        {session.totals.completedRounds}
                      </span>
                    )}
                    <ChevronDown className={isOpen ? 'is-open' : ''} size={18} />
                  </div>
                </button>
                {isOpen && (
                  <div className="workout-history__details">
                    {Object.entries(session.logs).map(([exerciseId, log], index) => (
                      <div key={exerciseId}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>
                          {t(`flow.exercises.${exerciseId}`, { defaultValue: exerciseId })}
                        </strong>
                        <small>{summarize(log, isVi)}</small>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </WorkoutFlowShell>
  );
}
