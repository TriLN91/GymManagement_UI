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

import { useTrainerProfileStore } from './useTrainerProfileStore';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { getGym } from '@/features/marketplace/model/marketplaceData';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

import './trainer-profile.css';

function getCopy(isVi: boolean) {
  return isVi
    ? {
        eyebrow: 'FIT® / TRAINER PROFILE',
        title: 'Hồ sơ huấn luyện viên',
        body: 'Thông tin chuyên môn mà Member và Gym sử dụng để hiểu phong cách coaching của bạn.',
        edit: 'Chỉnh sửa hồ sơ',
        complete: 'Hồ sơ hoàn thiện',
        experience: 'Kinh nghiệm',
        years: 'năm',
        specializations: 'Chuyên môn',
        about: 'Bio chuyên môn',
        introduction: 'Lời giới thiệu',
        contact: 'Thông tin liên hệ',
        email: 'Email',
        phone: 'Số điện thoại',
        gym: 'Gym đang công tác',
        assigned: 'Đã được phân công',
        viewGym: 'Xem thông tin Gym',
        editTitle: 'Chỉnh sửa hồ sơ Trainer',
        editBody: 'Cập nhật thông tin cá nhân và chuyên môn. Gym được hệ thống phân công riêng.',
        avatar: 'Ảnh đại diện',
        upload: 'Tải ảnh mới',
        imageRule: 'JPG, PNG hoặc WebP, tối đa 2 MB.',
        invalidImage: 'Vui lòng chọn ảnh JPG, PNG hoặc WebP dưới 2 MB.',
        fullName: 'Họ và tên',
        bio: 'Bio ngắn',
        selfIntroduction: 'Tự giới thiệu',
        selectMultiple: 'Có thể chọn nhiều',
        cancel: 'Hủy bỏ',
        save: 'Lưu thay đổi',
        required: 'Hãy hoàn thành tên, email, bio, kinh nghiệm và ít nhất một chuyên môn.',
        saved: 'Đã cập nhật hồ sơ Trainer.',
        gymLocked: 'Gym được phân công và không thể thay đổi tại đây.',
        gymTitle: 'Thông tin Gym',
        gymBody: 'Thông tin nơi công tác được quản lý bởi Gym Owner và chỉ đọc đối với Trainer.',
        readOnly: 'Chỉ đọc',
        verified: 'Gym đã xác minh',
        location: 'Địa điểm',
        type: 'Loại hình',
        rating: 'Đánh giá',
        facilities: 'Tiện ích',
        description: 'Giới thiệu Gym',
        assignment: 'Quan hệ công tác',
        active: 'Đang hoạt động',
        backProfile: 'Về hồ sơ Trainer',
      }
    : {
        eyebrow: 'FIT® / TRAINER PROFILE',
        title: 'Trainer profile',
        body: 'Professional information Members and your Gym use to understand your coaching approach.',
        edit: 'Edit profile',
        complete: 'Profile complete',
        experience: 'Experience',
        years: 'years',
        specializations: 'Specializations',
        about: 'Professional bio',
        introduction: 'Self-introduction',
        contact: 'Contact information',
        email: 'Email',
        phone: 'Phone',
        gym: 'Assigned Gym',
        assigned: 'Assigned',
        viewGym: 'View Gym information',
        editTitle: 'Edit Trainer profile',
        editBody:
          'Update personal and professional information. Gym assignment is managed separately.',
        avatar: 'Profile photo',
        upload: 'Upload new photo',
        imageRule: 'JPG, PNG or WebP, up to 2 MB.',
        invalidImage: 'Choose a JPG, PNG or WebP image under 2 MB.',
        fullName: 'Full name',
        bio: 'Short bio',
        selfIntroduction: 'Self-introduction',
        selectMultiple: 'Select multiple',
        cancel: 'Cancel',
        save: 'Save changes',
        required: 'Complete name, email, bio, experience and at least one specialization.',
        saved: 'Trainer profile updated.',
        gymLocked: 'Gym assignment cannot be changed here.',
        gymTitle: 'Gym information',
        gymBody:
          'Your workplace information is managed by the Gym Owner and is read-only for Trainers.',
        readOnly: 'Read only',
        verified: 'Verified Gym',
        location: 'Location',
        type: 'Gym type',
        rating: 'Rating',
        facilities: 'Facilities',
        description: 'About the Gym',
        assignment: 'Work assignment',
        active: 'Active',
        backProfile: 'Back to Trainer profile',
      };
}

function useTrainerCopy() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  return { copy: getCopy(isVi), isVi };
}

const specializationOptions = (isVi: boolean) => [
  { value: 'strength', label: isVi ? 'Sức mạnh' : 'Strength' },
  { value: 'hypertrophy', label: isVi ? 'Tăng cơ' : 'Hypertrophy' },
  { value: 'fat_loss', label: isVi ? 'Giảm mỡ' : 'Fat loss' },
  { value: 'movement', label: isVi ? 'Chất lượng vận động' : 'Movement quality' },
  { value: 'mobility', label: isVi ? 'Linh hoạt' : 'Mobility' },
  { value: 'endurance', label: isVi ? 'Sức bền' : 'Endurance' },
  { value: 'rehabilitation', label: isVi ? 'Phục hồi vận động' : 'Exercise rehabilitation' },
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
  const { copy, isVi } = useTrainerCopy();
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
          <span>FIT® TRAINER</span>
          <h2>{name}</h2>
          <p>
            {profile.specializations
              .map((id) => specializationOptions(isVi).find((item) => item.value === id)?.label)
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
          <p>{profile.bio}</p>
          <h2>{copy.introduction}</h2>
          <blockquote>{profile.selfIntroduction}</blockquote>
          <h2>{copy.specializations}</h2>
          <div className="trainer-specialty-list">
            {profile.specializations.map((id) => (
              <span key={id}>
                <Sparkles size={13} />
                {specializationOptions(isVi).find((item) => item.value === id)?.label}
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
                  {gym.area[isVi ? 'vi' : 'en']}
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
  const { copy, isVi } = useTrainerCopy();
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
              {specializationOptions(isVi).map((option) => (
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
  const { copy, isVi } = useTrainerCopy();
  const gym = getGym('fit-district-thao-dien');
  if (!gym) return null;
  const gymType =
    gym.type === 'boutique'
      ? 'Boutique'
      : gym.type === 'strength'
        ? isVi
          ? 'Sức mạnh'
          : 'Strength'
        : isVi
          ? 'Đa dịch vụ'
          : 'Full service';
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
            {gym.address[isVi ? 'vi' : 'en']}
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
          <strong>{gym.area[isVi ? 'vi' : 'en']}</strong>
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
          <p>{gym.description[isVi ? 'vi' : 'en']}</p>
        </section>
        <section>
          <h2>{copy.facilities}</h2>
          <div className="trainer-facility-list">
            {gym.facilities.map((facility) => (
              <span key={facility.en}>
                <Check size={14} />
                {facility[isVi ? 'vi' : 'en']}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
