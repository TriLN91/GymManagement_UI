import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useCheckIn } from '../model/useCoaching';

import type { CheckInPayload } from '@/entities/plan';
import { ApiError } from '@/shared/api/errorTypes';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toast } from '@/shared/ui/toast';


type CheckInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const schema = z.object({
  weightKg: z.coerce.number().positive().max(500, 'coaching:checkin.validation.weight'),
  workoutCompletionRate: z.coerce
    .number()
    .min(0, 'coaching:checkin.validation.completion')
    .max(100, 'coaching:checkin.validation.completion'),
  energyLevel: z.coerce
    .number()
    .min(1, 'coaching:checkin.validation.energy')
    .max(5, 'coaching:checkin.validation.energy'),
  fatigueLevel: z.coerce
    .number()
    .min(1, 'coaching:checkin.validation.fatigue')
    .max(5, 'coaching:checkin.validation.fatigue'),
  notes: z.string().max(500, 'coaching:checkin.validation.notes').optional(),
});
type FormValues = z.infer<typeof schema>;

// RHF gives us `number` from number inputs; Zod wants the literal union at the API boundary.
// Cast at submit — do not relax the schema (this is the documented anti-pattern).
type Energy = 1 | 2 | 3 | 4 | 5;
type Fatigue = 1 | 2 | 3 | 4 | 5;

export function CheckInDialog({ open, onOpenChange }: CheckInDialogProps) {
  const { t } = useTranslation('coaching');
  const checkIn = useCheckIn();
  const reactId = useId();
  const fieldIds = {
    weightKg: `${reactId}-weightKg`,
    workoutCompletionRate: `${reactId}-workoutCompletionRate`,
    energyLevel: `${reactId}-energyLevel`,
    fatigueLevel: `${reactId}-fatigueLevel`,
    notes: `${reactId}-notes`,
  };
  const titleId = `${reactId}-title`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      weightKg: 70,
      workoutCompletionRate: 80,
      energyLevel: 3,
      fatigueLevel: 3,
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    // Cast RHF's `number` to the literal-union shape Zod expects.
    const payload: CheckInPayload = {
      weightKg: values.weightKg,
      workoutCompletionRate: values.workoutCompletionRate,
      energyLevel: values.energyLevel as Energy,
      fatigueLevel: values.fatigueLevel as Fatigue,
      notes: values.notes ?? undefined,
    };
    try {
      await checkIn.mutateAsync(payload);
      toast.success(t('checkin.success'));
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('checkin.error.generic');
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle id={titleId}>{t('checkin.title')}</DialogTitle>
          <DialogDescription>{t('checkin.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field htmlFor={fieldIds.weightKg} label={t('checkin.weight')} error={errors.weightKg?.message}>
            <Input
              id={fieldIds.weightKg}
              type="number"
              step="0.1"
              min={1}
              max={500}
              {...register('weightKg')}
            />
          </Field>

          <Field htmlFor={fieldIds.workoutCompletionRate} label={t('checkin.completion')} error={errors.workoutCompletionRate?.message}>
            <Input
              id={fieldIds.workoutCompletionRate}
              type="number"
              min={0}
              max={100}
              {...register('workoutCompletionRate')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field htmlFor={fieldIds.energyLevel} label={t('checkin.energy')} error={errors.energyLevel?.message}>
              <Input
                id={fieldIds.energyLevel}
                type="number"
                min={1}
                max={5}
                {...register('energyLevel')}
              />
            </Field>
            <Field htmlFor={fieldIds.fatigueLevel} label={t('checkin.fatigue')} error={errors.fatigueLevel?.message}>
              <Input
                id={fieldIds.fatigueLevel}
                type="number"
                min={1}
                max={5}
                {...register('fatigueLevel')}
              />
            </Field>
          </div>

          <Field htmlFor={fieldIds.notes} label={t('checkin.notes')} error={errors.notes?.message}>
            <Input id={fieldIds.notes} type="text" maxLength={500} {...register('notes')} />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={checkIn.isPending}
            >
              {t('checkin.cancel')}
            </Button>
            <Button type="submit" disabled={checkIn.isPending}>
              {t('checkin.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}