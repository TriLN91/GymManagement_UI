import { CheckCircle2, Eye, LockKeyhole, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CriterionReview, RuntimeConfiguration, RuntimeVersion } from '../api/runtimeTypes';
import type { ReferenceSetProfileDto } from '../api/types';

import { StageCard, StudioStatus } from './StudioPrimitives';

import { Button } from '@/shared/ui/button';

const same = (first: string[], second: string[]) =>
  first.length === second.length && first.every((value) => second.includes(value));

export function MobilePreview({
  configuration,
  features = configuration.selectedFeatures,
  rules = configuration.rules.filter((rule) => rule.enabled).map((rule) => rule.code),
}: {
  configuration: RuntimeConfiguration;
  features?: string[];
  rules?: string[];
}) {
  const { t } = useTranslation('movementStudio');
  return (
    <div className="studio-mobile-preview">
      <div className="studio-mobile-preview-heading">
        <Smartphone size={20} aria-hidden />
        <h3>{t('mobilePreview')}</h3>
        <span>v{configuration.version}</span>
      </div>
      <strong>{configuration.exercise.name}</strong>
      <p>
        {t(`views.${configuration.view}`, { defaultValue: configuration.view })} ·{' '}
        {t(`capabilities.${configuration.capability.code}`, {
          defaultValue: configuration.capability.label,
        })}
      </p>
      <div className="studio-preview-regions">
        {(configuration.assessmentPlan?.requiredRegions ?? configuration.selectedRegions).map(
          (region) => (
            <span key={region}>{t(`regions.${region}`, { defaultValue: region })}</span>
          ),
        )}
      </div>
      <ul>
        <li>{t('mobileMeasurements', { count: features.length })}</li>
        <li>{t('mobileRules', { count: rules.length })}</li>
        <li>{t('readinessGates')}</li>
      </ul>
      <details className="studio-purpose-details">
        <summary>{t('technicalDetails')}</summary>
        <p className="studio-caption">
          {t('timing', {
            dwell: configuration.cuePolicy.dwellMs,
            cooldown: configuration.cuePolicy.cooldownMs / 1000,
          })}
        </p>
        <p className="studio-caption">
          {t(configuration.assessmentPlan ? 'focusedPlanHelp' : 'legacyPlanHelp')}
        </p>
      </details>
      <p className="studio-caption">{t('mobilePreviewHelp')}</p>
      {configuration.assessmentPolicy ? (
        <p className="studio-caption">
          {t('motionComparisonHelp', {
            coverage: Math.round(configuration.assessmentPolicy.minimumComparisonRatio * 100),
          })}
        </p>
      ) : null}
    </div>
  );
}

export function ReferenceApproval({
  profiles,
  selected,
  busy,
  onSelect,
  onConfirm,
  onActivate,
}: {
  profiles: ReferenceSetProfileDto[];
  selected?: ReferenceSetProfileDto;
  busy: boolean;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onActivate: () => void;
}) {
  const { t } = useTranslation('movementStudio');
  return (
    <section className="studio-reference-approval">
      <h2>{t('reference')}</h2>
      <p className="studio-muted">{t('referenceHelp')}</p>
      {profiles.length > 1 ? (
        <label className="studio-select-label">
          {t('chooseReference')}
          <select value={selected?.id ?? ''} onChange={(event) => onSelect(event.target.value)}>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {t('referenceVersion', { version: profile.version })} ·{' '}
                {t(`views.${profile.view}`, { defaultValue: profile.view })} ·{' '}
                {t(`status.${profile.status}`)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {selected ? (
        <div className="studio-reference-summary">
          <div>
            <strong>
              {t('referenceVersion', { version: selected.version })} ·{' '}
              {t(`views.${selected.view}`, { defaultValue: selected.view })}
            </strong>
            <p>
              {t('accepted', { count: selected.acceptedRepCount })} ·{' '}
              {t('clips', { count: selected.acceptedVideoCount })}
            </p>
          </div>
          <StudioStatus value={selected.status} />
          {selected.status === 'REVIEW_REQUIRED' ? (
            <Button disabled={busy} variant="outline" onClick={onConfirm}>
              {t('confirmReference')}
            </Button>
          ) : selected.status === 'CONFIRMED' ? (
            <Button disabled={busy} onClick={onActivate}>
              {t('publishReference')}
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="studio-muted">{t('noReference')}</p>
      )}
    </section>
  );
}

export function ConfigurationReview({
  chosen,
  current,
  reference,
  evidenceReady,
  busy,
  canPublish,
  isAvailable,
  onDirty,
  onInspect,
  onEditExercise,
  onSave,
  onPublish,
  onReject,
  onNewDraft,
}: {
  chosen: RuntimeVersion;
  current?: RuntimeVersion;
  reference?: ReferenceSetProfileDto;
  evidenceReady: boolean;
  busy: boolean;
  canPublish: boolean;
  isAvailable: boolean;
  onDirty: (value: boolean) => void;
  onInspect: (feature?: string) => void;
  onEditExercise?: () => void;
  onSave: (
    features: string[],
    rules: string[],
    note: string,
    criteria?: CriterionReview[],
    mobileRuntimeSchema?: string,
  ) => Promise<void>;
  onPublish: () => void;
  onReject: () => void;
  onNewDraft: () => void;
}) {
  const { t } = useTranslation('movementStudio');
  const configuration = chosen.configuration;
  const [features, setFeatures] = useState(configuration.selectedFeatures);
  const [rules, setRules] = useState(
    configuration.rules.filter((rule) => rule.enabled).map((rule) => rule.code),
  );
  const [note, setNote] = useState(chosen.reviewNote ?? '');
  const needsDefinition = configuration.schemaVersion === 'movement-runtime-v3';
  const initialCriteria = configuration.rules.map((rule) => ({
    code: rule.code,
    reviewExplanation: rule.reviewExplanation ?? rule.evidence,
    coachingPriority: rule.coachingPriority ?? ((rule.enabled ? 'P2' : 'P3') as 'P1' | 'P2' | 'P3'),
    expectation: rule.expectation ?? 'Compare this exercise with the approved reference range.',
    cueBelow: rule.cueBelow ?? rule.cue,
    cueAbove: rule.cueAbove ?? rule.cue,
  }));
  const [criteria, setCriteria] = useState<CriterionReview[]>(initialCriteria);
  const [mobileCompatible, setMobileCompatible] = useState(
    configuration.assessmentDefinition?.mobileRuntimeSchema === 'movement-runtime-v3',
  );
  const definitionReady =
    !needsDefinition || configuration.assessmentDefinition?.status === 'REVIEWED';
  const [compare, setCompare] = useState(false);
  const noteInput = useRef<HTMLTextAreaElement>(null);
  const draft = chosen.status === 'DRAFT';
  const effectiveRules = rules.filter((code) =>
    features.includes(configuration.rules.find((rule) => rule.code === code)?.feature ?? ''),
  );
  const dirty =
    draft &&
    ((needsDefinition && JSON.stringify(criteria) !== JSON.stringify(initialCriteria)) ||
      (needsDefinition &&
        mobileCompatible !==
          (configuration.assessmentDefinition?.mobileRuntimeSchema === 'movement-runtime-v3')) ||
      !same(features, configuration.selectedFeatures) ||
      !same(
        effectiveRules,
        configuration.rules.filter((rule) => rule.enabled).map((rule) => rule.code),
      ) ||
      note.trim() !== (chosen.reviewNote ?? '').trim());
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const toggle = (value: string, selected: string[], update: (value: string[]) => void) =>
    update(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    );
  const name = (feature: string) => t(`featureNames.${feature}`, { defaultValue: feature });
  return (
    <div className="studio-configuration">
      <div className={`studio-version-banner ${draft ? 'is-draft' : ''}`}>
        <div>
          <span className="studio-eyebrow">
            {t(
              draft
                ? 'candidate'
                : chosen.status === 'PUBLISHED' && isAvailable
                  ? 'current'
                  : 'historical',
            )}
          </span>
          <h2>
            {t('version', { version: chosen.version })} <StudioStatus value={chosen.status} />
          </h2>
          <p>
            {t('referenceVersion', { version: configuration.referenceVersion })} ·{' '}
            {t(`views.${configuration.view}`, { defaultValue: configuration.view })} ·{' '}
            {t(`capabilities.${configuration.capability.code}`, {
              defaultValue: configuration.capability.label,
            })}
          </p>
        </div>
        <Button variant="outline" onClick={() => onInspect()}>
          <Eye size={16} aria-hidden />
          {t('showEvidence')}
        </Button>
      </div>
      {!draft ? (
        <div className="studio-readonly">
          <LockKeyhole size={18} aria-hidden />
          <p>{t('readOnly')}</p>
          {reference ? (
            <Button variant="outline" size="sm" disabled={busy || !canPublish} onClick={onNewDraft}>
              {t('prepareDraft')}
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="studio-configuration-grid">
        <div className="studio-configuration-fields">
          <section className="studio-config-section">
            <h3>{t('measurementCoaching')}</h3>
            <p className="studio-muted">{t('measurementCoachingHelp')}</p>
            {!configuration.assessmentPlan ? (
              <p className="studio-inline-warning">{t('legacyPlanHelp')}</p>
            ) : null}
            <p className="studio-inline-warning">{t('referenceOnly')}</p>
            <div className="studio-measurement-cards">
              {(
                configuration.assessmentPlan?.availableFeatures ??
                Object.keys(configuration.capability.featureGeometry)
              ).map((code) => {
                const required = code === configuration.segmentation.driver;
                const measured = features.includes(code);
                const featureRules = configuration.rules.filter((rule) => rule.feature === code);
                return (
                  <article
                    key={code}
                    className={'studio-measurement-card ' + (measured ? 'is-measured' : '')}
                  >
                    <div className="studio-measurement-heading">
                      <label>
                        <input
                          type="checkbox"
                          checked={measured}
                          disabled={!draft || busy || required}
                          onChange={() => {
                            toggle(code, features, setFeatures);
                            if (measured) {
                              setRules(
                                rules.filter(
                                  (item) =>
                                    configuration.rules.find((rule) => rule.code === item)
                                      ?.feature !== code,
                                ),
                              );
                              setCriteria((items) =>
                                items.map((item) =>
                                  configuration.rules.find((rule) => rule.code === item.code)
                                    ?.feature === code
                                    ? { ...item, coachingPriority: 'P3' }
                                    : item,
                                ),
                              );
                            }
                          }}
                        />
                        <span>
                          <strong>
                            {t(`criterionNames.${code}`, { defaultValue: name(code) })}
                          </strong>
                          <small>{t(required ? 'trackingRequired' : 'optionalMeasurement')}</small>
                        </span>
                      </label>
                      <button
                        type="button"
                        className="studio-evidence-link"
                        aria-label={t('showEvidence') + ': ' + name(code)}
                        onClick={() => onInspect(code)}
                      >
                        <Eye size={17} aria-hidden />
                      </button>
                    </div>
                    <p className="studio-caption">
                      {t(required ? 'trackingLockedHelp' : 'optionalMeasurementHelp')}
                    </p>
                    {featureRules.map((rule) => (
                      <div className="studio-measurement-purpose" key={rule.code}>
                        <details className="studio-purpose-details">
                          <summary>{t('technicalDetails')}</summary>
                          <div className="studio-rule-range">
                            <span>{t('range')}</span>
                            <strong>
                              {rule.lower.toFixed(1)}°–{rule.upper.toFixed(1)}°
                            </strong>
                            <button type="button" onClick={() => onInspect(code)}>
                              {t('showEvidence')}
                            </button>
                          </div>
                        </details>
                        {configuration.assessmentPolicy ? (
                          <p className="studio-caption">
                            {t('descriptiveEvidenceHelp', {
                              clips:
                                configuration.referenceSupport?.acceptedVideoCount ??
                                reference?.acceptedVideoCount ??
                                0,
                              reps:
                                configuration.referenceSupport?.acceptedRepCount ??
                                reference?.acceptedRepCount ??
                                0,
                            })}
                          </p>
                        ) : null}
                        <p className="studio-caption">
                          {t(
                            !measured
                              ? 'measurementExcluded'
                              : rule.reviewEnabled || configuration.assessmentPlan
                                ? 'recordedWithMeasurement'
                                : effectiveRules.includes(rule.code)
                                  ? 'recordedWithMeasurement'
                                  : 'legacyMeasurementOnly',
                          )}
                        </p>
                        {rule.delivery === 'REVIEW_ONLY' ? (
                          <div className="studio-review-only">
                            <LockKeyhole size={15} aria-hidden />
                            <span>
                              <strong>{t('reviewOnly')}</strong> · {t('reviewObservationHelp')}
                            </span>
                          </div>
                        ) : (
                          <>
                            <label className="studio-live-choice">
                              <span>
                                <strong>{t('liveCueChoice')}</strong>
                                <small>{t('liveCueChoiceHelp')}</small>
                              </span>
                              <input
                                type="checkbox"
                                role="switch"
                                aria-label={t('rules') + ': ' + name(code)}
                                checked={effectiveRules.includes(rule.code)}
                                disabled={!draft || busy || !measured}
                                onChange={() => {
                                  toggle(rule.code, rules, setRules);
                                  setCriteria((items) =>
                                    items.map((item) =>
                                      item.code === rule.code
                                        ? {
                                            ...item,
                                            coachingPriority: effectiveRules.includes(rule.code)
                                              ? 'P3'
                                              : 'P2',
                                          }
                                        : item,
                                    ),
                                  );
                                }}
                              />
                            </label>
                            {effectiveRules.includes(rule.code) ? (
                              <p className="studio-cue">
                                {rule.cueBelow && rule.cueAbove ? (
                                  <>
                                    {t('belowRange')}: “{rule.cueBelow}”<br />
                                    {t('aboveRange')}: “{rule.cueAbove}”
                                  </>
                                ) : (
                                  <>“{rule.cue}”</>
                                )}
                              </p>
                            ) : null}
                          </>
                        )}
                        {needsDefinition ? (
                          <div className="studio-form">
                            <strong>{t('referenceCriterion')}</strong>
                            <p>
                              {t('during', {
                                phases: rule.phases
                                  .map((phase) => t(`phases.${phase}`, { defaultValue: phase }))
                                  .join(', '),
                              })}
                            </p>
                            <p className="studio-caption">{t('referenceCriterionHelp')}</p>
                            <label>
                              {t('coachingPriority')}
                              <select
                                disabled={!draft || busy || !measured}
                                value={
                                  criteria.find((item) => item.code === rule.code)
                                    ?.coachingPriority ?? 'P3'
                                }
                                onChange={(event) => {
                                  const coachingPriority = event.target.value as 'P1' | 'P2' | 'P3';
                                  setCriteria((items) =>
                                    items.map((item) =>
                                      item.code === rule.code
                                        ? { ...item, coachingPriority }
                                        : item,
                                    ),
                                  );
                                  setRules((items) =>
                                    coachingPriority === 'P3'
                                      ? items.filter((code) => code !== rule.code)
                                      : [...new Set([...items, rule.code])],
                                  );
                                }}
                              >
                                <option value="P3">{t('priorityP3')}</option>
                                <option value="P2" disabled={rule.delivery === 'REVIEW_ONLY'}>
                                  {t('priorityP2')}
                                </option>
                                <option value="P1" disabled={rule.delivery === 'REVIEW_ONLY'}>
                                  {t('priorityP1')}
                                </option>
                              </select>
                            </label>
                            <p className="studio-caption">{t('priorityMeaning')}</p>
                            {(
                              [
                                'expectation',
                                'reviewExplanation',
                                ...(effectiveRules.includes(rule.code)
                                  ? (['cueBelow', 'cueAbove'] as const)
                                  : []),
                              ] as const
                            ).map((field) => (
                              <label key={field}>
                                {t(field)} · {name(code)}
                                <textarea
                                  rows={2}
                                  maxLength={
                                    field === 'cueBelow' || field === 'cueAbove' ? 160 : 400
                                  }
                                  disabled={!draft || busy || !measured}
                                  value={
                                    criteria.find((item) => item.code === rule.code)?.[field] ?? ''
                                  }
                                  onChange={(event) =>
                                    setCriteria((items) =>
                                      items.map((item) =>
                                        item.code === rule.code
                                          ? { ...item, [field]: event.target.value }
                                          : item,
                                      ),
                                    )
                                  }
                                />
                              </label>
                            ))}
                            <details className="studio-purpose-details">
                              <summary>{t('technicalDetails')}</summary>
                              <p className="studio-caption">
                                {t('requiredEvidence')}:{' '}
                                {(
                                  rule.requiredJoints ??
                                  configuration.capability.featureGeometry[code]?.joints ??
                                  []
                                ).join(', ')}
                                . {t('criterionValidity')}
                              </p>
                            </details>
                          </div>
                        ) : null}
                        <details className="studio-purpose-details">
                          <summary>{t('whenMeasured')}</summary>
                          <p>
                            {t('during', {
                              phases: (rule.reviewPhases ?? rule.phases)
                                .map((phase) => t('phases.' + phase, { defaultValue: phase }))
                                .join(', '),
                            })}
                          </p>
                          <p>
                            {t('supportedFeature')}: {name(code)}
                          </p>
                          {rule.delivery !== 'REVIEW_ONLY' ? (
                            <p>
                              {t('liveDuring', {
                                phases: rule.phases
                                  .map((phase) => t('phases.' + phase, { defaultValue: phase }))
                                  .join(', '),
                              })}
                            </p>
                          ) : null}
                          <p>{t('cueLanguage')}</p>
                        </details>
                      </div>
                    ))}
                  </article>
                );
              })}
            </div>
          </section>
          {configuration.assessmentDefinition ? (
            <section className="studio-config-section">
              <h3>{t('unsupportedCriteria')}</h3>
              {configuration.assessmentDefinition.unsupportedCriteria.map((item) => (
                <p key={item.code}>
                  <strong>{item.code.replaceAll('_', ' ')}</strong>: {item.reason}
                </p>
              ))}
            </section>
          ) : null}
        </div>
        <aside className="studio-publication-panel">
          {draft ? (
            <section className="studio-config-section">
              <label className="studio-review-note">
                <strong>{t('reviewNote')}</strong>
                <span>{t('reviewNoteHelp')}</span>
                <textarea
                  ref={noteInput}
                  rows={3}
                  maxLength={2000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t('reviewPlaceholder')}
                  disabled={busy}
                />
              </label>
              {needsDefinition ? (
                <label className="studio-live-choice">
                  <input
                    type="checkbox"
                    checked={mobileCompatible}
                    disabled={busy}
                    onChange={(e) => setMobileCompatible(e.target.checked)}
                  />
                  <span>{t('confirmMobileCompatibility')}</span>
                </label>
              ) : null}
              <div className="studio-review-save">
                <Button
                  disabled={
                    busy ||
                    !note.trim() ||
                    !evidenceReady ||
                    (needsDefinition &&
                      (!mobileCompatible ||
                        criteria.some(
                          (item) =>
                            configuration.rules.some(
                              (rule) => rule.code === item.code && features.includes(rule.feature),
                            ) &&
                            (!item.expectation.trim() ||
                              !item.reviewExplanation?.trim() ||
                              (effectiveRules.includes(item.code) &&
                                (!item.cueBelow.trim() || !item.cueAbove.trim()))),
                        )))
                  }
                  onClick={() => {
                    if (needsDefinition)
                      void onSave(
                        features,
                        effectiveRules,
                        note,
                        criteria.filter((item) =>
                          configuration.rules.some(
                            (rule) => rule.code === item.code && features.includes(rule.feature),
                          ),
                        ),
                        'movement-runtime-v3',
                      );
                    else void onSave(features, effectiveRules, note);
                  }}
                >
                  {t('saveReview')}
                </Button>
                <span>
                  {dirty ? (
                    t('unsaved')
                  ) : !configuration.reviewRequired ? (
                    <>
                      <CheckCircle2 size={16} aria-hidden />
                      {t('reviewed')}
                    </>
                  ) : (
                    t('unreviewed')
                  )}
                </span>
              </div>
              <div className="studio-review-prerequisites" aria-label={t('reviewRequirements')}>
                <strong>{t('reviewRequirements')}</strong>
                {!evidenceReady ? (
                  <button onClick={() => onInspect()}>{t('resolveEvidence')}</button>
                ) : (
                  <span>✓ {t('evidenceInspected')}</span>
                )}
                {!note.trim() ? (
                  <button onClick={() => noteInput.current?.focus()}>{t('resolveNote')}</button>
                ) : (
                  <span>✓ {t('noteReady')}</span>
                )}
                {reference?.status !== 'ACTIVE' ? (
                  <button onClick={() => onInspect()}>{t('resolveReference')}</button>
                ) : (
                  <span>✓ {t('referenceReady')}</span>
                )}
                {!canPublish && !dirty ? (
                  <button onClick={onEditExercise ?? (() => onInspect())}>
                    {t('resolveExercise')}
                  </button>
                ) : null}
                {!canPublish && dirty ? <span>{t('saveBeforeExercise')}</span> : null}
                {dirty || configuration.reviewRequired ? (
                  <span>{t('resolveSave')}</span>
                ) : (
                  <span>✓ {t('reviewed')}</span>
                )}
              </div>
            </section>
          ) : chosen.reviewNote ? (
            <section className="studio-config-section">
              <h3>{t('reviewNote')}</h3>
              <p className="whitespace-pre-wrap">{chosen.reviewNote}</p>
            </section>
          ) : null}
          {draft ? (
            <div className="studio-publish-actions">
              <Button
                disabled={
                  busy ||
                  dirty ||
                  configuration.reviewRequired ||
                  !definitionReady ||
                  reference?.status !== 'ACTIVE' ||
                  !canPublish
                }
                onClick={onPublish}
              >
                {t('publish')}
              </Button>
              <p>
                {dirty
                  ? t('saveFirst')
                  : configuration.reviewRequired
                    ? t('unreviewed')
                    : reference?.status !== 'ACTIVE'
                      ? t('errors.reference')
                      : !canPublish
                        ? t('notPublishedHelp')
                        : t('publishHelp')}
              </p>
              <Button variant="ghost" disabled={busy} onClick={onReject}>
                {t('reject')}
              </Button>
            </div>
          ) : null}
          <MobilePreview configuration={configuration} features={features} rules={effectiveRules} />
          <StageCard
            done={reference?.status === 'ACTIVE'}
            title={t('reference')}
            description={
              reference?.status === 'ACTIVE' ? t('status.ACTIVE') : t('errors.reference')
            }
          />
          <StageCard
            done={!configuration.reviewRequired && !dirty}
            title={t('configurationReview')}
            description={
              dirty
                ? t('saveFirst')
                : configuration.reviewRequired
                  ? t('reviewNoteHelp')
                  : chosen.status === 'PUBLISHED'
                    ? t('published')
                    : t('reviewSaved')
            }
          />
          {current && current.id !== chosen.id ? (
            <div className="studio-comparison">
              <button aria-expanded={compare} onClick={() => setCompare((value) => !value)}>
                {t('compare')}
                <span>
                  v{current.version} → v{chosen.version}
                </span>
              </button>
              {compare ? (
                <div>
                  <p>{t('comparison')}</p>
                  <p>
                    {t('reference')}: v{current.configuration.referenceVersion} → v
                    {configuration.referenceVersion}
                  </p>
                  <p>
                    {t('features')}: {current.configuration.selectedFeatures.map(name).join(', ')} →{' '}
                    {features.map(name).join(', ')}
                  </p>
                  {configuration.rules.map((rule) => {
                    const old = current.configuration.rules.find((item) => item.code === rule.code);
                    return (
                      <p key={rule.code}>
                        <strong>{name(rule.feature)}</strong>
                        <br />
                        {old
                          ? `${old.lower.toFixed(1)}–${old.upper.toFixed(1)}°`
                          : t('newRule')} → {rule.lower.toFixed(1)}–{rule.upper.toFixed(1)}°<br />
                        {t(old?.enabled ? 'enabled' : 'disabled')} →{' '}
                        {t(effectiveRules.includes(rule.code) ? 'enabled' : 'disabled')}
                      </p>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : draft ? (
            <p className="studio-caption">{t('noCurrent')}</p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
