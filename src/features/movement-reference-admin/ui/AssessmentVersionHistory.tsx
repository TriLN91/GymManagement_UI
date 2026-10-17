import { ArrowUpRight, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ExerciseRevision, Readiness } from '../api/movementRuntimeApi';
import type { RuntimeVersion } from '../api/runtimeTypes';

import { StudioStatus } from './StudioPrimitives';

function snapshot(raw: string): Record<string, unknown> {
  try {
    return Object.fromEntries(
      Object.entries(JSON.parse(raw) as Record<string, unknown>).map(([key, value]) => [
        key.charAt(0).toLowerCase() + key.slice(1),
        value,
      ]),
    );
  } catch {
    return {};
  }
}
const text = (value: unknown) =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '—';
export function AssessmentVersionHistory({
  versions,
  revisions,
  readiness,
  onOpen,
}: {
  versions: RuntimeVersion[];
  revisions: ExerciseRevision[];
  readiness: Readiness[];
  onOpen: (id: string) => void;
}) {
  const { t, i18n } = useTranslation('movementStudio');
  return (
    <div className="studio-history-grid">
      <section>
        <div className="studio-section-heading">
          <History size={21} aria-hidden />
          <h2>{t('configurationHistory')}</h2>
        </div>
        <p className="studio-muted">{t('versionHelp')}</p>
        <div className="studio-version-list">
          {versions.map((item) => (
            <button key={item.id} className="studio-version-card" onClick={() => onOpen(item.id)}>
              <span className="studio-version-number">v{item.version}</span>
              <span>
                <strong>{item.configuration.exercise.name}</strong>
                <small>
                  {t('referenceVersion', { version: item.configuration.referenceVersion })} ·{' '}
                  {t(`views.${item.view}`, { defaultValue: item.view })}
                </small>
                <small>
                  {t('mobileMeasurements', { count: item.configuration.selectedFeatures.length })} ·{' '}
                  {t('mobileRules', {
                    count: item.configuration.rules.filter((rule) => rule.enabled).length,
                  })}
                </small>
              </span>
              <span>
                <StudioStatus value={item.status} />
                {readiness.some((config) => config.id === item.id && config.available) ? (
                  <small>{t('current')}</small>
                ) : item.status === 'PUBLISHED' ? (
                  <small>{t('notPublished')}</small>
                ) : null}
              </span>
              <ArrowUpRight size={18} aria-hidden />
            </button>
          ))}
        </div>
        {!versions.length ? <p className="studio-empty">{t('noVersions')}</p> : null}
      </section>
      <section>
        <h2>{t('metadataHistory')}</h2>
        <p className="studio-muted">{t('preserved')}</p>
        <ol className="studio-revisions">
          {revisions.map((revision, index) => {
            const value = snapshot(revision.snapshotJson),
              previousRevision = revisions[index + 1],
              previous = previousRevision ? snapshot(previousRevision.snapshotJson) : undefined;
            return (
              <li key={revision.id}>
                <div>
                  <strong>
                    v{revision.version} · {text(value.name)}
                  </strong>
                  {revision.createdAtUtc ? (
                    <small>
                      {t('date', {
                        date: new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: 'medium',
                        }).format(new Date(revision.createdAtUtc)),
                      })}
                    </small>
                  ) : null}
                </div>
                <dl>
                  {['pattern', 'equipment', 'muscleGroup', 'instructions'].map((key) => {
                    const data =
                      value[key] ?? (key === 'pattern' ? value.movementPatternCode : undefined);
                    const changed =
                      previous &&
                      data !==
                        (previous[key] ??
                          (key === 'pattern' ? previous.movementPatternCode : undefined));
                    return data ? (
                      <div key={key} className={changed ? 'is-changed' : ''}>
                        <dt>{t(`fields.${key}`)}</dt>
                        <dd>
                          {key === 'pattern'
                            ? t(`patterns.${text(data)}`, { defaultValue: text(data) })
                            : text(data)}
                        </dd>
                      </div>
                    ) : null;
                  })}
                  <div>
                    <dt>{t('assessment')}</dt>
                    <dd>
                      {t(value.isActive === false ? 'status.retired' : 'status.activeExercise')}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
        {!revisions.length ? <p className="studio-empty">{t('noHistory')}</p> : null}
      </section>
    </div>
  );
}
