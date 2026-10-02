import { ArrowRight, Building2, FileCheck2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { gymOwnerCopy } from './copy';
import { OnboardingProgress } from './OnboardingProgress';

import {
  isBrandAndBranchesComplete,
  useGymOwnerOnboardingStore,
} from '@/features/gym-owner-onboarding/model/useGymOwnerOnboardingStore';
import { ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

export function GymOwnerOnboardingEntryPage() {
  const { i18n } = useTranslation();
  const copy = gymOwnerCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const navigate = useNavigate();
  const data = useGymOwnerOnboardingStore();
  const profileComplete = isBrandAndBranchesComplete(data);
  const licenseComplete = Boolean(data.license);
  const isDraft = data.status === 'draft' || data.status === 'rejected';
  const continuePath = !profileComplete
    ? ROUTES.admin.onboardingProfile
    : !licenseComplete
      ? ROUTES.admin.onboardingLicense
      : ROUTES.admin.onboardingReview;

  const requirements = [
    {
      icon: Building2,
      label: copy.steps.profile,
      complete: profileComplete,
      to: ROUTES.admin.onboardingProfile,
    },
    {
      icon: FileCheck2,
      label: copy.steps.license,
      complete: licenseComplete,
      to: ROUTES.admin.onboardingLicense,
    },
    {
      icon: ShieldCheck,
      label: copy.steps.review,
      complete: !isDraft,
      to: ROUTES.admin.onboardingReview,
    },
  ];

  return (
    <WorkspacePage className="owner-onboarding-page">
      <div className="owner-entry-bar">
        <div>
          <span>{copy.entry.statusLabel}</span>
          <Badge variant={data.status === 'approved' ? 'accent' : 'neutral'}>
            {copy.status[data.status]}
          </Badge>
        </div>
        <Button
          onClick={() => void navigate(isDraft ? continuePath : ROUTES.admin.onboardingStatus)}
        >
          {isDraft ? copy.entry.continue : copy.entry.viewStatus}
          <ArrowRight aria-hidden="true" size={16} />
        </Button>
      </div>

      <OnboardingProgress copy={copy} />

      <WorkspacePanel>
        <div className="owner-panel-heading">
          <h1>{copy.entry.title}</h1>
          <span>{copy.entry.required}</span>
        </div>
        <WorkspacePanelContent className="owner-requirement-list">
          {requirements.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.to} onClick={() => void navigate(item.to)}>
                <span className="owner-requirement-icon">
                  <Icon aria-hidden="true" size={20} />
                </span>
                <strong>{item.label}</strong>
                <Badge variant={item.complete ? 'accent' : 'neutral'}>
                  {item.complete ? copy.steps.complete : copy.steps.incomplete}
                </Badge>
                <ArrowRight aria-hidden="true" size={17} />
              </button>
            );
          })}
        </WorkspacePanelContent>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
