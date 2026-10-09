import { ArrowLeft, FileVideo, History, Info, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import type { ReferenceSetProfileDto, ReferenceSetSourceDto } from '../api/types';
import {
  useActivateReferenceProfile,
  useConfirmReferenceProfile,
  useReferenceSet,
  useUploadReferenceSource,
} from '../model/useMovementReferences';

import { ApiErrorNotice } from './ApiErrorNotice';
import { MovementStatusBadge } from './MovementStatusBadge';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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

export function SourceVideos({ sources }: { sources: ReferenceSetSourceDto[] }) {
  const { t } = useTranslation('movementAdmin');
  if (sources.length === 0)
    return (
      <EmptyState
        icon={FileVideo}
        title={t('workspace.noSources')}
        description={t('workspace.noSourcesDescription')}
      />
    );
  return (
    <div className="space-y-3">
      {sources.map((source) => {
        const quality = displayJson(source.dataQuality);
        const evidence = displayJson(source.deterministicEvidence);
        return (
          <article key={source.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h4 className="truncate font-medium">{source.fileName}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {source.detectedView
                    ? t('workspace.detectedView', { view: source.detectedView })
                    : t('workspace.viewPending')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <MovementStatusBadge value={source.processingStatus} />
                {source.decision ? <MovementStatusBadge value={source.decision} /> : null}
                {source.action ? <MovementStatusBadge value={source.action} /> : null}
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">{t('fields.acceptedReps')}</dt>
                <dd className="font-semibold">{source.acceptedRepCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('fields.rejectedReps')}</dt>
                <dd className="font-semibold">{source.rejectedRepCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('fields.viewConfidence')}</dt>
                <dd className="font-semibold">
                  {source.detectedViewConfidence == null
                    ? '—'
                    : `${Math.round(source.detectedViewConfidence * 100)}%`}
                </dd>
              </div>
            </dl>
            {source.reviewReason ? (
              <p className="mt-3 rounded-md bg-muted p-3 text-sm">
                <strong>{t('fields.reason')}:</strong> {source.reviewReason}
              </p>
            ) : null}
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
  const actionError = confirm.error ?? activate.error;
  const confirmProfile = async () => {
    await confirm.mutateAsync(profile.id);
    toast.success(t('messages.profileConfirmed'));
  };
  const activateProfile = async () => {
    await activate.mutateAsync(profile.id);
    toast.success(t('messages.profileActivated'));
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
        <MovementStatusBadge value={profile.status} />
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
      {displayJson(profile.qualitySummary) ? (
        <details className="mt-4 rounded-md border p-3 text-sm">
          <summary className="cursor-pointer font-medium">{t('workspace.profileQuality')}</summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
            {displayJson(profile.qualitySummary)}
          </pre>
        </details>
      ) : null}
      <ApiErrorNotice error={actionError} />
      <div className="mt-4 flex justify-end gap-2">
        {profile.status === 'REVIEW_REQUIRED' ? (
          <Button size="sm" disabled={confirm.isPending} onClick={() => void confirmProfile()}>
            {confirm.isPending ? t('actions.confirming') : t('actions.confirm')}
          </Button>
        ) : null}
        {profile.status === 'CONFIRMED' ? (
          <Button size="sm" disabled={activate.isPending} onClick={() => void activateProfile()}>
            {activate.isPending ? t('actions.activating') : t('actions.activate')}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function ReferenceSetWorkspace({ referenceSetId }: { referenceSetId: string }) {
  const { t } = useTranslation('movementAdmin');
  const referenceSet = useReferenceSet(referenceSetId);
  const upload = useUploadReferenceSource(referenceSetId);
  const [video, setVideo] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');
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
    await upload.mutateAsync(video);
    setVideo(null);
    toast.success(t('messages.sourceUploaded'));
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
        <dl className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">{t('fields.sources')}</dt>
            <dd className="text-2xl font-semibold">{set.sources.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">{t('fields.profiles')}</dt>
            <dd className="text-2xl font-semibold">{set.profiles.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">{t('fields.active')}</dt>
            <dd className="text-2xl font-semibold">
              {set.profiles.filter((profile) => profile.status === 'ACTIVE').length}
            </dd>
          </div>
        </dl>
      </header>

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

      <section className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold">{t('workspace.sourcesTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('workspace.sourcesDescription')}</p>
        </div>
        <SourceVideos sources={set.sources} />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{t('workspace.profilesTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('workspace.profilesDescription')}</p>
        </div>
        {Object.entries(profilesByView).length === 0 ? (
          <EmptyState
            icon={Info}
            title={t('workspace.noProfiles')}
            description={t('workspace.noProfilesDescription')}
          />
        ) : (
          Object.entries(profilesByView).map(([view, profiles]) => (
            <div key={view} className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {view}
              </h4>
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
