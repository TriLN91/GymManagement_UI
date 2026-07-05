import { Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CoachingPlan } from '@/entities/plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

export type PlanCardProps = {
  plan: CoachingPlan | undefined;
  isLoading: boolean;
  /**
   * Optional id applied to the heading element. Lets the composing page
   * wire up `aria-labelledby` on a wrapping landmark without duplicating
   * the heading text. The page remains the only place that knows about
   * the region — the feature slice just accepts the id.
   */
  headingId?: string;
};

export function PlanCard({ plan, isLoading, headingId }: PlanCardProps) {
  const { t } = useTranslation('coaching');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <EmptyState
        icon={Dumbbell}
        title={t('plan.empty.title')}
        description={t('plan.empty.description')}
      />
    );
  }

  const goalLabel = t(`goals.${plan.goal}`);
  const experienceLabel = t(`experience.${plan.experienceLevel}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" id={headingId} className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" aria-hidden />
          {t('plan.title', { version: plan.version })}
        </CardTitle>
        <CardDescription>
          {t('plan.goal', { value: goalLabel })} · {t('plan.experience', { value: experienceLabel })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="mb-2 text-sm font-semibold">{t('plan.workout.title')}</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {t('plan.workout.minutes', { count: plan.workoutPlan.weeklyMinutes })}
          </p>
          <div className="space-y-2">
            {plan.workoutPlan.weeklySchedule.map((day, idx) => (
              <div
                key={`${day.dayOfWeek}-${idx}`}
                className="rounded-md border border-border p-3 text-sm"
              >
                <div className="flex items-center justify-between font-medium">
                  <span>
                    {t('plan.workout.day', { n: idx + 1 })} · {day.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('plan.workout.duration', { count: day.estimatedMinutes })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('plan.workout.exercises', { count: day.exercises.length })}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">{t('plan.nutrition.title')}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <NutritionStat label={t('plan.nutrition.calories')} value={t('plan.nutrition.kcal', { value: plan.nutritionPlan.dailyCalories })} />
            <NutritionStat label={t('plan.nutrition.protein')} value={t('plan.nutrition.grams', { value: plan.nutritionPlan.proteinGrams })} />
            <NutritionStat label={t('plan.nutrition.carbs')} value={t('plan.nutrition.grams', { value: plan.nutritionPlan.carbsGrams })} />
            <NutritionStat label={t('plan.nutrition.fat')} value={t('plan.nutrition.grams', { value: plan.nutritionPlan.fatGrams })} />
            <NutritionStat label={t('plan.nutrition.water')} value={t('plan.nutrition.liters', { value: plan.nutritionPlan.waterLiters })} />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function NutritionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}