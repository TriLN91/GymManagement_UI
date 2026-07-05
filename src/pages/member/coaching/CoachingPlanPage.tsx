import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentPlan } from '@/features/coaching/model/useCoaching';
import { CheckInDialog } from '@/features/coaching/ui/CheckInDialog';
import { PlanCard } from '@/features/coaching/ui/PlanCard';
import { Button } from '@/shared/ui/button';

const PLAN_REGION_LABEL_ID = 'coaching-plan-heading';

export function MemberCoachingPage() {
  const { t } = useTranslation('coaching');
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useCurrentPlan();

  return (
    <section
      aria-labelledby={PLAN_REGION_LABEL_ID}
      data-testid="coaching-plan-region"
      className="space-y-4"
    >
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>{t('checkin.openButton')}</Button>
      </div>
      <PlanCard plan={data} isLoading={isLoading} headingId={PLAN_REGION_LABEL_ID} />
      <CheckInDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}