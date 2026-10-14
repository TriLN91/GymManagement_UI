import { CheckCircle2, CircleAlert, Clock3, FileCheck2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { gymOwnerCopy } from './copy';

import type { GymOwnerApplicationStatus } from '@/features/gym-owner-onboarding/model/types';
import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding/model/useGymOwnerOnboardingStore';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

const STATUS_ICONS = {
  draft: FileCheck2,
  submitted: FileCheck2,
  under_review: Clock3,
  approved: CheckCircle2,
  rejected: CircleAlert,
} satisfies Record<GymOwnerApplicationStatus, typeof FileCheck2>;

export function GymOwnerApprovalStatusPage() {
  const { language, locale } = useLocale();
  const { t } = useTranslation();
  const copy = gymOwnerCopy[language];
  const status = useGymOwnerOnboardingStore((state) => state.status);
  const rejectionReason = useGymOwnerOnboardingStore((state) => state.rejectionReason);
  const submittedAt = useGymOwnerOnboardingStore((state) => state.submittedAt);
  const submissionCount = useGymOwnerOnboardingStore((state) => state.submissionCount);
  const StatusIcon = STATUS_ICONS[status];

  const content = {
    draft: {
      title: copy.entry.title,
      body: t('owner:gymOwnerApprovalStatus.theApplicationIsStill'),
    },
    submitted: {
      title: copy.approval.submittedTitle,
      body: copy.approval.submittedBody,
    },
    under_review: {
      title: copy.approval.reviewTitle,
      body: copy.approval.reviewBody,
    },
    approved: {
      title: copy.approval.approvedTitle,
      body: copy.approval.approvedBody,
    },
    rejected: {
      title: copy.approval.rejectedTitle,
      body: copy.approval.rejectedBody,
    },
  }[status];

  const badgeVariant =
    status === 'approved' ? 'accent' : status === 'rejected' ? 'destructive' : 'neutral';

  return (
    <WorkspacePage className="owner-onboarding-page">
      <WorkspacePanel className={`owner-status-card is-${status}`}>
        <WorkspacePanelContent>
          <span className="owner-status-icon" aria-hidden="true">
            <StatusIcon size={30} />
          </span>
          <Badge variant={badgeVariant}>{copy.status[status]}</Badge>
          <h1>{content.title}</h1>
          <p>{content.body}</p>

          {status === 'rejected' ? (
            <div className="owner-rejection-reason" role="alert">
              <strong>{copy.approval.reason}</strong>
              <span>{rejectionReason || copy.approval.noReason}</span>
            </div>
          ) : null}

          {submittedAt || submissionCount > 0 ? (
            <dl className="owner-status-meta">
              {submittedAt ? (
                <div>
                  <dt>{copy.approval.submittedAt}</dt>
                  <dd>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(submittedAt))}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{copy.approval.submissionCount}</dt>
                <dd>{submissionCount}</dd>
              </div>
            </dl>
          ) : null}

          {status === 'approved' ? (
            <Button asChild>
              <Link to={ROUTES.admin.root}>{copy.approval.dashboard}</Link>
            </Button>
          ) : status === 'rejected' ? (
            <Button asChild>
              <Link to={ROUTES.admin.onboardingProfile}>
                <Pencil aria-hidden="true" size={16} />
                {copy.approval.edit}
              </Link>
            </Button>
          ) : status === 'draft' ? (
            <Button asChild>
              <Link to={ROUTES.admin.onboardingProfile}>{copy.entry.continue}</Link>
            </Button>
          ) : null}
        </WorkspacePanelContent>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
