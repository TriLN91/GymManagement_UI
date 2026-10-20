import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import type { Capability, Readiness } from '../api/movementRuntimeApi';
import type { ExerciseDto, ReferenceSetSummaryDto } from '../api/types';
import { capabilityFor, patternOf, patterns, readinessOf } from '../model/studio';

import { StudioStatus } from './StudioPrimitives';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function ExerciseLibrary({
  exercises,
  sets,
  readiness,
  capabilities,
  onOpen,
  onCreate,
}: {
  exercises: ExerciseDto[];
  sets: ReferenceSetSummaryDto[];
  readiness: Readiness[];
  capabilities: Capability[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation('movementStudio');
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const pattern = params.get('pattern') ?? 'ALL';
  const filter = params.get('status') ?? 'all';
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const setQuery = (value: string) => update('q', value);
  const setPattern = (value: string) => update('pattern', value === 'ALL' ? '' : value);
  const setFilter = (value: string) => update('status', value === 'all' ? '' : value);
  const counts = {
    all: exercises.filter((exercise) => exercise.isActive).length,
    live: exercises.filter((exercise) => readinessOf(exercise, readiness) === 'live').length,
    draft: exercises.filter(
      (exercise) =>
        exercise.isActive &&
        readiness.some((item) => item.exerciseId === exercise.id && item.status === 'DRAFT'),
    ).length,
  };
  const visible = exercises.filter((exercise) => {
    const status = readinessOf(exercise, readiness);
    return (
      (filter === 'retired' ? !exercise.isActive : exercise.isActive) &&
      (filter === 'all' ||
        filter === 'retired' ||
        (filter === 'draft'
          ? readiness.some((item) => item.exerciseId === exercise.id && item.status === 'DRAFT')
          : status === filter)) &&
      (pattern === 'ALL' || patternOf(exercise, sets) === pattern) &&
      [exercise.name, exercise.equipment, exercise.muscleGroup].some((value) =>
        value?.toLowerCase().includes(query.toLowerCase()),
      )
    );
  });
  return (
    <>
      <header className="studio-page-header">
        <div>
          <p className="studio-eyebrow">{t('eyebrow')}</p>
          <h1>{t('title')}</h1>
          <p className="studio-subtitle">{t('subtitle')}</p>
        </div>
        <Button onClick={onCreate}>
          <Plus size={18} aria-hidden />
          {t('create')}
        </Button>
      </header>
      <div className="studio-overview">
        {(
          [
            ['all', 'total', Activity],
            ['live', 'live', CheckCircle2],
            ['draft', 'drafts', SlidersHorizontal],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            className={`studio-summary ${filter === key ? 'is-selected' : ''}`}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
          >
            <Icon size={22} aria-hidden />
            <span>
              {t(label)}
              <strong>{counts[key]}</strong>
            </span>
            <ArrowUpRight size={18} aria-hidden />
          </button>
        ))}
      </div>
      <section className="studio-library" aria-label={t('title')}>
        <div className="studio-library-toolbar">
          <div className="studio-patterns" aria-label={t('pattern')}>
            {['ALL', ...patterns, 'UNCLASSIFIED'].map((value) => (
              <button
                key={value}
                className={pattern === value ? 'is-selected' : ''}
                aria-pressed={pattern === value}
                onClick={() => setPattern(value)}
              >
                {value === 'ALL' ? t('all') : t(`patterns.${value}`)}
              </button>
            ))}
          </div>
          <div className="studio-search-row">
            <label className="studio-search">
              <Search size={18} aria-hidden />
              <Input
                aria-label={t('search')}
                placeholder={t('searchHint')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="studio-filter">
              <SlidersHorizontal size={16} aria-hidden />
              <select
                aria-label={t('assessment')}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                {['all', 'live', 'draft', 'unconfigured', 'retired'].map((value) => (
                  <option key={value} value={value}>
                    {t(`filters.${value}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="studio-list-heading" aria-hidden>
          <span>{t('exercise')}</span>
          <span>
            {t('pattern')} / {t('capability')}
          </span>
          <span>{t('assessment')}</span>
          <span>{t('footage')}</span>
          <span />
        </div>
        <ul className="studio-exercise-list">
          {visible.map((exercise) => {
            const movement = patternOf(exercise, sets);
            const capability = capabilityFor(capabilities, movement);
            const status = readinessOf(exercise, readiness);
            const exerciseSets = sets.filter((set) => set.exerciseId === exercise.id);
            const sourceCount = exerciseSets.reduce((count, set) => count + set.sourceCount, 0);
            return (
              <li key={exercise.id}>
                <button className="studio-exercise-row" onClick={() => onOpen(exercise.id)}>
                  <span className="studio-exercise-identity">
                    <span className={`studio-pattern-icon pattern-${movement.toLowerCase()}`}>
                      <Activity size={22} aria-hidden />
                    </span>
                    <span>
                      <strong>{exercise.name}</strong>
                      <small>
                        {[exercise.equipment, exercise.muscleGroup].filter(Boolean).join(' · ') ||
                          t('unspecified')}
                      </small>
                    </span>
                  </span>
                  <span className="studio-pattern-cell">
                    <strong>{t(`patterns.${movement}`)}</strong>
                    <small>
                      {capability
                        ? t(`capabilities.${capability.code}`, { defaultValue: capability.label })
                        : t('noCapability')}
                    </small>
                    {!exercise.movementPatternCode && movement !== 'UNCLASSIFIED' ? (
                      <small>{t('classificationPending')}</small>
                    ) : null}
                  </span>
                  <span>
                    <StudioStatus value={status} />
                    {status === 'live' &&
                    readiness.some(
                      (item) => item.exerciseId === exercise.id && item.status === 'DRAFT',
                    ) ? (
                      <small className="studio-pending">{t('status.draft')}</small>
                    ) : null}
                  </span>
                  <span className="studio-source-count">
                    {sourceCount ? t('clips', { count: sourceCount }) : t('none')}
                  </span>
                  <ArrowUpRight className="studio-row-arrow" size={19} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
        {!visible.length ? (
          <div className="studio-empty">
            <CircleDashed size={36} aria-hidden />
            <h2>{t('emptyTitle')}</h2>
            <p>{t('emptyBody')}</p>
            <Button
              variant="outline"
              onClick={() => {
                setParams({});
              }}
            >
              {t('clear')}
            </Button>
          </div>
        ) : null}
        <footer className="studio-library-footer">
          <span>{t('results', { count: visible.length })}</span>
          <span>{t('preserved')}</span>
        </footer>
      </section>
    </>
  );
}
