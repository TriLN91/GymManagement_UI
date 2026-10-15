import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCreateOwnerTrainer, useMyGyms } from '../model/useOwnerTrainers';

import { gymOwnerTrainingCopy } from './copy';

import { ApiError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

import './gym-owner-training.css';

const MIN_PASSWORD_LENGTH = 6;

/**
 * Gym Admin creates a Trainer account. The trainer belongs to the admin's own gym, so the backend
 * derives the gym from the signed-in user; the select only appears when the admin owns several gyms.
 */
export function TrainerAccountFormPage() {
  const { language } = useLocale();
  const copy = gymOwnerTrainingCopy[language];
  const navigate = useNavigate();
  const gyms = useMyGyms();
  const create = useCreateOwnerTrainer();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    yearsOfExperience: '',
    bio: '',
    gymId: '',
  });
  const [error, setError] = useState('');

  const gymList = gyms.data ?? [];
  const needsGymChoice = gymList.length > 1;

  const save = () => {
    const years = form.yearsOfExperience === '' ? 0 : Number(form.yearsOfExperience);
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      form.password.length < MIN_PASSWORD_LENGTH ||
      !Number.isFinite(years) ||
      years < 0 ||
      years > 80 ||
      (needsGymChoice && !form.gymId)
    ) {
      setError(copy.requiredAccount);
      return;
    }
    setError('');
    create.mutate(
      {
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        bio: form.bio.trim() || undefined,
        yearsOfExperience: years,
        gymId: needsGymChoice ? form.gymId : undefined,
      },
      {
        onSuccess: () => {
          toast.success(copy.createdAccount);
          void navigate(ROUTES.admin.pts);
        },
        onError: (failure) =>
          setError(failure instanceof ApiError ? failure.message : copy.accountFailed),
      },
    );
  };

  return (
    <WorkspacePage className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.pts}>
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.cancel}
          </Link>
        </Button>
      </div>
      <WorkspacePanel className="gym-training-form-shell">
        <div className="gym-training-form">
          <p>{copy.accountIntro}</p>
          <div className="gym-training-form-grid">
            {needsGymChoice ? (
              <div className="gym-training-field is-wide">
                <Label htmlFor="trainer-gym">{copy.gymLabel}</Label>
                <Select
                  id="trainer-gym"
                  value={form.gymId}
                  onChange={(event) => setForm({ ...form, gymId: event.target.value })}
                >
                  <option value="">—</option>
                  {gymList.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
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
                autoComplete="off"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-password">{copy.initialPassword}</Label>
              <Input
                id="trainer-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              <small>{copy.initialPasswordHint}</small>
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-phone">{copy.phone}</Label>
              <Input
                id="trainer-phone"
                value={form.phoneNumber}
                onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-experience">{copy.experience}</Label>
              <Input
                id="trainer-experience"
                type="number"
                min={0}
                max={80}
                value={form.yearsOfExperience}
                onChange={(event) => setForm({ ...form, yearsOfExperience: event.target.value })}
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
            <Button onClick={save} disabled={create.isPending}>
              {create.isPending ? copy.saving : copy.createAccount}
            </Button>
          </div>
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
