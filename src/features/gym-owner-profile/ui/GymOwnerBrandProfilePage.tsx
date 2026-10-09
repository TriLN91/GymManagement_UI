import { ArrowLeft, Building2, Pencil, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { gymProfileCopy } from './copy';
import { useGymProfileBootstrap } from './useGymProfileBootstrap';

import { isBrandProfileComplete } from '@/features/gym-owner-onboarding';
import type { GymProfileBrand } from '@/features/gym-owner-profile/model/types';
import { useGymOwnerProfileStore } from '@/features/gym-owner-profile/model/useGymOwnerProfileStore';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

export function GymOwnerBrandProfilePage() {
  const { language } = useLocale();
  useGymProfileBootstrap();
  const copy = gymProfileCopy[language];
  const brand = useGymOwnerProfileStore((state) => state.brand);
  const saveBrand = useGymOwnerProfileStore((state) => state.saveBrand);
  const [draft, setDraft] = useState<GymProfileBrand>(() => ({ ...brand }));
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) setDraft({ ...brand });
  }, [brand, isEditing]);

  const cancel = () => {
    setDraft({ ...brand });
    setError('');
    setIsEditing(false);
  };

  const save = () => {
    const normalized = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      contactPhone: draft.contactPhone.trim(),
    };
    if (!isBrandProfileComplete(normalized)) {
      setError(copy.required);
      return;
    }
    saveBrand(normalized);
    setError('');
    setIsEditing(false);
    toast.success(copy.saved);
  };

  return (
    <WorkspacePage className="gym-profile-page">
      <div className="gym-profile-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.profile}>
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.overview}
          </Link>
        </Button>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Pencil aria-hidden="true" size={16} />
            {copy.edit}
          </Button>
        ) : null}
      </div>

      <WorkspacePanel>
        <div className="gym-profile-section-head">
          <div>
            <Building2 aria-hidden="true" size={18} />
            <h1>{copy.brand}</h1>
          </div>
        </div>
        <WorkspacePanelContent>
          {error ? (
            <div className="owner-form-alert" role="alert">
              {error}
            </div>
          ) : null}

          {isEditing ? (
            <div className="gym-profile-form">
              <div className="gym-profile-field">
                <Label htmlFor="profile-brand-name">{copy.brandName}</Label>
                <Input
                  id="profile-brand-name"
                  value={draft.name}
                  aria-invalid={Boolean(error && !draft.name.trim())}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </div>
              <div className="gym-profile-field">
                <Label htmlFor="profile-brand-phone">{copy.contactPhone}</Label>
                <Input
                  id="profile-brand-phone"
                  type="tel"
                  value={draft.contactPhone}
                  aria-invalid={Boolean(error && !draft.contactPhone.trim())}
                  onChange={(event) => setDraft({ ...draft, contactPhone: event.target.value })}
                />
              </div>
              <div className="gym-profile-field is-wide">
                <Label htmlFor="profile-brand-description">{copy.description}</Label>
                <Textarea
                  id="profile-brand-description"
                  value={draft.description}
                  aria-invalid={Boolean(error && !draft.description.trim())}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </div>
            </div>
          ) : (
            <dl className="gym-profile-detail-list is-roomy">
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
          )}
        </WorkspacePanelContent>
      </WorkspacePanel>

      {isEditing ? (
        <div className="gym-profile-actions">
          <Button variant="ghost" onClick={cancel}>
            <X aria-hidden="true" size={16} />
            {copy.cancel}
          </Button>
          <Button onClick={save}>
            <Save aria-hidden="true" size={16} />
            {copy.save}
          </Button>
        </div>
      ) : null}
    </WorkspacePage>
  );
}
