import { Eye, Film, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { runtimeBase } from '../api/movementRuntimeApi';
import type { RuntimeConfiguration, VisualEvidence } from '../api/runtimeTypes';
import type { ReferenceSetSourceDto } from '../api/types';
import { featureJoints, formatTime, regionJoints } from '../model/studio';

import { StudioError, StudioStatus } from './StudioPrimitives';

import { apiGet, apiPost } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errorTypes';
import { Button } from '@/shared/ui/button';

const edges = [
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
] as const;

export function ReferenceInspector({
  source,
  capability,
  configuration,
  focusFeature,
  context,
  onReady,
}: {
  source: ReferenceSetSourceDto;
  capability?: RuntimeConfiguration['capability'];
  configuration?: RuntimeConfiguration;
  focusFeature?: string;
  context?: React.ReactNode;
  onReady: (sourceId: string, version: string) => void;
}) {
  const { t } = useTranslation('movementStudio');
  const { t: technical } = useTranslation('movementAdmin');
  const video = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState('');
  const [evidence, setEvidence] = useState<VisualEvidence>();
  const [videoError, setVideoError] = useState<unknown>();
  const [evidenceError, setEvidenceError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [overlay, setOverlay] = useState(true);
  const [feature, setFeature] = useState(focusFeature ?? capability?.driver ?? '');
  const [region, setRegion] = useState('');
  useEffect(() => {
    if (focusFeature) {
      setFeature(focusFeature);
      setRegion('');
    }
  }, [focusFeature]);
  useEffect(() => {
    let alive = true;
    let objectUrl = '';
    setVideoError(undefined);
    setUrl('');
    void apiGet<Blob>(`${runtimeBase}/sources/${source.id}/video`, { responseType: 'blob' })
      .then((blob) => {
        if (alive) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch((error) => {
        if (alive) setVideoError(error);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source.id, revision]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setEvidenceError(undefined);
    setEvidence(undefined);
    void apiGet<VisualEvidence>(`${runtimeBase}/sources/${source.id}/evidence`)
      .then((value) => {
        if (alive) {
          setEvidence(value);
          onReady(source.id, value.featureDefinitionsVersion);
        }
      })
      .catch((error) => {
        if (alive) setEvidenceError(error);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [source.id, revision, onReady]);
  const frame = evidence?.frames.reduce<VisualEvidence['frames'][number] | undefined>(
    (closest, point) =>
      !closest || Math.abs(point.timeMs - time) < Math.abs(closest.timeMs - time) ? point : closest,
    undefined,
  );
  // Do not show a pose from a distant timestamp over a gap in the extracted footage.
  const aligned = frame && Math.abs(frame.timeMs - time) <= 250 ? frame : undefined;
  const rep = evidence?.repetitions.find(
    (item) => time >= item.startTimestampMs && time <= item.endTimestampMs,
  );
  const phase = rep?.phases.find(
    (item) => time >= item.startTimestampMs && time <= item.endTimestampMs,
  );
  const length = Math.max(duration, evidence?.frames.at(-1)?.timeMs ?? 0, 1);
  const featureCodes = capability
    ? Object.keys(capability.featureGeometry)
    : Object.keys(aligned?.features ?? {}).filter((key) => key !== 'cycleProgress');
  const selectedFeature = featureCodes.includes(feature) ? feature : (featureCodes[0] ?? '');
  const highlights = region
    ? (regionJoints[region] ?? [])
    : featureJoints(capability, selectedFeature);
  const target = configuration?.rules.find((rule) => rule.feature === selectedFeature);
  const points =
    evidence?.frames.filter((point) => Number.isFinite(point.features[selectedFeature])) ?? [];
  const values = points.map((point) => point.features[selectedFeature] ?? 0);
  const minimum = Math.min(...values, target?.lower ?? Infinity);
  const maximum = Math.max(...values, target?.upper ?? -Infinity);
  const span = Math.max(1, maximum - minimum);
  const y = (value: number) => 85 - ((value - minimum) / span) * 70;
  let previous = -Infinity;
  const path = points
    .map((point) => {
      const command = point.timeMs - previous <= 250 ? 'L' : 'M';
      previous = point.timeMs;
      return `${command}${(point.timeMs / length) * 100},${y(point.features[selectedFeature] ?? 0)}`;
    })
    .join(' ');
  const seek = (value: number) => {
    const next = Math.max(0, Math.min(length, value));
    if (video.current) {
      video.current.pause();
      video.current.currentTime = next / 1000;
    }
    setTime(next);
  };
  const featureName = (code: string) => t(`featureNames.${code}`, { defaultValue: code });
  const trackingRegions =
    configuration?.assessmentPlan?.requiredRegions ?? capability?.requiredRegions ?? [];
  const trackingIndices = new Set(trackingRegions.flatMap((code) => regionJoints[code] ?? []));
  const regions = [
    ...new Set([
      ...trackingRegions,
      ...(capability?.requiredRegions ?? []).filter((code) =>
        (regionJoints[code] ?? []).some((index) => !trackingIndices.has(index)),
      ),
    ]),
  ];
  const missingEvidence = evidenceError instanceof ApiError && evidenceError.status === 409;
  return (
    <div className="studio-inspection-grid">
      <div className="studio-player-panel">
        <div className="studio-panel-heading">
          <h2>
            <Film size={18} aria-hidden />
            {t('video')}
          </h2>
          <label className="studio-overlay-toggle">
            <input
              type="checkbox"
              checked={overlay}
              onChange={(event) => setOverlay(event.target.checked)}
            />
            <Eye size={16} aria-hidden />
            {t('overlay')}
          </label>
        </div>
        <StudioError error={videoError} />
        <div
          className="studio-player"
          style={{
            aspectRatio: `${evidence?.sourceVideo.width ?? 16}/${evidence?.sourceVideo.height ?? 9}`,
            maxWidth: `min(100%, ${60 * ((evidence?.sourceVideo.width ?? 16) / (evidence?.sourceVideo.height ?? 9))}vh)`,
            marginInline: 'auto',
          }}
        >
          {url ? (
            <video
              ref={video}
              src={url}
              controls
              playsInline
              preload="metadata"
              onError={() => setVideoError(new Error('STUDIO_VIDEO_PREVIEW'))}
              onLoadedMetadata={() => setDuration((video.current?.duration ?? 0) * 1000)}
              onTimeUpdate={() => setTime((video.current?.currentTime ?? 0) * 1000)}
              onSeeked={() => setTime((video.current?.currentTime ?? 0) * 1000)}
            />
          ) : (
            <p>
              {t(videoError ? 'unavailable' : 'videoLoading')}
              {videoError ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  {t('retry')}
                </Button>
              ) : null}
            </p>
          )}
          {overlay && aligned ? (
            <svg
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              className="studio-pose-overlay"
              role="img"
              aria-label={t('overlay')}
            >
              {edges.map(([a, b]) => {
                const first = aligned.landmarks.find((point) => point.index === a),
                  second = aligned.landmarks.find((point) => point.index === b);
                const active = highlights.includes(a) && highlights.includes(b);
                return first && second && Math.min(first.visibility, second.visibility) >= 0.5 ? (
                  <line
                    key={`${a}-${b}`}
                    x1={first.x}
                    y1={first.y}
                    x2={second.x}
                    y2={second.y}
                    stroke={active ? '#e6ff72' : '#7dceac'}
                    strokeWidth={active ? 0.007 : 0.003}
                    opacity={active ? 1 : 0.5}
                  />
                ) : null;
              })}
              {aligned.landmarks
                .filter((point) => point.visibility >= 0.5)
                .map((point) => (
                  <circle
                    key={point.index}
                    cx={point.x}
                    cy={point.y}
                    r={highlights.includes(point.index) ? 0.008 : 0.003}
                    fill={highlights.includes(point.index) ? '#fff4a8' : '#fff'}
                    opacity={!highlights.length || highlights.includes(point.index) ? 1 : 0.5}
                  />
                ))}
            </svg>
          ) : null}
        </div>
        <div className="studio-video-readout">
          <strong>{formatTime(time)}</strong>
          <span>{rep ? t('rep', { number: rep.repIndex }) : t('outsideRep')}</span>
          <span>{phase ? t(`phases.${phase.name}`, { defaultValue: phase.name }) : '—'}</span>
          <span className={aligned?.usable ? 'is-reliable' : ''}>
            {aligned ? t(aligned.usable ? 'reliable' : 'notUsable') : t('noFrame')}
          </span>
        </div>
        {evidence ? (
          <>
            <div className="studio-timeline-heading">
              <h3>{t('timeline')}</h3>
              <span>
                {t('accepted', {
                  count: evidence.repetitions.filter((item) => item.status === 'ACCEPTED').length,
                })}{' '}
                ·{' '}
                {t('rejected', {
                  count: evidence.repetitions.filter((item) => item.status !== 'ACCEPTED').length,
                })}
              </span>
            </div>
            <div className="studio-rep-timeline" aria-label={t('timeline')}>
              {evidence.repetitions.map((item) => (
                <button
                  key={item.repIndex}
                  className={`${item.status.toLowerCase()} ${rep?.repIndex === item.repIndex ? 'is-selected' : ''}`}
                  style={{
                    left: `${(item.startTimestampMs / length) * 100}%`,
                    width: `${Math.max(1, ((item.endTimestampMs - item.startTimestampMs) / length) * 100)}%`,
                  }}
                  onClick={() => seek(item.startTimestampMs)}
                  title={`${t('rep', { number: item.repIndex })} · ${t(`status.${item.status.toLowerCase()}`)}`}
                  aria-label={`${t('rep', { number: item.repIndex })} · ${t(`status.${item.status.toLowerCase()}`)}`}
                >
                  {item.repIndex}
                </button>
              ))}
            </div>
            <input
              className="studio-seek"
              type="range"
              aria-label={t('timeline')}
              min={0}
              max={length}
              step={10}
              value={Math.min(time, length)}
              onChange={(event) => seek(Number(event.target.value))}
            />
            {rep ? (
              <div className="studio-phase-row">
                <StudioStatus value={rep.status.toLowerCase()} />
                {rep.phases.map((item, index) => (
                  <button
                    key={`${item.name}-${index}`}
                    aria-pressed={phase === item}
                    onClick={() => seek((item.startTimestampMs + item.endTimestampMs) / 2)}
                  >
                    {t(`phases.${item.name}`, { defaultValue: item.name })}
                  </button>
                ))}
              </div>
            ) : null}
            {rep?.rejectionReasons.length ? (
              <div className="studio-inline-warning">
                {rep.rejectionReasons
                  .map((reason) =>
                    technical(`rejectionReasons.${reason}`, { defaultValue: t('questionable') }),
                  )
                  .join(' · ')}
              </div>
            ) : null}
            {!evidence.repetitions.length ? <p className="studio-muted">{t('noReps')}</p> : null}
            {points.length ? (
              <div className="studio-feature-plot">
                <div>
                  <h3>{t('trajectory', { feature: featureName(selectedFeature) })}</h3>
                  <strong>
                    {Number.isFinite(aligned?.features[selectedFeature])
                      ? `${aligned?.features[selectedFeature]?.toFixed(1)}°`
                      : '—'}
                  </strong>
                </div>
                <button
                  className="studio-chart"
                  aria-label={t('trajectory', { feature: featureName(selectedFeature) })}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    seek(((event.clientX - rect.left) / rect.width) * length);
                  }}
                >
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    {target ? (
                      <rect
                        x={0}
                        y={y(target.upper)}
                        width={100}
                        height={Math.max(1, y(target.lower) - y(target.upper))}
                        fill="currentColor"
                        opacity={0.08}
                      />
                    ) : null}
                    {[15, 50, 85].map((line) => (
                      <line
                        key={line}
                        x1={0}
                        x2={100}
                        y1={line}
                        y2={line}
                        stroke="currentColor"
                        opacity={0.12}
                        strokeWidth={0.3}
                      />
                    ))}
                    <path
                      d={path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={0.7}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={(time / length) * 100}
                      x2={(time / length) * 100}
                      y1={0}
                      y2={100}
                      stroke="#ba8633"
                      strokeWidth={0.4}
                    />
                  </svg>
                  <span className="studio-chart-top">{maximum.toFixed(1)}°</span>
                  <span className="studio-chart-bottom">{minimum.toFixed(1)}°</span>
                </button>
                <div className="studio-plot-caption">
                  <span>0:00</span>
                  <span>
                    {target
                      ? `${t('range')}: ${target.lower.toFixed(1)}–${target.upper.toFixed(1)}°`
                      : t('noTarget')}
                  </span>
                  <span>{formatTime(length)}</span>
                </div>
              </div>
            ) : null}
            <p className="studio-caption">{t('sampled')}</p>
          </>
        ) : (
          <div className="studio-evidence-empty">
            <p>
              {t(
                loading
                  ? 'evidenceLoading'
                  : missingEvidence
                    ? 'evidenceMissing'
                    : 'errors.generic',
              )}
            </p>
            {!loading ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  if (!missingEvidence) {
                    setRevision((value) => value + 1);
                    return;
                  }
                  setBusy(true);
                  setEvidenceError(undefined);
                  void apiPost(`${runtimeBase}/sources/${source.id}/visual-review`, undefined, {
                    timeout: 330000,
                  })
                    .then(() => {
                      setRevision((value) => value + 1);
                      setLoading(true);
                    })
                    .catch(setEvidenceError)
                    .finally(() => setBusy(false));
                }}
              >
                <RefreshCw size={16} className={busy ? 'animate-spin' : ''} aria-hidden />
                {t(busy ? 'loading' : missingEvidence ? 'generateEvidence' : 'retry')}
              </Button>
            ) : null}
          </div>
        )}
        {evidenceError && !loading ? (
          <details className="studio-diagnostics">
            <summary>{t('technicalDetails')}</summary>
            <StudioError error={evidenceError} />
          </details>
        ) : null}
      </div>
      <aside className="studio-evidence-inspector" aria-label={t('quality')}>
        {context}
        <div className="studio-panel-heading">
          <h2>{t('bodyRegions')}</h2>
        </div>
        <p className="studio-caption">{t('regionHelp')}</p>
        <div className="studio-regions">
          {regions.map((code) => {
            const indices = regionJoints[code] ?? [];
            const visible = indices.filter((index) =>
              aligned?.landmarks.some(
                (point) =>
                  point.index === index &&
                  point.visibility >= 0.5 &&
                  point.x >= 0 &&
                  point.x <= 1 &&
                  point.y >= 0 &&
                  point.y <= 1,
              ),
            ).length;
            return (
              <button
                key={code}
                aria-pressed={region === code}
                className={region === code ? 'is-selected' : ''}
                onClick={() => {
                  setRegion(region === code ? '' : code);
                  const matching = featureCodes.find((item) =>
                    featureJoints(capability, item).some((index) => indices.includes(index)),
                  );
                  if (matching) setFeature(matching);
                }}
              >
                <span>{t(`regions.${code}`, { defaultValue: code })}</span>
                <small>
                  {visible}/{indices.length} ·{' '}
                  {t(trackingRegions.includes(code) ? 'regionTracking' : 'regionOptional')}
                </small>
              </button>
            );
          })}
        </div>
        <h3>{t('features')}</h3>
        <p className="studio-caption">{t('featureHelp')}</p>
        <div className="studio-measurements">
          {featureCodes.map((code) => (
            <button
              key={code}
              className={selectedFeature === code ? 'is-selected' : ''}
              aria-pressed={selectedFeature === code}
              onClick={() => {
                setFeature(code);
                setRegion('');
              }}
            >
              <span>
                <strong>{featureName(code)}</strong>
                <small>{t(`featureDescriptions.${code}`, { defaultValue: '' })}</small>
              </span>
              <b>
                {Number.isFinite(aligned?.features[code])
                  ? `${aligned?.features[code]?.toFixed(1)}°`
                  : '—'}
              </b>
            </button>
          ))}
        </div>
        {!featureCodes.length ? <p className="studio-muted">{t('noFeatures')}</p> : null}
        <details className="studio-diagnostics">
          <summary>{t('sourceDiagnostics')}</summary>
          <p>{t('regenerateHelp')}</p>
          <StudioError error={evidenceError} />
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setEvidenceError(undefined);
              void apiPost(`${runtimeBase}/sources/${source.id}/visual-review`, undefined, {
                timeout: 330000,
              })
                .then(() => {
                  setRevision((value) => value + 1);
                  setLoading(true);
                })
                .catch(setEvidenceError)
                .finally(() => setBusy(false));
            }}
          >
            <RefreshCw size={14} aria-hidden />
            {t(busy ? 'loading' : 'regenerate')}
          </Button>
          <pre>
            {JSON.stringify(
              {
                processing: source.processingSummary,
                quality: source.dataQuality,
                decision: source.deterministicEvidence,
                warnings: source.warnings,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </aside>
    </div>
  );
}
