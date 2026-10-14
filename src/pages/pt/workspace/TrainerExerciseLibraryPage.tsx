import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { TrainerExerciseArtwork, TrainerExercisePreviewDialog } from './TrainerExerciseMedia';

import {
  EMPTY_TRAINER_EXERCISE_FILTERS,
  filterTrainerExercises,
  getExerciseGoal,
  toggleTrainerExerciseFilter,
  trainerExercises,
  useTrainerText,
  useTrainerWorkspaceStore,
  type TrainerExercise,
  type TrainerExerciseFilterKey,
  type TrainerExerciseFilters,
} from '@/features/trainer-workspace';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

import './trainer-workspace.css';

const PAGE_SIZE = 6;

function FilterOptions({
  filterKey,
  values,
  filters,
  onChange,
}: {
  filterKey: TrainerExerciseFilterKey;
  values: string[];
  filters: TrainerExerciseFilters;
  onChange: (filters: TrainerExerciseFilters) => void;
}) {
  const tr = useTrainerText();
  return (
    <div className="trainer-library-filter-options">
      {values.map((value) => (
        <label key={value}>
          <input
            type="checkbox"
            checked={filters[filterKey].includes(value)}
            onChange={() => onChange(toggleTrainerExerciseFilter(filters, filterKey, value))}
          />
          <span aria-hidden="true">
            <Check />
          </span>
          {tr(value)}
        </label>
      ))}
    </div>
  );
}

export function TrainerExerciseLibraryPage() {
  const tr = useTrainerText();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const add = useTrainerWorkspaceStore((state) => state.addDraftExercise);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<TrainerExerciseFilters>(EMPTY_TRAINER_EXERCISE_FILTERS);
  const [draftFilters, setDraftFilters] = useState<TrainerExerciseFilters>(
    EMPTY_TRAINER_EXERCISE_FILTERS,
  );
  const [sort, setSort] = useState<'name' | 'difficulty'>('name');
  const [page, setPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [preview, setPreview] = useState<TrainerExercise | null>(null);
  const [expandedMuscles, setExpandedMuscles] = useState<string[]>([]);

  const options = useMemo(
    () => ({
      equipment: [...new Set(trainerExercises.map((item) => item.equipment))].sort(),
      difficulty: [...new Set(trainerExercises.map((item) => item.difficulty))].sort(),
      muscle: [
        ...new Set(
          trainerExercises.flatMap((item) => [item.muscle, ...(item.secondaryMuscles ?? [])]),
        ),
      ].sort(),
      goal: [...new Set(trainerExercises.map(getExerciseGoal))].sort(),
    }),
    [],
  );
  const filtered = useMemo(() => {
    const matches = filterTrainerExercises(trainerExercises, query, filters);
    return [...matches].sort((a, b) => {
      if (sort === 'difficulty') {
        const order = ['Beginner', 'Intermediate', 'Advanced'];
        const difference = order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
        if (difference !== 0) return difference;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filters, query, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCount = Object.values(filters).reduce((sum, values) => sum + values.length, 0);

  const updateFilters = (next: TrainerExerciseFilters) => {
    setFilters(next);
    setPage(1);
  };
  const addExercise = (exercise: TrainerExercise) => {
    add(exercise.id);
    toast.success(t('trainer:trainerExerciseLibrary.addedToThePlan'), {
      action: {
        label: t('trainer:trainerExerciseLibrary.openPlan'),
        onClick: () => navigate(ROUTES.pt.planBuilder),
      },
    });
  };
  const labels: Record<TrainerExerciseFilterKey, string> = {
    equipment: t('trainer:trainerExerciseLibrary.equipment'),
    difficulty: t('trainer:trainerExerciseLibrary.difficulty'),
    muscle: t('trainer:trainerExerciseLibrary.muscleGroup'),
    goal: t('trainer:trainerExerciseLibrary.goal'),
  };

  return (
    <div className="trainer-workspace-page trainer-library-page">
      <div className="trainer-library-heading">
        <h1>{t('trainer:trainerExerciseLibrary.exerciseLibrary')}</h1>
        <button
          className="trainer-primary-action"
          type="button"
          onClick={() => navigate(ROUTES.pt.planBuilder)}
        >
          {t('trainer:trainerExerciseLibrary.openPlan')} <ArrowRight size={15} />
        </button>
      </div>

      <section className="trainer-library-controls" aria-label={tr('Exercise filters')}>
        <label className="trainer-library-search">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={t('trainer:trainerExerciseLibrary.searchExerciseMuscleOr')}
          />
        </label>
        <div className="trainer-library-desktop-filters">
          {(Object.keys(options) as TrainerExerciseFilterKey[]).map((key) => (
            <details className="trainer-library-filter" key={key}>
              <summary>
                {labels[key]}
                {filters[key].length > 0 && <b>{filters[key].length}</b>}
                <ChevronDown aria-hidden="true" />
              </summary>
              <FilterOptions
                filterKey={key}
                values={options[key]}
                filters={filters}
                onChange={updateFilters}
              />
            </details>
          ))}
        </div>
        <button
          type="button"
          className="trainer-library-mobile-filter"
          onClick={() => {
            setDraftFilters(filters);
            setFilterSheetOpen(true);
          }}
        >
          <Filter aria-hidden="true" />
          {t('trainer:trainerExerciseLibrary.filters')}
          {activeCount > 0 && <b>{activeCount}</b>}
        </button>
        <label className="trainer-library-sort">
          <span className="sr-only">{t('trainer:trainerExerciseLibrary.sort')}</span>
          <SlidersHorizontal aria-hidden="true" />
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as typeof sort);
              setPage(1);
            }}
          >
            <option value="name">{t('trainer:trainerExerciseLibrary.nameAZ')}</option>
            <option value="difficulty">{t('trainer:trainerExerciseLibrary.difficulty')}</option>
          </select>
        </label>
      </section>

      {activeCount > 0 && (
        <div className="trainer-library-chips" aria-label={tr('Active filters')}>
          {(Object.keys(filters) as TrainerExerciseFilterKey[]).flatMap((key) =>
            filters[key].map((value) => (
              <button
                type="button"
                key={`${key}-${value}`}
                onClick={() => updateFilters(toggleTrainerExerciseFilter(filters, key, value))}
                aria-label={`${t('trainer:trainerExerciseLibrary.remove')} ${tr(value)}`}
              >
                <span>{tr(value)}</span>
                <X aria-hidden="true" />
              </button>
            )),
          )}
          <button
            type="button"
            className="is-clear"
            onClick={() => updateFilters(EMPTY_TRAINER_EXERCISE_FILTERS)}
          >
            {t('trainer:trainerExerciseLibrary.clearAll')}
          </button>
        </div>
      )}

      <div className="trainer-library-results-bar" aria-live="polite">
        <strong>
          {filtered.length} {t('trainer:trainerExerciseLibrary.results')}
        </strong>
        {filtered.length > 0 && (
          <span>
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
          </span>
        )}
      </div>

      {paginated.length > 0 ? (
        <div className="trainer-exercise-library">
          {paginated.map((exercise) => {
            const muscles = [exercise.muscle, ...(exercise.secondaryMuscles ?? [])];
            const musclesExpanded = expandedMuscles.includes(exercise.id);
            return (
              <article key={exercise.id}>
                <button
                  className="trainer-exercise-card__media"
                  type="button"
                  onClick={() => setPreview(exercise)}
                  aria-label={`${t('trainer:trainerExerciseLibrary.view')} ${tr(exercise.name)}`}
                >
                  <TrainerExerciseArtwork exercise={exercise} />
                  <span className="trainer-exercise-card__badges">
                    <b>{exercise.difficulty}</b>
                    <b>{getExerciseGoal(exercise)}</b>
                  </span>
                </button>
                <div className="trainer-exercise-card__body">
                  <button
                    className="trainer-exercise-card__title"
                    type="button"
                    onClick={() => setPreview(exercise)}
                  >
                    {tr(exercise.name)}
                  </button>
                  <span className="trainer-exercise-card__equipment">{tr(exercise.equipment)}</span>
                  <div className="trainer-exercise-card__muscles">
                    {(musclesExpanded ? muscles : muscles.slice(0, 3)).map((muscle) => (
                      <span key={muscle}>{tr(muscle)}</span>
                    ))}
                    {muscles.length > 3 && (
                      <button
                        type="button"
                        aria-expanded={musclesExpanded}
                        aria-label={
                          musclesExpanded ? 'Show fewer muscle groups' : 'Show more muscle groups'
                        }
                        onClick={() =>
                          setExpandedMuscles((current) =>
                            current.includes(exercise.id)
                              ? current.filter((id) => id !== exercise.id)
                              : [...current, exercise.id],
                          )
                        }
                      >
                        {musclesExpanded ? '−' : `+${muscles.length - 3}`}
                      </button>
                    )}
                  </div>
                  {exercise.description && <p>{exercise.description}</p>}
                  <button
                    className="trainer-exercise-card__add"
                    type="button"
                    onClick={() => addExercise(exercise)}
                    aria-label={`${t('trainer:trainerExerciseLibrary.add')} ${tr(exercise.name)}`}
                  >
                    <Plus aria-hidden="true" />
                    {t('trainer:trainerExerciseLibrary.addToPlan')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="trainer-library-empty">
          <Search aria-hidden="true" />
          <strong>{t('trainer:trainerExerciseLibrary.noExercisesFound')}</strong>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              updateFilters(EMPTY_TRAINER_EXERCISE_FILTERS);
            }}
          >
            {t('trainer:trainerExerciseLibrary.clearSearchAndFilters')}
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="trainer-library-pagination" aria-label={tr('Exercise library pagination')}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            aria-label={t('trainer:trainerExerciseLibrary.previousPage')}
          >
            <ArrowLeft />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button
              type="button"
              className={cn(number === currentPage && 'is-active')}
              aria-current={number === currentPage ? 'page' : undefined}
              onClick={() => setPage(number)}
              key={number}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            aria-label={t('trainer:trainerExerciseLibrary.nextPage')}
          >
            <ArrowRight />
          </button>
        </nav>
      )}

      <Dialog
        open={filterSheetOpen}
        onOpenChange={(open) => {
          setFilterSheetOpen(open);
          if (!open) setDraftFilters(filters);
        }}
      >
        <DialogContent className="trainer-library-filter-sheet">
          <DialogHeader>
            <DialogTitle>{t('trainer:trainerExerciseLibrary.exerciseFilters')}</DialogTitle>
            <DialogDescription>
              {t('trainer:trainerExerciseLibrary.selectMultipleValuesThen')}
            </DialogDescription>
          </DialogHeader>
          <div className="trainer-library-filter-sheet__groups">
            {(Object.keys(options) as TrainerExerciseFilterKey[]).map((key) => (
              <fieldset key={key}>
                <legend>{labels[key]}</legend>
                <FilterOptions
                  filterKey={key}
                  values={options[key]}
                  filters={draftFilters}
                  onChange={setDraftFilters}
                />
              </fieldset>
            ))}
          </div>
          <footer>
            <button type="button" onClick={() => setDraftFilters(EMPTY_TRAINER_EXERCISE_FILTERS)}>
              {t('trainer:trainerExerciseLibrary.clearSelection')}
            </button>
            <button
              type="button"
              className="is-apply"
              onClick={() => {
                updateFilters(draftFilters);
                setFilterSheetOpen(false);
              }}
            >
              {t('trainer:trainerExerciseLibrary.viewResults')}
            </button>
          </footer>
        </DialogContent>
      </Dialog>

      <TrainerExercisePreviewDialog
        exercise={preview}
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
      />
    </div>
  );
}
