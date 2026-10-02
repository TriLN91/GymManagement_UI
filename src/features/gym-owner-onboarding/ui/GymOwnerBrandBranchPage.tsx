import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { gymOwnerCopy } from './copy';
import { OnboardingProgress } from './OnboardingProgress';

import type {
  GymBranchProfile,
  GymBrandProfile,
} from '@/features/gym-owner-onboarding/model/types';
import {
  createEmptyBranch,
  isBranchProfileComplete,
  isBrandProfileComplete,
  useGymOwnerOnboardingStore,
} from '@/features/gym-owner-onboarding/model/useGymOwnerOnboardingStore';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  WorkspacePage,
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspaceToolbar,
} from '@/shared/ui/workspace';

const FACILITY_IDS = [
  'free-weights',
  'cardio',
  'functional',
  'locker-shower',
  'parking',
  'sauna',
  'recovery',
  'body-assessment',
] as const;

type FormErrors = Record<string, string>;

export function GymOwnerBrandBranchPage() {
  const { i18n } = useTranslation();
  const copy = gymOwnerCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const navigate = useNavigate();
  const storedBrand = useGymOwnerOnboardingStore((state) => state.brand);
  const storedBranches = useGymOwnerOnboardingStore((state) => state.branches);
  const saveBrandAndBranches = useGymOwnerOnboardingStore((state) => state.saveBrandAndBranches);
  const [brand, setBrand] = useState<GymBrandProfile>(() => ({ ...storedBrand }));
  const [branches, setBranches] = useState<GymBranchProfile[]>(() =>
    storedBranches.map((branch) => ({ ...branch, facilities: [...branch.facilities] })),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const updateBranch = (id: string, updates: Partial<GymBranchProfile>) => {
    setBranches((current) =>
      current.map((branch) => (branch.id === id ? { ...branch, ...updates } : branch)),
    );
  };

  const addBranch = () => {
    const id =
      typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `branch-${Date.now()}`;
    setBranches((current) => [...current, createEmptyBranch(id)]);
  };

  const removeBranch = (id: string) => {
    setBranches((current) => current.filter((branch) => branch.id !== id));
  };

  const toggleFacility = (branch: GymBranchProfile, facility: string) => {
    const selected = branch.facilities.includes(facility);
    updateBranch(branch.id, {
      facilities: selected
        ? branch.facilities.filter((value) => value !== facility)
        : [...branch.facilities, facility],
    });
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!isBrandProfileComplete(brand)) next.brand = copy.profile.requiredError;
    if (branches.length === 0) next.branches = copy.profile.branchesError;
    for (const branch of branches) {
      if (!isBranchProfileComplete(branch)) next[branch.id] = copy.profile.requiredError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    saveBrandAndBranches(
      {
        name: brand.name.trim(),
        description: brand.description.trim(),
        contactPhone: brand.contactPhone.trim(),
      },
      branches.map((branch) => ({
        ...branch,
        name: branch.name.trim(),
        city: branch.city.trim(),
        area: branch.area.trim(),
        address: branch.address.trim(),
        contactPhone: branch.contactPhone.trim(),
        operatingHours: branch.operatingHours.trim(),
      })),
    );
    void navigate(ROUTES.admin.onboardingLicense);
  };

  return (
    <WorkspacePage className="owner-onboarding-page">
      <OnboardingProgress copy={copy} />
      <WorkspaceToolbar>
        <span className="owner-step-label">{copy.profile.step}</span>
      </WorkspaceToolbar>

      {Object.values(errors).length > 0 ? (
        <div className="owner-form-alert" role="alert">
          {Object.values(errors)[0]}
        </div>
      ) : null}

      <WorkspacePanel>
        <div className="owner-panel-heading">
          <h1>{copy.profile.brandSection}</h1>
        </div>
        <WorkspacePanelContent className="owner-form-grid">
          <div className="owner-field">
            <Label htmlFor="brand-name">{copy.profile.brandName}</Label>
            <Input
              id="brand-name"
              value={brand.name}
              aria-invalid={Boolean(errors.brand && !brand.name.trim())}
              onChange={(event) => setBrand({ ...brand, name: event.target.value })}
            />
          </div>
          <div className="owner-field">
            <Label htmlFor="brand-phone">{copy.profile.contactPhone}</Label>
            <Input
              id="brand-phone"
              type="tel"
              value={brand.contactPhone}
              aria-invalid={Boolean(errors.brand && !brand.contactPhone.trim())}
              onChange={(event) => setBrand({ ...brand, contactPhone: event.target.value })}
            />
          </div>
          <div className="owner-field is-full">
            <Label htmlFor="brand-description">{copy.profile.brandDescription}</Label>
            <Textarea
              id="brand-description"
              value={brand.description}
              aria-invalid={Boolean(errors.brand && !brand.description.trim())}
              onChange={(event) => setBrand({ ...brand, description: event.target.value })}
            />
          </div>
        </WorkspacePanelContent>
      </WorkspacePanel>

      <div className="owner-branch-stack">
        {branches.map((branch, index) => (
          <WorkspacePanel key={branch.id}>
            <div className="owner-panel-heading">
              <h2>
                {copy.profile.branchLabel} {index + 1}
              </h2>
              {branches.length > 1 ? (
                <Button variant="ghost" size="sm" onClick={() => removeBranch(branch.id)}>
                  <Trash2 aria-hidden="true" size={15} />
                  {copy.profile.removeBranch}
                </Button>
              ) : null}
            </div>
            <WorkspacePanelContent className="owner-form-grid">
              <div className="owner-field">
                <Label htmlFor={`branch-name-${branch.id}`}>{copy.profile.branchName}</Label>
                <Input
                  id={`branch-name-${branch.id}`}
                  value={branch.name}
                  aria-invalid={Boolean(errors[branch.id] && !branch.name.trim())}
                  onChange={(event) => updateBranch(branch.id, { name: event.target.value })}
                />
              </div>
              <div className="owner-field">
                <Label htmlFor={`branch-city-${branch.id}`}>{copy.profile.city}</Label>
                <Input
                  id={`branch-city-${branch.id}`}
                  value={branch.city}
                  aria-invalid={Boolean(errors[branch.id] && !branch.city.trim())}
                  onChange={(event) => updateBranch(branch.id, { city: event.target.value })}
                />
              </div>
              <div className="owner-field">
                <Label htmlFor={`branch-area-${branch.id}`}>{copy.profile.area}</Label>
                <Input
                  id={`branch-area-${branch.id}`}
                  value={branch.area}
                  onChange={(event) => updateBranch(branch.id, { area: event.target.value })}
                />
              </div>
              <div className="owner-field">
                <Label htmlFor={`branch-phone-${branch.id}`}>{copy.profile.contactPhone}</Label>
                <Input
                  id={`branch-phone-${branch.id}`}
                  type="tel"
                  value={branch.contactPhone}
                  aria-invalid={Boolean(errors[branch.id] && !branch.contactPhone.trim())}
                  onChange={(event) =>
                    updateBranch(branch.id, { contactPhone: event.target.value })
                  }
                />
              </div>
              <div className="owner-field is-full">
                <Label htmlFor={`branch-address-${branch.id}`}>{copy.profile.address}</Label>
                <Input
                  id={`branch-address-${branch.id}`}
                  value={branch.address}
                  aria-invalid={Boolean(errors[branch.id] && !branch.address.trim())}
                  onChange={(event) => updateBranch(branch.id, { address: event.target.value })}
                />
              </div>
              <div className="owner-field is-full">
                <Label htmlFor={`branch-hours-${branch.id}`}>{copy.profile.operatingHours}</Label>
                <Input
                  id={`branch-hours-${branch.id}`}
                  value={branch.operatingHours}
                  aria-invalid={Boolean(errors[branch.id] && !branch.operatingHours.trim())}
                  onChange={(event) =>
                    updateBranch(branch.id, { operatingHours: event.target.value })
                  }
                />
              </div>
              <fieldset className="owner-facilities is-full">
                <legend>{copy.profile.facilities}</legend>
                <div>
                  {FACILITY_IDS.map((facility, facilityIndex) => (
                    <label key={facility}>
                      <Checkbox
                        checked={branch.facilities.includes(facility)}
                        onChange={() => toggleFacility(branch, facility)}
                      />
                      <span>{copy.facilities[facilityIndex]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </WorkspacePanelContent>
          </WorkspacePanel>
        ))}
      </div>

      <Button variant="outline" onClick={addBranch}>
        <Plus aria-hidden="true" size={16} />
        {copy.profile.addBranch}
      </Button>

      <div className="owner-form-actions">
        <Button variant="ghost" onClick={() => void navigate(ROUTES.admin.onboarding)}>
          <ArrowLeft aria-hidden="true" size={16} />
          {copy.profile.back}
        </Button>
        <Button onClick={handleContinue}>
          {copy.profile.save}
          <ArrowRight aria-hidden="true" size={16} />
        </Button>
      </div>
    </WorkspacePage>
  );
}
