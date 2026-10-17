import { useCallback, useEffect, useRef, useState } from 'react';

import { movementReferenceApi } from '../api/movementReferenceApi';
import type { RuntimeVersion, VisualEvidence } from '../api/runtimeTypes';
import type { ExerciseDto, ReferenceSetDto, ReferenceSetSummaryDto } from '../api/types';

import { ApiErrorNotice } from './ApiErrorNotice';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const base = '/admin/movement-runtime';
const display = (value: string) =>
  value
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace('Deg', '°');
const connections = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

function VideoEvidence({ sourceId, refresh }: { sourceId: string; refresh: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState('');
  const [evidence, setEvidence] = useState<VisualEvidence>();
  const [time, setTime] = useState(0);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    let objectUrl = '';
    setEvidence(undefined);
    setError(undefined);
    setUrl('');
    setLoading(true);
    void Promise.all([
      apiGet<Blob>(`${base}/sources/${sourceId}/video`, { responseType: 'blob' }),
      apiGet<VisualEvidence>(`${base}/sources/${sourceId}/evidence`),
    ])
      .then(([blob, data]) => {
        if (alive) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
          setEvidence(data);
        }
      })
      .catch((failure: unknown) => {
        if (alive) setError(failure);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sourceId, revision, refresh]);
  const frame = evidence?.frames.reduce<VisualEvidence['frames'][number] | undefined>(
    (closest, candidate) =>
      !closest || Math.abs(candidate.timeMs - time) < Math.abs(closest.timeMs - time)
        ? candidate
        : closest,
    undefined,
  );
  const rep = evidence?.repetitions.find(
    (item) => time >= item.startTimestampMs && time <= item.endTimestampMs,
  );
  const phase = rep?.phases.find(
    (item) => time >= item.startTimestampMs && time <= item.endTimestampMs,
  );
  return (
    <section className="space-y-3" aria-label="Video-aligned pose review">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Video & movement evidence</h3>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setError(undefined);
            void apiPost(`${base}/sources/${sourceId}/visual-review`, undefined, {
              timeout: 330000,
            })
              .then(() => setRevision((x) => x + 1))
              .catch(setError)
              .finally(() => setBusy(false));
          }}
        >
          {busy ? 'Extracting pose evidence…' : 'Regenerate visual evidence'}
        </Button>
      </div>
      <ApiErrorNotice error={error} />
      {url ? (
        <div
          className="relative overflow-hidden rounded-lg bg-black"
          style={{
            aspectRatio: `${evidence?.sourceVideo.width ?? 16}/${evidence?.sourceVideo.height ?? 9}`,
          }}
        >
          <video
            ref={video}
            src={url}
            controls
            playsInline
            className="h-full w-full"
            onTimeUpdate={() => setTime((video.current?.currentTime ?? 0) * 1000)}
          />
          {frame ? (
            <svg
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-label="Extracted pose landmarks"
            >
              {connections.map(([a, b]) => {
                const first = frame.landmarks.find((p) => p.index === a);
                const second = frame.landmarks.find((p) => p.index === b);
                return first && second && Math.min(first.visibility, second.visibility) >= 0.5 ? (
                  <line
                    key={`${a}-${b}`}
                    x1={first.x}
                    y1={first.y}
                    x2={second.x}
                    y2={second.y}
                    stroke="#7affb4"
                    strokeWidth=".003"
                  />
                ) : null;
              })}
              {frame.landmarks
                .filter((p) => p.visibility >= 0.5)
                .map((p) => (
                  <circle key={p.index} cx={p.x} cy={p.y} r=".004" fill="#fff" />
                ))}
            </svg>
          ) : null}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
          {loading
            ? 'Loading video and aligned movement evidence…'
            : 'Extract visual evidence to review this historical upload. Original reference history stays unchanged.'}
        </p>
      )}
      <div className="flex flex-wrap gap-3 rounded-lg bg-muted p-3 text-sm">
        <strong>{(time / 1000).toFixed(2)} s</strong>
        <span>Rep {rep?.repIndex ?? '—'}</span>
        <span>{display(phase?.name ?? 'Outside segmented rep')}</span>
        <span>{frame?.usable ? 'Required joints reliable' : 'Pose not usable'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {evidence?.repetitions.map((item) => (
          <Button
            size="sm"
            variant="outline"
            key={item.repIndex}
            onClick={() => {
              if (video.current) {
                video.current.currentTime = item.startTimestampMs / 1000;
                setTime(item.startTimestampMs);
              }
            }}
          >
            Rep {item.repIndex} · {item.status.toLowerCase()}
          </Button>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(frame?.features ?? {})
          .filter(([, value]) => Number.isFinite(value))
          .map(([code, value]) => (
            <div key={code} className="rounded border p-2">
              <dt className="text-muted-foreground">{display(code)}</dt>
              <dd className="font-mono">{value.toFixed(2)}</dd>
            </div>
          ))}
      </dl>
      {rep?.rejectionReasons.length ? (
        <p role="status" className="text-sm text-destructive">
          {rep.rejectionReasons.map(display).join(' · ')}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Pose is sampled at up to 8 fps for review. Measurements use the versioned processing
        coordinate convention; the overlay uses normalized video coordinates.
      </p>
    </section>
  );
}

export function RuntimeAdminWorkspace({ referenceSetId }: { referenceSetId?: string }) {
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [sets, setSets] = useState<ReferenceSetSummaryDto[]>([]);
  const [exerciseId, setExerciseId] = useState('');
  const [set, setSet] = useState<ReferenceSetDto>();
  const [versions, setVersions] = useState<RuntimeVersion[]>([]);
  const [versionId, setVersionId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [pattern, setPattern] = useState('SQUAT');
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('ACTIVE');
  const [readiness, setReadiness] = useState<
    { id: string; exerciseId: string; version: number; status: string; available: boolean }[]
  >([]);
  const [profileId, setProfileId] = useState('');
  const [exerciseHistory, setExerciseHistory] = useState<
    { id: string; version: number; snapshotJson: string }[]
  >([]);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [edit, setEdit] = useState<ExerciseDto>();
  const [newName, setNewName] = useState('');
  const [tab, setTab] = useState('REVIEW');
  const [refresh, setRefresh] = useState(0);
  const chosen = versions.find((item) => item.id === versionId);
  const published = versions.find(
    (item) => item.status === 'PUBLISHED' && item.configuration.view === chosen?.configuration.view,
  );
  const exercise = exercises.find((item) => item.id === exerciseId);
  const reload = useCallback(async () => {
    const [catalog, references, statuses] = await Promise.all([
      apiGet<ExerciseDto[]>(`${base}/exercises`),
      movementReferenceApi.listReferenceSets(),
      apiGet<typeof readiness>(`${base}/readiness`),
    ]);
    setExercises(catalog);
    setSets(references);
    setReadiness(statuses);
  }, []);
  useEffect(() => {
    void reload().catch(setError);
  }, [reload]);
  useEffect(() => {
    if (referenceSetId)
      void movementReferenceApi
        .getReferenceSet(referenceSetId)
        .then((value) => setExerciseId(value.exerciseId))
        .catch(setError);
  }, [referenceSetId]);
  useEffect(() => {
    let active = true;
    setSet(undefined);
    setVersions([]);
    setSourceId('');
    setVersionId('');
    setEdit(undefined);
    setError(undefined);
    if (!exerciseId) return;
    const classification = exercises.find((item) => item.id === exerciseId)?.movementPatternCode;
    const selected = sets.find(
      (item) =>
        item.exerciseId === exerciseId && (!classification || item.pattern === classification),
    );
    void Promise.all([
      selected ? movementReferenceApi.getReferenceSet(selected.id) : Promise.resolve(undefined),
      apiGet<RuntimeVersion[]>(`${base}/configurations`, { params: { exerciseId } }),
      apiGet<typeof exerciseHistory>(`${base}/exercises/${exerciseId}/history`),
    ])
      .then(([reference, configs, history]) => {
        if (!active) return;
        setSet(reference);
        setVersions(configs);
        setExerciseHistory(history);
        setSourceId(
          reference?.sources.find((item) => item.processingStatus === 'PROCESSED')?.id ??
            reference?.sources[0]?.id ??
            '',
        );
        setVersionId(configs[0]?.id ?? '');
        setPattern(classification ?? reference?.pattern ?? 'SQUAT');
      })
      .catch(setError);
    return () => {
      active = false;
    };
  }, [exerciseId, exercises, sets, refresh]);
  useEffect(() => {
    setFeatures(chosen?.configuration.selectedFeatures ?? []);
    setRules(
      chosen?.configuration.rules.filter((rule) => rule.enabled).map((rule) => rule.code) ?? [],
    );
    setNote(chosen?.reviewNote ?? '');
  }, [chosen]);
  const act = async (work: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError(undefined);
    setNotice('');
    try {
      await work();
      await reload();
      setRefresh((x) => x + 1);
      setNotice(message);
    } catch (failure) {
      if (set)
        await movementReferenceApi
          .getReferenceSet(set.id)
          .then(setSet)
          .catch(() => undefined);
      setError(failure);
    } finally {
      setBusy(false);
    }
  };
  const candidates =
    set?.profiles
      .filter((profile) => !profile.qualitySummary.withdrawnReason)
      .sort((a, b) => b.version - a.version) ?? [];
  const candidate = candidates.find((profile) => profile.id === profileId) ?? candidates[0];
  const source = set?.sources.find((item) => item.id === sourceId);
  const toggle = (value: string, list: string[], update: (items: string[]) => void) =>
    update(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold">Movement assessment studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exercise → GOOD footage → visual review → confirmed runtime configuration → live Mobile
          assessment
        </p>
      </header>
      <ApiErrorNotice error={error} />
      {notice ? (
        <p role="status" className="rounded border border-forest p-3 text-sm">
          {notice}
        </p>
      ) : null}
      <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)_350px]">
        <aside className="space-y-3 rounded-xl border bg-card p-3 xl:max-h-[78vh] xl:overflow-auto">
          <label className="block text-sm">
            Movement pattern
            <select
              aria-label="Movement pattern filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="mt-1 w-full rounded border bg-background p-2"
            >
              {['ALL', 'SQUAT', 'HINGE', 'PULL', 'PUSH'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <Input
            aria-label="Find exercise"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find exercise"
          />
          <select
            aria-label="Exercise availability"
            className="w-full rounded border bg-background p-2"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
          >
            <option value="ACTIVE">Active catalog</option>
            <option value="PUBLISHED">Published reference</option>
            <option value="LIVE">Live Mobile configuration</option>
            <option value="DRAFT">Configuration needs review</option>
            <option value="RETIRED">Retired history</option>
          </select>
          {exercises
            .filter(
              (item) =>
                (availability === 'RETIRED' ? !item.isActive : item.isActive) &&
                item.name.toLowerCase().includes(query.toLowerCase()) &&
                (filter === 'ALL' ||
                  (item.movementPatternCode ??
                    sets.find((reference) => reference.exerciseId === item.id)?.pattern) ===
                    filter) &&
                (availability !== 'PUBLISHED' ||
                  sets.some(
                    (reference) =>
                      reference.exerciseId === item.id && reference.activeProfileCount > 0,
                  )) &&
                (availability !== 'LIVE' ||
                  readiness.some((config) => config.exerciseId === item.id && config.available)) &&
                (availability !== 'DRAFT' ||
                  readiness.some(
                    (config) => config.exerciseId === item.id && config.status === 'DRAFT',
                  )),
            )
            .map((item) => (
              <button
                key={item.id}
                onClick={() => setExerciseId(item.id)}
                className={`block w-full rounded-lg border p-3 text-left text-sm ${item.id === exerciseId ? 'border-forest bg-muted font-semibold' : ''}`}
              >
                {item.name}
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.movementPatternCode ??
                    sets.find((reference) => reference.exerciseId === item.id)?.pattern ??
                    'Not configured'}{' '}
                  · {item.equipment ?? 'No equipment'}
                  <span className="block pt-1 font-medium">
                    {!item.isActive
                      ? 'Retired · history preserved'
                      : readiness.some(
                            (config) => config.exerciseId === item.id && config.available,
                          )
                        ? 'Live configuration available'
                        : readiness.some(
                              (config) =>
                                config.exerciseId === item.id && config.status === 'DRAFT',
                            )
                          ? 'Configuration needs review'
                          : 'No live configuration'}
                  </span>
                </span>
              </button>
            ))}
          <div className="border-t pt-3">
            <label className="text-sm">
              New exercise name
              <Input value={newName} onChange={(event) => setNewName(event.target.value)} />
            </label>
            <Button
              className="mt-2 w-full"
              size="sm"
              disabled={busy || !newName.trim()}
              onClick={() =>
                void act(async () => {
                  const created = await movementReferenceApi.createExercise({
                    name: newName.trim(),
                  });
                  setExerciseId(created.id);
                  setNewName('');
                }, 'Exercise saved. Set its metadata and movement capability.')
              }
            >
              Create exercise
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            PUSH remains in the taxonomy; its runtime capability is unavailable pending verified
            footage.
          </p>
        </aside>
        <main className="min-w-0 space-y-4 rounded-xl border bg-card p-4 xl:max-h-[78vh] xl:overflow-auto">
          {exercise ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold">{exercise.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {set?.pattern ?? 'Choose a capability'} ·{' '}
                    {exercise.equipment ?? 'Equipment unspecified'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEdit({ ...exercise });
                    setTab('EXERCISE');
                  }}
                >
                  Edit exercise
                </Button>
              </div>
              {!set && exercise.isActive ? (
                <div className="space-y-2">
                  <select
                    aria-label="Reference movement pattern"
                    className="rounded border bg-background p-2"
                    value={pattern}
                    onChange={(event) => setPattern(event.target.value)}
                  >
                    {['SQUAT', 'HINGE', 'PULL'].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void act(
                        () =>
                          movementReferenceApi.createReferenceSet({
                            exerciseId,
                            pattern: pattern as 'SQUAT' | 'HINGE' | 'PULL',
                          }),
                        'Reference workspace created.',
                      )
                    }
                  >
                    Prepare references
                  </Button>
                </div>
              ) : null}
              {set?.sources.length ? (
                <label className="block text-sm">
                  Reference footage
                  <select
                    className="mt-1 w-full rounded border bg-background p-2"
                    value={sourceId}
                    onChange={(event) => setSourceId(event.target.value)}
                  >
                    {set.sources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.fileName} · {source.processingStatus} · {source.acceptedRepCount}{' '}
                        accepted / {source.rejectedRepCount} rejected
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {sourceId ? (
                <>
                  {source?.processingStatus === 'FAILED' ? (
                    <div role="alert" className="rounded border border-destructive p-3 text-sm">
                      <strong>{source.failureCode ?? 'Reference processing failed'}</strong>
                      <p>{source.failureSummary ?? source.failureMessage}</p>
                      <p>
                        Check the exact exercise, supported view, full body visibility and complete
                        repetitions. Correct the footage or processing setup, then add replacement
                        GOOD footage below. Failed footage cannot enable live assessment.
                      </p>
                    </div>
                  ) : null}
                  <VideoEvidence key={sourceId} sourceId={sourceId} refresh={0} />
                </>
              ) : (
                <p className="p-6 text-sm text-muted-foreground">
                  Upload GOOD footage to inspect pose, phases and features.
                </p>
              )}
              {set ? (
                <details open={!sourceId} className="rounded-lg border p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Add GOOD footage & camera guidance
                  </summary>
                  <p className="my-3 text-muted-foreground">
                    {set.pattern === 'PULL'
                      ? 'Vertical pulldown: show shoulders, elbows, wrists and hips, including overhead reach.'
                      : 'Show shoulders, hips, knees and ankles; start and finish upright.'}{' '}
                    Use the exact exercise variant and a supported side or oblique-side view.
                  </p>
                  <label>
                    Add GOOD reference video (MP4, maximum 500 MB)
                    <input
                      aria-label="GOOD reference video"
                      type="file"
                      accept="video/mp4"
                      disabled={busy || !exercise.isActive}
                      className="mt-2 block w-full"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file && file.size > 500_000_000)
                          setError(new Error('Choose a video smaller than 500 MB.'));
                        else if (file)
                          void act(
                            () => movementReferenceApi.uploadSource(set.id, file),
                            'Processing completed. Inspect pose and rep evidence before approval.',
                          );
                        event.target.value = '';
                      }}
                    />
                  </label>
                </details>
              ) : null}
            </>
          ) : (
            <p className="p-8 text-muted-foreground">
              Select an exercise or create a catalog entry.
            </p>
          )}
        </main>
        <aside className="space-y-4 rounded-xl border bg-card p-4 xl:max-h-[78vh] xl:overflow-auto">
          <div className="flex gap-2">
            {['REVIEW', 'EXERCISE', 'VERSIONS'].map((value) => (
              <Button
                key={value}
                variant={tab === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTab(value);
                  if (value === 'EXERCISE' && exercise) setEdit({ ...exercise });
                }}
              >
                {display(value)}
              </Button>
            ))}
          </div>
          {tab === 'EXERCISE' && edit ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void act(
                  () => apiPut(`${base}/exercises/${edit.id}`, { ...edit, pattern }),
                  'Exercise revision saved. Published configurations retain their original metadata.',
                );
              }}
            >
              {(['name', 'equipment', 'muscleGroup', 'instructions'] as const).map((key) => (
                <label key={key} className="block text-sm">
                  {display(key)}
                  <Input
                    value={edit[key] ?? ''}
                    onChange={(event) => setEdit({ ...edit, [key]: event.target.value })}
                  />
                </label>
              ))}
              <label className="block text-sm">
                Classification
                <select
                  aria-label="Exercise classification"
                  className="block w-full rounded border bg-background p-2"
                  value={pattern}
                  onChange={(event) => setPattern(event.target.value)}
                >
                  {['SQUAT', 'HINGE', 'PULL', 'PUSH', 'OTHER'].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={edit.isActive}
                  onChange={(event) => setEdit({ ...edit, isActive: event.target.checked })}
                />
                Active exercise (uncheck to retire)
              </label>
              <Button disabled={busy}>Save exercise revision</Button>
            </form>
          ) : null}
          {tab === 'VERSIONS' ? (
            <div className="space-y-3">
              <h3 className="font-semibold">Immutable publication history</h3>
              {exerciseHistory.map((revision) => (
                <details key={revision.id} className="rounded border p-2 text-xs">
                  <summary>Exercise metadata v{revision.version}</summary>
                  <pre className="overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(revision.snapshotJson), null, 2)}
                  </pre>
                </details>
              ))}
              {versions.map((item) => (
                <button
                  key={item.id}
                  className="block w-full rounded border p-3 text-left text-sm"
                  onClick={() => {
                    setVersionId(item.id);
                    setTab('REVIEW');
                  }}
                >
                  Configuration v{item.version} · {item.status}
                  <span className="block text-xs">
                    Reference v{item.configuration.referenceVersion} · {item.configuration.view}
                  </span>
                </button>
              ))}
              <p className="text-xs text-muted-foreground">
                Edit a draft or generate a new proposal. Published configurations and saved-session
                snapshots never change.
              </p>
            </div>
          ) : null}
          {tab === 'REVIEW' ? (
            <>
              <h3 className="font-semibold">Canonical reference → live capability</h3>
              {candidates.length > 1 ? (
                <label className="block text-sm">
                  Canonical reference version and view
                  <select
                    className="mt-1 w-full rounded border p-2"
                    value={candidate?.id ?? ''}
                    onChange={(event) => setProfileId(event.target.value)}
                  >
                    {candidates.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        v{profile.version} · {profile.view} · {profile.status}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {candidate ? (
                <div className="space-y-2 rounded border p-3 text-sm">
                  <strong>
                    Reference v{candidate.version} · {candidate.view}
                  </strong>
                  <p>
                    {candidate.acceptedRepCount} accepted reps · {candidate.acceptedVideoCount}{' '}
                    source videos · {candidate.status}
                  </p>
                  {candidate.status === 'REVIEW_REQUIRED' ? (
                    <Button
                      disabled={busy}
                      size="sm"
                      onClick={() =>
                        void act(
                          () => movementReferenceApi.confirmProfile(set!.id, candidate.id),
                          'Canonical profile confirmed; publish it after checking the visual evidence.',
                        )
                      }
                    >
                      Confirm canonical profile
                    </Button>
                  ) : null}
                  {candidate.status === 'CONFIRMED' ? (
                    <Button
                      disabled={busy}
                      size="sm"
                      onClick={() =>
                        void act(
                          () => movementReferenceApi.activateProfile(set!.id, candidate.id),
                          'Canonical reference published. Live configuration still needs separate review.',
                        )
                      }
                    >
                      Publish canonical reference
                    </Button>
                  ) : null}
                  <Button
                    disabled={busy || !exercise?.isActive}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void act(
                        () => apiPost(`${base}/proposals/${candidate.id}`),
                        'New configuration proposal generated from the canonical evidence.',
                      )
                    }
                  >
                    Generate configuration proposal
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No eligible canonical profile. Inspect or replace the source footage.
                </p>
              )}
              {chosen ? (
                <>
                  <label className="block text-sm">
                    Configuration version
                    <select
                      aria-label="Configuration version"
                      className="mt-1 w-full rounded border bg-background p-2"
                      value={versionId}
                      onChange={(event) => setVersionId(event.target.value)}
                    >
                      {versions.map((item) => (
                        <option key={item.id} value={item.id}>
                          v{item.version} · {item.status} · {item.view}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-sm">
                    <strong>{chosen.configuration.capability.label}</strong>
                    <br />
                    {chosen.configuration.view} · {chosen.configuration.featureDefinitionsVersion}
                  </p>
                  <h4 className="text-sm font-semibold">Required body regions</h4>
                  <div className="flex flex-wrap gap-1">
                    {chosen.configuration.selectedRegions.map((region) => (
                      <span className="rounded bg-muted px-2 py-1 text-xs" key={region}>
                        {display(region)}
                      </span>
                    ))}
                  </div>
                  <fieldset disabled={chosen.status !== 'DRAFT' || busy} className="space-y-2">
                    <legend className="text-sm font-semibold">Supported measured features</legend>
                    {Object.keys(chosen.configuration.capability.featureGeometry).map((code) => (
                      <label key={code} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={features.includes(code)}
                          disabled={code === chosen.configuration.segmentation.driver}
                          onChange={() => toggle(code, features, setFeatures)}
                        />
                        {display(code)}
                      </label>
                    ))}
                    <h4 className="pt-2 text-sm font-semibold">Optional reference-relative cues</h4>
                    {chosen.configuration.rules.map((rule) => (
                      <label key={rule.code} className="block rounded border p-2 text-sm">
                        <span className="flex gap-2">
                          <input
                            type="checkbox"
                            checked={rules.includes(rule.code)}
                            disabled={!features.includes(rule.feature)}
                            onChange={() => toggle(rule.code, rules, setRules)}
                          />
                          <strong>{display(rule.feature)}</strong>
                        </span>
                        <span className="block pl-5 text-xs">
                          Observed envelope {rule.lower.toFixed(1)}–{rule.upper.toFixed(1)}° ·{' '}
                          {rule.phases.map(display).join(', ')}
                          <br />
                          {rule.cue}
                          <br />
                          {rule.evidence}
                        </span>
                      </label>
                    ))}
                    <label className="block text-sm">
                      Visual review / correction note
                      <textarea
                        aria-label="Visual review note"
                        className="mt-1 min-h-20 w-full rounded border bg-background p-2"
                        maxLength={2000}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                      />
                    </label>
                    <Button
                      disabled={!note.trim()}
                      onClick={() =>
                        void act(
                          () =>
                            apiPut(`${base}/configurations/${chosen.id}/review`, {
                              regions: chosen.configuration.selectedRegions,
                              features,
                              enabledRules: rules,
                              note,
                            }),
                          'Configuration review saved. Publish when the selected target and cues fit this exact exercise.',
                        )
                      }
                    >
                      Confirm reviewed configuration
                    </Button>
                  </fieldset>
                  {published && published.id !== chosen.id ? (
                    <div className="rounded border p-3 text-xs">
                      <strong>Compared with live v{published.version}</strong>
                      <p>
                        Reference: v{published.configuration.referenceVersion} → v
                        {chosen.configuration.referenceVersion}
                      </p>
                      <p>
                        Features: {published.configuration.selectedFeatures.map(display).join(', ')}{' '}
                        → {features.map(display).join(', ')}
                      </p>
                      <p>
                        Enabled rules:{' '}
                        {published.configuration.rules.filter((rule) => rule.enabled).length} →{' '}
                        {rules.length}
                      </p>
                      {chosen.configuration.rules.map((rule) => {
                        const old = published.configuration.rules.find(
                          (item) => item.code === rule.code,
                        );
                        return (
                          <p key={rule.code}>
                            {display(rule.feature)} target:{' '}
                            {old ? `${old.lower.toFixed(1)}–${old.upper.toFixed(1)}°` : 'new'} →{' '}
                            {rule.lower.toFixed(1)}–{rule.upper.toFixed(1)}° ·{' '}
                            {rules.includes(rule.code) ? 'enabled' : 'disabled'}
                          </p>
                        );
                      })}
                    </div>
                  ) : null}
                  {chosen.status === 'DRAFT' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={busy || chosen.configuration.reviewRequired}
                        onClick={() =>
                          void act(
                            () => apiPost(`${base}/configurations/${chosen.id}/publish`),
                            'Live configuration published. Mobile can now load this exact version.',
                          )
                        }
                      >
                        Publish live configuration
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void act(
                            () => apiPost(`${base}/configurations/${chosen.id}/reject`),
                            'Draft rejected; historical versions are preserved.',
                          )
                        }
                      >
                        Reject draft
                      </Button>
                    </div>
                  ) : (
                    <p className="rounded bg-muted p-3 text-sm">
                      {chosen.status} · v{chosen.version}. Generate a new proposal to change this
                      configuration.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {chosen.configuration.limitations}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  A published aggregate profile alone does not enable live feedback. Generate,
                  visually review and publish its runtime configuration.
                </p>
              )}
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
