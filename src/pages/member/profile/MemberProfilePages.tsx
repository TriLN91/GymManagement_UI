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
import { cn } from '@/shared/lib/cn';

import './member-profile.css';

function getCopy(isVi: boolean) {
  return isVi
    ? {
        eyebrow: 'FIT® / HỒ SƠ MEMBER',
        profile: 'Hồ sơ cá nhân',
        profileBody: 'Thông tin tài khoản, thể chất và mức sẵn sàng tập luyện của bạn.',
        edit: 'Chỉnh sửa hồ sơ',
        setupHealth: 'Cập nhật hồ sơ sức khỏe',
        personalInfo: 'Thông tin cá nhân',
        fitnessInfo: 'Thông tin tập luyện',
        fullName: 'Họ và tên',
        email: 'Email',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        height: 'Chiều cao',
        weight: 'Cân nặng',
        goal: 'Mục tiêu chính',
        experience: 'Kinh nghiệm',
        available: 'Lịch có thể tập',
        noData: 'Chưa thiết lập',
        completeness: 'Hồ sơ hoàn thiện',
        ready: 'Có thể tạo plan',
        incomplete: 'Cần hoàn thành Profile Setup',
        ptReview: 'Cần PT xem lại',
        medicalReview: 'Cần xác minh sức khỏe',
        assessments: 'Lịch sử AI Assessment',
        appointments: 'Lịch hẹn PT',
        wearables: 'Thiết bị kết nối',
        notifications: 'Thông báo',
        view: 'Xem chi tiết',
        editTitle: 'Chỉnh sửa thông tin cá nhân',
        editBody: 'Thông tin liên hệ được quản lý riêng với hồ sơ sức khỏe và vận động.',
        avatar: 'Ảnh đại diện',
        uploadAvatar: 'Tải ảnh mới',
        avatarLimit: 'Ảnh JPG, PNG hoặc WebP, tối đa 2 MB.',
        invalidAvatar: 'Vui lòng chọn ảnh JPG, PNG hoặc WebP dưới 2 MB.',
        save: 'Lưu thay đổi',
        cancel: 'Hủy bỏ',
        saved: 'Đã cập nhật hồ sơ cá nhân.',
        physicalManaged: 'Chỉ số cơ thể và sức khỏe được chỉnh sửa trong Profile Setup.',
        security: 'Tài khoản & bảo mật',
        securityBody: 'Quản lý mật khẩu, cảnh báo đăng nhập và thời lượng phiên.',
        accountInfo: 'Thông tin tài khoản',
        accountId: 'Mã tài khoản',
        role: 'Vai trò',
        changePassword: 'Đổi mật khẩu',
        currentPassword: 'Mật khẩu hiện tại',
        newPassword: 'Mật khẩu mới',
        confirmPassword: 'Xác nhận mật khẩu mới',
        updatePassword: 'Cập nhật mật khẩu',
        passwordMismatch: 'Mật khẩu xác nhận không khớp.',
        passwordLength: 'Mật khẩu mới phải có ít nhất 8 ký tự.',
        passwordUpdated: 'Mật khẩu đã được cập nhật trong bản mô phỏng.',
        preferences: 'Cài đặt bảo mật',
        twoFactor: 'Xác thực hai bước',
        loginAlerts: 'Cảnh báo đăng nhập mới',
        sessionTimeout: 'Tự động khóa phiên sau',
        minutes: 'phút',
        currentSession: 'Phiên hiện tại',
        currentDevice: 'Trình duyệt hiện tại',
        activeNow: 'Đang hoạt động',
        assessmentBody: 'Theo dõi video đang xử lý và xem lại kết quả phân tích động tác.',
        all: 'Tất cả',
        completed: 'Đã có kết quả',
        pending: 'Đang xử lý',
        score: 'Điểm kỹ thuật',
        submitted: 'Ngày gửi',
        findings: 'Điểm cần điều chỉnh',
        backHistory: 'Về lịch sử đánh giá',
        pendingBody: 'Video đang chờ dịch vụ phân tích. Kết quả sẽ xuất hiện tại đây.',
        severity: { low: 'Nhẹ', medium: 'Trung bình', high: 'Ưu tiên cao' },
        appointmentBody: 'Lịch do PT tạo. Member chỉ xem thông tin và trao đổi trực tiếp với PT.',
        upcoming: 'Sắp tới',
        confirmed: 'Đã xác nhận',
        waiting: 'Chờ xác nhận',
        duration: 'Thời lượng',
        appointmentTypes: {
          in_person: 'Tập trực tiếp',
          video_checkin: 'Video check-in',
          body_assessment: 'Đánh giá cơ thể',
        },
        readOnly: 'Lịch hẹn do PT quản lý',
        wearableBody: 'Kết nối nguồn dữ liệu vận động để đồng bộ bước chân, nhịp tim và buổi tập.',
        connected: 'Đã kết nối',
        disconnected: 'Chưa kết nối',
        connect: 'Kết nối',
        disconnect: 'Ngắt kết nối',
        sync: 'Đồng bộ ngay',
        synced: 'Đã đồng bộ thiết bị.',
        lastSync: 'Lần đồng bộ gần nhất',
        never: 'Chưa từng đồng bộ',
        notificationBody: 'Workout, AI Assessment, lịch PT và thanh toán được tập trung tại đây.',
        unread: 'Chưa đọc',
        markAll: 'Đánh dấu tất cả đã đọc',
        empty: 'Không có dữ liệu phù hợp.',
      }
    : {
        eyebrow: 'FIT® / MEMBER PROFILE',
        profile: 'Personal profile',
        profileBody: 'Your account, physical profile and training readiness in one place.',
        edit: 'Edit profile',
        setupHealth: 'Update health profile',
        personalInfo: 'Personal information',
        fitnessInfo: 'Fitness information',
        fullName: 'Full name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        height: 'Height',
        weight: 'Weight',
        goal: 'Primary goal',
        experience: 'Experience',
        available: 'Available schedule',
        noData: 'Not provided',
        completeness: 'Profile complete',
        ready: 'Ready for plan creation',
        incomplete: 'Profile Setup is incomplete',
        ptReview: 'Trainer review needed',
        medicalReview: 'Health verification needed',
        assessments: 'AI Assessment history',
        appointments: 'PT appointments',
        wearables: 'Connected devices',
        notifications: 'Notifications',
        view: 'View details',
        editTitle: 'Edit personal information',
        editBody: 'Contact information is managed separately from health and movement data.',
        avatar: 'Profile photo',
        uploadAvatar: 'Upload new photo',
        avatarLimit: 'JPG, PNG or WebP, up to 2 MB.',
        invalidAvatar: 'Choose a JPG, PNG or WebP image under 2 MB.',
        save: 'Save changes',
        cancel: 'Cancel',
        saved: 'Personal profile updated.',
        physicalManaged: 'Body metrics and health data are edited in Profile Setup.',
        security: 'Account & security',
        securityBody: 'Manage password, login alerts and session duration.',
        accountInfo: 'Account information',
        accountId: 'Account ID',
        role: 'Role',
        changePassword: 'Change password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm new password',
        updatePassword: 'Update password',
        passwordMismatch: 'Password confirmation does not match.',
        passwordLength: 'The new password must contain at least 8 characters.',
        passwordUpdated: 'Password updated in the local simulation.',
        preferences: 'Security settings',
        twoFactor: 'Two-step verification',
        loginAlerts: 'New-login alerts',
        sessionTimeout: 'Automatically lock session after',
        minutes: 'minutes',
        currentSession: 'Current session',
        currentDevice: 'Current browser',
        activeNow: 'Active now',
        assessmentBody: 'Track processing videos and review movement-analysis results.',
        all: 'All',
        completed: 'Completed',
        pending: 'Processing',
        score: 'Form score',
        submitted: 'Submitted',
        findings: 'Movement findings',
        backHistory: 'Back to assessment history',
        pendingBody: 'The video is waiting for analysis. Results will appear here.',
        severity: { low: 'Low', medium: 'Medium', high: 'High priority' },
        appointmentBody:
          'Appointments are created by your Trainer. Members can view and coordinate directly.',
        upcoming: 'Upcoming',
        confirmed: 'Confirmed',
        waiting: 'Pending',
        duration: 'Duration',
        appointmentTypes: {
          in_person: 'In-person training',
          video_checkin: 'Video check-in',
          body_assessment: 'Body assessment',
        },
        readOnly: 'Appointments are managed by your Trainer',
        wearableBody: 'Connect activity sources to sync steps, heart rate and workouts.',
        connected: 'Connected',
        disconnected: 'Not connected',
        connect: 'Connect',
        disconnect: 'Disconnect',
        sync: 'Sync now',
        synced: 'Device synchronized.',
        lastSync: 'Last synchronized',
        never: 'Never synchronized',
        notificationBody: 'Workout, AI Assessment, appointments and payments appear here.',
        unread: 'Unread',
        markAll: 'Mark all as read',
        empty: 'No matching data.',
      };
}

function useProfileCopy() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  return { isVi, copy: getCopy(isVi) };
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

function formatDate(value: string, isVi: boolean, withTime = false) {
  return new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(value));
}

const goalNames: Record<string, { en: string; vi: string }> = {
  muscle_gain: { en: 'Build muscle', vi: 'Tăng cơ' },
  fat_loss: { en: 'Lose fat', vi: 'Giảm mỡ' },
  strength: { en: 'Build strength', vi: 'Tăng sức mạnh' },
  endurance: { en: 'Improve endurance', vi: 'Tăng sức bền' },
  mobility: { en: 'Improve mobility', vi: 'Cải thiện vận động' },
  general: { en: 'General fitness', vi: 'Sức khỏe tổng thể' },
};

export function PersonalProfilePage() {
  const { copy, isVi } = useProfileCopy();
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
        : readiness.level === 'pt_review'
          ? copy.ptReview
          : copy.medicalReview;
  const info = [
    [copy.fullName, name],
    [copy.email, user?.email ?? copy.noData],
    [copy.phone, contact.phone || copy.noData],
    [copy.address, contact.address || copy.noData],
  ];
  const fitnessInfo = [
    [copy.height, fitness.identity.heightCm ? `${fitness.identity.heightCm} cm` : copy.noData],
    [copy.weight, fitness.identity.weightKg ? `${fitness.identity.weightKg} kg` : copy.noData],
    [copy.goal, goalNames[fitness.goals.primary]?.[isVi ? 'vi' : 'en'] ?? copy.noData],
    [copy.experience, fitness.training.experience || copy.noData],
    [
      copy.available,
      fitness.training.availableDays.length
        ? `${fitness.training.availableDays.length} ${isVi ? 'ngày/tuần' : 'days/week'}`
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
          <span>MEMBER // TIER 1</span>
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
            ? isVi
              ? 'Hoàn thành thông tin sức khỏe để AI và PT có đủ dữ liệu.'
              : 'Complete the health profile so AI and your Trainer have enough data.'
            : readiness.level === 'ready'
              ? isVi
                ? 'Dữ liệu sẵn sàng cho AI và PT.'
                : 'Data is ready for AI and your Trainer.'
              : isVi
                ? 'Hãy kiểm tra trạng thái trước khi tăng cường độ.'
                : 'Review the status before increasing intensity.'}
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
  const { copy, isVi } = useProfileCopy();
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
              <dd>Member</dd>
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
                  <button type="button" aria-label="toggle password" onClick={() => setShow(!show)}>
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
              {isVi ? 'Đổi mật khẩu: ' : 'Password changed: '}
              {formatDate(security.lastPasswordChangedAt, isVi)}
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
  const { copy, isVi } = useProfileCopy();
  const pending = useAssessmentStore((state) => state.assessments);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const records = useMemo(
    () =>
      [
        ...completedAssessments.map((record) => ({
          ...record,
          name: record.exerciseName[isVi ? 'vi' : 'en'],
        })),
        ...pending.map((record) => ({ ...record, name: record.exerciseId.replaceAll('-', ' ') })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [pending, isVi],
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
                <small>{formatDate(record.createdAt, isVi, true)}</small>
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
  const { copy, isVi } = useProfileCopy();
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
              <dd>{formatDate(pending.createdAt, isVi, true)}</dd>
            </div>
            <div>
              <dt>File</dt>
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
                    <h3>{finding.title[isVi ? 'vi' : 'en']}</h3>
                    <p>{finding.feedback[isVi ? 'vi' : 'en']}</p>
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
  const { copy, isVi } = useProfileCopy();
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
                  {new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-US', { month: 'short' }).format(
                    new Date(item.startsAt),
                  )}
                </span>
              </time>
              <div>
                <strong>{copy.appointmentTypes[item.type]}</strong>
                <span>{item.trainerName}</span>
                <small>{formatDate(item.startsAt, isVi, true)}</small>
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
            <span>TRAINER</span>
            <h2>{appointment.trainerName}</h2>
            <p>{appointment.note[isVi ? 'vi' : 'en']}</p>
            <dl>
              <div>
                <dt>
                  <CalendarDays size={16} />
                  {copy.appointments}
                </dt>
                <dd>{formatDate(appointment.startsAt, isVi, true)}</dd>
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
                <dd>{appointment.location[isVi ? 'vi' : 'en']}</dd>
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
  const { copy, isVi } = useProfileCopy();
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
                {device.lastSyncedAt ? formatDate(device.lastSyncedAt, isVi, true) : copy.never}
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
  const { copy, isVi } = useProfileCopy();
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
                <strong>{item.title[isVi ? 'vi' : 'en']}</strong>
                <p>{item.body[isVi ? 'vi' : 'en']}</p>
                <small>{formatDate(item.createdAt, isVi, true)}</small>
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
