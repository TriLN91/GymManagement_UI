import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import {
  progressionGoals,
  weeklyProgressionApi,
  type ProgressionGoal,
} from '../api/weeklyProgressionApi';

import { Button } from '@/shared/ui';

export function WeeklyProgressionPage() {
  const client = useQueryClient();
  const [exerciseId, setExerciseId] = useState('');
  const [goal, setGoal] = useState<ProgressionGoal>('Strength');
  const data = useQuery({
    queryKey: ['weekly-progression'],
    queryFn: async () => {
      const [exercises, reviews] = await Promise.all([
        weeklyProgressionApi.exercises(),
        weeklyProgressionApi.history(),
      ]);
      return { exercises, reviews };
    },
  });
  const action = useMutation({
    mutationFn: async (input: { kind: 'evaluate' | 'review' | 'resolve'; id: string }) => {
      if (input.kind === 'evaluate') await weeklyProgressionApi.evaluate(input.id, goal);
      else if (input.kind === 'review') await weeklyProgressionApi.review(input.id);
      else await weeklyProgressionApi.resolveRecovery(input.id);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['weekly-progression'] });
    },
  });
  function evaluate(event: FormEvent) {
    event.preventDefault();
    action.mutate({ kind: 'evaluate', id: exerciseId || data.data?.exercises[0]?.id || '' });
  }
  return (
    <main className="space-y-5 p-6">
      <h1 className="text-2xl font-bold">Weekly progression review</h1>
      <p>
        Review five exercise sessions within your selected goal’s window. Saved recommendations
        include their evidence. Plan changes require confirmation through your plan owner.
      </p>
      {data.isPending ? (
        <p role="status">Loading your exercise evidence…</p>
      ) : data.isError ? (
        <div role="alert">
          Could not load progression. <Button onClick={() => void data.refetch()}>Retry</Button>
        </div>
      ) : (
        <>
          <form className="flex flex-wrap items-end gap-3" onSubmit={evaluate}>
            <div>
              <label htmlFor="weekly-exercise">Exercise</label>
              <select
                id="weekly-exercise"
                className="block rounded border p-2"
                value={exerciseId || data.data.exercises[0]?.id || ''}
                onChange={(e) => setExerciseId(e.target.value)}
                disabled={action.isPending}
              >
                {data.data.exercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="weekly-goal">Goal</label>
              <select
                id="weekly-goal"
                className="block rounded border p-2"
                value={goal}
                onChange={(e) => setGoal(e.target.value as ProgressionGoal)}
                disabled={action.isPending}
              >
                {progressionGoals.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={action.isPending || data.data.exercises.length === 0}>
              Evaluate this week
            </Button>
          </form>
          {data.data.exercises.length === 0 && (
            <p>No exercises yet. Save a workout or an active plan to begin.</p>
          )}
          {data.data.reviews.length === 0 && <p>No weekly reviews saved yet.</p>}
          {data.data.reviews.map((review) => (
            <article
              key={review.id}
              aria-label={review.evaluation.exerciseName}
              className="space-y-2 rounded border p-4"
            >
              <h2 className="text-lg font-semibold">
                {review.evaluation.exerciseName} · {review.goal} · {review.weekOf}
              </h2>
              <p>
                {review.status.replaceAll('_', ' ')} ·{' '}
                {review.evaluation.conclusion.replaceAll('_', ' ')}
              </p>
              <p>{review.evaluation.reason}</p>
              <p>
                {review.evaluation.validSessions}/{review.evaluation.requiredSessions} sessions in{' '}
                {review.evaluation.windowDays} days · Target completion:{' '}
                {review.evaluation.completionRatio === null
                  ? 'unavailable'
                  : `${Math.round(review.evaluation.completionRatio * 100)}%`}{' '}
                · Average effort: {review.evaluation.averageRpe ?? 'unavailable'}/10 · Workload
                trend:{' '}
                {review.evaluation.performanceTrendPercent === null
                  ? 'unavailable'
                  : `${review.evaluation.performanceTrendPercent}%`}
              </p>
              <p>
                Evidence as of {new Date(review.evidenceAsOfUtc).toLocaleString()} ·{' '}
                {review.evaluation.ruleVersion}
              </p>
              <p>{review.evaluation.handoff}</p>
              <details>
                <summary>
                  Evidence and limitations ({review.evaluation.evidence.length} records)
                </summary>
                <ul className="list-disc space-y-2 pl-5">
                  {review.evaluation.evidence.map((e) => (
                    <li key={`${e.source}-${e.id}`}>
                      <strong>
                        {e.source} · {e.use}
                      </strong>{' '}
                      · {new Date(e.occurredAtUtc).toLocaleString()}
                      <p>{e.detail}</p>
                      <small>Record {e.id}</small>
                      {e.source === 'recovery_report' && review.status === 'pending_review' && (
                        <Button
                          variant="outline"
                          disabled={action.isPending}
                          onClick={() => action.mutate({ kind: 'resolve', id: e.id })}
                        >
                          Mark recovery resolved
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                <ul className="list-disc pl-5">
                  {review.evaluation.limitations.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </details>
              {review.status === 'pending_review' && (
                <Button
                  disabled={action.isPending}
                  onClick={() => action.mutate({ kind: 'review', id: review.id })}
                >
                  Mark as reviewed (no plan changes)
                </Button>
              )}
            </article>
          ))}
        </>
      )}
      {action.isError && (
        <p role="alert">
          {action.error instanceof Error ? action.error.message : 'Action failed. Please retry.'}
        </p>
      )}
    </main>
  );
}
