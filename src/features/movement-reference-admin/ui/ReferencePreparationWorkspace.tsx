import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  FileVideo,
  History,
  Loader2,
  Radio,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import type { ReferenceSetProfileDto, ReferenceSetSourceDto } from '../api/types';
import type { SourceOperationalOutcome, ViewReferenceState } from '../model/presentation';
import {
  countSourceOutcomes,
  getContributingSourceIds,
  getSourceOperationalOutcome,
  getViewReferenceStates,
  rollUpExerciseState,
} from '../model/presentation';
import {
  processingIsStale,
  processingIssueCode,
  sourceEvidence,
} from '../model/processingEvidence';
import {
  useActivateReferenceProfile,
  useConfirmReferenceProfile,
  useReferenceSet,
  useUploadReferenceSource,
} from '../model/useMovementReferences';

import { ApiErrorNotice } from './ApiErrorNotice';
import { PresentationStateBadge } from './ExerciseReferenceLibrary';
import { MovementStatusBadge } from './MovementStatusBadge';

import { ApiError, NetworkError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

const MAX_VIDEO_BYTES = 500_000_000;

const outcomeTone: Record<SourceOperationalOutcome, string> = {
  ANALYZING: 'bg-blue-100 text-blue-800',
  USABLE: 'bg-energy/50 text-forest',
  USABLE_REDUCED: 'bg-energy/50 text-forest',
  NEEDS_REVIEW: 'bg-amber-100 text-amber-900',
  EXCLUDED: 'bg-muted text-muted-foreground',
  FAILED: 'bg-destructive/10 text-destructive',
};

function OperationalOutcome({ outcome }: { outcome: SourceOperationalOutcome }) {
  const { t } = useTranslation('movementAdmin');
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        outcomeTone[outcome],
      )}
    >
      {t(`sourceOutcome.${outcome}`)}
    </span>
  );
}

function ScalarEvidence({ value }: { value: Record<string, unknown> }) {
  const entries = Object.entries(value).filter(([, item]) =>
    ['string', 'number', 'boolean'].includes(typeof item),
  );
  if (entries.length === 0) return null;
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, item]) => (
        <div key={key} className="rounded-md bg-muted/60 p-2">
          <dt className="text-xs text-muted-foreground">{key}</dt>
          <dd className="text-sm font-medium">{String(item)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ReferenceFootage({
  sources,
  highlightedSourceId,
  onReplaceSource,
}: {
  sources: ReferenceSetSourceDto[];
  highlightedSourceId?: string;
  onReplaceSource?: () => void;
}) {
  const { t } = useTranslation('movementAdmin');
  if (sources.length === 0) {
    return (
      <EmptyState
        icon={FileVideo}
        title={t('workspace.noSources')}
        description={t('workspace.noSourcesDescription')}
      />
    );
  }
  const groups = sources.reduce<Record<string, ReferenceSetSourceDto[]>>((result, source) => {
    const outcome = getSourceOperationalOutcome(source);
    const group =
      outcome === 'FAILED'
        ? t('inspection.failedFootage')
        : outcome === 'ANALYZING'
          ? t('inspection.pendingFootage')
          : outcome === 'EXCLUDED'
            ? t('workspace.unsupportedFootage')
            : (source.detectedView ?? t('workspace.unknownView'));
    (result[group] ??= []).push(source);
    return result;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([view, footage]) => (
        <section key={view} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {view}
          </h4>
          {footage.map((source) => {
            const outcome = getSourceOperationalOutcome(source);
            const issue = processingIssueCode(source.failureCode, source.failureMessage ?? '');
            const evidence = sourceEvidence(source);
            return (
              <article
                id={`source-${source.id}`}
                key={source.id}
                tabIndex={-1}
                className={cn(
                  'rounded-lg border border-border bg-card p-4 outline-none',
                  highlightedSourceId === source.id && 'ring-2 ring-energy',
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h5 className="truncate font-semibold">{source.fileName}</h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {source.processingStatus === 'PROCESSED'
                        ? t('workspace.footageResult', {
                            accepted: source.acceptedRepCount,
                            rejected: source.rejectedRepCount,
                          })
                        : t('inspection.noRepResult')}
                    </p>
                  </div>
                  <OperationalOutcome outcome={outcome} />
                </div>
                <p className="mt-3 text-sm">
                  {outcome === 'FAILED'
                    ? t(`processingIssues.${issue}.description`, {
                        defaultValue: t('processingIssues.REFERENCE_PROCESSING_FAILED.description'),
                      })
                    : source.reviewReason ||
                      t(`sourceOutcomeDescription.${outcome}`, {
                        view: source.detectedView ?? t('workspace.unknownView'),
                      })}
                </p>
                {outcome === 'FAILED' ? (
                  <div className="mt-3 space-y-2 rounded-md bg-muted/50 p-3">
                    <strong className="text-sm">
                      {t(`processingIssues.${issue}.title`, {
                        defaultValue: t('processingIssues.REFERENCE_PROCESSING_FAILED.title'),
                      })}
                    </strong>
                    <p className="text-sm">
                      {t(`processingIssues.${issue}.recovery`, {
                        defaultValue: t('processingIssues.REFERENCE_PROCESSING_FAILED.recovery'),
                      })}
                    </p>
                    {onReplaceSource && issue !== 'PROCESSOR_UNAVAILABLE' ? (
                      <Button size="sm" variant="outline" onClick={onReplaceSource}>
                        {t('inspection.replaceVideo')}
                      </Button>
                    ) : null}
                    {issue === 'UNSUPPORTED_PATTERN' ? (
                      <Link
                        className="ml-3 inline-block text-sm font-medium underline underline-offset-4"
                        to={ROUTES.superadmin.movementAssessment}
                      >
                        {t('inspection.reviewExercise')}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
                {processingIsStale(source) ? (
                  <p
                    className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900"
                    role="status"
                  >
                    {t('inspection.stale')}
                  </p>
                ) : null}
                {source.processingStatus === 'PROCESSED' ? (
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">{t('fields.pattern')}</dt>
                      <dd>{source.detectedPattern ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('fields.view')}</dt>
                      <dd>{source.detectedView ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('inspection.duration')}</dt>
                      <dd>
                        {evidence.durationSeconds === null
                          ? '—'
                          : `${evidence.durationSeconds.toFixed(1)} s`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('inspection.resolution')}</dt>
                      <dd>{evidence.resolution ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('inspection.frameRate')}</dt>
                      <dd>{evidence.fps === null ? '—' : `${evidence.fps.toFixed(1)} fps`}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('inspection.usableFrames')}</dt>
                      <dd>
                        {evidence.usableFrames === null
                          ? '—'
                          : `${evidence.usableFrames} / ${evidence.totalFrames ?? '—'}`}
                      </dd>
                    </div>
                  </dl>
                ) : null}
                {source.warnings[0] ? (
                  <p className="mt-3 flex items-start gap-2 text-sm text-amber-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {source.warnings[0]}
                  </p>
                ) : null}
                <details className="mt-4 rounded-md border border-border p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    {t('workspace.evidenceDetails')}
                  </summary>
                  <div className="mt-3 space-y-4">
                    {source.detectedViewConfidence != null ? (
                      <p>
                        <span className="text-muted-foreground">{t('fields.viewConfidence')}:</span>{' '}
                        <strong>{Math.round(source.detectedViewConfidence * 100)}%</strong>
                      </p>
                    ) : null}
                    <ScalarEvidence value={source.dataQuality} />
                    {source.warnings.length > 1 ? (
                      <ul className="list-disc space-y-1 pl-5">
                        {source.warnings.slice(1).map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    ) : null}
                    <details>
                      <summary className="cursor-pointer text-muted-foreground">
                        {t('workspace.technicalAudit')}
                      </summary>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <MovementStatusBadge value={source.processingStatus} />
                        {source.decision ? <MovementStatusBadge value={source.decision} /> : null}
                        {source.action ? <MovementStatusBadge value={source.action} /> : null}
                      </div>
                      <ScalarEvidence value={source.deterministicEvidence} />
                      {source.failureMessage ? (
                        <div className="mt-3 space-y-2">
                          <code className="text-xs">
                            {source.failureCode ?? issue} · {source.failureStage ?? 'UNKNOWN'} ·{' '}
                            {source.id}
                          </code>
                          <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
                            {source.failureMessage}
                          </pre>
                        </div>
                      ) : null}
                      {source.adjudication ? (
                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div>
                            <dt>TypeSafe decision</dt>
                            <dd>{source.adjudication.choice ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>TypeSafe probability</dt>
                            <dd>{source.adjudication.confidence ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Governance outcome</dt>
                            <dd>{source.adjudication.governanceOutcome}</dd>
                          </div>
                          <div>
                            <dt>Governance reason</dt>
                            <dd>{source.adjudication.governanceReason}</dd>
                          </div>
                        </dl>
                      ) : null}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-muted-foreground">
                          {t('workspace.rawPayload')}
                        </summary>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
                          {JSON.stringify(source, null, 2)}
                        </pre>
                      </details>
                    </details>
                  </div>
                </details>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function ReadinessPanel({ view }: { view: ViewReferenceState }) {
  const { t } = useTranslation('movementAdmin');
  const review = view.sources.filter(
    (source) => getSourceOperationalOutcome(source) === 'NEEDS_REVIEW',
  ).length;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold">{view.view}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{t('readiness.matchingView')}</p>
          </div>
          <PresentationStateBadge state={view.state} />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">{t('readiness.usableVideos')}</dt>
            <dd className="font-semibold">{view.usableSources}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('fields.acceptedReps')}</dt>
            <dd className="font-semibold">{view.acceptedReps}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('readiness.needsReview')}</dt>
            <dd className="font-semibold">{review}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function GeneratedReferenceCard({
  profile,
  referenceSetId,
  role,
  sources,
  replacingLive,
}: {
  profile: ReferenceSetProfileDto;
  referenceSetId: string;
  role: 'live' | 'candidate';
  sources: ReferenceSetSourceDto[];
  replacingLive?: boolean;
}) {
  const { t } = useTranslation('movementAdmin');
  const confirm = useConfirmReferenceProfile(referenceSetId);
  const activate = useActivateReferenceProfile(referenceSetId);
  const [pendingAction, setPendingAction] = useState<'confirm' | 'activate' | null>(null);
  const contributorIds = getContributingSourceIds(profile);
  const contributors = contributorIds.map(
    (id) => sources.find((source) => source.id === id)?.fileName ?? id,
  );
  const warnings = Array.isArray(profile.qualitySummary.warnings)
    ? profile.qualitySummary.warnings.filter((item): item is string => typeof item === 'string')
    : [];
  const phases: string[] = Array.isArray(profile.aggregateProfile.phaseDefinitions)
    ? profile.aggregateProfile.phaseDefinitions.flatMap((phase: unknown): string[] =>
        phase && typeof phase === 'object' && 'code' in phase && typeof phase.code === 'string'
          ? [phase.code]
          : [],
      )
    : [];
  const commitAction = async () => {
    try {
      if (pendingAction === 'activate') {
        await activate.mutateAsync(profile.id);
        toast.success(t('messages.profileActivated'));
      } else {
        await confirm.mutateAsync(profile.id);
        toast.success(t('messages.profileConfirmed'));
      }
      setPendingAction(null);
    } catch {
      // Typed backend error is displayed below.
    }
  };

  return (
    <article
      className={cn('rounded-lg border p-4', role === 'live' && 'bg-energy/10 border-forest/40')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {role === 'live' ? t('workspace.liveVersion') : t('workspace.currentCandidate')}
          </p>
          <h4 className="mt-1 text-lg font-semibold">
            {profile.view} · v{profile.version}
          </h4>
        </div>
        {role === 'live' ? (
          <span className="bg-energy/50 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-forest">
            <Radio className="h-3.5 w-3.5" /> {t('workspace.liveForAssessments')}
          </span>
        ) : (
          <MovementStatusBadge value={profile.status} />
        )}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t('fields.version')}</dt>
          <dd className="font-semibold">v{profile.version}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('fields.contributingFootage')}</dt>
          <dd className="font-semibold">{profile.sourceVideoCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('fields.acceptedReps')}</dt>
          <dd className="font-semibold">{profile.acceptedRepCount}</dd>
        </div>
      </dl>
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">{t('inspection.phases')}: </span>
          {phases.length
            ? phases
                .map((phase) =>
                  t(`inspection.phaseLabels.${phase}`, {
                    defaultValue: phase.replaceAll('_', ' ').toLowerCase(),
                  }),
                )
                .join(' → ')
            : t('inspection.noPhaseEvidence')}
        </p>
        {Array.isArray(profile.normalizedReference.trajectory) ? (
          <p>
            <span className="text-muted-foreground">{t('inspection.samples')}: </span>
            {profile.normalizedReference.trajectory.length}
          </p>
        ) : null}
      </div>
      {warnings[0] ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {warnings[0]}
        </p>
      ) : null}
      {contributors.length > 0 ? (
        <details className="mt-4 rounded-md border p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            {t('workspace.contributingFootage')}
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {contributors.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </details>
      ) : null}
      <details className="mt-4 rounded-md border p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          {t('workspace.profileTechnicalQuality')}
        </summary>
        <div className="mt-3 space-y-3">
          <ScalarEvidence value={profile.qualitySummary} />
          {warnings.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          ) : null}
          <details>
            <summary className="cursor-pointer text-muted-foreground">
              {t('workspace.rawPayload')}
            </summary>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
              {JSON.stringify(profile.qualitySummary, null, 2)}
            </pre>
          </details>
        </div>
      </details>
      <ApiErrorNotice error={confirm.error ?? activate.error} />
      {role === 'candidate' ? (
        <div className="mt-4 flex justify-end">
          {profile.status === 'REVIEW_REQUIRED' ? (
            <Button
              size="sm"
              disabled={confirm.isPending}
              onClick={() => setPendingAction('confirm')}
            >
              {confirm.isPending ? t('actions.approving') : t('actions.approveVersion')}
            </Button>
          ) : null}
          {profile.status === 'CONFIRMED' ? (
            <Button
              size="sm"
              disabled={activate.isPending}
              onClick={() => setPendingAction('activate')}
            >
              {activate.isPending ? t('actions.publishing') : t('actions.publishLive')}
            </Button>
          ) : null}
        </div>
      ) : null}
      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !confirm.isPending && !activate.isPending) setPendingAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'activate'
                ? t('profileAction.publishTitle')
                : t('profileAction.approveTitle')}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'activate'
                ? t('profileAction.publishDescription', {
                    view: profile.view,
                    version: profile.version,
                  })
                : t('profileAction.approveDescription', {
                    view: profile.view,
                    version: profile.version,
                  })}
            </DialogDescription>
          </DialogHeader>
          <ApiErrorNotice error={confirm.error ?? activate.error} />
          {pendingAction === 'activate' && replacingLive ? (
            <p className="rounded-md bg-muted p-3 text-sm">
              {t('profileAction.replacementNotice')}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={confirm.isPending || activate.isPending}
              onClick={() => setPendingAction(null)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              disabled={confirm.isPending || activate.isPending}
              onClick={() => void commitAction()}
            >
              {pendingAction === 'activate'
                ? t('actions.publishLive')
                : t('actions.approveVersion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function ProcessingStages() {
  const { t } = useTranslation('movementAdmin');
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950" role="status">
      <div className="flex items-center gap-2 font-semibold">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('processing.title')}
      </div>
      <p className="mt-1 text-sm">{t('processing.description')}</p>
      <ol className="mt-3 flex flex-wrap gap-2 text-xs">
        {['uploading', 'normalizing', 'analyzing', 'detecting', 'building'].map((stage, index) => (
          <li
            key={stage}
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1"
          >
            {index > 0 ? <ChevronRight className="h-3 w-3" /> : null}
            {t(`processing.stages.${stage}`)}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ReferencePreparationWorkspace({ referenceSetId }: { referenceSetId: string }) {
  const { t } = useTranslation('movementAdmin');
  const referenceSet = useReferenceSet(referenceSetId);
  const upload = useUploadReferenceSource(referenceSetId);
  const [video, setVideo] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [outcomeUncertain, setOutcomeUncertain] = useState(false);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!video) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(video);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  const views = useMemo(
    () => (referenceSet.data ? getViewReferenceStates(referenceSet.data) : []),
    [referenceSet.data],
  );
  const histories = views.flatMap((view) => view.history);

  const selectVideo = (file: File | null) => {
    setValidationError('');
    setVideo(null);
    if (!file) return;
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      setValidationError(t('upload.invalidType'));
    } else if (file.size === 0) {
      setValidationError(t('upload.empty'));
    } else if (file.size > MAX_VIDEO_BYTES) {
      setValidationError(t('upload.tooLarge'));
    } else {
      setVideo(file);
    }
  };

  const submitVideo = async () => {
    if (!video) return;
    try {
      const existingIds = new Set(referenceSet.data?.sources.map((source) => source.id));
      const result = await upload.mutateAsync(video);
      const uploaded = result.sources.find((source) => !existingIds.has(source.id));
      setVideo(null);
      if (inputRef.current) inputRef.current.value = '';
      setHighlightedSourceId(uploaded?.id);
      if (uploaded?.processingStatus === 'FAILED') toast.error(t('messages.sourceUploadFailed'));
      else if (uploaded && getSourceOperationalOutcome(uploaded) === 'EXCLUDED')
        toast.info(t('inspection.excludedUpload'));
      else if (uploaded?.processingStatus === 'PROCESSING')
        toast.info(t('inspection.pendingUpload'));
      else toast.success(t('messages.sourceUploaded'));
    } catch (error) {
      setOutcomeUncertain(error instanceof NetworkError);
      if (error instanceof ApiError && error.details && typeof error.details === 'object') {
        const savedId = (error.details as Record<string, unknown>).resourceId;
        if (typeof savedId === 'string') setHighlightedSourceId(savedId);
      }
      toast.error(t('messages.sourceUploadFailed'));
    }
  };

  useEffect(() => {
    if (!highlightedSourceId) return;
    const element = document.getElementById(`source-${highlightedSourceId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.focus({ preventScroll: true });
  }, [highlightedSourceId, referenceSet.data?.sources]);

  if (referenceSet.isLoading) {
    return (
      <div className="space-y-4" aria-label={t('loading')}>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (referenceSet.error || !referenceSet.data) {
    return (
      <div className="space-y-4">
        <Link
          className="inline-flex items-center text-sm text-muted-foreground"
          to={ROUTES.superadmin.movementAssessment}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('actions.back')}
        </Link>
        <ApiErrorNotice error={referenceSet.error} />
        <Button variant="outline" onClick={() => void referenceSet.refetch()}>
          {t('actions.refreshStatus')}
        </Button>
      </div>
    );
  }

  const set = referenceSet.data;
  const sourceCounts = countSourceOutcomes(set.sources);
  const state = rollUpExerciseState(set);
  return (
    <div className="space-y-8">
      <nav
        aria-label={t('breadcrumbs.label')}
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link to={ROUTES.superadmin.movementAssessment}>{t('breadcrumbs.standards')}</Link>
        <span>/</span>
        <Link to={ROUTES.superadmin.movementAssessment}>{t('breadcrumbs.references')}</Link>
        <span>/</span>
        <strong className="text-foreground">{set.exerciseName}</strong>
      </nav>
      <header className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t('workspace.eyebrow')}
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{set.exerciseName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('workspace.pattern', { pattern: set.pattern })}
            </p>
          </div>
          <PresentationStateBadge state={state} />
        </div>
        <div className="mt-5 grid gap-2 border-t pt-4 text-sm sm:grid-cols-4">
          <span>{t('summary.usable', { count: sourceCounts.usable })}</span>
          <span>{t('summary.review', { count: sourceCounts.needsReview })}</span>
          <span>{t('summary.excluded', { count: sourceCounts.excluded })}</span>
          <span>{t('summary.failed', { count: sourceCounts.failed })}</span>
        </div>
      </header>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="font-semibold">{t('workflow.title')}</h3>
          <p className="text-sm">
            {views.some((view) => view.currentCandidate?.status === 'CONFIRMED')
              ? t('inspection.nextPublish')
              : views.some((view) => view.currentCandidate?.status === 'REVIEW_REQUIRED')
                ? t('inspection.nextReview')
                : sourceCounts.analyzing > 0
                  ? t('inspection.nextProcessing')
                  : views.some((view) => view.liveProfile)
                    ? t('inspection.nextLive')
                    : sourceCounts.failed > 0
                      ? t('inspection.nextFailure')
                      : t('inspection.nextUpload')}
          </p>
          <p className="text-sm text-muted-foreground">{t('inspection.autoMetadata')}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="#reference-footage" className="underline underline-offset-4">
              {t('workspace.footageTitle')}
            </a>
            <a href="#generated-references" className="underline underline-offset-4">
              {t('workspace.generatedTitle')}
            </a>
          </div>
        </CardContent>
      </Card>

      <section id="reference-footage" className="scroll-mt-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">A</p>
            <h3 className="text-xl font-semibold">{t('workspace.footageTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('workspace.footageDescription')}</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle as="h4" className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />
              {t('upload.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('upload.description')} {t(`patternGuidance.${set.pattern}`)}
            </p>
            <div>
              <Label htmlFor="reference-video">{t('upload.file')}</Label>
              <Input
                id="reference-video"
                ref={inputRef}
                className="mt-2"
                type="file"
                accept="video/mp4,.mp4"
                disabled={upload.isPending || outcomeUncertain}
                onChange={(event) => selectVideo(event.target.files?.[0] ?? null)}
              />
            </div>
            {video ? (
              <p className="text-sm">
                {video.name} · {(video.size / 1024 / 1024).toFixed(1)} MB
              </p>
            ) : null}
            {previewUrl ? (
              <video
                className="max-h-80 w-full rounded-lg bg-black"
                src={previewUrl}
                controls
                preload="metadata"
                aria-label={t('upload.preview')}
              >
                <track kind="captions" />
              </video>
            ) : null}
            {validationError ? (
              <p className="text-sm text-destructive" role="alert">
                {validationError}
              </p>
            ) : null}
            {upload.isPending ? <ProcessingStages /> : null}
            <ApiErrorNotice error={upload.error} />
            {outcomeUncertain ? (
              <div className="space-y-3 rounded-md border border-amber-300 p-4" role="status">
                <p className="text-sm">{t('upload.uncertain')}</p>
                <Button
                  variant="outline"
                  disabled={referenceSet.isFetching}
                  onClick={() => void referenceSet.refetch()}
                >
                  {t('actions.refreshStatus')}
                </Button>
                <Button variant="outline" onClick={() => setOutcomeUncertain(false)}>
                  {t('upload.checkedHistory')}
                </Button>
              </div>
            ) : null}
            <Button
              disabled={!video || upload.isPending || outcomeUncertain}
              onClick={() => void submitVideo()}
            >
              {upload.isPending ? t('upload.processing') : t('upload.submit')}
            </Button>
          </CardContent>
        </Card>
        <ReferenceFootage
          sources={set.sources}
          highlightedSourceId={highlightedSourceId}
          onReplaceSource={() => inputRef.current?.click()}
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">B</p>
          <h3 className="text-xl font-semibold">{t('readiness.title')}</h3>
          <p className="max-w-3xl text-sm text-muted-foreground">{t('readiness.description')}</p>
        </div>
        {views.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {views.map((view) => (
              <ReadinessPanel key={view.view} view={view} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            {t('readiness.empty')}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">C</p>
          <h3 id="generated-references" className="scroll-mt-6 text-xl font-semibold">
            {t('workspace.generatedTitle')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('workspace.generatedDescription')}</p>
        </div>
        {views.every((view) => !view.liveProfile && !view.currentCandidate) ? (
          <EmptyState
            icon={FileVideo}
            title={t('workspace.noProfiles')}
            description={t('workspace.noProfilesDescription')}
          />
        ) : (
          views.map((view) => (
            <div key={view.view} className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {view.view}
              </h4>
              <div className="grid gap-4 lg:grid-cols-2">
                {view.liveProfile ? (
                  <GeneratedReferenceCard
                    profile={view.liveProfile}
                    referenceSetId={referenceSetId}
                    role="live"
                    sources={set.sources}
                  />
                ) : null}
                {view.currentCandidate ? (
                  <GeneratedReferenceCard
                    profile={view.currentCandidate}
                    referenceSetId={referenceSetId}
                    role="candidate"
                    sources={set.sources}
                    replacingLive={Boolean(view.liveProfile)}
                  />
                ) : null}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">D</p>
          <h3 className="text-xl font-semibold">{t('publish.title')}</h3>
          <p className="max-w-3xl text-sm text-muted-foreground">{t('publish.description')}</p>
        </div>
        {views.some((view) => view.liveProfile) ? (
          <div className="bg-energy/20 flex items-center gap-2 rounded-lg border border-forest/30 p-4 text-sm font-semibold text-forest">
            <Radio className="h-4 w-4" />
            {t('workspace.liveForAssessments')}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {t('publish.pending')}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <details className="rounded-lg border border-border bg-card p-4">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <History className="h-4 w-4" />
            {t('workspace.historyTitle')}
          </summary>
          <p className="mt-2 text-sm text-muted-foreground">{t('workspace.historyDescription')}</p>
          {histories.length > 0 ? (
            <TableContainer className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('fields.version')}</TableHead>
                    <TableHead>{t('fields.view')}</TableHead>
                    <TableHead>{t('fields.status')}</TableHead>
                    <TableHead>{t('fields.contributingFootage')}</TableHead>
                    <TableHead>{t('fields.acceptedReps')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {histories.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>v{profile.version}</TableCell>
                      <TableCell>{profile.view}</TableCell>
                      <TableCell>
                        {typeof profile.qualitySummary.withdrawnReason === 'string' ? (
                          <p className="text-sm text-destructive">
                            {t('inspection.withdrawn')}: {profile.qualitySummary.withdrawnReason}
                          </p>
                        ) : (
                          <MovementStatusBadge value={profile.status} />
                        )}
                      </TableCell>
                      <TableCell>{profile.sourceVideoCount}</TableCell>
                      <TableCell>{profile.acceptedRepCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t('workspace.noHistory')}</p>
          )}
        </details>
      </section>
    </div>
  );
}
