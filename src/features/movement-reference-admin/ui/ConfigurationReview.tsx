import { ArrowRight, CheckCircle2, Eye, LockKeyhole, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { RuntimeConfiguration, RuntimeVersion } from '../api/runtimeTypes';
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
        {configuration.selectedRegions.map((region) => (
          <span key={region}>{t(`regions.${region}`, { defaultValue: region })}</span>
        ))}
      </div>
      <ul>
        <li>{t('mobileMeasurements', { count: features.length })}</li>
        <li>{t('mobileRules', { count: rules.length })}</li>
        <li>{t('readinessGates')}</li>
      </ul>
      <p className="studio-caption">
        {t('timing', {
          dwell: configuration.cuePolicy.dwellMs,
          cooldown: configuration.cuePolicy.cooldownMs / 1000,
        })}
      </p>
      <p className="studio-caption">{t('mobilePreviewHelp')}</p>
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
  onSave: (features: string[], rules: string[], note: string) => Promise<void>;
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
  const [compare, setCompare] = useState(false);
  const draft = chosen.status === 'DRAFT';
  const effectiveRules = rules.filter((code) =>
    features.includes(configuration.rules.find((rule) => rule.code === code)?.feature ?? ''),
  );
  const dirty =
    draft &&
    (!same(features, configuration.selectedFeatures) ||
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
            <h3>{t('features')}</h3>
            <p className="studio-muted">{t('measureHelp')}</p>
            <fieldset>
              {Object.keys(configuration.capability.featureGeometry).map((code) => (
                <div className="studio-feature-option" key={code}>
                  <label>
                    <input
                      type="checkbox"
                      checked={features.includes(code)}
                      disabled={!draft || busy || code === configuration.segmentation.driver}
                      onChange={() => {
                        toggle(code, features, setFeatures);
                        if (features.includes(code))
                          setRules(
                            rules.filter(
                              (item) =>
                                configuration.rules.find((rule) => rule.code === item)?.feature !==
                                code,
                            ),
                          );
                      }}
                    />
                    <span>
                      <strong>{name(code)}</strong>
                      <small>
                        {code === configuration.segmentation.driver
                          ? t('driver')
                          : t(`featureDescriptions.${code}`, { defaultValue: '' })}
                      </small>
                    </span>
                  </label>
                  <button
                    type="button"
                    className="studio-evidence-link"
                    onClick={() => onInspect(code)}
                    aria-label={`${t('showEvidence')}: ${name(code)}`}
                  >
                    <Eye size={17} aria-hidden />
                  </button>
                </div>
              ))}
            </fieldset>
          </section>
          <section className="studio-config-section">
            <h3>{t('rules')}</h3>
            <p className="studio-muted">{t('rulesHelp')}</p>
            <div className="studio-inline-warning">{t('referenceOnly')}</div>
            <fieldset className="studio-rule-list">
              {configuration.rules.map((rule) => (
                <div
                  className={`studio-rule ${effectiveRules.includes(rule.code) ? 'is-enabled' : ''}`}
                  key={rule.code}
                >
                  <label>
                    <span>
                      <strong>{name(rule.feature)}</strong>
                      <small>
                        {t('during', {
                          phases: rule.phases
                            .map((phase) => t(`phases.${phase}`, { defaultValue: phase }))
                            .join(', '),
                        })}
                      </small>
                    </span>
                    <span className="studio-switch-label">
                      {t(effectiveRules.includes(rule.code) ? 'enabled' : 'disabled')}
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={`${t('rules')}: ${name(rule.feature)}`}
                        checked={effectiveRules.includes(rule.code)}
                        disabled={!draft || busy || !features.includes(rule.feature)}
                        onChange={() => toggle(rule.code, rules, setRules)}
                      />
                    </span>
                  </label>
                  <div className="studio-rule-range">
                    <span>{t('range')}</span>
                    <strong>
                      {rule.lower.toFixed(1)}° <ArrowRight size={14} aria-hidden />{' '}
                      {rule.upper.toFixed(1)}°
                    </strong>
                    <button type="button" onClick={() => onInspect(rule.feature)}>
                      {t('showEvidence')}
                    </button>
                  </div>
                  <p className="studio-cue">
                    <span>{t('cue')}</span>“{rule.cue}”
                  </p>
                </div>
              ))}
            </fieldset>
            {!configuration.rules.length ? <p className="studio-muted">{t('noRules')}</p> : null}
            <p className="studio-caption">{t('cueLanguage')}</p>
          </section>
          {draft ? (
            <section className="studio-config-section">
              <label className="studio-review-note">
                <strong>{t('reviewNote')}</strong>
                <span>{t('reviewNoteHelp')}</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t('reviewPlaceholder')}
                  disabled={busy}
                />
              </label>
              {!evidenceReady ? (
                <div className="studio-inline-warning">
                  <p>{t('inspectBeforeReview')}</p>
                  <Button variant="outline" size="sm" onClick={() => onInspect()}>
                    {t('showEvidence')}
                  </Button>
                </div>
              ) : null}
              <div className="studio-review-save">
                <Button
                  disabled={busy || !note.trim() || !evidenceReady}
                  onClick={() => void onSave(features, effectiveRules, note)}
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
            </section>
          ) : chosen.reviewNote ? (
            <section className="studio-config-section">
              <h3>{t('reviewNote')}</h3>
              <p className="whitespace-pre-wrap">{chosen.reviewNote}</p>
            </section>
          ) : null}
        </div>
        <aside className="studio-publication-panel">
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
          {draft ? (
            <div className="studio-publish-actions">
              <Button
                disabled={
                  busy ||
                  dirty ||
                  configuration.reviewRequired ||
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
        </aside>
      </div>
    </div>
  );
}
