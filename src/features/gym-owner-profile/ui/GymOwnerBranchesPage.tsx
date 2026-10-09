import { ArrowLeft, MapPin, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { gymProfileCopy } from './copy';
import { useGymProfileBootstrap } from './useGymProfileBootstrap';

import { createEmptyBranch, isBranchProfileComplete } from '@/features/gym-owner-onboarding';
import type { GymProfileBranch } from '@/features/gym-owner-profile/model/types';
import { useGymOwnerProfileStore } from '@/features/gym-owner-profile/model/useGymOwnerProfileStore';
import { FACILITY_IDS, ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
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
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

function createBranchId() {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `branch-${Date.now()}`;
}

export function GymOwnerBranchesPage() {
  const { language } = useLocale();
  useGymProfileBootstrap();
  const copy = gymProfileCopy[language];
  const branches = useGymOwnerProfileStore((state) => state.branches);
  const addBranch = useGymOwnerProfileStore((state) => state.addBranch);
  const updateBranch = useGymOwnerProfileStore((state) => state.updateBranch);
  const removeBranch = useGymOwnerProfileStore((state) => state.removeBranch);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GymProfileBranch | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<GymProfileBranch | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedId && branches[0]) setSelectedId(branches[0].id);
    if (selectedId && !branches.some((branch) => branch.id === selectedId)) {
      setSelectedId(branches[0]?.id ?? null);
    }
  }, [branches, selectedId]);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedId) ?? branches[0] ?? null,
    [branches, selectedId],
  );

  const facilityLabel = (id: string) => {
    const index = FACILITY_IDS.indexOf(id as (typeof FACILITY_IDS)[number]);
    return index >= 0 ? copy.facilities[index] : id;
  };

  const openAdd = () => {
    setDraft(createEmptyBranch(createBranchId()));
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (branch: GymProfileBranch) => {
    setDraft({ ...branch, facilities: [...branch.facilities] });
    setError('');
    setIsFormOpen(true);
  };

  const toggleFacility = (facility: string) => {
    if (!draft) return;
    const selected = draft.facilities.includes(facility);
    setDraft({
      ...draft,
      facilities: selected
        ? draft.facilities.filter((value) => value !== facility)
        : [...draft.facilities, facility],
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const normalized = {
      ...draft,
      name: draft.name.trim(),
      city: draft.city.trim(),
      area: draft.area.trim(),
      address: draft.address.trim(),
      contactPhone: draft.contactPhone.trim(),
      operatingHours: draft.operatingHours.trim(),
    };
    if (!isBranchProfileComplete(normalized)) {
      setError(copy.required);
      return;
    }

    const alreadyExists = branches.some((branch) => branch.id === normalized.id);
    if (alreadyExists) updateBranch(normalized);
    else addBranch(normalized);
    setSelectedId(normalized.id);
    setIsFormOpen(false);
    setDraft(null);
    toast.success(copy.saved);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    if (branches.length <= 1) {
      setRemoveTarget(null);
      toast.error(copy.atLeastOne);
      return;
    }
    removeBranch(removeTarget.id);
    setRemoveTarget(null);
    toast.success(copy.saved);
  };

  return (
    <WorkspacePage className="gym-profile-page" width="wide">
      <div className="gym-profile-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.profile}>
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.overview}
          </Link>
        </Button>
        <Button onClick={openAdd}>
          <Plus aria-hidden="true" size={16} />
          {copy.addBranch}
        </Button>
      </div>

      <div className="gym-branches-layout">
        <WorkspacePanel className="gym-branch-list-panel">
          <div className="gym-profile-section-head">
            <div>
              <MapPin aria-hidden="true" size={18} />
              <h1>{copy.branches}</h1>
            </div>
            <Badge variant="neutral">{branches.length}</Badge>
          </div>
          <WorkspacePanelContent className="gym-branch-list">
            {branches.map((branch, index) => (
              <button
                type="button"
                key={branch.id}
                className={branch.id === selectedBranch?.id ? 'is-selected' : undefined}
                aria-pressed={branch.id === selectedBranch?.id}
                onClick={() => setSelectedId(branch.id)}
              >
                <span>
                  <strong>{branch.name}</strong>
                  {index === 0 ? <small>{copy.primaryBranch}</small> : null}
                </span>
                <small>{[branch.area, branch.city].filter(Boolean).join(', ')}</small>
              </button>
            ))}
          </WorkspacePanelContent>
        </WorkspacePanel>

        <WorkspacePanel>
          {selectedBranch ? (
            <>
              <div className="gym-profile-section-head gym-branch-detail-head">
                <div>
                  <MapPin aria-hidden="true" size={18} />
                  <h2>{selectedBranch.name}</h2>
                </div>
                <div className="gym-branch-detail-actions">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(selectedBranch)}>
                    <Pencil aria-hidden="true" size={14} />
                    {copy.editBranch}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={branches.length <= 1}
                    onClick={() => setRemoveTarget(selectedBranch)}
                  >
                    <Trash2 aria-hidden="true" size={14} />
                    {copy.removeBranch}
                  </Button>
                </div>
              </div>
              <WorkspacePanelContent className="gym-branch-detail">
                <dl className="gym-profile-detail-list is-roomy">
                  <div>
                    <dt>{copy.address}</dt>
                    <dd>
                      {[selectedBranch.address, selectedBranch.area, selectedBranch.city]
                        .filter(Boolean)
                        .join(', ')}
                    </dd>
                  </div>
                  <div>
                    <dt>{copy.contactPhone}</dt>
                    <dd>{selectedBranch.contactPhone}</dd>
                  </div>
                  <div>
                    <dt>{copy.operatingHours}</dt>
                    <dd>{selectedBranch.operatingHours}</dd>
                  </div>
                </dl>
                <div className="gym-branch-amenities">
                  <strong>{copy.amenities}</strong>
                  <div className="gym-profile-chips">
                    {selectedBranch.facilities.length ? (
                      selectedBranch.facilities.map((facility) => (
                        <span key={facility}>{facilityLabel(facility)}</span>
                      ))
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </WorkspacePanelContent>
            </>
          ) : null}
        </WorkspacePanel>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="gym-branch-form-dialog">
          <DialogHeader>
            <DialogTitle>
              {draft && branches.some((branch) => branch.id === draft.id)
                ? copy.editBranch
                : copy.addBranch}
            </DialogTitle>
            <DialogDescription>{copy.required}</DialogDescription>
          </DialogHeader>

          {error ? (
            <div className="owner-form-alert" role="alert">
              {error}
            </div>
          ) : null}

          {draft ? (
            <div className="gym-profile-form">
              <div className="gym-profile-field">
                <Label htmlFor="gym-branch-name">{copy.branchName}</Label>
                <Input
                  id="gym-branch-name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </div>
              <div className="gym-profile-field">
                <Label htmlFor="gym-branch-city">{copy.city}</Label>
                <Input
                  id="gym-branch-city"
                  value={draft.city}
                  onChange={(event) => setDraft({ ...draft, city: event.target.value })}
                />
              </div>
              <div className="gym-profile-field">
                <Label htmlFor="gym-branch-area">{copy.area}</Label>
                <Input
                  id="gym-branch-area"
                  value={draft.area}
                  onChange={(event) => setDraft({ ...draft, area: event.target.value })}
                />
              </div>
              <div className="gym-profile-field">
                <Label htmlFor="gym-branch-phone">{copy.contactPhone}</Label>
                <Input
                  id="gym-branch-phone"
                  type="tel"
                  value={draft.contactPhone}
                  onChange={(event) => setDraft({ ...draft, contactPhone: event.target.value })}
                />
              </div>
              <div className="gym-profile-field is-wide">
                <Label htmlFor="gym-branch-address">{copy.address}</Label>
                <Input
                  id="gym-branch-address"
                  value={draft.address}
                  onChange={(event) => setDraft({ ...draft, address: event.target.value })}
                />
              </div>
              <div className="gym-profile-field is-wide">
                <Label htmlFor="gym-branch-hours">{copy.operatingHours}</Label>
                <Input
                  id="gym-branch-hours"
                  value={draft.operatingHours}
                  onChange={(event) => setDraft({ ...draft, operatingHours: event.target.value })}
                />
              </div>
              <fieldset className="gym-branch-facilities">
                <legend>{copy.amenities}</legend>
                <div>
                  {FACILITY_IDS.map((facility, index) => (
                    <label key={facility}>
                      <Checkbox
                        checked={draft.facilities.includes(facility)}
                        onChange={() => toggleFacility(facility)}
                      />
                      <span>{copy.facilities[index]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              {copy.cancel}
            </Button>
            <Button onClick={saveDraft}>
              <Save aria-hidden="true" size={16} />
              {copy.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.removeTitle}</DialogTitle>
            <DialogDescription>{copy.removeBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              {copy.keepBranch}
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              {copy.confirmRemove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
