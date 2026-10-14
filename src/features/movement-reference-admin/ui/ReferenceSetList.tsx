import { Activity, Dumbbell, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useCreateExercise,
  useCreateReferenceSet,
  useExercises,
  useReferenceSets,
} from '../model/useMovementReferences';

import { ApiErrorNotice } from './ApiErrorNotice';
import { MovementStatusBadge } from './MovementStatusBadge';

import { ROUTES } from '@/shared/config/constants';
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

export function ReferenceSetList() {
  const { t } = useTranslation('movementAdmin');
  const navigate = useNavigate();
  const [exerciseId, setExerciseId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const exercises = useExercises();
  const referenceSets = useReferenceSets(exerciseId || undefined);
  const createSet = useCreateReferenceSet();
  const createExercise = useCreateExercise();
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '', equipment: '' });

  const submitSet = async () => {
    if (!exerciseId) return;
    const created = await createSet.mutateAsync({ exerciseId, pattern: 'SQUAT' });
    toast.success(t('messages.setCreated'));
    setCreateOpen(false);
    void navigate(ROUTES.superadmin.movementReferenceSetPath(created.id));
  };

  const submitExercise = async () => {
    if (!newExercise.name.trim()) return;
    const created = await createExercise.mutateAsync({
      name: newExercise.name.trim(),
      muscleGroup: newExercise.muscleGroup.trim() || undefined,
      equipment: newExercise.equipment.trim() || undefined,
    });
    setExerciseId(created.id);
    setExerciseOpen(false);
    setNewExercise({ name: '', muscleGroup: '', equipment: '' });
    toast.success(t('messages.exerciseCreated'));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {t('eyebrow')}
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{t('list.title')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('list.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setExerciseOpen(true)}>
            <Dumbbell className="mr-2 h-4 w-4" /> {t('actions.createExercise')}
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('actions.createSet')}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle as="h3" className="text-lg">
            {t('list.filterTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="exercise-filter">{t('fields.exercise')}</Label>
          <select
            id="exercise-filter"
            className="mt-2 h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm"
            value={exerciseId}
            onChange={(event) => setExerciseId(event.target.value)}
          >
            <option value="">{t('list.allExercises')}</option>
            {(exercises.data ?? []).map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <ApiErrorNotice error={referenceSets.error ?? exercises.error} />

      {referenceSets.isLoading ? (
        <div className="space-y-2" aria-label={t('loading')}>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (referenceSets.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Activity}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={<Button onClick={() => setCreateOpen(true)}>{t('actions.createSet')}</Button>}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.exercise')}</TableHead>
                <TableHead>{t('fields.pattern')}</TableHead>
                <TableHead>{t('fields.sources')}</TableHead>
                <TableHead>{t('fields.profiles')}</TableHead>
                <TableHead>{t('fields.status')}</TableHead>
                <TableHead>{t('fields.active')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('fields.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referenceSets.data?.map((set) => (
                <TableRow key={set.id}>
                  <TableCell className="font-medium">{set.exerciseName}</TableCell>
                  <TableCell>{set.pattern}</TableCell>
                  <TableCell>{set.sourceCount}</TableCell>
                  <TableCell>{set.profileCount}</TableCell>
                  <TableCell>
                    <MovementStatusBadge value={set.status} />
                  </TableCell>
                  <TableCell>
                    {set.activeProfileCount > 0
                      ? t('list.activeCount', { count: set.activeProfileCount })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.superadmin.movementReferenceSetPath(set.id))}
                    >
                      {t('actions.open')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createSet.title')}</DialogTitle>
            <DialogDescription>{t('createSet.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-set-exercise">{t('fields.exercise')}</Label>
              <select
                id="create-set-exercise"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={exerciseId}
                onChange={(event) => setExerciseId(event.target.value)}
              >
                <option value="">{t('createSet.selectExercise')}</option>
                {(exercises.data ?? []).map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t('fields.pattern')}</Label>
              <Input className="mt-2" value="SQUAT" disabled />
            </div>
            <ApiErrorNotice error={createSet.error} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button disabled={!exerciseId || createSet.isPending} onClick={() => void submitSet()}>
              {createSet.isPending ? t('actions.creating') : t('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <ApiErrorNotice error={createExercise.error} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExerciseOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              disabled={!newExercise.name.trim() || createExercise.isPending}
              onClick={() => void submitExercise()}
            >
              {createExercise.isPending ? t('actions.creating') : t('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
