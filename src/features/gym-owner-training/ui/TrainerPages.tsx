import {
  ArrowLeft,
  Camera,
  CircleAlert,
  ClipboardCheck,
  Mail,
  Plus,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  TRAINER_SPECIALIZATIONS,
  type GymTrainerInput,
  type TrainerOperationalStatus,
} from '../model/types';
import { useGymOwnerTrainingStore } from '../model/useGymOwnerTrainingStore';

import { gymOwnerTrainingCopy } from './copy';
import { ManagementState } from './ManagementState';
import { ApprovalBadge, DetailRow, OperationalBadge, TrainerAvatar } from './TrainingShared';

import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
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
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

import './gym-owner-training.css';

function useTrainingCopy() {
  const { language, locale } = useLocale();
  return { copy: gymOwnerTrainingCopy[language], locale };
}

export function GymOwnerTrainerListPage() {
  const { copy } = useTrainingCopy();
  const trainers = useGymOwnerTrainingStore((state) => state.trainers);
  const assignments = useGymOwnerTrainingStore((state) => state.assignments);
  const openExceptions = useGymOwnerTrainingStore(
    (state) => state.assignmentExceptions.filter((item) => item.status === 'open').length,
  );

  return (
    <WorkspacePage width="wide" className="gym-training-page">
      <h1 className="sr-only">{copy.trainerList}</h1>
      <div className="gym-training-toolbar">
        <Button asChild variant="outline">
          <Link to={ROUTES.admin.trainerAssignments}>
            <ClipboardCheck aria-hidden="true" size={16} />
            {copy.assignmentExceptions}
            {openExceptions > 0 ? <Badge variant="destructive">{openExceptions}</Badge> : null}
          </Link>
        </Button>
        <Button asChild>
          <Link to={ROUTES.admin.trainerCreate}>
            <Plus aria-hidden="true" size={16} />
            {copy.createTrainer}
          </Link>
        </Button>
      </div>

      <WorkspacePanel className="gym-training-list-panel">
        <div className="gym-training-list-head" aria-hidden="true">
          <span>{copy.trainers}</span>
          <span>{copy.specializations}</span>
          <span>{copy.approvalStatus}</span>
          <span>{copy.operationalStatus}</span>
          <span>{copy.assignments}</span>
          <span />
        </div>
        <ManagementState
          state="loaded"
          isEmpty={trainers.length === 0}
          loadingLabel={copy.loading}
          emptyLabel={copy.noTrainers}
          errorLabel={copy.listError}
        >
          <div className="gym-trainer-list">
            {trainers.map((trainer) => {
              const assignedCount = assignments.filter(
                (assignment) =>
                  assignment.trainerId === trainer.id && assignment.status === 'active',
              ).length;
              return (
                <article key={trainer.id}>
                  <div className="gym-trainer-identity">
                    <TrainerAvatar name={trainer.fullName} source={trainer.avatarDataUrl} />
                    <div>
                      <strong>{trainer.fullName}</strong>
                      <span>{trainer.email}</span>
                    </div>
                  </div>
                  <div className="gym-training-chip-list">
                    {trainer.specializations.slice(0, 2).map((specialization) => (
                      <span key={specialization}>{copy.specializationsMap[specialization]}</span>
                    ))}
                  </div>
                  <div>
                    <ApprovalBadge status={trainer.approvalStatus} copy={copy} />
                  </div>
                  <div>
                    <OperationalBadge status={trainer.operationalStatus} copy={copy} />
                  </div>
                  <strong className="gym-training-assignment-count">{assignedCount}</strong>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={ROUTES.admin.trainerDetailPath(trainer.id)}>{copy.viewDetail}</Link>
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

type TrainerFormDraft = GymTrainerInput;

const emptyTrainerForm: TrainerFormDraft = {
  fullName: '',
  email: '',
  phone: '',
  bio: '',
  specializations: [],
  experienceYears: 0,
  selfIntroduction: '',
  avatarDataUrl: null,
};

export function GymOwnerTrainerFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { copy } = useTrainingCopy();
  const { trainerId = '' } = useParams();
  const navigate = useNavigate();
  const trainer = useGymOwnerTrainingStore((state) =>
    state.trainers.find((item) => item.id === trainerId),
  );
  const createTrainer = useGymOwnerTrainingStore((state) => state.createTrainer);
  const updateTrainer = useGymOwnerTrainingStore((state) => state.updateTrainer);
  const [form, setForm] = useState<TrainerFormDraft>(() =>
    mode === 'edit' && trainer
      ? {
          fullName: trainer.fullName,
          email: trainer.email,
          phone: trainer.phone,
          bio: trainer.bio,
          specializations: [...trainer.specializations],
          experienceYears: trainer.experienceYears,
          selfIntroduction: trainer.selfIntroduction,
          avatarDataUrl: trainer.avatarDataUrl,
        }
      : emptyTrainerForm,
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (mode === 'edit' && (!trainer || !['draft', 'rejected'].includes(trainer.approvalStatus))) {
    return (
      <Navigate
        to={trainer ? ROUTES.admin.trainerDetailPath(trainer.id) : ROUTES.admin.pts}
        replace
      />
    );
  }

  const toggleSpecialization = (specialization: TrainerFormDraft['specializations'][number]) => {
    setForm((current) => ({
      ...current,
      specializations: current.specializations.includes(specialization)
        ? current.specializations.filter((item) => item !== specialization)
        : [...current.specializations, specialization],
    }));
  };

  const save = () => {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.bio.trim() ||
      form.experienceYears <= 0 ||
      form.specializations.length === 0
    ) {
      setError(copy.requiredTrainer);
      return;
    }
    setIsSaving(true);
    window.setTimeout(() => {
      const normalized: GymTrainerInput = {
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        selfIntroduction: form.selfIntroduction.trim(),
        specializations: [...form.specializations],
      };
      const savedId = mode === 'create' ? createTrainer(normalized) : trainer!.id;
      if (mode === 'edit') updateTrainer(trainer!.id, normalized);
      toast.success(mode === 'create' ? copy.createdTrainer : copy.savedTrainer);
      void navigate(ROUTES.admin.trainerDetailPath(savedId));
    }, 250);
  };

  return (
    <WorkspacePage className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link
            to={
              mode === 'edit' && trainer
                ? ROUTES.admin.trainerDetailPath(trainer.id)
                : ROUTES.admin.pts
            }
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.cancel}
          </Link>
        </Button>
      </div>
      <WorkspacePanel className="gym-training-form-shell">
        <aside className="gym-training-avatar-editor">
          <TrainerAvatar name={form.fullName || 'Trainer'} source={form.avatarDataUrl} large />
          <strong>{copy.avatar}</strong>
          <label>
            <Camera aria-hidden="true" size={16} />
            {copy.uploadAvatar}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (
                  !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                  file.size > 2_000_000
                ) {
                  setError(copy.invalidImage);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setForm((current) => ({ ...current, avatarDataUrl: reader.result as string }));
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <small>{copy.imageRule}</small>
        </aside>
        <div className="gym-training-form">
          <div className="gym-training-form-grid">
            <div className="gym-training-field">
              <Label htmlFor="trainer-name">{copy.fullName}</Label>
              <Input
                id="trainer-name"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-email">{copy.email}</Label>
              <Input
                id="trainer-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-phone">{copy.phone}</Label>
              <Input
                id="trainer-phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-experience">{copy.experience}</Label>
              <Input
                id="trainer-experience"
                type="number"
                min={1}
                value={form.experienceYears || ''}
                onChange={(event) =>
                  setForm({ ...form, experienceYears: Number(event.target.value) })
                }
              />
            </div>
            <div className="gym-training-field is-wide">
              <Label htmlFor="trainer-bio">{copy.bio}</Label>
              <Textarea
                id="trainer-bio"
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
              />
            </div>
            <div className="gym-training-field is-wide">
              <Label htmlFor="trainer-introduction">{copy.selfIntroduction}</Label>
              <Textarea
                id="trainer-introduction"
                value={form.selfIntroduction}
                onChange={(event) => setForm({ ...form, selfIntroduction: event.target.value })}
              />
            </div>
            <fieldset className="gym-training-specializations">
              <legend>{copy.specializations}</legend>
              <div>
                {TRAINER_SPECIALIZATIONS.map((specialization) => (
                  <label key={specialization}>
                    <Checkbox
                      checked={form.specializations.includes(specialization)}
                      onChange={() => toggleSpecialization(specialization)}
                    />
                    {copy.specializationsMap[specialization]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {error ? (
            <p className="gym-training-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="gym-training-form-actions">
            <Button variant="outline" onClick={() => navigate(-1)}>
              {copy.cancel}
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? copy.saving : copy.save}
            </Button>
          </div>
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}

export function GymOwnerTrainerDetailPage() {
  const { copy } = useTrainingCopy();
  const { trainerId = '' } = useParams();
  const trainer = useGymOwnerTrainingStore((state) =>
    state.trainers.find((item) => item.id === trainerId),
  );
  const allAssignments = useGymOwnerTrainingStore((state) => state.assignments);
  const submitTrainer = useGymOwnerTrainingStore((state) => state.submitTrainer);
  const setTrainerOperationalStatus = useGymOwnerTrainingStore(
    (state) => state.setTrainerOperationalStatus,
  );
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<TrainerOperationalStatus | null>(null);

  if (!trainer) return <Navigate to={ROUTES.admin.pts} replace />;

  const assignments = allAssignments.filter((item) => item.trainerId === trainerId);

  const approvalBody = {
    draft: copy.draftBody,
    pending: copy.pendingBody,
    approved: copy.approvedBody,
    rejected: copy.rejectedBody,
  }[trainer.approvalStatus];

  const allowedStatusActions = (() => {
    if (trainer.approvalStatus !== 'approved' || !trainer.operationalStatus) return [];
    if (trainer.operationalStatus === 'unlinked') return [];
    if (trainer.operationalStatus === 'active') {
      return [
        { status: 'hidden' as const, label: copy.hideTrainer },
        { status: 'suspended' as const, label: copy.suspendTrainer },
        { status: 'unlinked' as const, label: copy.unlinkTrainer },
      ];
    }
    return [
      { status: 'active' as const, label: copy.restoreTrainer },
      { status: 'unlinked' as const, label: copy.unlinkTrainer },
    ];
  })();

  return (
    <WorkspacePage width="wide" className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.pts}>
            <ArrowLeft aria-hidden="true" size={16} /> {copy.back}
          </Link>
        </Button>
        <div>
          {['draft', 'rejected'].includes(trainer.approvalStatus) ? (
            <Button asChild variant="outline">
              <Link to={ROUTES.admin.trainerEditPath(trainer.id)}>{copy.edit}</Link>
            </Button>
          ) : null}
          {['draft', 'rejected'].includes(trainer.approvalStatus) ? (
            <Button onClick={() => setIsSubmitOpen(true)}>
              <ShieldCheck aria-hidden="true" size={16} />
              {trainer.approvalStatus === 'rejected' ? copy.resubmitApproval : copy.submitApproval}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="gym-trainer-detail-hero">
        <TrainerAvatar name={trainer.fullName} source={trainer.avatarDataUrl} large />
        <div>
          <h1>{trainer.fullName}</h1>
          <div className="gym-training-chip-list">
            {trainer.specializations.map((specialization) => (
              <span key={specialization}>{copy.specializationsMap[specialization]}</span>
            ))}
          </div>
        </div>
        <dl>
          <div>
            <dt>{copy.approvalStatus}</dt>
            <dd>
              <ApprovalBadge status={trainer.approvalStatus} copy={copy} />
            </dd>
          </div>
          <div>
            <dt>{copy.operationalStatus}</dt>
            <dd>
              <OperationalBadge status={trainer.operationalStatus} copy={copy} />
            </dd>
          </div>
        </dl>
      </section>

      <section className={`gym-trainer-approval is-${trainer.approvalStatus}`}>
        {trainer.approvalStatus === 'rejected' ? (
          <CircleAlert aria-hidden="true" size={22} />
        ) : (
          <ShieldCheck aria-hidden="true" size={22} />
        )}
        <div>
          <strong>{copy.approval[trainer.approvalStatus]}</strong>
          <span>{approvalBody}</span>
          {trainer.rejectionReason ? (
            <p role="alert">
              <b>{copy.rejectionReason}:</b> {trainer.rejectionReason}
            </p>
          ) : null}
        </div>
      </section>

      <div className="gym-training-detail-grid">
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <UserRoundCog size={18} />
            <h2>{copy.about}</h2>
          </div>
          <WorkspacePanelContent>
            <dl className="gym-training-detail-list">
              <DetailRow label={copy.bio}>{trainer.bio}</DetailRow>
              <DetailRow label={copy.selfIntroduction}>{trainer.selfIntroduction || '—'}</DetailRow>
              <DetailRow label={copy.experience}>
                {trainer.experienceYears} {copy.years}
              </DetailRow>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <Mail size={18} />
            <h2>{copy.contact}</h2>
          </div>
          <WorkspacePanelContent>
            <dl className="gym-training-detail-list">
              <DetailRow label={copy.email}>{trainer.email}</DetailRow>
              <DetailRow label={copy.phone}>{trainer.phone || '—'}</DetailRow>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      {allowedStatusActions.length > 0 ? (
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <ShieldCheck size={18} />
            <h2>{copy.statusActions}</h2>
          </div>
          <WorkspacePanelContent className="gym-training-status-actions">
            {allowedStatusActions.map((action) => (
              <Button
                key={action.status}
                variant={action.status === 'unlinked' ? 'destructive' : 'outline'}
                onClick={() => setStatusTarget(action.status)}
              >
                {action.label}
              </Button>
            ))}
          </WorkspacePanelContent>
        </WorkspacePanel>
      ) : null}

      <WorkspacePanel>
        <div className="gym-training-section-head">
          <UsersRound size={18} />
          <h2>{copy.assignedMembers}</h2>
        </div>
        <WorkspacePanelContent>
          {assignments.length > 0 ? (
            <div className="gym-training-assignment-list">
              {assignments.map((assignment) => (
                <article key={assignment.id}>
                  <div>
                    <strong>{assignment.memberName}</strong>
                    <span>{assignment.memberEmail}</span>
                  </div>
                  <span>{assignment.packageName}</span>
                  <span>
                    {assignment.startsOn} – {assignment.endsOn}
                  </span>
                  <Badge variant={assignment.status === 'active' ? 'accent' : 'neutral'}>
                    {assignment.status === 'active' ? copy.active : copy.historical}
                  </Badge>
                </article>
              ))}
            </div>
          ) : (
            <p className="gym-training-muted">{copy.noAssignments}</p>
          )}
        </WorkspacePanelContent>
      </WorkspacePanel>

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.submitTitle}</DialogTitle>
            <DialogDescription>{copy.submitBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{copy.cancel}</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (submitTrainer(trainer.id)) toast.success(copy.submitted);
                setIsSubmitOpen(false);
              }}
            >
              {copy.confirmSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.statusConfirmTitle}</DialogTitle>
            <DialogDescription>
              {statusTarget === 'unlinked' ? copy.unlinkWarning : copy.statusConfirmBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{copy.cancel}</Button>
            </DialogClose>
            <Button
              variant={statusTarget === 'unlinked' ? 'destructive' : 'default'}
              onClick={() => {
                if (statusTarget && setTrainerOperationalStatus(trainer.id, statusTarget)) {
                  toast.success(copy.statusUpdated);
                }
                setStatusTarget(null);
              }}
            >
              {copy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
