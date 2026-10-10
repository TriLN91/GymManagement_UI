import { Activity, ArrowRight, Dumbbell, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type { ExerciseDto, ReferenceSetSummaryDto } from '../api/types';
import type { ReferencePresentationState } from '../model/presentation';
import { getViewReferenceStates, rollUpExerciseState } from '../model/presentation';
import {
  useCreateExercise,
  useCreateReferenceSet,
  useExercises,
  useReferenceSet,
  useReferenceSets,
} from '../model/useMovementReferences';

import { ApiErrorNotice } from './ApiErrorNotice';

import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
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

const stateTone: Record<ReferencePresentationState, string> = {
  NEEDS_FOOTAGE: 'bg-muted text-muted-foreground',
  ANALYZING: 'bg-blue-100 text-blue-800',
  NEEDS_REVIEW: 'bg-amber-100 text-amber-900',
  READY_TO_APPROVE: 'bg-amber-100 text-amber-900',
  APPROVED: 'bg-blue-100 text-blue-800',
  LIVE: 'bg-energy/50 text-forest',
  UPDATE_READY: 'bg-violet-100 text-violet-800',
  PROBLEM: 'bg-destructive/10 text-destructive',
};

export function PresentationStateBadge({ state }: { state: ReferencePresentationState }) {
  const { t } = useTranslation('movementAdmin');
  return (
    <span
      className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', stateTone[state])}
    >
      {t(`presentationState.${state}`)}
    </span>
  );
}

function ExerciseRow({
  exercise,
  summary,
  opening,
  onOpen,
}: {
  exercise: ExerciseDto;
  summary?: ReferenceSetSummaryDto;
  opening: boolean;
  onOpen: (exerciseId: string) => void;
}) {
  const { t } = useTranslation('movementAdmin');
  const detail = useReferenceSet(summary?.id ?? '');
  const state: ReferencePresentationState = detail.data
    ? rollUpExerciseState(detail.data)
    : 'NEEDS_FOOTAGE';
  const views = detail.data ? getViewReferenceStates(detail.data) : [];
  const liveViews = views.filter((view) => view.liveProfile).map((view) => view.view);
  const candidateViews = views.filter((view) => view.currentCandidate).map((view) => view.view);
  const action = !summary
    ? 'startPreparation'
    : state === 'LIVE'
      ? 'viewLive'
      : state === 'UPDATE_READY'
        ? 'reviewUpdate'
        : 'continuePreparation';

  return (
    <TableRow>
      <TableCell>
        <div className="font-semibold">{exercise.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {[exercise.muscleGroup, exercise.equipment].filter(Boolean).join(' · ') || '—'}
        </div>
      </TableCell>
      <TableCell>SQUAT</TableCell>
      <TableCell>
        {detail.isLoading && summary ? (
          <Skeleton className="h-6 w-28" />
        ) : (
          <PresentationStateBadge state={state} />
        )}
      </TableCell>
      <TableCell>{liveViews.length > 0 ? liveViews.join(', ') : '—'}</TableCell>
      <TableCell>{candidateViews.length > 0 ? candidateViews.join(', ') : '—'}</TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={state === 'LIVE' ? 'outline' : 'default'}
          disabled={opening}
          onClick={() => onOpen(exercise.id)}
        >
          {opening ? t('actions.opening') : t(`actions.${action}`)}
          {!opening ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ExerciseReferenceLibrary() {
  const { t } = useTranslation('movementAdmin');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [openingExerciseId, setOpeningExerciseId] = useState('');
  const exercises = useExercises();
  const referenceSets = useReferenceSets();
  const createSet = useCreateReferenceSet();
  const createExercise = useCreateExercise();
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '', equipment: '' });

  const summaries = useMemo(
    () => new Map((referenceSets.data ?? []).map((item) => [item.exerciseId, item])),
    [referenceSets.data],
  );
  const visibleExercises = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (exercises.data ?? []).filter((exercise) =>
      [exercise.name, exercise.muscleGroup, exercise.equipment]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [exercises.data, query]);

  const openPreparation = async (exerciseId: string) => {
    setOpeningExerciseId(exerciseId);
    try {
      const context = await createSet.mutateAsync({ exerciseId, pattern: 'SQUAT' });
      void navigate(ROUTES.superadmin.movementReferenceSetPath(context.id));
    } finally {
      setOpeningExerciseId('');
    }
  };

  const submitExercise = async () => {
    if (!newExercise.name.trim()) return;
    try {
      const created = await createExercise.mutateAsync({
        name: newExercise.name.trim(),
        muscleGroup: newExercise.muscleGroup.trim() || undefined,
        equipment: newExercise.equipment.trim() || undefined,
      });
      toast.success(t('messages.exerciseCreated'));
      setExerciseOpen(false);
      setNewExercise({ name: '', muscleGroup: '', equipment: '' });
      await openPreparation(created.id);
    } catch {
      // Mutation errors stay visible in the dialog or list notice.
    }
  };

  const loading = exercises.isLoading || referenceSets.isLoading;
  return (
    <div className="space-y-6">
      <nav aria-label={t('breadcrumbs.label')} className="text-sm text-muted-foreground">
        {t('breadcrumbs.standards')} <span aria-hidden="true">/</span>{' '}
        <strong className="text-foreground">{t('breadcrumbs.references')}</strong>
      </nav>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {t('eyebrow')}
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{t('list.title')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('list.description')}</p>
        </div>
        <Button onClick={() => setExerciseOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('actions.addExercise')}
        </Button>
      </header>

      <Card>
        <CardContent className="p-4">
          <Label htmlFor="exercise-search">{t('list.searchLabel')}</Label>
          <Input
            id="exercise-search"
            className="mt-2 max-w-md"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('list.searchPlaceholder')}
          />
        </CardContent>
      </Card>
      <ApiErrorNotice error={referenceSets.error ?? exercises.error ?? createSet.error} />

      {loading ? (
        <div className="space-y-2" aria-label={t('loading')}>
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : visibleExercises.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={<Button onClick={() => setExerciseOpen(true)}>{t('actions.addExercise')}</Button>}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.exercise')}</TableHead>
                <TableHead>{t('fields.pattern')}</TableHead>
                <TableHead>{t('fields.readiness')}</TableHead>
                <TableHead>{t('fields.liveViews')}</TableHead>
                <TableHead>{t('fields.candidateViews')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('fields.nextAction')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleExercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  summary={summaries.get(exercise.id)}
                  opening={openingExerciseId === exercise.id}
                  onOpen={(id) => void openPreparation(id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={exerciseOpen} onOpenChange={setExerciseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createExercise.title')}</DialogTitle>
            <DialogDescription>{t('createExercise.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exercise-name">{t('fields.name')}</Label>
              <Input
                id="exercise-name"
                className="mt-2"
                value={newExercise.name}
                onChange={(event) => setNewExercise({ ...newExercise, name: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="exercise-muscle">{t('fields.muscleGroup')}</Label>
              <Input
                id="exercise-muscle"
                className="mt-2"
                value={newExercise.muscleGroup}
                onChange={(event) =>
                  setNewExercise({ ...newExercise, muscleGroup: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="exercise-equipment">{t('fields.equipment')}</Label>
              <Input
                id="exercise-equipment"
                className="mt-2"
                value={newExercise.equipment}
                onChange={(event) =>
                  setNewExercise({ ...newExercise, equipment: event.target.value })
                }
              />
            </div>
            <ApiErrorNotice error={createExercise.error ?? createSet.error} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExerciseOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              disabled={!newExercise.name.trim() || createExercise.isPending || createSet.isPending}
              onClick={() => void submitExercise()}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              {createExercise.isPending || createSet.isPending
                ? t('actions.creating')
                : t('actions.saveAndStart')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
