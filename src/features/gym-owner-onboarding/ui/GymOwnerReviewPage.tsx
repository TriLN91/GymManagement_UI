import { ArrowLeft, Building2, FileCheck2, MapPin, Pencil, Send } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { gymOwnerCopy } from './copy';
import { OnboardingProgress } from './OnboardingProgress';

import {
  isBrandAndBranchesComplete,
  useGymOwnerOnboardingStore,
} from '@/features/gym-owner-onboarding/model/useGymOwnerOnboardingStore';
import { FACILITY_IDS, ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  WorkspacePage,
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspaceToolbar,
} from '@/shared/ui/workspace';

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function GymOwnerReviewPage() {
  const { language } = useLocale();
  const copy = gymOwnerCopy[language];
  const navigate = useNavigate();
  const data = useGymOwnerOnboardingStore();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isComplete = isBrandAndBranchesComplete(data) && Boolean(data.license);
  const isResubmission = data.status === 'rejected';

  const facilityLabel = (id: string) => {
    const index = FACILITY_IDS.indexOf(id as (typeof FACILITY_IDS)[number]);
    return index >= 0 ? copy.facilities[index] : id;
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      if (isResubmission) data.resubmitApplication();
      else data.submitApplication();
      toast.success(copy.review.success);
      setIsConfirming(false);
      void navigate(ROUTES.admin.onboardingStatus);
    }, 450);
  };

  return (
    <WorkspacePage className="owner-onboarding-page">
      <OnboardingProgress copy={copy} />
      <WorkspaceToolbar>
        <span className="owner-step-label">{copy.review.step}</span>
      </WorkspaceToolbar>

      {!isComplete ? (
        <div className="owner-form-alert" role="alert">
          {copy.review.incomplete}
        </div>
      ) : null}

      <div className="owner-review-grid">
        <WorkspacePanel>
          <div className="owner-panel-heading owner-review-heading">
            <div>
              <Building2 aria-hidden="true" size={19} />
              <h1>{copy.review.brand}</h1>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.admin.onboardingProfile}>
                <Pencil aria-hidden="true" size={14} />
                {copy.review.edit}
              </Link>
            </Button>
          </div>
          <WorkspacePanelContent>
            <dl className="owner-review-list">
              <div>
                <dt>{copy.profile.brandName}</dt>
                <dd>{data.brand.name || '—'}</dd>
              </div>
              <div>
                <dt>{copy.profile.contactPhone}</dt>
                <dd>{data.brand.contactPhone || '—'}</dd>
              </div>
              <div>
                <dt>{copy.profile.brandDescription}</dt>
                <dd>{data.brand.description || '—'}</dd>
              </div>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>

        <WorkspacePanel>
          <div className="owner-panel-heading owner-review-heading">
            <div>
              <FileCheck2 aria-hidden="true" size={19} />
              <h2>{copy.review.license}</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.admin.onboardingLicense}>
                <Pencil aria-hidden="true" size={14} />
                {copy.review.edit}
              </Link>
            </Button>
          </div>
          <WorkspacePanelContent>
            <dl className="owner-review-list">
              <div>
                <dt>{copy.license.uploaded}</dt>
                <dd>{data.license?.name || '—'}</dd>
              </div>
              <div>
                <dt>{copy.license.accepted}</dt>
                <dd>{data.license ? formatFileSize(data.license.size) : '—'}</dd>
              </div>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      <WorkspacePanel>
        <div className="owner-panel-heading owner-review-heading">
          <div>
            <MapPin aria-hidden="true" size={19} />
            <h2>{copy.review.branches}</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.admin.onboardingProfile}>
              <Pencil aria-hidden="true" size={14} />
              {copy.review.edit}
            </Link>
          </Button>
        </div>
        <WorkspacePanelContent className="owner-review-branches">
          {data.branches.map((branch, index) => (
            <article key={branch.id}>
              <strong>
                {copy.profile.branchLabel} {index + 1} · {branch.name || '—'}
              </strong>
              <dl className="owner-review-list">
                <div>
                  <dt>{copy.profile.address}</dt>
                  <dd>
                    {[branch.address, branch.area, branch.city].filter(Boolean).join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt>{copy.profile.contactPhone}</dt>
                  <dd>{branch.contactPhone || '—'}</dd>
                </div>
                <div>
                  <dt>{copy.profile.operatingHours}</dt>
                  <dd>{branch.operatingHours || '—'}</dd>
                </div>
                <div>
                  <dt>{copy.profile.facilities}</dt>
                  <dd>
                    {branch.facilities.length
                      ? branch.facilities.map(facilityLabel).join(', ')
                      : '—'}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </WorkspacePanelContent>
      </WorkspacePanel>

      <div className="owner-form-actions">
        <Button variant="ghost" onClick={() => void navigate(ROUTES.admin.onboardingLicense)}>
          <ArrowLeft aria-hidden="true" size={16} />
          {copy.review.back}
        </Button>
        <Button disabled={!isComplete} onClick={() => setIsConfirming(true)}>
          <Send aria-hidden="true" size={16} />
          {isResubmission ? copy.review.resubmit : copy.review.submit}
        </Button>
      </div>

      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.review.confirmationTitle}</DialogTitle>
            <DialogDescription>{copy.review.confirmationBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" disabled={isSubmitting} onClick={() => setIsConfirming(false)}>
              {copy.review.cancel}
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting
                ? copy.review.submitting
                : isResubmission
                  ? copy.review.confirmResubmit
                  : copy.review.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
