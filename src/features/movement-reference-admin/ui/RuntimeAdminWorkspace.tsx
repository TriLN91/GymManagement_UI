import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileVideo,
  Pencil,
  Plus,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBeforeUnload, useBlocker, useNavigate, useSearchParams } from 'react-router-dom';

import { movementReferenceApi } from '../api/movementReferenceApi';
import {
  movementRuntimeApi,
  type Capability,
  type ExerciseMetadataCatalog,
  type ExerciseRevision,
  type Readiness,
} from '../api/movementRuntimeApi';
import type { RuntimeVersion } from '../api/runtimeTypes';
import type { ExerciseDto, ReferenceSetDto, ReferenceSetSummaryDto } from '../api/types';
import { capabilityFor, patternOf, readinessOf, type StudioTab } from '../model/studio';

import { AssessmentVersionHistory } from './AssessmentVersionHistory';
import { ConfigurationReview, MobilePreview, ReferenceApproval } from './ConfigurationReview';
import { ExerciseEditor } from './ExerciseEditor';
import { ExerciseLibrary } from './ExerciseLibrary';
import { ReferenceInspector } from './ReferenceInspector';
import { ReferenceUpload } from './ReferenceUpload';
import { StudioConfirm } from './StudioConfirm';
import { StudioError, StudioLoading, StudioStatus } from './StudioPrimitives';

import { Button } from '@/shared/ui/button';
import './movement-studio.css';

export function RuntimeAdminWorkspace({ referenceSetId }: { referenceSetId?: string }) {
  const { t } = useTranslation('movementStudio');
  const { t: refCopy } = useTranslation('movementAdmin');
  const [params, setParams] = useSearchParams();
  const navigatePage = useNavigate();
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [sets, setSets] = useState<ReferenceSetSummaryDto[]>([]);
  const [readiness, setReadiness] = useState<Readiness[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [metadataCatalog, setMetadataCatalog] = useState<ExerciseMetadataCatalog>({
    equipment: [],
    muscleGroups: [],
  });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reference, setReference] = useState<ReferenceSetDto>();
  const [versions, setVersions] = useState<RuntimeVersion[]>([]);
  const [revisions, setRevisions] = useState<ExerciseRevision[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [focusFeature, setFocusFeature] = useState<string>();
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<unknown>();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const workspace = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const [editor, setEditor] = useState<'create' | 'edit'>();
  const [upload, setUpload] = useState(false);
  const [confirmation, setConfirmation] = useState<'publish' | 'reject' | 'retire' | 'reference'>();
  const exerciseId =
    params.get('exercise') ?? sets.find((item) => item.id === referenceSetId)?.exerciseId ?? '';
  const exercise = exercises.find((item) => item.id === exerciseId);
  const classification = exercise ? patternOf(exercise, sets) : 'UNCLASSIFIED';
  const capability = capabilityFor(capabilities, classification);
  const exerciseSets = sets.filter((item) => item.exerciseId === exerciseId);
  const summary =
    exerciseSets.find((item) => item.id === (params.get('collection') ?? referenceSetId)) ??
    exerciseSets.find((item) => item.pattern === classification) ??
    exerciseSets[0];
  const summaryId = summary?.id;
  const tab: StudioTab =
    params.get('tab') === 'configure'
      ? 'configure'
      : params.get('tab') === 'history'
        ? 'history'
        : 'inspect';
  const chosen =
    versions.find((item) => item.id === params.get('version')) ??
    versions.find((item) => item.status === 'DRAFT') ??
    versions.find((item) =>
      readiness.some((status) => status.id === item.id && status.available),
    ) ??
    versions[0];
  const current = versions.find(
    (item) =>
      item.status === 'PUBLISHED' &&
      item.view === chosen?.view &&
      readiness.some((status) => status.id === item.id && status.available),
  );
  const profiles =
    reference?.profiles
      .filter((item) => !item.qualitySummary.withdrawnReason && item.status !== 'FAILED')
      .sort((a, b) => b.version - a.version) ?? [];
  const profile =
    profiles.find((item) => item.id === profileId) ??
    profiles.find((item) => item.id === chosen?.referenceProfileId) ??
    profiles[0];
  const configReference = reference?.profiles.find(
    (item) => item.id === chosen?.referenceProfileId,
  );
  const source =
    reference?.sources.find((item) => item.id === sourceId) ??
    reference?.sources.find((item) => profile?.sourceReferenceIds?.includes(item.id)) ??
    reference?.sources.find((item) => item.processingStatus === 'PROCESSED') ??
    reference?.sources[0];
  const inspectionConfiguration = (
    chosen?.referenceProfileId === profile?.id
      ? chosen
      : versions.find((item) => item.referenceProfileId === profile?.id)
  )?.configuration;
  const selectedCapability =
    inspectionConfiguration?.capability ??
    capabilityFor(capabilities, reference?.pattern ?? classification);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const before = new URLSearchParams(currentLocation.search),
      after = new URLSearchParams(nextLocation.search);
    return (
      dirty &&
      (currentLocation.pathname !== nextLocation.pathname ||
        ['exercise', 'collection', 'version'].some((key) => before.get(key) !== after.get(key)))
    );
  });
  useEffect(() => {
    workspace.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, [exerciseId, tab]);
  useBeforeUnload(
    useCallback(
      (event) => {
        if (dirty) {
          event.preventDefault();
          event.returnValue = '';
        }
      },
      [dirty],
    ),
  );
  const onDirty = useCallback((value: boolean) => setDirty(value), []);
  const onEvidence = useCallback(
    (id: string, version: string) =>
      setEvidence((previous) =>
        previous[id] === version ? previous : { ...previous, [id]: version },
      ),
    [],
  );
  const reload = useCallback(async () => {
    const [catalog, collections, statuses, supported, metadata] = await Promise.all([
      movementRuntimeApi.exercises(),
      movementReferenceApi.listReferenceSets(),
      movementRuntimeApi.readiness(),
      movementRuntimeApi.capabilities(),
      movementRuntimeApi.metadataCatalog(),
    ]);
    setExercises(catalog);
    setSets(collections);
    setReadiness(statuses);
    setCapabilities(supported);
    setMetadataCatalog(metadata);
  }, []);
  useEffect(() => {
    void reload()
      .catch(setError)
      .finally(() => setLoading(false));
  }, [reload]);
  useEffect(() => {
    let alive = true;
    setDetailLoading(Boolean(exerciseId));
    setReference(undefined);
    setVersions([]);
    setRevisions([]);
    setProfileId('');
    setSourceId('');
    if (!exerciseId) return;
    void Promise.all([
      summaryId ? movementReferenceApi.getReferenceSet(summaryId) : Promise.resolve(undefined),
      movementRuntimeApi.versions(exerciseId),
      movementRuntimeApi.history(exerciseId),
    ])
      .then(([collection, configs, history]) => {
        if (alive) {
          setReference(collection);
          setVersions(configs);
          setRevisions(history);
        }
      })
      .catch((failure) => {
        if (alive) setError(failure);
      })
      .finally(() => {
        if (alive) setDetailLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [exerciseId, summaryId, refresh]);
  const navigate = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };
  const back = () => {
    if (referenceSetId) void navigatePage('/superadmin/movement-assessment');
    else
      navigate({ exercise: undefined, tab: undefined, version: undefined, collection: undefined });
  };
  const act = async <T,>(work: () => Promise<T>, message: string): Promise<T | undefined> => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    setBusy(true);
    setError(undefined);
    setNotice('');
    try {
      const result = await work();
      setNotice(message);
      // A successful write remains successful even if the subsequent refresh fails.
      try {
        await reload();
        setRefresh((value) => value + 1);
      } catch (failure) {
        setError(failure);
      }
      return result;
    } catch (failure) {
      setError(failure);
      return undefined;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const openExercise = (id: string, keepNotice = false) => {
    if (!keepNotice) setNotice('');
    setError(undefined);
    setFocusFeature(undefined);
    navigate({ exercise: id, tab: undefined, version: undefined, collection: undefined });
  };
  const openVersion = (id: string) =>
    navigate({
      tab: 'configure',
      version: id,
      collection: versions.find((item) => item.id === id)?.referenceSetId ?? summaryId,
    });
  const inspect = (feature?: string) => {
    if (tab === 'configure' && configReference) {
      setProfileId(configReference.id);
      if (configReference.sourceReferenceIds?.[0])
        setSourceId(configReference.sourceReferenceIds[0]);
    }
    setFocusFeature(feature);
    navigate({ tab: 'inspect' });
  };
  const makeDraft = async () => {
    if (!profile) return;
    const existing = versions.find(
      (item) => item.status === 'DRAFT' && item.referenceProfileId === profile.id,
    );
    if (existing) {
      openVersion(existing.id);
      return;
    }
    const draft = await act(() => movementRuntimeApi.propose(profile.id), 'draftCreated');
    if (draft) openVersion(draft.id);
  };
  const sourceMatches =
    !profile?.sourceReferenceIds?.length ||
    Boolean(source && profile.sourceReferenceIds.includes(source.id));
  const readyEvidence = Boolean(
    chosen &&
    (configReference?.sourceReferenceIds ?? reference?.sources.map((item) => item.id) ?? []).some(
      (id) => evidence[id] === chosen.configuration.featureDefinitionsVersion,
    ),
  );
  const editable = Boolean(exercise?.isActive && capability);
  const profileApproval = (
    <ReferenceApproval
      profiles={profiles}
      selected={profile}
      busy={busy || dirty || !exercise?.isActive || !sourceMatches}
      onSelect={setProfileId}
      onConfirm={() => {
        if (reference && profile)
          void act(
            () => movementReferenceApi.confirmProfile(reference.id, profile.id),
            'referenceConfirmed',
          );
      }}
      onActivate={() => {
        if (reference && profile) setConfirmation('reference');
      }}
    />
  );
  const metadataInput = (isActive: boolean) => ({
    name: exercise!.name,
    equipment: exercise!.equipment ?? '',
    muscleGroup: exercise!.muscleGroup ?? '',
    instructions: exercise!.instructions ?? '',
    pattern: classification === 'UNCLASSIFIED' ? 'OTHER' : classification,
    isActive,
  });
  const confirmCopy = {
    publish: {
      title: 'publishTitle',
      help: 'publishHelp',
      action: 'confirmPublish',
      saved: 'published',
    },
    reject: { title: 'rejectTitle', help: 'rejectHelp', action: 'reject', saved: 'rejectSaved' },
    retire: {
      title: 'retireTitle',
      help: 'retireHelp',
      action: 'confirmRetire',
      saved: 'retiredSaved',
    },
    reference: {
      title: 'referencePublishTitle',
      help: 'referencePublishHelp',
      action: 'publishReference',
      saved: 'referencePublished',
    },
  };
  return (
    <div className="movement-studio" ref={workspace}>
      {loading ? <StudioLoading /> : null}
      <StudioError error={error} />
      {error ? (
        <Button
          variant="outline"
          disabled={busy || dirty}
          onClick={() => {
            setError(undefined);
            void reload()
              .then(() => setRefresh((value) => value + 1))
              .catch(setError);
          }}
        >
          {t('retry')}
        </Button>
      ) : null}
      {notice ? (
        <div className="studio-notice" role="status">
          <CheckCircle2 size={18} aria-hidden />
          {t(notice)}
        </div>
      ) : null}
      {!loading && !exerciseId ? (
        <ExerciseLibrary
          exercises={exercises}
          sets={sets}
          readiness={readiness}
          capabilities={capabilities}
          onOpen={openExercise}
          onCreate={() => {
            setError(undefined);
            setEditor('create');
          }}
        />
      ) : null}
      {!loading && exerciseId && !exercise ? (
        <div className="studio-empty">
          <p>{t('errors.missing')}</p>
          <Button onClick={back}>{t('back')}</Button>
        </div>
      ) : null}
      {exercise ? (
        <>
          <button className="studio-breadcrumb" onClick={back}>
            <ArrowLeft size={16} aria-hidden />
            {t('back')}
          </button>
          <header className="studio-exercise-header">
            <div>
              <p className="studio-eyebrow">
                {t(`patterns.${classification}`)} <span>/</span>{' '}
                {exercise.equipment ?? t('unspecified')}
              </p>
              <h1>{exercise.name}</h1>
              <p className="studio-subtitle">
                {capability
                  ? t(`capabilities.${capability.code}`, { defaultValue: capability.label })
                  : t('noCapability')}{' '}
                <span>·</span> <StudioStatus value={readinessOf(exercise, readiness)} />
              </p>
            </div>
            <div className="studio-header-actions">
              <Button
                variant="outline"
                disabled={busy || dirty}
                onClick={() => {
                  setError(undefined);
                  setEditor('edit');
                }}
              >
                <Pencil size={15} aria-hidden />
                {t('edit')}
              </Button>
              <Button
                disabled={busy || !editable || dirty}
                onClick={() => {
                  setError(undefined);
                  setUpload(true);
                }}
              >
                <Plus size={16} aria-hidden />
                {t('addVideo')}
              </Button>
            </div>
          </header>
          {!exercise.isActive ? (
            <div className="studio-inline-warning">
              {t('retiredNotice')}{' '}
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() =>
                  void act(
                    () => movementRuntimeApi.updateExercise(exercise.id, metadataInput(true)),
                    'restoredSaved',
                  )
                }
              >
                {t('restore')}
              </Button>
            </div>
          ) : null}
          <nav className="studio-workflow-tabs" aria-label={t('assessment')}>
            {(['inspect', 'configure', 'history'] as const).map((value, index) => (
              <button
                key={value}
                aria-current={tab === value ? 'step' : undefined}
                onClick={() => navigate({ tab: value === 'inspect' ? undefined : value })}
              >
                <span>{index + 1}</span>
                <strong>{t(`tabs.${value}`)}</strong>
                {value === 'configure' && versions.some((item) => item.status === 'DRAFT') ? (
                  <i aria-label={t('status.draft')} />
                ) : null}
              </button>
            ))}
          </nav>
          {detailLoading ? (
            <StudioLoading />
          ) : (
            <>
              {dirty && tab !== 'configure' ? (
                <div className="studio-inline-warning">
                  {t('unsaved')}{' '}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ tab: 'configure' })}
                  >
                    {t('tabs.configure')}
                  </Button>
                </div>
              ) : null}
              {tab === 'inspect' ? (
                <>
                  {!capability ? (
                    <div className="studio-capability-note">
                      <strong>{t('noCapability')}</strong>
                      <p>{t('noCapabilityHelp')}</p>
                      <p>{t('capabilityHelp')}</p>
                    </div>
                  ) : null}
                  {exerciseSets.length > 1 ? (
                    <div className="studio-collection-picker">
                      <label>
                        {t('referenceSets')}
                        <select
                          value={summary?.id ?? ''}
                          onChange={(event) => navigate({ collection: event.target.value })}
                        >
                          {exerciseSets.map((item) => (
                            <option key={item.id} value={item.id}>
                              {t('collection', { pattern: t(`patterns.${item.pattern}`) })} ·{' '}
                              {t('clips', { count: item.sourceCount })}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}
                  {reference?.sources.length ? (
                    <div className="studio-source-strip" aria-label={t('selectSource')}>
                      {reference.sources.map((item, index) => (
                        <button
                          key={item.id}
                          aria-pressed={source?.id === item.id}
                          className={source?.id === item.id ? 'is-selected' : ''}
                          onClick={() => setSourceId(item.id)}
                        >
                          <FileVideo size={23} aria-hidden />
                          <span>
                            <strong title={item.fileName}>{item.fileName}</strong>
                            <small>
                              {t(
                                item.processingStatus === 'FAILED'
                                  ? 'status.FAILED'
                                  : item.processingStatus === 'PROCESSING'
                                    ? 'status.PROCESSING'
                                    : 'accepted',
                                { count: item.acceptedRepCount },
                              )}{' '}
                              · {t('source', { number: index + 1 })}
                            </small>
                          </span>
                          <StudioStatus value={item.processingStatus} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {source ? (
                    <>
                      {source.processingStatus === 'FAILED' ? (
                        <div className="studio-source-failure" role="alert">
                          <strong>
                            {refCopy(
                              `processingIssues.${source.failureCode ?? 'REFERENCE_PROCESSING_FAILED'}.title`,
                              { defaultValue: t('status.FAILED') },
                            )}
                          </strong>
                          <p>
                            {refCopy(
                              `processingIssues.${source.failureCode ?? 'REFERENCE_PROCESSING_FAILED'}.description`,
                              { defaultValue: t('failureHelp') },
                            )}
                          </p>
                          <p>{t('failureHelp')}</p>
                          <details>
                            <summary>{t('technicalDetails')}</summary>
                            <p>{source.failureSummary ?? source.failureMessage}</p>
                          </details>
                        </div>
                      ) : null}
                      {source.reviewReason ||
                      source.action === 'EXCLUDE' ||
                      source.action === 'REQUIRES_REVIEW' ||
                      source.action === 'DOWN_WEIGHT' ? (
                        <div className="studio-inline-warning">
                          <strong>{t('reviewReason')}</strong>
                          <p>{t('questionable')}</p>
                          <details>
                            <summary>{t('technicalDetails')}</summary>
                            <p>{source.reviewReason}</p>
                          </details>
                        </div>
                      ) : null}
                      {!sourceMatches ? (
                        <div className="studio-inline-warning">{t('sourceMismatch')}</div>
                      ) : null}
                      <ReferenceInspector
                        key={source.id}
                        source={source}
                        capability={selectedCapability}
                        configuration={inspectionConfiguration}
                        focusFeature={focusFeature}
                        context={
                          <div className="studio-evidence-context">
                            <div>
                              <span>{t('intended')}</span>
                              <strong>
                                {t(`patterns.${reference?.pattern ?? classification}`)}
                              </strong>
                            </div>
                            <div>
                              <span>{t('detected')}</span>
                              <strong>
                                {source.detectedPattern
                                  ? t(`patterns.${source.detectedPattern}`, {
                                      defaultValue: source.detectedPattern,
                                    })
                                  : t('unavailable')}
                              </strong>
                            </div>
                            <div>
                              <span>{t('camera')}</span>
                              <strong>
                                {t(`views.${source.detectedView ?? 'UNKNOWN'}`, {
                                  defaultValue: source.detectedView ?? t('unavailable'),
                                })}
                              </strong>
                              {typeof source.detectedViewConfidence === 'number' ? (
                                <small>
                                  {t('confidence', {
                                    value: Math.round(source.detectedViewConfidence * 100),
                                  })}
                                </small>
                              ) : null}
                            </div>
                            <div>
                              <span>{t('quality')}</span>
                              <strong>
                                {t(
                                  source.processingStatus === 'FAILED'
                                    ? 'status.FAILED'
                                    : source.action === 'EXCLUDE'
                                      ? 'excluded'
                                      : source.action === 'REQUIRES_REVIEW' ||
                                          source.action === 'DOWN_WEIGHT'
                                        ? 'questionable'
                                        : 'included',
                                )}
                              </strong>
                              <small>
                                {t('accepted', { count: source.acceptedRepCount })} ·{' '}
                                {t('rejected', { count: source.rejectedRepCount })}
                              </small>
                            </div>
                          </div>
                        }
                        onReprocessed={async (result) => {
                          await reload();
                          const updated = await movementReferenceApi.getReferenceSet(
                            result.referenceSetId,
                          );
                          setReference(updated);
                          setSourceId(result.sourceId ?? '');
                          setProfileId(updated.profiles.at(-1)?.id ?? '');
                          setNotice(t('reprocessCreated'));
                        }}
                        onReady={onEvidence}
                      />
                    </>
                  ) : capability ? (
                    <div className="studio-first-reference">
                      <FileVideo size={44} aria-hidden />
                      <h2>{t('noFootageTitle')}</h2>
                      <p>{t('noFootageBody')}</p>
                      <Button disabled={!editable || busy} onClick={() => setUpload(true)}>
                        <Plus size={17} aria-hidden />
                        {t('addVideo')}
                      </Button>
                    </div>
                  ) : null}
                  {reference || capability ? profileApproval : null}
                  {profile ? (
                    <div className="studio-next-step">
                      <div>
                        <strong>{t('draftTitle')}</strong>
                        <p>{t('draftHelp')}</p>
                      </div>
                      <Button
                        disabled={busy || dirty || !editable || !sourceMatches}
                        onClick={() => void makeDraft()}
                      >
                        {t(
                          versions.some(
                            (item) =>
                              item.status === 'DRAFT' && item.referenceProfileId === profile.id,
                          )
                            ? 'existingDraft'
                            : 'prepareDraft',
                        )}
                        <ArrowRight size={17} aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
              {chosen ? (
                <div hidden={tab !== 'configure'}>
                  <ConfigurationReview
                    key={chosen.id}
                    chosen={chosen}
                    current={current}
                    reference={configReference}
                    evidenceReady={readyEvidence}
                    busy={busy}
                    canPublish={
                      editable &&
                      chosen.configuration.pattern === classification &&
                      reference?.pattern === classification
                    }
                    isAvailable={readiness.some((item) => item.id === chosen.id && item.available)}
                    onDirty={onDirty}
                    onInspect={inspect}
                    onEditExercise={() => setEditor('edit')}
                    onSave={async (features, rules, note, criteria, mobileRuntimeSchema) => {
                      await act(
                        () =>
                          movementRuntimeApi.review(chosen.id, {
                            regions: chosen.configuration.selectedRegions,
                            features,
                            enabledRules: rules,
                            note,
                            criteria,
                            mobileRuntimeSchema,
                          }),
                        'reviewSaved',
                      );
                    }}
                    onPublish={() => setConfirmation('publish')}
                    onReject={() => setConfirmation('reject')}
                    onNewDraft={() => void makeDraft()}
                  />
                </div>
              ) : tab === 'configure' ? (
                <div className="studio-configuration-start">
                  {reference || capability ? profileApproval : null}
                  <div className="studio-first-reference">
                    <Smartphone size={40} aria-hidden />
                    <h2>{t(capability ? 'draftTitle' : 'noCapability')}</h2>
                    <p>{t(capability ? 'draftHelp' : 'noCapabilityHelp')}</p>
                    {capability ? (
                      <Button
                        disabled={busy || !profile || !editable}
                        onClick={() => void makeDraft()}
                      >
                        {t('prepareDraft')}
                      </Button>
                    ) : null}
                    <Button variant="ghost" onClick={() => inspect()}>
                      {t('showEvidence')}
                    </Button>
                  </div>
                </div>
              ) : null}
              {tab === 'history' ? (
                <AssessmentVersionHistory
                  versions={versions}
                  revisions={revisions}
                  readiness={readiness}
                  onOpen={openVersion}
                />
              ) : null}
            </>
          )}
          <footer className="studio-exercise-footer">
            <details open={!capability}>
              <summary>{t('details')}</summary>
              <dl>
                <div>
                  <dt>{t('fields.equipment')}</dt>
                  <dd>{exercise.equipment ?? t('unspecified')}</dd>
                </div>
                <div>
                  <dt>{t('fields.muscleGroup')}</dt>
                  <dd>{exercise.muscleGroup ?? t('unspecified')}</dd>
                </div>
                <div>
                  <dt>{t('fields.instructions')}</dt>
                  <dd className="whitespace-pre-wrap">
                    {exercise.instructions ?? t('unspecified')}
                  </dd>
                </div>
              </dl>
            </details>
            {exercise.isActive ? (
              <Button
                variant="ghost"
                disabled={busy || dirty}
                onClick={() => setConfirmation('retire')}
              >
                {t('retire')}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              disabled={busy || dirty}
              onClick={() => {
                void reload()
                  .then(() => setRefresh((value) => value + 1))
                  .catch(setError);
              }}
            >
              <RefreshCw size={15} aria-hidden />
              {refCopy('actions.refreshStatus')}
            </Button>
          </footer>
        </>
      ) : null}
      {editor ? (
        <ExerciseEditor
          catalog={metadataCatalog}
          key={`${editor}-${exercise?.id ?? 'new'}`}
          exercise={editor === 'edit' ? exercise : undefined}
          pattern={editor === 'edit' ? classification : undefined}
          busy={busy}
          error={error}
          onClose={() => setEditor(undefined)}
          onSave={async (input) => {
            const saved = await act(
              () =>
                editor === 'edit' && exercise
                  ? movementRuntimeApi.updateExercise(exercise.id, input)
                  : movementRuntimeApi.createExercise(input),
              editor === 'edit' ? 'updated' : 'created',
            );
            if (saved) {
              openExercise(saved.id, true);
              return true;
            }
            return false;
          }}
        />
      ) : null}
      {upload && capability ? (
        <ReferenceUpload
          capability={capability}
          busy={busy}
          error={error}
          onClose={() => setUpload(false)}
          onUpload={async (file) => {
            const saved = await act(async () => {
              let collectionId = sets.find(
                (item) => item.exerciseId === exerciseId && item.pattern === classification,
              )?.id;
              if (!collectionId)
                collectionId = (
                  await movementReferenceApi.createReferenceSet({
                    exerciseId,
                    pattern: classification as 'SQUAT' | 'HINGE' | 'PULL',
                  })
                ).id;
              return movementReferenceApi.uploadSource(collectionId, file);
            }, 'uploadSaved');
            if (saved) {
              navigate({ collection: saved.id, tab: undefined });
              return true;
            }
            await reload().catch(() => undefined);
            setRefresh((value) => value + 1);
            return false;
          }}
        />
      ) : null}
      {confirmation && exercise ? (
        <StudioConfirm
          key={confirmation}
          title={t(confirmCopy[confirmation].title)}
          description={t(confirmCopy[confirmation].help)}
          action={t(confirmCopy[confirmation].action)}
          busy={busy}
          danger={confirmation === 'reject' || confirmation === 'retire'}
          acknowledge={confirmation === 'publish' ? t('acknowledge') : undefined}
          onClose={() => setConfirmation(undefined)}
          onConfirm={() =>
            void (async () => {
              const saved = await act<{ id: string }>(
                () =>
                  confirmation === 'retire'
                    ? movementRuntimeApi.updateExercise(exercise.id, metadataInput(false))
                    : confirmation === 'reference'
                      ? movementReferenceApi.activateProfile(reference!.id, profile!.id)
                      : movementRuntimeApi.transition(chosen!.id, confirmation),
                confirmCopy[confirmation].saved,
              );
              if (saved) setConfirmation(undefined);
            })()
          }
        >
          <StudioError error={error} />
          {confirmation === 'publish' && chosen ? (
            <MobilePreview configuration={chosen.configuration} />
          ) : null}
        </StudioConfirm>
      ) : null}
      {blocker.state === 'blocked' ? (
        <StudioConfirm
          title={t('dirtyLeave')}
          description={t('dirtyLeaveHelp')}
          action={t('discard')}
          busy={false}
          danger
          onClose={() => blocker.reset()}
          onConfirm={() => {
            setDirty(false);
            blocker.proceed();
          }}
        />
      ) : null}
    </div>
  );
}
