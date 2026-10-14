import type { TFunction } from 'i18next';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  Dumbbell,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Star,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { getGym } from '@/features/marketplace/model/marketplaceData';
import { useTrainerProfileStore } from '@/features/trainer-profile';
import { translateTrainerText } from '@/features/trainer-workspace';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { cn } from '@/shared/lib/cn';

import './trainer-profile.css';

function getCopy(t: TFunction) {
  return {
    eyebrow: t('trainerProfile:trainerProfilePages.copy.eyebrow'),
    title: t('trainerProfile:trainerProfilePages.copy.title'),
    body: t('trainerProfile:trainerProfilePages.copy.body'),
    edit: t('trainerProfile:trainerProfilePages.copy.edit'),
    complete: t('trainerProfile:trainerProfilePages.copy.complete'),
    experience: t('trainerProfile:trainerProfilePages.copy.experience'),
    years: t('trainerProfile:trainerProfilePages.copy.years'),
    specializations: t('trainerProfile:trainerProfilePages.copy.specializations'),
    about: t('trainerProfile:trainerProfilePages.copy.about'),
    introduction: t('trainerProfile:trainerProfilePages.copy.introduction'),
    contact: t('trainerProfile:trainerProfilePages.copy.contact'),
    email: t('trainerProfile:trainerProfilePages.copy.email'),
    phone: t('trainerProfile:trainerProfilePages.copy.phone'),
    gym: t('trainerProfile:trainerProfilePages.copy.gym'),
    assigned: t('trainerProfile:trainerProfilePages.copy.assigned'),
    viewGym: t('trainerProfile:trainerProfilePages.copy.viewGym'),
    editTitle: t('trainerProfile:trainerProfilePages.copy.editTitle'),
    editBody: t('trainerProfile:trainerProfilePages.copy.editBody'),
    avatar: t('trainerProfile:trainerProfilePages.copy.avatar'),
    upload: t('trainerProfile:trainerProfilePages.copy.upload'),
    imageRule: t('trainerProfile:trainerProfilePages.copy.imageRule'),
    invalidImage: t('trainerProfile:trainerProfilePages.copy.invalidImage'),
    fullName: t('trainerProfile:trainerProfilePages.copy.fullName'),
    bio: t('trainerProfile:trainerProfilePages.copy.bio'),
    selfIntroduction: t('trainerProfile:trainerProfilePages.copy.selfIntroduction'),
    selectMultiple: t('trainerProfile:trainerProfilePages.copy.selectMultiple'),
    cancel: t('trainerProfile:trainerProfilePages.copy.cancel'),
    save: t('trainerProfile:trainerProfilePages.copy.save'),
    required: t('trainerProfile:trainerProfilePages.copy.required'),
    saved: t('trainerProfile:trainerProfilePages.copy.saved'),
    gymLocked: t('trainerProfile:trainerProfilePages.copy.gymLocked'),
    gymTitle: t('trainerProfile:trainerProfilePages.copy.gymTitle'),
    gymBody: t('trainerProfile:trainerProfilePages.copy.gymBody'),
    readOnly: t('trainerProfile:trainerProfilePages.copy.readOnly'),
    verified: t('trainerProfile:trainerProfilePages.copy.verified'),
    location: t('trainerProfile:trainerProfilePages.copy.location'),
    type: t('trainerProfile:trainerProfilePages.copy.type'),
    rating: t('trainerProfile:trainerProfilePages.copy.rating'),
    facilities: t('trainerProfile:trainerProfilePages.copy.facilities'),
    description: t('trainerProfile:trainerProfilePages.copy.description'),
    assignment: t('trainerProfile:trainerProfilePages.copy.assignment'),
    active: t('trainerProfile:trainerProfilePages.copy.active'),
    backProfile: t('trainerProfile:trainerProfilePages.copy.backProfile'),
  };
}

function useTrainerCopy() {
  const { t } = useTranslation();
  const { language } = useLocale();
  return { copy: getCopy(t), language };
}

const specializationOptions = (t: TFunction) => [
  { value: 'strength', label: t('trainerProfile:trainerProfilePages.strength') },
  { value: 'hypertrophy', label: t('trainerProfile:trainerProfilePages.hypertrophy') },
  { value: 'fat_loss', label: t('trainerProfile:trainerProfilePages.fatLoss') },
  { value: 'movement', label: t('trainerProfile:trainerProfilePages.movementQuality') },
  { value: 'mobility', label: t('trainerProfile:trainerProfilePages.mobility') },
  { value: 'endurance', label: t('trainerProfile:trainerProfilePages.endurance') },
  {
    value: 'rehabilitation',
    label: t('trainerProfile:trainerProfilePages.exerciseRehabilitation'),
  },
];

function TrainerAvatar({
  name,
  source,
  large = false,
}: {
  name: string;
  source?: string | null;
  large?: boolean;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span className={cn('trainer-profile-avatar', large && 'is-large')}>
      {source ? <img src={source} alt="" /> : initials}
    </span>
  );
}

export function TrainerProfilePage() {
  const { t } = useTranslation();
  const { copy, language } = useTrainerCopy();
  const user = useAuthStore((state) => state.user);
  const profile = useTrainerProfileStore((state) => state.profile);
  const gym = getGym('fit-district-thao-dien');
  const name = user?.fullName ?? 'Trainer';
  const completeness = useMemo(() => {
    const checks = [
      user?.fullName,
      user?.email,
      profile.phone,
      profile.bio,
      profile.specializations.length,
      profile.experienceYears,
      profile.selfIntroduction,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile, user]);
  return (
    <div className="trainer-profile-page">
      <div className="trainer-profile-tools">
        <Link className="trainer-profile-primary" to={ROUTES.pt.profileEdit}>
          {copy.edit}
          <ArrowRight size={16} />
        </Link>
      </div>
      <section className="trainer-profile-hero">
        <TrainerAvatar name={name} source={profile.avatarDataUrl ?? user?.avatarUrl} large />
        <div>
          <span>{translateTrainerText(language, 'FIT® TRAINER')}</span>
          <h2>{name}</h2>
          <p>
            {profile.specializations
              .map((id) => specializationOptions(t).find((item) => item.value === id)?.label)
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="trainer-profile-complete">
          <strong>{completeness}%</strong>
          <span>{copy.complete}</span>
        </div>
      </section>
      <div className="trainer-profile-metrics">
        <article>
          <span>{copy.experience}</span>
          <strong>
            {profile.experienceYears ?? '—'} <small>{copy.years}</small>
          </strong>
        </article>
        <article>
          <span>{copy.specializations}</span>
          <strong>{profile.specializations.length}</strong>
        </article>
        <article>
          <span>{copy.gym}</span>
          <strong>{gym?.name ?? '—'}</strong>
        </article>
      </div>
      <div className="trainer-profile-grid">
        <section className="trainer-profile-panel is-about">
          <h2>{copy.about}</h2>
          <p>{translateTrainerText(language, profile.bio)}</p>
          <h2>{copy.introduction}</h2>
          <blockquote>{translateTrainerText(language, profile.selfIntroduction)}</blockquote>
          <h2>{copy.specializations}</h2>
          <div className="trainer-specialty-list">
            {profile.specializations.map((id) => (
              <span key={id}>
                <Sparkles size={13} />
                {specializationOptions(t).find((item) => item.value === id)?.label}
              </span>
            ))}
          </div>
        </section>
        <aside>
          <section className="trainer-profile-panel">
            <h2>{copy.contact}</h2>
            <dl>
              <div>
                <dt>
                  <Mail size={15} />
                  {copy.email}
                </dt>
                <dd>{user?.email}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={15} />
                  {copy.phone}
                </dt>
                <dd>{profile.phone || '—'}</dd>
              </div>
            </dl>
          </section>
          {gym && (
            <Link className="trainer-gym-card" to={ROUTES.pt.gymInfo}>
              <div
                className="trainer-gym-mark"
                style={{ '--trainer-gym-accent': gym.accent } as CSSProperties}
              >
                <Building2 size={24} />
                <span>{gym.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <span>{copy.assigned}</span>
                <h2>{gym.name}</h2>
                <p>
                  <MapPin size={13} />
                  {gym.area[language]}
                </p>
                <em>
                  {copy.viewGym}
                  <ArrowRight size={14} />
                </em>
              </div>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="trainer-profile-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function EditTrainerProfilePage() {
  const { t } = useTranslation();
  const { copy } = useTrainerCopy();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const profile = useTrainerProfileStore((state) => state.profile);
  const updateProfile = useTrainerProfileStore((state) => state.updateProfile);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    ...profile,
  });
  const save = () => {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.bio.trim() ||
      !form.experienceYears ||
      form.specializations.length === 0
    ) {
      toast.error(copy.required);
      return;
    }
    updateUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      avatarUrl: user?.avatarUrl,
    });
    updateProfile({
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      specializations: form.specializations,
      experienceYears: form.experienceYears,
      selfIntroduction: form.selfIntroduction.trim(),
      avatarDataUrl: form.avatarDataUrl,
    });
    toast.success(copy.saved);
    void navigate(ROUTES.pt.profile);
  };
  return (
    <div className="trainer-profile-page">
      <div className="trainer-edit-layout">
        <aside className="trainer-avatar-editor">
          <TrainerAvatar
            name={form.fullName || 'Trainer'}
            source={form.avatarDataUrl ?? user?.avatarUrl}
            large
          />
          <strong>{copy.avatar}</strong>
          <label>
            <Camera size={16} />
            {copy.upload}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (
                  !file ||
                  !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
                  file.size > 2 * 1024 * 1024
                ) {
                  toast.error(copy.invalidImage);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string')
                    setForm((current) => ({ ...current, avatarDataUrl: reader.result as string }));
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <small>{copy.imageRule}</small>
          <div className="trainer-gym-lock">
            <LockKeyhole size={17} />
            <span>{copy.gymLocked}</span>
          </div>
        </aside>
        <section className="trainer-edit-form">
          <div className="trainer-field-grid">
            <Field label={copy.fullName}>
              <input
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </Field>
            <Field label={copy.email}>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            <Field label={copy.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>
            <Field label={copy.experience}>
              <div className="trainer-unit-input">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.experienceYears ?? ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      experienceYears: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                />
                <span>{copy.years}</span>
              </div>
            </Field>
          </div>
          <Field label={copy.bio}>
            <textarea
              value={form.bio}
              maxLength={280}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
            />
          </Field>
          <Field label={copy.selfIntroduction}>
            <textarea
              className="is-large"
              value={form.selfIntroduction}
              maxLength={600}
              onChange={(event) => setForm({ ...form, selfIntroduction: event.target.value })}
            />
          </Field>
          <section className="trainer-specialty-editor">
            <h2>
              {copy.specializations}
              <small>{copy.selectMultiple}</small>
            </h2>
            <div>
              {specializationOptions(t).map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={cn(form.specializations.includes(option.value) && 'is-selected')}
                  onClick={() =>
                    setForm({
                      ...form,
                      specializations: form.specializations.includes(option.value)
                        ? form.specializations.filter((id) => id !== option.value)
                        : [...form.specializations, option.value],
                    })
                  }
                >
                  {form.specializations.includes(option.value) && <Check size={13} />}
                  {option.label}
                </button>
              ))}
            </div>
          </section>
          <footer className="trainer-edit-actions">
            <button type="button" onClick={() => navigate(ROUTES.pt.profile)}>
              {copy.cancel}
            </button>
            <button type="button" className="is-primary" onClick={save}>
              <Save size={16} />
              {copy.save}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}

export function TrainerGymInformationPage() {
  const { t } = useTranslation();
  const { copy, language } = useTrainerCopy();
  const gym = getGym('fit-district-thao-dien');
  if (!gym) return null;
  const gymType =
    gym.type === 'boutique'
      ? 'Boutique'
      : gym.type === 'strength'
        ? t('trainerProfile:trainerProfilePages.strength')
        : t('trainerProfile:trainerProfilePages.fullService');
  return (
    <div className="trainer-profile-page">
      <div className="trainer-profile-tools is-between">
        <Link className="trainer-back-link" to={ROUTES.pt.profile}>
          <ArrowLeft size={15} />
          {copy.backProfile}
        </Link>
        <span className="trainer-readonly-pill">
          <LockKeyhole size={14} />
          {copy.readOnly}
        </span>
      </div>
      <section
        className="trainer-gym-hero"
        style={{ '--trainer-gym-accent': gym.accent } as CSSProperties}
      >
        <div className="trainer-gym-hero__art">
          <Building2 size={58} />
          <span>{gym.name.slice(0, 2).toUpperCase()}</span>
          <i />
        </div>
        <div>
          <span className="trainer-verified">
            <BadgeCheck size={15} />
            {copy.verified}
          </span>
          <h1>{gym.name}</h1>
          <p>
            <MapPin size={15} />
            {gym.address[language]}
          </p>
          <div>
            <strong>{copy.assignment}</strong>
            <em>{copy.active}</em>
          </div>
        </div>
      </section>
      <div className="trainer-gym-stats">
        <article>
          <MapPin size={18} />
          <span>{copy.location}</span>
          <strong>{gym.area[language]}</strong>
        </article>
        <article>
          <Dumbbell size={18} />
          <span>{copy.type}</span>
          <strong>{gymType}</strong>
        </article>
        <article>
          <Star size={18} />
          <span>{copy.rating}</span>
          <strong>
            {gym.rating} · {gym.reviewCount}
          </strong>
        </article>
      </div>
      <div className="trainer-gym-content">
        <section>
          <h2>{copy.description}</h2>
          <p>{gym.description[language]}</p>
        </section>
        <section>
          <h2>{copy.facilities}</h2>
          <div className="trainer-facility-list">
            {gym.facilities.map((facility) => (
              <span key={facility.en}>
                <Check size={14} />
                {facility[language]}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
