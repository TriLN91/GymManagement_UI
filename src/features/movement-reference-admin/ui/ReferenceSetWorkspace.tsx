import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  CircleDot,
  FileVideo,
  History,
  Info,
  Radio,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import type { ReferenceSetDto, ReferenceSetProfileDto, ReferenceSetSourceDto } from '../api/types';
import {
  useActivateReferenceProfile,
  useConfirmReferenceProfile,
  useReferenceSet,
  useUploadReferenceSource,
} from '../model/useMovementReferences';
import {
  getWorkflowGuidance,
  sourceDescriptionKey,
  sourceNeedsReview,
  WORKFLOW_STAGES,
} from '../model/workflow';

import { ApiErrorNotice } from './ApiErrorNotice';
import { MovementStatusBadge } from './MovementStatusBadge';

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

const displayJson = (value: Record<string, unknown>) =>
  Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : null;

export function SourceVideos({
  sources,
  onUpload,
  highlightedSourceId,
}: {
  sources: ReferenceSetSourceDto[];
  onUpload?: () => void;
  highlightedSourceId?: string;
}) {
  const { t } = useTranslation('movementAdmin');
  if (sources.length === 0)
    return (
      <EmptyState
        icon={FileVideo}
        title={t('workspace.noSources')}
        description={t('workspace.noSourcesDescription')}
        action={onUpload ? <Button onClick={onUpload}>{t('upload.first')}</Button> : undefined}
      />
    );
  return (
    <div className="space-y-3">
      {sources.map((source) => {
        const quality = displayJson(source.dataQuality);
        const evidence = displayJson(source.deterministicEvidence);
        return (
          <article
            id={`source-${source.id}`}
            key={source.id}
            tabIndex={-1}
            className={cn(
              'rounded-lg border border-border bg-card p-4 outline-none transition-shadow focus:ring-2 focus:ring-ring',
              highlightedSourceId === source.id && 'ring-2 ring-energy',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h4 className="truncate font-medium">{source.fileName}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {source.detectedView
                    ? t('workspace.detectedView', { view: source.detectedView })
                    : t('workspace.viewPending')}
                </p>
                <p className="mt-2 text-sm font-medium">
                  {t(sourceDescriptionKey(source), {
                    view: source.detectedView ?? t('workspace.unknownView'),
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <MovementStatusBadge value={source.processingStatus} />
                {source.decision ? <MovementStatusBadge value={source.decision} /> : null}
                {source.action ? <MovementStatusBadge value={source.action} /> : null}
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t('fields.acceptedReps')}</dt>
                <dd className="font-semibold">{source.acceptedRepCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('fields.rejectedReps')}</dt>
                <dd className="font-semibold">{source.rejectedRepCount}</dd>
              </div>
            </dl>
            <OperationalQuality value={source.dataQuality} />
            {source.failureMessage ? (
              <p className="mt-3 text-sm text-destructive">{source.failureMessage}</p>
            ) : null}
            {source.warnings.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-700">
                {source.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
            {quality || evidence || source.adjudication ? (
              <details className="mt-4 rounded-md border border-border p-3 text-sm">
                <summary className="cursor-pointer font-medium">
                  {t('workspace.technicalEvidence')}
                </summary>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  {source.detectedViewConfidence != null ? (
                    <EvidenceBlock
                      title={t('fields.viewConfidence')}
                      value={`${Math.round(source.detectedViewConfidence * 100)}%`}
                    />
                  ) : null}
                  {source.reviewReason ? (
                    <EvidenceBlock title={t('fields.reason')} value={source.reviewReason} />
                  ) : null}
                  {quality ? (
                    <EvidenceBlock title={t('workspace.dataQuality')} value={quality} />
                  ) : null}
                  {evidence ? (
                    <EvidenceBlock title={t('workspace.deterministicEvidence')} value={evidence} />
                  ) : null}
                  {source.adjudication ? (
                    <EvidenceBlock
                      title={t('workspace.fallbackEvidence')}
                      value={JSON.stringify(source.adjudication, null, 2)}
                    />
                  ) : null}
                </div>
              </details>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function OperationalQuality({ value }: { value: Record<string, unknown> }) {
  const { t } = useTranslation('movementAdmin');
  const entries = Object.entries(value).filter(([, item]) =>
    ['string', 'number', 'boolean'].includes(typeof item),
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-muted/60 p-3 text-xs">
      <strong>{t('workspace.qualitySummary')}:</strong>
      {entries.slice(0, 3).map(([key, item]) => (
        <span key={key} className="rounded-full bg-background px-2 py-1">
          {key}: {String(item)}
        </span>
      ))}
    </div>
  );
}

function EvidenceBlock({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h5>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
        {value}
      </pre>
    </section>
  );
}

export function ProfileCard({
  profile,
  referenceSetId,
}: {
  profile: ReferenceSetProfileDto;
  referenceSetId: string;
}) {
  const { t } = useTranslation('movementAdmin');
  const confirm = useConfirmReferenceProfile(referenceSetId);
  const activate = useActivateReferenceProfile(referenceSetId);
  const [pendingAction, setPendingAction] = useState<'confirm' | 'activate' | null>(null);
  const actionError = confirm.error ?? activate.error;
  const confirmProfile = async () => {
    try {
      await confirm.mutateAsync(profile.id);
      setPendingAction(null);
      toast.success(t('messages.profileConfirmed'));
    } catch {
      // The mutation exposes the typed backend error in the confirmation dialog.
    }
  };
  const activateProfile = async () => {
    try {
      await activate.mutateAsync(profile.id);
      setPendingAction(null);
      toast.success(t('messages.profileActivated'));
    } catch {
      // The mutation exposes the typed backend error in the confirmation dialog.
    }
  };
  return (
    <article className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {profile.view}
          </p>
          <h4 className="mt-1 text-lg font-semibold">
            {t('workspace.profileVersion', { version: profile.version })}
          </h4>
        </div>
        <div className="flex flex-col items-end gap-2">
          <MovementStatusBadge value={profile.status} />
          {profile.status === 'ACTIVE' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
              <Radio className="h-3.5 w-3.5" aria-hidden /> {t('workspace.live')}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{t('workspace.notActive')}</span>
          )}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t('fields.sources')}</dt>
          <dd className="font-semibold">{profile.sourceVideoCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('fields.acceptedVideos')}</dt>
          <dd className="font-semibold">{profile.acceptedVideoCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('fields.acceptedReps')}</dt>
          <dd className="font-semibold">{profile.acceptedRepCount}</dd>
        </div>
      </dl>
      <OperationalQuality value={profile.qualitySummary} />
      {profileWarnings(profile).length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-700">
          {profileWarnings(profile).map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
      {displayJson(profile.qualitySummary) ? (
        <details className="mt-4 rounded-md border p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            {t('workspace.profileTechnicalQuality')}
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
            {displayJson(profile.qualitySummary)}
          </pre>
        </details>
      ) : null}
      <ApiErrorNotice error={actionError} />
      <div className="mt-4 flex justify-end gap-2">
        {profile.status === 'REVIEW_REQUIRED' ? (
          <Button
            size="sm"
            disabled={confirm.isPending}
            onClick={() => setPendingAction('confirm')}
          >
            {confirm.isPending ? t('actions.confirming') : t('actions.confirm')}
          </Button>
        ) : null}
        {profile.status === 'CONFIRMED' ? (
          <Button
            size="sm"
            disabled={activate.isPending}
            onClick={() => setPendingAction('activate')}
          >
            {activate.isPending ? t('actions.activating') : t('actions.activate')}
          </Button>
        ) : null}
      </div>
      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'activate'
                ? t('profileAction.activateTitle', { version: profile.version })
                : t('profileAction.confirmTitle', { version: profile.version })}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'activate'
                ? t('profileAction.activateDescription', {
                    view: profile.view,
                    version: profile.version,
                  })
                : t('profileAction.confirmDescription', {
                    view: profile.view,
                    version: profile.version,
                  })}
            </DialogDescription>
          </DialogHeader>
          <ApiErrorNotice error={actionError} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              {t('actions.cancel')}
            </Button>
            <Button
              disabled={confirm.isPending || activate.isPending}
              onClick={() =>
                void (pendingAction === 'activate' ? activateProfile() : confirmProfile())
              }
            >
              {pendingAction === 'activate' ? t('actions.activate') : t('actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function profileWarnings(profile: ReferenceSetProfileDto): string[] {
  const warnings = profile.qualitySummary.warnings;
  return Array.isArray(warnings)
    ? warnings.filter((warning): warning is string => typeof warning === 'string')
    : [];
}

function WorkflowPanel({
  referenceSet,
  onNavigate,
}: {
  referenceSet: ReferenceSetDto;
  onNavigate: (target: 'upload' | 'sources' | 'profiles') => void;
}) {
  const { t } = useTranslation('movementAdmin');
  const guidance = getWorkflowGuidance(referenceSet);
  const actionTarget =
    guidance.nextAction === 'UPLOAD_SOURCE'
      ? 'upload'
      : guidance.nextAction === 'CONFIRM_PROFILE' || guidance.nextAction === 'ACTIVATE_PROFILE'
        ? 'profiles'
        : guidance.nextAction === 'LIVE'
          ? null
          : 'sources';
  return (
    <Card variant="attention">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {t('workflow.title')}
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              {t(`workflow.next.${guidance.nextAction}.title`)}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t(`workflow.next.${guidance.nextAction}.description`)}
            </p>
          </div>
          {actionTarget ? (
            <Button onClick={() => onNavigate(actionTarget)}>
              {t(`workflow.next.${guidance.nextAction}.action`)}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-energy px-3 py-2 text-sm font-semibold text-forest">
              <CheckCircle2 className="h-4 w-4" /> {t('workflow.live')}
            </span>
          )}
        </div>
        <ol className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {WORKFLOW_STAGES.map((stage, index) => {
            const complete = index < guidance.currentStage;
            const current = index === guidance.currentStage;
            return (
              <li
                key={stage}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium',
                  complete && 'bg-energy/40 border-energy text-forest',
                  current && 'border-forest bg-background text-forest',
                  !complete && !current && 'text-muted-foreground',
                )}
              >
                {complete ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : current ? (
                  <CircleDot className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Circle className="h-3.5 w-3.5" aria-hidden />
                )}
                {t(`workflow.stages.${stage}`)}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function ReferenceSetSummary({ referenceSet }: { referenceSet: ReferenceSetDto }) {
  const { t } = useTranslation('movementAdmin');
  const accepted = referenceSet.sources.filter((source) => source.action === 'KEEP').length;
  const reviewRequired = referenceSet.sources.filter(sourceNeedsReview).length;
  const views = [
    ...new Set([
      ...referenceSet.sources.map((source) => source.detectedView).filter(Boolean),
      ...referenceSet.profiles.map((profile) => profile.view),
    ]),
  ];
  const active = referenceSet.profiles.filter((profile) => profile.status === 'ACTIVE');
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">{t('fields.sources')}</p>
          <p className="mt-2 text-2xl font-semibold">{referenceSet.sources.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('summary.sourceBreakdown', { accepted, review: reviewRequired })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">{t('summary.views')}</p>
          <p className="mt-2 text-sm font-semibold">{views.length > 0 ? views.join(' · ') : '—'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('summary.groupedByView')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {t('fields.profiles')}
          </p>
          <p className="mt-2 text-2xl font-semibold">{referenceSet.profiles.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.length > 0
              ? t('summary.activeViews', {
                  views: active.map((profile) => profile.view).join(', '),
                })
              : t('summary.noActive')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReferenceSetWorkspace({ referenceSetId }: { referenceSetId: string }) {
  const { t } = useTranslation('movementAdmin');
  const referenceSet = useReferenceSet(referenceSetId);
  const upload = useUploadReferenceSource(referenceSetId);
  const [video, setVideo] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');
  const [highlightedSourceId, setHighlightedSourceId] = useState<string>();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const sourcesSectionRef = useRef<HTMLElement>(null);
  const profilesSectionRef = useRef<HTMLElement>(null);
  const profilesByView = useMemo(
    () =>
      (referenceSet.data?.profiles ?? []).reduce<Record<string, ReferenceSetProfileDto[]>>(
        (groups, profile) => {
          (groups[profile.view] ??= []).push(profile);
          return groups;
        },
        {},
      ),
    [referenceSet.data?.profiles],
  );

  const selectVideo = (file: File | null) => {
    setValidationError('');
    setVideo(null);
    if (!file) return;
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      setValidationError(t('upload.invalidType'));
      return;
    }
    if (file.size === 0) {
      setValidationError(t('upload.empty'));
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setValidationError(t('upload.tooLarge'));
      return;
    }
    setVideo(file);
  };

  const submitVideo = async () => {
    if (!video) return;
    try {
      const result = await upload.mutateAsync(video);
      const uploaded = result.sources.at(-1);
      setVideo(null);
      setHighlightedSourceId(uploaded?.id);
      toast.success(t('messages.sourceUploaded'));
    } catch {
      toast.error(t('messages.sourceUploadFailed'));
    }
  };

  useEffect(() => {
    if (!highlightedSourceId) return;
    const source = document.getElementById(`source-${highlightedSourceId}`);
    if (!source) return;
    source.scrollIntoView({ behavior: 'smooth', block: 'center' });
    source.focus({ preventScroll: true });
  }, [highlightedSourceId, referenceSet.data?.sources]);

  const moveTo = (target: 'upload' | 'sources' | 'profiles') => {
    const element =
      target === 'upload'
        ? uploadSectionRef.current
        : target === 'sources'
          ? sourcesSectionRef.current
          : profilesSectionRef.current;
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (target === 'upload') uploadInputRef.current?.focus({ preventScroll: true });
  };

  if (referenceSet.isLoading)
    return (
      <div className="space-y-4" aria-label={t('loading')}>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  if (referenceSet.error || !referenceSet.data)
    return (
      <div className="space-y-4">
        <Link
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          to={ROUTES.superadmin.movementAssessment}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('actions.back')}
        </Link>
        <ApiErrorNotice error={referenceSet.error} />
      </div>
    );
  const set = referenceSet.data;
  const activeProfiles = set.profiles.filter((profile) => profile.status === 'ACTIVE');
  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        to={ROUTES.superadmin.movementAssessment}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('actions.back')}
      </Link>
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
          <MovementStatusBadge value={set.status} />
        </div>
        <p className="mt-5 border-t pt-4 text-sm">
          <strong>{t('fields.active')}:</strong>{' '}
          {activeProfiles.length > 0
            ? activeProfiles.map((profile) => `${profile.view} · v${profile.version}`).join(', ')
            : t('summary.noActive')}
        </p>
      </header>

      <WorkflowPanel referenceSet={set} onNavigate={moveTo} />
      <ReferenceSetSummary referenceSet={set} />

      <div ref={uploadSectionRef}>
        <Card>
          <CardHeader>
            <CardTitle as="h3" className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              {t('upload.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('upload.description')}</p>
            <div>
              <Label htmlFor="reference-video">{t('upload.file')}</Label>
              <Input
                id="reference-video"
                ref={uploadInputRef}
                className="mt-2"
                type="file"
                accept="video/mp4,.mp4"
                onChange={(event) => selectVideo(event.target.files?.[0] ?? null)}
              />
            </div>
            {video ? (
              <p className="text-sm">
                {video.name} · {(video.size / 1024 / 1024).toFixed(1)} MB
              </p>
            ) : null}
            {validationError ? (
              <p className="text-sm text-destructive" role="alert">
                {validationError}
              </p>
            ) : null}
            <ApiErrorNotice error={upload.error} />
            <Button disabled={!video || upload.isPending} onClick={() => void submitVideo()}>
              {upload.isPending ? t('upload.processing') : t('upload.submit')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <section ref={sourcesSectionRef} className="scroll-mt-20 space-y-3">
        <div>
          <h3 className="text-xl font-semibold">{t('workspace.sourcesTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('workspace.sourcesDescription')}</p>
        </div>
        <SourceVideos
          sources={set.sources}
          onUpload={() => moveTo('upload')}
          highlightedSourceId={highlightedSourceId}
        />
      </section>

      <section ref={profilesSectionRef} className="scroll-mt-20 space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{t('workspace.profilesTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('workspace.profilesDescription')}</p>
        </div>
        {Object.entries(profilesByView).length === 0 ? (
          <EmptyState
            icon={Info}
            title={t('workspace.noProfiles')}
            description={t('workspace.noProfilesDescription')}
            action={<Button onClick={() => moveTo('upload')}>{t('upload.another')}</Button>}
          />
        ) : (
          Object.entries(profilesByView).map(([view, profiles]) => (
            <div key={view} className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {view}
              </h4>
              {!profiles.some((profile) => profile.status === 'ACTIVE') ? (
                <p className="text-sm text-muted-foreground">
                  {t('workspace.noActiveForView', { view })}
                </p>
              ) : null}
              <div className="grid gap-4 lg:grid-cols-2">
                {profiles?.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} referenceSetId={referenceSetId} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            <History className="h-5 w-5" />
            {t('workspace.historyTitle')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('workspace.historyDescription')}</p>
        </div>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.version')}</TableHead>
                <TableHead>{t('fields.view')}</TableHead>
                <TableHead>{t('fields.status')}</TableHead>
                <TableHead>{t('fields.sources')}</TableHead>
                <TableHead>{t('fields.acceptedReps')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {set.profiles
                .slice()
                .sort((a, b) => b.version - a.version)
                .map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>v{profile.version}</TableCell>
                    <TableCell>{profile.view}</TableCell>
                    <TableCell>
                      <MovementStatusBadge value={profile.status} />
                    </TableCell>
                    <TableCell>{profile.sourceVideoCount}</TableCell>
                    <TableCell>{profile.acceptedRepCount}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
}
