import { ArrowLeft, CalendarDays, CircleDollarSign, PackagePlus, Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import type { GymPTPackageInput } from '../model/types';
import { useGymOwnerTrainingStore } from '../model/useGymOwnerTrainingStore';

import { gymOwnerTrainingCopy } from './copy';
import { ManagementState } from './ManagementState';
import { TrainerAvatar } from './TrainingShared';

import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

import './gym-owner-training.css';

function usePackageCopy() {
  const { language, locale } = useLocale();
  return { copy: gymOwnerTrainingCopy[language], locale };
}

function formatVnd(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function GymOwnerPTPackageListPage() {
  const { language } = useLocale();
  const { copy, locale } = usePackageCopy();
  const packages = useGymOwnerTrainingStore((state) => state.packages);
  const trainers = useGymOwnerTrainingStore((state) => state.trainers);

  return (
    <WorkspacePage width="wide" className="gym-training-page">
      <h1 className="sr-only">{copy.packages}</h1>
      <div className="gym-training-toolbar">
        <span />
        <Button asChild>
          <Link to={ROUTES.admin.packageCreate}>
            <PackagePlus aria-hidden="true" size={16} />
            {copy.createPackage}
          </Link>
        </Button>
      </div>

      <WorkspacePanel className="gym-training-list-panel">
        <div className="gym-package-list-head" aria-hidden="true">
          <span>{copy.packages}</span>
          <span>{copy.packageTrainer}</span>
          <span>{copy.sessions}</span>
          <span>{copy.durationDays}</span>
          <span>{copy.servicePrice}</span>
          <span>{copy.packageStatus}</span>
          <span />
        </div>
        <ManagementState
          state="loaded"
          isEmpty={packages.length === 0}
          loadingLabel={copy.loading}
          emptyLabel={copy.noPackages}
          errorLabel={copy.packageListError}
        >
          <div className="gym-package-list">
            {packages.map((gymPackage) => {
              const trainer = trainers.find((item) => item.id === gymPackage.trainerId);
              return (
                <article key={gymPackage.id}>
                  <div className="gym-package-name">
                    <strong>{gymPackage.name[language]}</strong>
                    <span>{gymPackage.name[language]}</span>
                  </div>
                  <div className="gym-package-trainer">
                    {trainer ? (
                      <>
                        <TrainerAvatar name={trainer.fullName} source={trainer.avatarDataUrl} />
                        <strong>{trainer.fullName}</strong>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                  <strong>{gymPackage.sessionsIncluded}</strong>
                  <span>{gymPackage.durationDays}</span>
                  <strong>{formatVnd(gymPackage.servicePriceVnd, locale)}</strong>
                  <Badge
                    variant={gymPackage.publicationStatus === 'published' ? 'accent' : 'neutral'}
                  >
                    {gymPackage.publicationStatus === 'published' ? copy.published : copy.draft}
                  </Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={ROUTES.admin.packageDetailPath(gymPackage.id)}>
                      {copy.viewDetail}
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        </ManagementState>
      </WorkspacePanel>
    </WorkspacePage>
  );
}

interface PackageDraft {
  trainerId: string;
  nameEn: string;
  nameVi: string;
  sessionsIncluded: number;
  durationDays: number;
  servicePriceVnd: number;
  featuresEn: string;
  featuresVi: string;
}

const emptyPackageForm: PackageDraft = {
  trainerId: '',
  nameEn: '',
  nameVi: '',
  sessionsIncluded: 0,
  durationDays: 0,
  servicePriceVnd: 0,
  featuresEn: '',
  featuresVi: '',
};

function lines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function GymOwnerPTPackageFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { copy } = usePackageCopy();
  const { packageId = '' } = useParams();
  const navigate = useNavigate();
  const trainers = useGymOwnerTrainingStore((state) => state.trainers);
  const gymPackage = useGymOwnerTrainingStore((state) =>
    state.packages.find((item) => item.id === packageId),
  );
  const createPackage = useGymOwnerTrainingStore((state) => state.createPackage);
  const updatePackage = useGymOwnerTrainingStore((state) => state.updatePackage);
  const [form, setForm] = useState<PackageDraft>(() =>
    mode === 'edit' && gymPackage
      ? {
          trainerId: gymPackage.trainerId,
          nameEn: gymPackage.name.en,
          nameVi: gymPackage.name.vi,
          sessionsIncluded: gymPackage.sessionsIncluded,
          durationDays: gymPackage.durationDays,
          servicePriceVnd: gymPackage.servicePriceVnd,
          featuresEn: gymPackage.features.map((feature) => feature.en).join('\n'),
          featuresVi: gymPackage.features.map((feature) => feature.vi).join('\n'),
        }
      : { ...emptyPackageForm },
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const eligibleTrainers = trainers.filter(
    (trainer) => trainer.approvalStatus === 'approved' && trainer.operationalStatus !== 'unlinked',
  );

  if (mode === 'edit' && (!gymPackage || gymPackage.publicationStatus !== 'draft')) {
    return (
      <Navigate
        to={gymPackage ? ROUTES.admin.packageDetailPath(gymPackage.id) : ROUTES.admin.packages}
        replace
      />
    );
  }

  const save = () => {
    const enFeatures = lines(form.featuresEn);
    const viFeatures = lines(form.featuresVi);
    const isInvalid =
      !form.trainerId ||
      !form.nameEn.trim() ||
      !form.nameVi.trim() ||
      form.sessionsIncluded <= 0 ||
      form.durationDays <= 0 ||
      form.servicePriceVnd <= 0 ||
      enFeatures.length === 0 ||
      enFeatures.length !== viFeatures.length;
    if (isInvalid) {
      setError(copy.requiredPackage);
      return;
    }

    const input: GymPTPackageInput = {
      trainerId: form.trainerId,
      name: { en: form.nameEn.trim(), vi: form.nameVi.trim() },
      sessionsIncluded: form.sessionsIncluded,
      durationDays: form.durationDays,
      servicePriceVnd: form.servicePriceVnd,
      features: enFeatures.map((feature, index) => ({
        en: feature,
        vi: viFeatures[index]!,
      })),
    };
    setIsSaving(true);
    window.setTimeout(() => {
      const savedId = mode === 'create' ? createPackage(input) : gymPackage!.id;
      if (mode === 'edit') updatePackage(gymPackage!.id, input);
      toast.success(mode === 'create' ? copy.packageCreated : copy.packageSaved);
      void navigate(ROUTES.admin.packageDetailPath(savedId));
    }, 250);
  };

  return (
    <WorkspacePage className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link
            to={
              mode === 'edit' && gymPackage
                ? ROUTES.admin.packageDetailPath(gymPackage.id)
                : ROUTES.admin.packages
            }
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.cancel}
          </Link>
        </Button>
      </div>

      <WorkspacePanel className="gym-package-form-shell">
        <div className="gym-package-form-marker" aria-hidden="true">
          <PackagePlus size={28} />
        </div>
        <WorkspacePanelContent className="gym-training-form">
          <div className="gym-training-form-grid">
            <div className="gym-training-field is-wide">
              <Label htmlFor="package-trainer">{copy.packageTrainer}</Label>
              <Select
                id="package-trainer"
                value={form.trainerId}
                onChange={(event) => setForm({ ...form, trainerId: event.target.value })}
              >
                <option value="">{copy.chooseTrainer}</option>
                {eligibleTrainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="gym-training-field">
              <Label htmlFor="package-name-en">{copy.packageNameEn}</Label>
              <Input
                id="package-name-en"
                value={form.nameEn}
                onChange={(event) => setForm({ ...form, nameEn: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="package-name-vi">{copy.packageNameVi}</Label>
              <Input
                id="package-name-vi"
                value={form.nameVi}
                onChange={(event) => setForm({ ...form, nameVi: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="package-sessions">{copy.sessions}</Label>
              <Input
                id="package-sessions"
                type="number"
                min={1}
                value={form.sessionsIncluded || ''}
                onChange={(event) =>
                  setForm({ ...form, sessionsIncluded: Number(event.target.value) })
                }
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="package-days">{copy.durationDays}</Label>
              <Input
                id="package-days"
                type="number"
                min={1}
                value={form.durationDays || ''}
                onChange={(event) => setForm({ ...form, durationDays: Number(event.target.value) })}
              />
            </div>
            <div className="gym-training-field is-wide">
              <Label htmlFor="package-price">{copy.servicePrice}</Label>
              <Input
                id="package-price"
                type="number"
                min={1}
                step={1000}
                value={form.servicePriceVnd || ''}
                onChange={(event) =>
                  setForm({ ...form, servicePriceVnd: Number(event.target.value) })
                }
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="package-features-en">{copy.featuresEn}</Label>
              <Textarea
                id="package-features-en"
                rows={5}
                value={form.featuresEn}
                onChange={(event) => setForm({ ...form, featuresEn: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="package-features-vi">{copy.featuresVi}</Label>
              <Textarea
                id="package-features-vi"
                rows={5}
                value={form.featuresVi}
                onChange={(event) => setForm({ ...form, featuresVi: event.target.value })}
              />
            </div>
          </div>
          <p className="gym-training-muted">{copy.oneFeaturePerLine}</p>
          {error ? (
            <p className="gym-training-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="gym-training-form-actions">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {copy.cancel}
            </Button>
            <Button type="button" onClick={save} disabled={isSaving}>
              {isSaving ? copy.saving : copy.savePackage}
            </Button>
          </div>
        </WorkspacePanelContent>
      </WorkspacePanel>
    </WorkspacePage>
  );
}

export function GymOwnerPTPackageDetailPage() {
  const { language } = useLocale();
  const { t } = useTranslation();
  const { copy, locale } = usePackageCopy();
  const { packageId = '' } = useParams();
  const gymPackage = useGymOwnerTrainingStore((state) =>
    state.packages.find((item) => item.id === packageId),
  );
  const trainer = useGymOwnerTrainingStore((state) =>
    state.trainers.find((item) => item.id === gymPackage?.trainerId),
  );
  const publishPackage = useGymOwnerTrainingStore((state) => state.publishPackage);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  if (!gymPackage) return <Navigate to={ROUTES.admin.packages} replace />;

  return (
    <WorkspacePage className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.packages}>
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.back}
          </Link>
        </Button>
        <div>
          {gymPackage.publicationStatus === 'draft' ? (
            <>
              <Button asChild variant="outline">
                <Link to={ROUTES.admin.packageEditPath(gymPackage.id)}>{copy.edit}</Link>
              </Button>
              <Button type="button" onClick={() => setIsPublishOpen(true)}>
                <Send aria-hidden="true" size={16} />
                {copy.publish}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" disabled title={copy.unpublishPending}>
              {copy.unpublish}
            </Button>
          )}
        </div>
      </div>

      <section className="gym-package-detail-hero">
        <div>
          <Badge variant={gymPackage.publicationStatus === 'published' ? 'accent' : 'neutral'}>
            {gymPackage.publicationStatus === 'published' ? copy.published : copy.draft}
          </Badge>
          <h1>{gymPackage.name[language]}</h1>
          <span>{gymPackage.name[language]}</span>
        </div>
        <strong>{formatVnd(gymPackage.servicePriceVnd, locale)}</strong>
      </section>

      <div className="gym-package-metrics">
        <article>
          <PackagePlus aria-hidden="true" size={20} />
          <span>{copy.sessions}</span>
          <strong>{gymPackage.sessionsIncluded}</strong>
        </article>
        <article>
          <CalendarDays aria-hidden="true" size={20} />
          <span>{copy.durationDays}</span>
          <strong>{gymPackage.durationDays}</strong>
        </article>
        <article>
          <CircleDollarSign aria-hidden="true" size={20} />
          <span>{copy.servicePrice}</span>
          <strong>{formatVnd(gymPackage.servicePriceVnd, locale)}</strong>
        </article>
      </div>

      <div className="gym-training-detail-grid">
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <h2>{copy.packageTrainer}</h2>
          </div>
          <WorkspacePanelContent>
            {trainer ? (
              <div className="gym-package-owner">
                <TrainerAvatar name={trainer.fullName} source={trainer.avatarDataUrl} large />
                <div>
                  <strong>{trainer.fullName}</strong>
                  <span>{trainer.email}</span>
                </div>
              </div>
            ) : (
              '—'
            )}
          </WorkspacePanelContent>
        </WorkspacePanel>
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <h2>{t('owner:pTPackagePages.features')}</h2>
          </div>
          <WorkspacePanelContent>
            <ul className="gym-package-features">
              {gymPackage.features.map((feature, index) => (
                <li key={`${feature.en}-${index}`}>
                  <CheckMark />
                  <span>{feature[language]}</span>
                </li>
              ))}
            </ul>
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      {gymPackage.publicationStatus === 'published' ? (
        <p className="gym-training-rule-note" role="note">
          {copy.unpublishPending}
        </p>
      ) : null}

      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.publishTitle}</DialogTitle>
            <DialogDescription>{copy.publishBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {copy.cancel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                if (publishPackage(gymPackage.id)) toast.success(copy.packagePublished);
                setIsPublishOpen(false);
              }}
            >
              {copy.confirmPublish}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}

function CheckMark() {
  return <span aria-hidden="true">✓</span>;
}
