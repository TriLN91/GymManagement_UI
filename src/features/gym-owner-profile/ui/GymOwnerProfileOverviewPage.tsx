import { Building2, FileCheck2, Images, MapPin, Pencil, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { gymProfileCopy } from './copy';
import { useGymProfileBootstrap } from './useGymProfileBootstrap';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { useGymOwnerProfileStore } from '@/features/gym-owner-profile/model/useGymOwnerProfileStore';
import { FACILITY_IDS, ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

export function GymOwnerProfileOverviewPage() {
  const { language, locale } = useLocale();
  useGymProfileBootstrap();
  const copy = gymProfileCopy[language];
  const brand = useGymOwnerProfileStore((state) => state.brand);
  const branches = useGymOwnerProfileStore((state) => state.branches);
  const updatedAt = useGymOwnerProfileStore((state) => state.updatedAt);
  const license = useGymOwnerOnboardingStore((state) => state.license);

  const facilityLabel = (id: string) => {
    const index = FACILITY_IDS.indexOf(id as (typeof FACILITY_IDS)[number]);
    return index >= 0 ? copy.facilities[index] : id;
  };

  return (
    <WorkspacePage className="gym-profile-page">
      <section className="gym-profile-summary">
        <div className="gym-profile-summary__mark" aria-hidden="true">
          <Building2 size={28} />
        </div>
        <div>
          <span>{copy.approvedRecord}</span>
          <h1>{brand.name || '—'}</h1>
          <p>{brand.description || '—'}</p>
        </div>
        <dl>
          <div>
            <dt>{copy.branchCount}</dt>
            <dd>{branches.length}</dd>
          </div>
          <div>
            <dt>{copy.updatedAt}</dt>
            <dd>
              {updatedAt
                ? new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                  }).format(new Date(updatedAt))
                : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <div className="gym-profile-grid">
        <WorkspacePanel>
          <div className="gym-profile-section-head">
            <div>
              <Building2 aria-hidden="true" size={18} />
              <h2>{copy.brand}</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.admin.profileBrand}>
                <Pencil aria-hidden="true" size={14} />
                {copy.edit}
              </Link>
            </Button>
          </div>
          <WorkspacePanelContent>
            <dl className="gym-profile-detail-list">
              <div>
                <dt>{copy.brandName}</dt>
                <dd>{brand.name || '—'}</dd>
              </div>
              <div>
                <dt>{copy.contactPhone}</dt>
                <dd>{brand.contactPhone || '—'}</dd>
              </div>
              <div>
                <dt>{copy.description}</dt>
                <dd>{brand.description || '—'}</dd>
              </div>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>

        <WorkspacePanel>
          <div className="gym-profile-section-head">
            <div>
              <MapPin aria-hidden="true" size={18} />
              <h2>{copy.branches}</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.admin.profileBranches}>{copy.manage}</Link>
            </Button>
          </div>
          <WorkspacePanelContent className="gym-profile-branch-preview">
            {branches.map((branch, index) => (
              <article key={branch.id}>
                <div>
                  <strong>{branch.name}</strong>
                  {index === 0 ? <Badge variant="accent">{copy.primaryBranch}</Badge> : null}
                </div>
                <span>
                  <MapPin aria-hidden="true" size={14} />
                  {[branch.address, branch.area, branch.city].filter(Boolean).join(', ')}
                </span>
                <span>
                  <Phone aria-hidden="true" size={14} />
                  {branch.contactPhone}
                </span>
                <div className="gym-profile-chips">
                  {branch.facilities.slice(0, 3).map((facility) => (
                    <span key={facility}>{facilityLabel(facility)}</span>
                  ))}
                  {branch.facilities.length > 3 ? (
                    <span>+{branch.facilities.length - 3}</span>
                  ) : null}
                </div>
              </article>
            ))}
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      <div className="gym-profile-grid">
        <WorkspacePanel>
          <div className="gym-profile-section-head">
            <div>
              <Images aria-hidden="true" size={18} />
              <h2>{copy.media}</h2>
            </div>
          </div>
          <WorkspacePanelContent>
            <EmptyState icon={Images} title={copy.noMedia} />
          </WorkspacePanelContent>
        </WorkspacePanel>

        <WorkspacePanel>
          <div className="gym-profile-section-head">
            <div>
              <ShieldCheck aria-hidden="true" size={18} />
              <h2>{copy.legal}</h2>
            </div>
            <Badge variant="accent">{copy.approvedRecord}</Badge>
          </div>
          <WorkspacePanelContent>
            <div className="gym-profile-legal-summary">
              <FileCheck2 aria-hidden="true" size={22} />
              <div>
                <strong>{copy.license}</strong>
                <span>{license?.name || '—'}</span>
              </div>
            </div>
            <p className="gym-profile-notice">{copy.legalNotice}</p>
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
