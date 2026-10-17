import type { ReferenceSetSourceDto } from '../api/types';

export function processingIssueCode(code?: string | null, diagnostic = ''): string {
  const aliases: Record<string, string> = {
    PATTERN_MISMATCH: 'UNSUPPORTED_PATTERN',
    UNSUPPORTED_VIDEO_CODEC: 'VIDEO_DECODE_FAILED',
    VIDEO_NORMALIZATION_FAILED: /not available|requires ff/.test(diagnostic)
      ? 'PROCESSOR_UNAVAILABLE'
      : 'VIDEO_NORMALIZATION_FAILED',
  };
  if (code) return aliases[code] ?? code;
  if (/libEGL|libGLES|not available at the configured path|model was not found/i.test(diagnostic))
    return 'PROCESSOR_UNAVAILABLE';
  if (/Detected pattern.*only SQUAT|does not match reference set pattern/is.test(diagnostic))
    return 'UNSUPPORTED_PATTERN';
  if (/No valid SQUAT repetitions|Not enough usable SQUAT frames/i.test(diagnostic))
    return 'INSUFFICIENT_MOVEMENT_EVIDENCE';
  if (
    /corrupt|could not be decoded|No frames could be decoded|could not open video/i.test(diagnostic)
  )
    return 'VIDEO_DECODE_FAILED';
  return 'REFERENCE_PROCESSING_FAILED';
}

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const finite = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function sourceEvidence(source: ReferenceSetSourceDto) {
  const summary = source.processingSummary ?? {};
  const video = object(summary.sourceVideo);
  const frames = object(summary.frameValidation);
  const width = finite(video.width),
    height = finite(video.height);
  return {
    durationSeconds: finite(video.durationMs) === null ? null : Number(video.durationMs) / 1000,
    fps: finite(video.fps),
    resolution: width !== null && height !== null ? `${width} × ${height}` : null,
    usableFrames: finite(frames.usableFrames),
    totalFrames: finite(frames.totalFrames),
    rejectionReasons: Object.entries(object(frames.rejectionReasons)).filter(
      (entry): entry is [string, number] => finite(entry[1]) !== null,
    ),
  };
}

export function processingIsStale(source: ReferenceSetSourceDto, now = Date.now()) {
  return (
    source.processingStatus === 'PROCESSING' &&
    Boolean(source.createdAtUtc) &&
    now - Date.parse(source.createdAtUtc!) > 10 * 60 * 1000
  );
}
