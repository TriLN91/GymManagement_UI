import type { TFunction } from 'i18next';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Eye,
  EyeOff,
  HeartPulse,
  Laptop,
  LockKeyhole,
  MapPin,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Watch,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { completedAssessments, trainerAppointments } from './memberProfileData';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useAssessmentStore } from '@/features/camera-assessment/model/useAssessmentStore';
import { calculateProfileReadiness, useProfileSetupStore } from '@/features/member-fitness';
import { useMemberProfileStore } from '@/features/member-profile';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { cn } from '@/shared/lib/cn';

import './member-profile.css';

function getCopy(t: TFunction) {
  return {
    eyebrow: t('memberProfile:memberProfilePages.copy.eyebrow'),
    profile: t('memberProfile:memberProfilePages.copy.profile'),
    profileBody: t('memberProfile:memberProfilePages.copy.profileBody'),
    edit: t('memberProfile:memberProfilePages.copy.edit'),
    setupHealth: t('memberProfile:memberProfilePages.copy.setupHealth'),
    personalInfo: t('memberProfile:memberProfilePages.copy.personalInfo'),
    fitnessInfo: t('memberProfile:memberProfilePages.copy.fitnessInfo'),
    fullName: t('memberProfile:memberProfilePages.copy.fullName'),
    email: t('memberProfile:memberProfilePages.copy.email'),
    phone: t('memberProfile:memberProfilePages.copy.phone'),
    address: t('memberProfile:memberProfilePages.copy.address'),
    height: t('memberProfile:memberProfilePages.copy.height'),
    weight: t('memberProfile:memberProfilePages.copy.weight'),
    goal: t('memberProfile:memberProfilePages.copy.goal'),
    experience: t('memberProfile:memberProfilePages.copy.experience'),
    available: t('memberProfile:memberProfilePages.copy.available'),
    noData: t('memberProfile:memberProfilePages.copy.noData'),
    completeness: t('memberProfile:memberProfilePages.copy.completeness'),
    ready: t('memberProfile:memberProfilePages.copy.ready'),
    incomplete: t('memberProfile:memberProfilePages.copy.incomplete'),
    ptReview: t('memberProfile:memberProfilePages.copy.ptReview'),
    assessments: t('memberProfile:memberProfilePages.copy.assessments'),
    appointments: t('memberProfile:memberProfilePages.copy.appointments'),
    wearables: t('memberProfile:memberProfilePages.copy.wearables'),
    notifications: t('memberProfile:memberProfilePages.copy.notifications'),
    view: t('memberProfile:memberProfilePages.copy.view'),
    editTitle: t('memberProfile:memberProfilePages.copy.editTitle'),
    editBody: t('memberProfile:memberProfilePages.copy.editBody'),
    avatar: t('memberProfile:memberProfilePages.copy.avatar'),
    uploadAvatar: t('memberProfile:memberProfilePages.copy.uploadAvatar'),
    avatarLimit: t('memberProfile:memberProfilePages.copy.avatarLimit'),
    invalidAvatar: t('memberProfile:memberProfilePages.copy.invalidAvatar'),
    save: t('memberProfile:memberProfilePages.copy.save'),
    cancel: t('memberProfile:memberProfilePages.copy.cancel'),
    saved: t('memberProfile:memberProfilePages.copy.saved'),
    physicalManaged: t('memberProfile:memberProfilePages.copy.physicalManaged'),
    security: t('memberProfile:memberProfilePages.copy.security'),
    securityBody: t('memberProfile:memberProfilePages.copy.securityBody'),
    accountInfo: t('memberProfile:memberProfilePages.copy.accountInfo'),
    accountId: t('memberProfile:memberProfilePages.copy.accountId'),
    role: t('memberProfile:memberProfilePages.copy.role'),
    changePassword: t('memberProfile:memberProfilePages.copy.changePassword'),
    currentPassword: t('memberProfile:memberProfilePages.copy.currentPassword'),
    newPassword: t('memberProfile:memberProfilePages.copy.newPassword'),
    confirmPassword: t('memberProfile:memberProfilePages.copy.confirmPassword'),
    updatePassword: t('memberProfile:memberProfilePages.copy.updatePassword'),
    passwordMismatch: t('memberProfile:memberProfilePages.copy.passwordMismatch'),
    passwordLength: t('memberProfile:memberProfilePages.copy.passwordLength'),
    passwordUpdated: t('memberProfile:memberProfilePages.copy.passwordUpdated'),
    preferences: t('memberProfile:memberProfilePages.copy.preferences'),
    twoFactor: t('memberProfile:memberProfilePages.copy.twoFactor'),
    loginAlerts: t('memberProfile:memberProfilePages.copy.loginAlerts'),
    sessionTimeout: t('memberProfile:memberProfilePages.copy.sessionTimeout'),
    minutes: t('memberProfile:memberProfilePages.copy.minutes'),
    currentSession: t('memberProfile:memberProfilePages.copy.currentSession'),
    currentDevice: t('memberProfile:memberProfilePages.copy.currentDevice'),
    activeNow: t('memberProfile:memberProfilePages.copy.activeNow'),
    assessmentBody: t('memberProfile:memberProfilePages.copy.assessmentBody'),
    all: t('memberProfile:memberProfilePages.copy.all'),
    completed: t('memberProfile:memberProfilePages.copy.completed'),
    pending: t('memberProfile:memberProfilePages.copy.pending'),
    score: t('memberProfile:memberProfilePages.copy.score'),
    submitted: t('memberProfile:memberProfilePages.copy.submitted'),
    findings: t('memberProfile:memberProfilePages.copy.findings'),
    backHistory: t('memberProfile:memberProfilePages.copy.backHistory'),
    pendingBody: t('memberProfile:memberProfilePages.copy.pendingBody'),
    severity: {
      low: t('memberProfile:memberProfilePages.copy.severity.low'),
      medium: t('memberProfile:memberProfilePages.copy.severity.medium'),
      high: t('memberProfile:memberProfilePages.copy.severity.high'),
    },
    appointmentBody: t('memberProfile:memberProfilePages.copy.appointmentBody'),
    upcoming: t('memberProfile:memberProfilePages.copy.upcoming'),
    confirmed: t('memberProfile:memberProfilePages.copy.confirmed'),
    waiting: t('memberProfile:memberProfilePages.copy.waiting'),
    duration: t('memberProfile:memberProfilePages.copy.duration'),
    appointmentTypes: {
      in_person: t('memberProfile:memberProfilePages.copy.appointmentTypes.in_person'),
      video_checkin: t('memberProfile:memberProfilePages.copy.appointmentTypes.video_checkin'),
      body_assessment: t('memberProfile:memberProfilePages.copy.appointmentTypes.body_assessment'),
    },
    readOnly: t('memberProfile:memberProfilePages.copy.readOnly'),
    wearableBody: t('memberProfile:memberProfilePages.copy.wearableBody'),
    connected: t('memberProfile:memberProfilePages.copy.connected'),
    disconnected: t('memberProfile:memberProfilePages.copy.disconnected'),
    connect: t('memberProfile:memberProfilePages.copy.connect'),
    disconnect: t('memberProfile:memberProfilePages.copy.disconnect'),
    sync: t('memberProfile:memberProfilePages.copy.sync'),
    synced: t('memberProfile:memberProfilePages.copy.synced'),
    lastSync: t('memberProfile:memberProfilePages.copy.lastSync'),
    never: t('memberProfile:memberProfilePages.copy.never'),
    notificationBody: t('memberProfile:memberProfilePages.copy.notificationBody'),
    unread: t('memberProfile:memberProfilePages.copy.unread'),
    markAll: t('memberProfile:memberProfilePages.copy.markAll'),
    empty: t('memberProfile:memberProfilePages.copy.empty'),
    roleMember: t('memberProfile:memberProfilePages.copy.roleMember'),
    file: t('memberProfile:memberProfilePages.copy.file'),
    trainerBadge: t('memberProfile:memberProfilePages.copy.trainerBadge'),
    togglePassword: t('memberProfile:memberProfilePages.copy.togglePassword'),
  };
}

function useProfileCopy() {
  const { t } = useTranslation();
  const { language, locale } = useLocale();
  return { language, locale, copy: getCopy(t) };
}

function ProfileActions({ children }: { children: ReactNode }) {
  return <div className="member-profile-actions">{children}</div>;
}

function Avatar({
  name,
  source,
  large = false,
}: {
  name: string;
  source?: string | null;
  large?: boolean;
}) {
  return (
    <span className={cn('member-profile-avatar', large && 'is-large')}>
      {source ? (
        <img src={source} alt="" />
      ) : (
        name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase()
      )}
    </span>
  );
}

function formatDate(value: string, locale: string, withTime = false) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(value));
}

const goalNames: Record<string, { en: string; vi: string }> = {
  muscle_gain: { en: 'Build muscle', vi: 'Tăng cơ' },
  fat_loss: { en: 'Lose fat', vi: 'Giảm mỡ' },
  strength: { en: 'Build strength', vi: 'Tăng sức mạnh' },
  cardio_endurance: { en: 'Improve cardio endurance', vi: 'Tăng sức bền tim mạch' },
  muscular_endurance: { en: 'Improve muscular endurance', vi: 'Tăng sức bền cơ bắp' },
  mobility: { en: 'Improve mobility', vi: 'Cải thiện vận động' },
};

export function PersonalProfilePage() {
  const { t } = useTranslation();
  const { copy, language } = useProfileCopy();
  const user = useAuthStore((state) => state.user);
  const contact = useMemberProfileStore((state) => state.contact);
  const notifications = useMemberProfileStore((state) => state.notifications);
  const wearables = useMemberProfileStore((state) => state.wearables);
  const assessments = useAssessmentStore((state) => state.assessments);
  const fitness = useProfileSetupStore((state) => state.profile);
  const readiness = calculateProfileReadiness(fitness);
  const name = user?.fullName ?? 'Member';
  const readinessLabel =
    readiness.completeness < 100
      ? copy.incomplete
      : readiness.level === 'ready'
        ? copy.ready
        : copy.ptReview;
  const info = [
    [copy.fullName, name],
    [copy.email, user?.email ?? copy.noData],
    [copy.phone, contact.phone || copy.noData],
    [copy.address, contact.address || copy.noData],
  ];
  const fitnessInfo = [
    [copy.height, fitness.identity.heightCm ? `${fitness.identity.heightCm} cm` : copy.noData],
    [copy.weight, fitness.identity.weightKg ? `${fitness.identity.weightKg} kg` : copy.noData],
    [
      copy.goal,
      fitness.goals.selected.map((goal) => goalNames[goal]?.[language] ?? goal).join(', ') ||
        copy.noData,
    ],
    [copy.experience, fitness.training.experience || copy.noData],
    [
      copy.available,
      fitness.training.availableDays.length
        ? `${fitness.training.availableDays.length} ${t('memberProfile:memberProfilePages.daysWeek')}`
        : copy.noData,
    ],
  ];
  return (
    <div className="member-profile-page">
      <ProfileActions>
        <Link className="profile-primary-link" to={ROUTES.member.profileEdit}>
          {copy.edit}
          <ArrowRight size={16} />
        </Link>
      </ProfileActions>
      <section className="profile-identity-hero">
        <Avatar name={name} source={contact.avatarDataUrl ?? user?.avatarUrl} large />
        <div>
          <span>{t('memberProfile:memberProfilePages.mEMBERTIER1')}</span>
          <h2>{name}</h2>
          <p>{user?.email}</p>
        </div>
        <div className="profile-complete-ring">
          <strong>{readiness.completeness}%</strong>
          <span>{copy.completeness}</span>
        </div>
      </section>
      <section
        className={cn(
          'profile-readiness-line',
          readiness.completeness < 100 ? 'is-incomplete' : `is-${readiness.level}`,
        )}
      >
        <ShieldCheck size={20} />
        <strong>{readinessLabel}</strong>
        <span>
          {readiness.completeness < 100
            ? t('memberProfile:memberProfilePages.completeTheHealthProfile')
            : readiness.level === 'ready'
              ? t('memberProfile:memberProfilePages.dataIsReadyFor')
              : t('memberProfile:memberProfilePages.reviewTheStatusBefore')}
        </span>
        <Link to={ROUTES.member.profileSetup}>{copy.setupHealth}</Link>
      </section>
      <div className="profile-overview-grid">
        <InfoPanel title={copy.personalInfo} rows={info} />
        <InfoPanel title={copy.fitnessInfo} rows={fitnessInfo} />
      </div>
      <section className="profile-shortcuts">
        <Shortcut
          icon={<ScanLine />}
          title={copy.assessments}
          metric={`${completedAssessments.length + assessments.length}`}
          to={ROUTES.member.profileAssessments}
          copy={copy.view}
        />
        <Shortcut
          icon={<CalendarDays />}
          title={copy.appointments}
          metric={`${trainerAppointments.length}`}
          to={ROUTES.member.profileAppointments}
          copy={copy.view}
        />
        <Shortcut
          icon={<Watch />}
          title={copy.wearables}
          metric={`${wearables.filter((item) => item.connected).length}`}
          to={ROUTES.member.profileWearables}
          copy={copy.view}
        />
        <Shortcut
          icon={<Bell />}
          title={copy.notifications}
          metric={`${notifications.filter((item) => !item.read).length}`}
          to={ROUTES.member.profileNotifications}
          copy={copy.view}
        />
      </section>
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="profile-info-panel">
      <h2>{title}</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
function Shortcut({
  icon,
  title,
  metric,
  to,
  copy,
}: {
  icon: ReactNode;
  title: string;
  metric: string;
  to: string;
  copy: string;
}) {
  return (
    <Link to={to} className="profile-shortcut">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{metric}</small>
      </div>
      <em>
        {copy}
        <ChevronRight size={15} />
      </em>
    </Link>
  );
}

export function EditPersonalProfilePage() {
  const { copy } = useProfileCopy();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const contact = useMemberProfileStore((state) => state.contact);
  const updateContact = useMemberProfileStore((state) => state.updateContact);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: contact.phone,
    address: contact.address,
    avatarDataUrl: contact.avatarDataUrl,
  });
  const name = form.fullName || 'Member';
  const save = () => {
    if (!form.fullName.trim() || !form.email.trim()) return;
    updateUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      avatarUrl: user?.avatarUrl,
    });
    updateContact({
      phone: form.phone.trim(),
      address: form.address.trim(),
      avatarDataUrl: form.avatarDataUrl,
    });
    toast.success(copy.saved);
    void navigate(ROUTES.member.profile);
  };
  return (
    <div className="member-profile-page">
      <div className="profile-edit-layout">
        <section className="profile-avatar-editor">
          <Avatar name={name} source={form.avatarDataUrl ?? user?.avatarUrl} large />
          <strong>{copy.avatar}</strong>
          <label>
            <Camera size={16} />
            {copy.uploadAvatar}
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
                  toast.error(copy.invalidAvatar);
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
          <small>{copy.avatarLimit}</small>
        </section>
        <section className="profile-edit-form">
          <div className="profile-form-pair">
            <ProfileField label={copy.fullName}>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </ProfileField>
            <ProfileField label={copy.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </ProfileField>
            <ProfileField label={copy.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </ProfileField>
            <ProfileField label={copy.address}>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </ProfileField>
          </div>
          <div className="profile-edit-note">
            <HeartPulse size={18} />
            <span>{copy.physicalManaged}</span>
            <Link to={ROUTES.member.profileSetup}>{copy.setupHealth}</Link>
          </div>
          <div className="profile-form-buttons">
            <button type="button" onClick={() => navigate(ROUTES.member.profile)}>
              {copy.cancel}
            </button>
            <button type="button" className="is-primary" onClick={save}>
              {copy.save}
              <Check size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="member-profile-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function AccountSecurityPage() {
  const { t } = useTranslation();
  const { copy, locale } = useProfileCopy();
  const user = useAuthStore((state) => state.user);
  const security = useMemberProfileStore((state) => state.security);
  const updateSecurity = useMemberProfileStore((state) => state.updateSecurity);
  const recordPasswordChange = useMemberProfileStore((state) => state.recordPasswordChange);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const updatePassword = () => {
    if (passwords.next.length < 8) {
      toast.error(copy.passwordLength);
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error(copy.passwordMismatch);
      return;
    }
    recordPasswordChange();
    setPasswords({ current: '', next: '', confirm: '' });
    toast.success(copy.passwordUpdated);
  };
  return (
    <div className="member-profile-page">
      <div className="profile-security-grid">
        <section className="profile-account-card">
          <h2>{copy.accountInfo}</h2>
          <dl>
            <div>
              <dt>{copy.email}</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>{copy.accountId}</dt>
              <dd>{user?.id}</dd>
            </div>
            <div>
              <dt>{copy.role}</dt>
              <dd>{copy.roleMember}</dd>
            </div>
          </dl>
        </section>
        <section className="profile-password-card">
          <h2>{copy.changePassword}</h2>
          {(['current', 'next', 'confirm'] as const).map((key) => (
            <ProfileField
              key={key}
              label={
                key === 'current'
                  ? copy.currentPassword
                  : key === 'next'
                    ? copy.newPassword
                    : copy.confirmPassword
              }
            >
              <div className="profile-password-input">
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                  value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                />
                {key === 'next' && (
                  <button
                    type="button"
                    aria-label={copy.togglePassword}
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                )}
              </div>
            </ProfileField>
          ))}
          <button
            className="profile-action-button"
            type="button"
            disabled={!passwords.current || !passwords.next || !passwords.confirm}
            onClick={updatePassword}
          >
            {copy.updatePassword}
            <ArrowRight size={15} />
          </button>
        </section>
        <section className="profile-security-settings">
          <h2>{copy.preferences}</h2>
          <ToggleSetting
            icon={<ShieldCheck />}
            title={copy.twoFactor}
            checked={security.twoFactorEnabled}
            onChange={(twoFactorEnabled) => updateSecurity({ twoFactorEnabled })}
          />
          <ToggleSetting
            icon={<Bell />}
            title={copy.loginAlerts}
            checked={security.loginAlerts}
            onChange={(loginAlerts) => updateSecurity({ loginAlerts })}
          />
          <label className="profile-select-setting">
            <div>
              <Clock3 size={19} />
              <strong>{copy.sessionTimeout}</strong>
            </div>
            <select
              value={security.sessionTimeoutMinutes}
              onChange={(e) =>
                updateSecurity({ sessionTimeoutMinutes: Number(e.target.value) as 30 | 60 | 120 })
              }
            >
              <option value="30">30 {copy.minutes}</option>
              <option value="60">60 {copy.minutes}</option>
              <option value="120">120 {copy.minutes}</option>
            </select>
          </label>
        </section>
        <section className="profile-session-card">
          <div>
            <Laptop size={22} />
            <span>
              <strong>{copy.currentSession}</strong>
              <small>{copy.currentDevice}</small>
            </span>
          </div>
          <em>{copy.activeNow}</em>
          {security.lastPasswordChangedAt && (
            <small>
              {t('memberProfile:memberProfilePages.passwordChanged')}
              {formatDate(security.lastPasswordChangedAt, locale)}
            </small>
          )}
        </section>
      </div>
    </div>
  );
}

function ToggleSetting({
  icon,
  title,
  checked,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="profile-toggle-setting">
      <div>
        {icon}
        <strong>{title}</strong>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
    </label>
  );
}

export function AssessmentHistoryPage() {
  const { copy, language, locale } = useProfileCopy();
  const pending = useAssessmentStore((state) => state.assessments);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const records = useMemo(
    () =>
      [
        ...completedAssessments.map((record) => ({
          ...record,
          name: record.exerciseName[language],
        })),
        ...pending.map((record) => ({ ...record, name: record.exerciseId.replaceAll('-', ' ') })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [pending, language],
  );
  const visible = records.filter((record) => filter === 'all' || record.status === filter);
  return (
    <div className="member-profile-page">
      <div className="profile-filter-bar">
        {(['all', 'completed', 'pending'] as const).map((value) => (
          <button
            type="button"
            className={cn(filter === value && 'is-active')}
            key={value}
            onClick={() => setFilter(value)}
          >
            {copy[value]}
          </button>
        ))}
      </div>
      <section className="assessment-history-list">
        {visible.length ? (
          visible.map((record) => (
            <article key={record.id}>
              <span className={cn('assessment-status', `is-${record.status}`)}>
                {record.status === 'completed' ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <RefreshCw size={17} />
                )}
              </span>
              <div>
                <strong>{record.name}</strong>
                <small>{formatDate(record.createdAt, locale, true)}</small>
              </div>
              {record.status === 'completed' ? (
                <>
                  <em>
                    {record.score}
                    <small>/100</small>
                  </em>
                  <Link to={ROUTES.member.profileAssessmentPath(record.id)}>
                    {copy.view}
                    <ChevronRight size={15} />
                  </Link>
                </>
              ) : (
                <>
                  <em>—</em>
                  <span className="assessment-pending-label">{copy.pending}</span>
                </>
              )}
            </article>
          ))
        ) : (
          <EmptyState copy={copy.empty} />
        )}
      </section>
    </div>
  );
}

export function AssessmentDetailPage() {
  const { assessmentId = '' } = useParams();
  const { copy, language, locale } = useProfileCopy();
  const pending = useAssessmentStore((state) =>
    state.assessments.find((item) => item.id === assessmentId),
  );
  const completed = completedAssessments.find((item) => item.id === assessmentId);
  if (!pending && !completed) return <Navigate to={ROUTES.member.profileAssessments} replace />;
  return (
    <div className="member-profile-page">
      <Link className="profile-back-link" to={ROUTES.member.profileAssessments}>
        <ArrowLeft size={15} />
        {copy.backHistory}
      </Link>
      {pending ? (
        <section className="assessment-processing">
          <RefreshCw size={30} />
          <h2>{copy.pending}</h2>
          <p>{copy.pendingBody}</p>
          <dl>
            <div>
              <dt>{copy.submitted}</dt>
              <dd>{formatDate(pending.createdAt, locale, true)}</dd>
            </div>
            <div>
              <dt>{copy.file}</dt>
              <dd>{pending.fileName}</dd>
            </div>
          </dl>
        </section>
      ) : (
        completed && (
          <>
            <section className="assessment-score-card">
              <div>
                <ScanLine size={25} />
                <span>{copy.score}</span>
              </div>
              <strong>
                {completed.score}
                <small>/100</small>
              </strong>
            </section>
            <section className="assessment-findings">
              <h2>{copy.findings}</h2>
              {completed.findings.map((finding) => (
                <article key={`${finding.timestamp}-${finding.title.en}`}>
                  <time>{finding.timestamp}</time>
                  <div>
                    <span className={`is-${finding.severity}`}>
                      {copy.severity[finding.severity]}
                    </span>
                    <h3>{finding.title[language]}</h3>
                    <p>{finding.feedback[language]}</p>
                  </div>
                </article>
              ))}
            </section>
          </>
        )
      )}
    </div>
  );
}

export function PTAppointmentsPage() {
  const { copy, language, locale } = useProfileCopy();
  const [selected, setSelected] = useState(trainerAppointments[0]?.id ?? '');
  const appointment = trainerAppointments.find((item) => item.id === selected);
  return (
    <div className="member-profile-page">
      <ProfileActions>
        <span className="profile-readonly-pill">
          <LockKeyhole size={14} />
          {copy.readOnly}
        </span>
      </ProfileActions>
      <div className="appointment-layout">
        <section className="appointment-list">
          <h2>{copy.upcoming}</h2>
          {trainerAppointments.map((item) => (
            <button
              type="button"
              key={item.id}
              className={cn(item.id === selected && 'is-selected')}
              onClick={() => setSelected(item.id)}
            >
              <time>
                <strong>{new Date(item.startsAt).getDate()}</strong>
                <span>
                  {new Intl.DateTimeFormat(locale, {
                    month: 'short',
                  }).format(new Date(item.startsAt))}
                </span>
              </time>
              <div>
                <strong>{copy.appointmentTypes[item.type]}</strong>
                <span>{item.trainerName}</span>
                <small>{formatDate(item.startsAt, locale, true)}</small>
              </div>
              <em className={`is-${item.status}`}>
                {item.status === 'confirmed' ? copy.confirmed : copy.waiting}
              </em>
            </button>
          ))}
        </section>
        {appointment && (
          <aside className="appointment-detail">
            <Avatar name={appointment.trainerName} />
            <span>{copy.trainerBadge}</span>
            <h2>{appointment.trainerName}</h2>
            <p>{appointment.note[language]}</p>
            <dl>
              <div>
                <dt>
                  <CalendarDays size={16} />
                  {copy.appointments}
                </dt>
                <dd>{formatDate(appointment.startsAt, locale, true)}</dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={16} />
                  {copy.duration}
                </dt>
                <dd>{appointment.durationMinutes} min</dd>
              </div>
              <div>
                <dt>
                  <MapPin size={16} />
                  Location
                </dt>
                <dd>{appointment.location[language]}</dd>
              </div>
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
}

const wearableMeta = {
  apple_health: { name: 'Apple Health', icon: Smartphone },
  google_fit: { name: 'Google Fit', icon: Activity },
  garmin: { name: 'Garmin Connect', icon: Watch },
  fitbit: { name: 'Fitbit', icon: HeartPulse },
};

export function WearableConnectionsPage() {
  const { copy, locale } = useProfileCopy();
  const wearables = useMemberProfileStore((state) => state.wearables);
  const toggle = useMemberProfileStore((state) => state.toggleWearable);
  const sync = useMemberProfileStore((state) => state.syncWearable);
  return (
    <div className="member-profile-page">
      <section className="wearable-grid">
        {wearables.map((device) => {
          const meta = wearableMeta[device.id];
          const Icon = meta.icon;
          return (
            <article key={device.id} className={cn(device.connected && 'is-connected')}>
              <div className="wearable-icon">
                <Icon size={25} />
              </div>
              <div>
                <h2>{meta.name}</h2>
                <span>{device.connected ? copy.connected : copy.disconnected}</span>
              </div>
              <p>
                {copy.lastSync}:{' '}
                {device.lastSyncedAt ? formatDate(device.lastSyncedAt, locale, true) : copy.never}
              </p>
              <div>
                {device.connected && (
                  <button
                    type="button"
                    onClick={() => {
                      sync(device.id);
                      toast.success(copy.synced);
                    }}
                  >
                    <RefreshCw size={15} />
                    {copy.sync}
                  </button>
                )}
                <button
                  type="button"
                  className={cn(device.connected && 'is-danger')}
                  onClick={() => toggle(device.id)}
                >
                  {device.connected ? copy.disconnect : copy.connect}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export function MemberNotificationsPage() {
  const { copy, language, locale } = useProfileCopy();
  const notifications = useMemberProfileStore((state) => state.notifications);
  const markRead = useMemberProfileStore((state) => state.markNotificationRead);
  const markAll = useMemberProfileStore((state) => state.markAllNotificationsRead);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const visible = notifications.filter((item) => filter === 'all' || !item.read);
  return (
    <div className="member-profile-page">
      <ProfileActions>
        <button className="profile-secondary-action" type="button" onClick={markAll}>
          <Check size={15} />
          {copy.markAll}
        </button>
      </ProfileActions>
      <div className="profile-filter-bar">
        <button
          type="button"
          className={cn(filter === 'all' && 'is-active')}
          onClick={() => setFilter('all')}
        >
          {copy.all}
        </button>
        <button
          type="button"
          className={cn(filter === 'unread' && 'is-active')}
          onClick={() => setFilter('unread')}
        >
          {copy.unread} · {notifications.filter((item) => !item.read).length}
        </button>
      </div>
      <section className="profile-notification-list">
        {visible.length ? (
          visible.map((item) => (
            <Link
              key={item.id}
              to={item.target}
              className={cn(!item.read && 'is-unread')}
              onClick={() => markRead(item.id)}
            >
              <span className={`is-${item.category}`}>
                {item.category === 'workout' ? (
                  <Dumbbell />
                ) : item.category === 'assessment' ? (
                  <ScanLine />
                ) : item.category === 'appointment' ? (
                  <CalendarDays />
                ) : (
                  <CheckCircle2 />
                )}
              </span>
              <div>
                <strong>{item.title[language]}</strong>
                <p>{item.body[language]}</p>
                <small>{formatDate(item.createdAt, locale, true)}</small>
              </div>
              <ChevronRight size={17} />
            </Link>
          ))
        ) : (
          <EmptyState copy={copy.empty} />
        )}
      </section>
    </div>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return (
    <div className="profile-empty">
      <Bell size={24} />
      <span>{copy}</span>
    </div>
  );
}
