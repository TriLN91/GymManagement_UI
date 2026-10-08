import { Check } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import type { GymOwnerCopy } from './copy';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding/model/useGymOwnerOnboardingStore';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

interface OnboardingProgressProps {
  copy: GymOwnerCopy;
}

export function OnboardingProgress({ copy }: OnboardingProgressProps) {
  const location = useLocation();
  const brand = useGymOwnerOnboardingStore((state) => state.brand);
  const branches = useGymOwnerOnboardingStore((state) => state.branches);
  const license = useGymOwnerOnboardingStore((state) => state.license);
  const status = useGymOwnerOnboardingStore((state) => state.status);
  const profileComplete = Boolean(
    brand.name &&
    brand.description &&
    brand.contactPhone &&
    branches.length > 0 &&
    branches.every(
      (branch) =>
        branch.name &&
        branch.city &&
        branch.address &&
        branch.contactPhone &&
        branch.operatingHours,
    ),
  );

  const steps = [
    {
      label: copy.steps.profile,
      to: ROUTES.admin.onboardingProfile,
      complete: profileComplete,
    },
    {
      label: copy.steps.license,
      to: ROUTES.admin.onboardingLicense,
      complete: Boolean(license),
    },
    {
      label: copy.steps.review,
      to: ROUTES.admin.onboardingReview,
      complete: status === 'submitted' || status === 'under_review' || status === 'approved',
    },
  ];

  return (
    <ol className="owner-progress" aria-label={copy.entry.required}>
      {steps.map((step, index) => {
        const active = location.pathname === step.to;
        return (
          <li key={step.to} className={cn(active && 'is-active', step.complete && 'is-complete')}>
            <NavLink to={step.to} aria-current={active ? 'step' : undefined}>
              <span aria-hidden="true">{step.complete ? <Check size={14} /> : index + 1}</span>
              <strong>{step.label}</strong>
              <small>
                {step.complete
                  ? copy.steps.complete
                  : active
                    ? copy.steps.current
                    : copy.steps.incomplete}
              </small>
            </NavLink>
          </li>
        );
      })}
    </ol>
  );
}
