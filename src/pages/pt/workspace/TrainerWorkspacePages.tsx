import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Dumbbell,
  Eye,
  Filter,
  History,
  Mail,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  UsersRound,
  Video,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { TrainerExerciseArtwork, TrainerExercisePreviewDialog } from './TrainerExerciseMedia';
import {
  getTrainerExercise,
  getTrainerMember,
  trainerExercises,
  trainerMembers,
  useTrainerWorkspaceStore,
  weekdays,
  type TrainerAppointment,
  type TrainerExercise,
  type TrainerPlanExercise,
  type TrainerWeekday,
} from './useTrainerWorkspaceStore';

import {
  isMuscleRelated,
  MUSCLES,
  type MuscleId,
} from '@/features/member-workout-builder/model/muscleMapData';
import { MaleAnatomyMuscleMap } from '@/features/member-workout-builder/ui/MaleAnatomyMuscleMap';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

export { TrainerExerciseLibraryPage } from './TrainerExerciseLibraryPage';

import './trainer-workspace.css';

const dayLabels = {
  en: {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  },
  vi: {
    monday: 'T2',
    tuesday: 'T3',
    wednesday: 'T4',
    thursday: 'T5',
    friday: 'T6',
    saturday: 'T7',
    sunday: 'CN',
  },
} as const;

const trainerMuscleIds: Partial<Record<string, MuscleId>> = {
  Chest: 'chest',
  Back: 'latissimus_dorsi',
  Quadriceps: 'quadriceps',
  Hamstrings: 'hamstrings',
  Core: 'rectus_abdominis',
};

function useWorkspaceLanguage() {
  const { i18n } = useTranslation();
  return i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
}

function MemberSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (memberId: string) => void;
}) {
  return (
    <label className="trainer-member-select">
      <UsersRound size={16} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Select member"
      >
        {trainerMembers.map((member) => (
          <option value={member.id} key={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function MemberAvatar({ name, source }: { name: string; source?: string }) {
  return (
    <span className="trainer-member-avatar">
      {source ? (
        <img src={source} alt={`${name} portrait`} />
      ) : (
        name
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
      )}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    on_track: 'On track',
    attention: 'Needs review',
    paused: 'Paused',
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    active: 'Active',
  };
  return <span className={cn('trainer-status', `is-${status}`)}>{labels[status] ?? status}</span>;
}

function MiniLineChart({
  values,
  label,
  suffix = '',
}: {
  values: number[];
  label: string;
  suffix?: string;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 100},${88 - ((value - min) / Math.max(max - min, 1)) * 68}`,
    )
    .join(' ');
  return (
    <div className="trainer-chart">
      <div>
        <span>{label}</span>
        <strong>
          {values.at(-1)?.toLocaleString()}
          {suffix}
        </strong>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={label}>
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} />
        ))}
        <polyline points={points} />
        {values.map((value, index) => (
          <circle
            key={`${value}-${index}`}
            cx={(index / (values.length - 1)) * 100}
            cy={88 - ((value - min) / Math.max(max - min, 1)) * 68}
            r="1.8"
          />
        ))}
      </svg>
      <footer>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </footer>
    </div>
  );
}

export function TrainerDashboardPage() {
  const lang = useWorkspaceLanguage();
  const selectedMemberId = useTrainerWorkspaceStore((state) => state.selectedMemberId);
  const setSelectedMember = useTrainerWorkspaceStore((state) => state.setSelectedMember);
  const appointments = useTrainerWorkspaceStore((state) => state.appointments);
  const member = getTrainerMember(selectedMemberId) ?? trainerMembers[0]!;
  const completion = Math.round((member.completed / member.planned) * 100);
  const copy =
    lang === 'vi'
      ? {
          eyebrow: 'TRAINER COMMAND / DASHBOARD',
          title: 'Trung tâm coaching',
          members: 'Member quản lý',
          sessions: 'Buổi sắp tới',
          completion: 'Tỷ lệ hoàn thành',
          review: 'Cần xem lại',
          performance: 'Hiệu suất Member',
          calorie: 'Calories trung bình',
          load: 'Training load',
          video: 'AI phát hiện lỗi động tác',
          issue: 'Lưng dưới mất vị trí trung lập ở rep 6',
          view: 'Xem video',
          today: 'Lịch hôm nay',
        }
      : {
          eyebrow: 'TRAINER COMMAND / DASHBOARD',
          title: 'Coaching command center',
          members: 'Managed Members',
          sessions: 'Upcoming sessions',
          completion: 'Completion rate',
          review: 'Needs review',
          performance: 'Member performance',
          calorie: 'Average calories',
          load: 'Training load',
          video: 'AI form issue detected',
          issue: 'Lower back lost neutral position at rep 6',
          view: 'View video',
          today: "Today's schedule",
        };
  return (
    <div className="trainer-workspace-page">
      <div className="trainer-context-tools">
        <MemberSelect value={selectedMemberId} onChange={setSelectedMember} />
      </div>
      <section className="trainer-metric-grid">
        <article>
          <UsersRound />
          <span>{copy.members}</span>
          <strong>{trainerMembers.length}</strong>
        </article>
        <article>
          <CalendarDays />
          <span>{copy.sessions}</span>
          <strong>{appointments.filter((item) => item.status !== 'completed').length}</strong>
        </article>
        <article>
          <Activity />
          <span>{copy.completion}</span>
          <strong>{completion}%</strong>
        </article>
        <article>
          <Sparkles />
          <span>{copy.review}</span>
          <strong>{trainerMembers.filter((item) => item.status === 'attention').length}</strong>
        </article>
      </section>
      <section className="trainer-dashboard-grid">
        <div className="trainer-panel trainer-performance-panel">
          <div className="trainer-panel-heading">
            <div>
              <span>MEMBER DATA / 7 DAYS</span>
              <h2>{copy.performance}</h2>
            </div>
            <StatusBadge status={member.status} />
          </div>
          <div className="trainer-chart-grid">
            <MiniLineChart values={member.calories} label={copy.calorie} suffix=" kcal" />
            <MiniLineChart values={member.loads} label={copy.load} suffix=" kg" />
          </div>
          <div className="trainer-member-strip">
            <MemberAvatar name={member.name} />
            <div>
              <strong>{member.name}</strong>
              <span>
                {member.goal} · {member.experience}
              </span>
            </div>
            <Link to={ROUTES.pt.memberWorkout}>
              <Dumbbell size={15} /> {lang === 'vi' ? 'Mở lịch tập' : 'Open workout'}
            </Link>
          </div>
        </div>
        <aside className="trainer-dashboard-side">
          <section className="trainer-panel trainer-ai-alert">
            <Video />
            <span>AI REVIEW / 02:14</span>
            <h2>{copy.video}</h2>
            <p>{copy.issue}</p>
            <button type="button">
              <Play size={14} />
              {copy.view}
            </button>
          </section>
          <section className="trainer-panel trainer-priority-panel">
            <div className="trainer-panel-heading">
              <div>
                <span>SCHEDULE</span>
                <h2>{copy.today}</h2>
              </div>
            </div>
            <div className="trainer-agenda">
              {appointments.slice(0, 3).map((item) => {
                const current = getTrainerMember(item.memberId);
                return (
                  <article key={item.id}>
                    <time>{item.time}</time>
                    <div>
                      <strong>{current?.name}</strong>
                      <span>
                        {item.type} · {item.duration} min
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                  </article>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export function TrainerMembersPage() {
  const lang = useWorkspaceLanguage();
  const navigate = useNavigate();
  const loadMemberPlan = useTrainerWorkspaceStore((state) => state.loadMemberPlan);
  const [search, setSearch] = useState('');
  const [goal, setGoal] = useState('all');
  const [status, setStatus] = useState('all');
  const [experience, setExperience] = useState('all');
  const filtered = trainerMembers.filter(
    (member) =>
      `${member.name} ${member.email}`.toLowerCase().includes(search.toLowerCase()) &&
      (goal === 'all' || member.goal === goal) &&
      (status === 'all' || member.status === status) &&
      (experience === 'all' || member.experience === experience),
  );
  const openWorkout = (memberId: string) => {
    loadMemberPlan(memberId);
    void navigate(ROUTES.pt.memberWorkout);
  };
  const openDetail = (memberId: string) => {
    void navigate(ROUTES.pt.memberDetailPath(memberId));
  };
  return (
    <div className="trainer-workspace-page">
      <section className="trainer-filter-panel">
        <label className="trainer-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={lang === 'vi' ? 'Tìm tên hoặc email' : 'Search name or email'}
          />
        </label>
        <label>
          <Filter size={15} />
          <select value={goal} onChange={(event) => setGoal(event.target.value)} aria-label="Goal">
            <option value="all">All goals</option>
            {[...new Set(trainerMembers.map((item) => item.goal))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Workout status"
          >
            <option value="all">All statuses</option>
            <option value="on_track">On track</option>
            <option value="attention">Needs review</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <label>
          <select
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            aria-label="Experience"
          >
            <option value="all">All experience</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
      </section>
      <div className="trainer-member-grid">
        {filtered.map((member) => (
          <article className="trainer-member-card" key={member.id}>
            <div className="trainer-member-card__portrait">
              <img src={member.portraitUrl} alt={`${member.name} membership portrait`} />
              <StatusBadge status={member.status} />
              <span>{member.membershipCode}</span>
            </div>
            <div className="trainer-member-card__content">
              <header>
                <div>
                  <h2>{member.name}</h2>
                  <span>
                    <Mail size={12} />
                    {member.email}
                  </span>
                </div>
              </header>
              <div className="trainer-member-card__goal">
                <span>{lang === 'vi' ? 'Mục tiêu chính' : 'Primary goal'}</span>
                <strong>{member.goal}</strong>
              </div>
              <dl>
                <div>
                  <dt>{lang === 'vi' ? 'Cơ thể' : 'Body'}</dt>
                  <dd>
                    {member.height} cm · {member.weight} kg
                  </dd>
                </div>
                <div>
                  <dt>{lang === 'vi' ? 'Kinh nghiệm' : 'Experience'}</dt>
                  <dd>{member.experience}</dd>
                </div>
                <div>
                  <dt>{lang === 'vi' ? 'Hoàn thành' : 'Completion'}</dt>
                  <dd>{Math.round((member.completed / member.planned) * 100)}%</dd>
                </div>
              </dl>
              <footer>
                <button
                  type="button"
                  className="is-secondary"
                  onClick={() => openDetail(member.id)}
                >
                  <Eye size={14} />
                  {lang === 'vi' ? 'Xem hồ sơ' : 'View detail'}
                </button>
                <button type="button" onClick={() => openWorkout(member.id)}>
                  {lang === 'vi' ? 'Xem lịch tập' : 'View workout'}
                  <ArrowRight size={15} />
                </button>
              </footer>
            </div>
          </article>
        ))}
      </div>
      <footer className="trainer-pagination">
        <span>
          {filtered.length} {lang === 'vi' ? 'Member' : 'Members'}
        </span>
        <div>
          <button type="button" disabled>
            <ArrowLeft size={14} />
          </button>
          <button type="button" className="is-active">
            1
          </button>
          <button type="button" disabled>
            <ArrowRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}

function ReadonlyList({ items, empty }: { items: string[]; empty: string }) {
  return (
    <ul className="trainer-member-detail-list">
      {(items.length ? items : [empty]).map((item) => (
        <li key={item}>
          <Check aria-hidden="true" size={13} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function TrainerMemberDetailPage() {
  const lang = useWorkspaceLanguage();
  const navigate = useNavigate();
  const { memberId } = useParams();
  const loadMemberPlan = useTrainerWorkspaceStore((state) => state.loadMemberPlan);
  const member = getTrainerMember(memberId ?? '');

  if (!member) {
    return (
      <div className="trainer-workspace-page">
        <div className="trainer-empty trainer-member-detail-empty">
          <UsersRound aria-hidden="true" />
          <strong>{lang === 'vi' ? 'Không tìm thấy Member' : 'Member not found'}</strong>
          <button type="button" onClick={() => navigate(ROUTES.pt.members)}>
            {lang === 'vi' ? 'Về danh sách' : 'Back to Members'}
          </button>
        </div>
      </div>
    );
  }

  const bmi = member.weight / (member.height / 100) ** 2;
  const openWorkout = () => {
    loadMemberPlan(member.id);
    void navigate(ROUTES.pt.memberWorkout);
  };

  return (
    <div className="trainer-workspace-page trainer-member-detail-page">
      <div className="trainer-context-tools is-between">
        <button className="trainer-detail-back" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} />
          {lang === 'vi' ? 'Danh sách Member' : 'Member list'}
        </button>
        <button className="trainer-primary-action" type="button" onClick={openWorkout}>
          <Dumbbell size={15} />
          {lang === 'vi' ? 'Xem lịch tập' : 'View workout'}
        </button>
      </div>

      <section className="trainer-member-detail-hero">
        <div className="trainer-member-detail-portrait">
          <img src={member.portraitUrl} alt={`${member.name} membership portrait`} />
        </div>
        <div className="trainer-member-detail-identity">
          <StatusBadge status={member.status} />
          <h1>{member.name}</h1>
          <p>
            {member.membershipCode} · {member.email} · {member.phone}
          </p>
          <div>
            <span>{member.goal}</span>
            <span>{member.experience}</span>
            <span>
              {lang === 'vi' ? 'Tham gia' : 'Joined'} {member.joinedAt}
            </span>
          </div>
        </div>
        <dl className="trainer-member-vitals">
          <div>
            <dt>{lang === 'vi' ? 'Tuổi' : 'Age'}</dt>
            <dd>{member.age}</dd>
          </div>
          <div>
            <dt>{lang === 'vi' ? 'Chiều cao' : 'Height'}</dt>
            <dd>{member.height} cm</dd>
          </div>
          <div>
            <dt>{lang === 'vi' ? 'Cân nặng' : 'Weight'}</dt>
            <dd>{member.weight} kg</dd>
          </div>
          <div>
            <dt>BMI</dt>
            <dd>{bmi.toFixed(1)}</dd>
          </div>
          <div>
            <dt>{lang === 'vi' ? 'Mỡ cơ thể' : 'Body fat'}</dt>
            <dd>{member.bodyFat}%</dd>
          </div>
        </dl>
      </section>

      <div className="trainer-member-detail-layout">
        <main>
          <section className="trainer-member-detail-section is-accent">
            <header>
              <span>{lang === 'vi' ? 'Mục tiêu tập luyện' : 'Training goals'}</span>
              <strong>{member.goal}</strong>
            </header>
            <ReadonlyList
              items={member.secondaryGoals}
              empty={lang === 'vi' ? 'Chưa có mục tiêu phụ' : 'No secondary goals'}
            />
          </section>
          <section className="trainer-member-detail-section">
            <header>
              <span>{lang === 'vi' ? 'Bệnh lý và sức khỏe' : 'Medical conditions'}</span>
            </header>
            <ReadonlyList
              items={member.medicalConditions}
              empty={lang === 'vi' ? 'Không ghi nhận' : 'None reported'}
            />
          </section>
          <section className="trainer-member-detail-section">
            <header>
              <span>{lang === 'vi' ? 'Chấn thương' : 'Injury history'}</span>
            </header>
            <ReadonlyList
              items={member.injuries}
              empty={lang === 'vi' ? 'Không ghi nhận' : 'None reported'}
            />
          </section>
          <section className="trainer-member-detail-section">
            <header>
              <span>{lang === 'vi' ? 'Giới hạn khi tập' : 'Training limitations'}</span>
            </header>
            <ReadonlyList
              items={member.trainingLimitations}
              empty={lang === 'vi' ? 'Không có giới hạn' : 'No limitations'}
            />
          </section>
        </main>
        <aside>
          <section className="trainer-member-detail-section">
            <header>
              <span>{lang === 'vi' ? 'Thuốc đang sử dụng' : 'Medication'}</span>
            </header>
            <ReadonlyList
              items={member.medications}
              empty={lang === 'vi' ? 'Không ghi nhận' : 'None reported'}
            />
          </section>
          <section className="trainer-member-detail-section trainer-member-lifestyle">
            <header>
              <span>{lang === 'vi' ? 'Lối sống và dinh dưỡng' : 'Lifestyle and nutrition'}</span>
            </header>
            <dl>
              <div>
                <dt>{lang === 'vi' ? 'Mức vận động' : 'Activity level'}</dt>
                <dd>{member.activityLevel}</dd>
              </div>
              <div>
                <dt>{lang === 'vi' ? 'Giấc ngủ' : 'Sleep'}</dt>
                <dd>{member.sleepHours} h/night</dd>
              </div>
              <div>
                <dt>{lang === 'vi' ? 'Dinh dưỡng' : 'Dietary notes'}</dt>
                <dd>{member.dietaryNotes}</dd>
              </div>
            </dl>
          </section>
          <section className="trainer-member-detail-section">
            <header>
              <span>{lang === 'vi' ? 'Liên hệ khẩn cấp' : 'Emergency contact'}</span>
            </header>
            <p>{member.emergencyContact}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function TrainerMemberDataPage() {
  const selectedMemberId = useTrainerWorkspaceStore((state) => state.selectedMemberId);
  const setSelectedMember = useTrainerWorkspaceStore((state) => state.setSelectedMember);
  const member = getTrainerMember(selectedMemberId) ?? trainerMembers[0]!;
  return (
    <div className="trainer-workspace-page">
      <div className="trainer-context-tools">
        <MemberSelect value={selectedMemberId} onChange={setSelectedMember} />
      </div>
      <section className="trainer-metric-grid">
        <article>
          <ClipboardList />
          <span>Planned workouts</span>
          <strong>{member.planned}</strong>
        </article>
        <article>
          <Check />
          <span>Completed</span>
          <strong>{member.completed}</strong>
        </article>
        <article>
          <Activity />
          <span>Completion rate</span>
          <strong>{Math.round((member.completed / member.planned) * 100)}%</strong>
        </article>
        <article>
          <Dumbbell />
          <span>Current weight</span>
          <strong>{member.weight} kg</strong>
        </article>
      </section>
      <div className="trainer-chart-grid is-dashboard">
        <MiniLineChart values={member.calories} label="Calories" suffix=" kcal" />
        <MiniLineChart values={member.loads} label="Training load" suffix=" kg" />
        <MiniLineChart values={member.weights} label="Body weight" suffix=" kg" />
      </div>
      <section className="trainer-panel trainer-video-review">
        <div className="trainer-video-thumb">
          <Play size={25} />
        </div>
        <div>
          <span>AI ERROR VIDEO / 2026-09-24 · 02:14</span>
          <h2>Barbell Back Squat</h2>
          <p>AI detected excessive forward trunk lean during the final two repetitions.</p>
        </div>
        <button type="button">
          <Eye size={15} />
          View video
        </button>
      </section>
    </div>
  );
}

function PrescriptionFields({
  exercise,
  update,
}: {
  exercise: TrainerPlanExercise;
  update: (patch: Partial<TrainerPlanExercise>) => void;
}) {
  const catalog = getTrainerExercise(exercise.exerciseId);
  const numberField = (label: string, key: keyof TrainerPlanExercise, value: number) => (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => update({ [key]: Number(event.target.value) })}
      />
    </label>
  );
  if (catalog?.trackingType === 'duration')
    return (
      <div className="trainer-prescription-grid">
        {numberField('Duration (sec)', 'duration', exercise.duration)}
        {numberField('Rest (sec)', 'rest', exercise.rest)}
      </div>
    );
  if (catalog?.trackingType === 'distance')
    return (
      <div className="trainer-prescription-grid">
        {numberField('Distance (km)', 'distance', exercise.distance)}
        {numberField('Duration (sec)', 'duration', exercise.duration)}
      </div>
    );
  if (catalog?.trackingType === 'interval')
    return (
      <div className="trainer-prescription-grid">
        {numberField('Rounds', 'rounds', exercise.rounds)}
        {numberField('Work (sec)', 'duration', exercise.duration)}
        {numberField('Rest (sec)', 'rest', exercise.rest)}
      </div>
    );
  return (
    <div className="trainer-prescription-grid">
      {numberField('Sets', 'sets', exercise.sets)}
      {numberField('Reps', 'reps', exercise.reps)}
      {numberField('Load (kg)', 'load', exercise.load)}
      {numberField('Rest (sec)', 'rest', exercise.rest)}
    </div>
  );
}

export function TrainerPlanBuilderPage() {
  const lang = useWorkspaceLanguage();
  const selectedMemberId = useTrainerWorkspaceStore((state) => state.selectedMemberId);
  const draftName = useTrainerWorkspaceStore((state) => state.draftName);
  const draftWeek = useTrainerWorkspaceStore((state) => state.draftWeek);
  const exercises = useTrainerWorkspaceStore((state) => state.draftExercises);
  const loadMemberPlan = useTrainerWorkspaceStore((state) => state.loadMemberPlan);
  const setDraftMeta = useTrainerWorkspaceStore((state) => state.setDraftMeta);
  const addExercise = useTrainerWorkspaceStore((state) => state.addDraftExercise);
  const updateExercise = useTrainerWorkspaceStore((state) => state.updateDraftExercise);
  const removeExercise = useTrainerWorkspaceStore((state) => state.removeDraftExercise);
  const moveExercise = useTrainerWorkspaceStore((state) => state.moveDraftExercise);
  const savePlan = useTrainerWorkspaceStore((state) => state.saveDraftPlan);
  const [selectedDays, setSelectedDays] = useState<TrainerWeekday[]>(['monday']);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleId | null>(null);
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [preview, setPreview] = useState<TrainerExercise | null>(null);
  const visible = useMemo(
    () => exercises.filter((exercise) => selectedDays.includes(exercise.day)),
    [exercises, selectedDays],
  );
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const selectedMuscleName = selectedMuscle
    ? Object.entries(trainerMuscleIds).find(
        ([, muscleId]) => muscleId && isMuscleRelated(selectedMuscle, muscleId),
      )?.[0]
    : undefined;
  const effectiveMuscleFilter = selectedMuscle
    ? (selectedMuscleName ?? '__unmapped__')
    : muscleFilter;
  const filteredExercises = trainerExercises.filter((exercise) => {
    const query = exerciseQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      exercise.name.toLowerCase().includes(query) ||
      exercise.equipment.toLowerCase().includes(query);
    const matchesMuscle =
      effectiveMuscleFilter === 'all' || exercise.muscle === effectiveMuscleFilter;
    return matchesQuery && matchesMuscle;
  });
  const activeMuscles = useMemo(
    () =>
      new Set<MuscleId>(
        visible
          .map(
            (exercise) => trainerMuscleIds[getTrainerExercise(exercise.exerciseId)?.muscle ?? ''],
          )
          .filter((muscle): muscle is MuscleId => Boolean(muscle)),
      ),
    [visible],
  );
  const muscleVolume = useMemo(
    () =>
      visible.reduce<Partial<Record<MuscleId, number>>>((volumes, exercise) => {
        const muscleId = trainerMuscleIds[getTrainerExercise(exercise.exerciseId)?.muscle ?? ''];
        if (muscleId) volumes[muscleId] = (volumes[muscleId] ?? 0) + exercise.sets;
        return volumes;
      }, {}),
    [visible],
  );
  const handleAddExercise = (exerciseId: string) => {
    const availableDays = selectedDays.filter(
      (selectedDay) =>
        !exercises.some(
          (exercise) => exercise.exerciseId === exerciseId && exercise.day === selectedDay,
        ),
    );
    if (availableDays.length === 0) {
      toast.error(
        lang === 'vi'
          ? 'Bài tập này đã có trong tất cả ngày đang chọn.'
          : 'This exercise is already scheduled for every selected day.',
      );
      return;
    }
    availableDays.forEach((selectedDay) => addExercise(exerciseId, selectedDay));
    const skipped = selectedDays.length - availableDays.length;
    toast.success(
      lang === 'vi'
        ? `Đã thêm vào ${availableDays.length} ngày${skipped ? `, bỏ qua ${skipped} ngày bị trùng` : ''}.`
        : `Added to ${availableDays.length} day${availableDays.length > 1 ? 's' : ''}${skipped ? `; skipped ${skipped} duplicate${skipped > 1 ? 's' : ''}` : ''}.`,
    );
  };

  const toggleSelectedDay = (weekday: TrainerWeekday) => {
    setSelectedDays((current) => {
      if (!current.includes(weekday)) return [...current, weekday];
      if (current.length === 1) {
        toast.error(
          lang === 'vi' ? 'Hãy giữ lại ít nhất một ngày.' : 'Keep at least one day selected.',
        );
        return current;
      }
      return current.filter((day) => day !== weekday);
    });
  };

  const handleDayChange = (uid: string, exerciseId: string, nextDay: TrainerWeekday) => {
    const duplicate = exercises.some(
      (exercise) =>
        exercise.uid !== uid && exercise.exerciseId === exerciseId && exercise.day === nextDay,
    );
    if (duplicate) {
      toast.error(
        lang === 'vi'
          ? `Bài tập này đã có trong ${dayLabels.vi[nextDay]}.`
          : `This exercise is already scheduled for ${dayLabels.en[nextDay]}.`,
      );
      return;
    }
    updateExercise(uid, { day: nextDay });
  };
  return (
    <div className="trainer-workspace-page is-wide">
      <section className="trainer-builder-toolbar">
        <MemberSelect value={selectedMemberId} onChange={loadMemberPlan} />
        <label>
          <span>Plan name</span>
          <input
            value={draftName}
            onChange={(event) => setDraftMeta({ name: event.target.value })}
          />
        </label>
        <label>
          <span>Week</span>
          <input
            type="number"
            min="1"
            max="52"
            value={draftWeek}
            onChange={(event) => setDraftMeta({ week: Number(event.target.value) })}
          />
        </label>
        <button
          className="trainer-primary-action"
          type="button"
          onClick={() => {
            savePlan();
            toast.success(lang === 'vi' ? 'Đã lưu kế hoạch.' : 'Plan saved.');
          }}
        >
          <Save size={15} />
          {lang === 'vi' ? 'Lưu kế hoạch' : 'Save plan'}
        </button>
      </section>
      <div className="trainer-day-tabs">
        {weekdays.map((weekday) => (
          <button
            type="button"
            className={cn(selectedDays.includes(weekday) && 'is-active')}
            key={weekday}
            onClick={() => toggleSelectedDay(weekday)}
            aria-pressed={selectedDays.includes(weekday)}
          >
            {dayLabels[lang][weekday]}
          </button>
        ))}
      </div>
      <div className="trainer-builder-layout">
        <aside className="trainer-builder-library-panel">
          <header>
            <div>
              <span>EXERCISE LIBRARY</span>
              <strong>{trainerExercises.length}</strong>
            </div>
            <small>
              {selectedDays.map((selectedDay) => dayLabels[lang][selectedDay]).join(' · ')}
            </small>
          </header>
          <label className="trainer-builder-search">
            <Search aria-hidden="true" size={15} />
            <input
              value={exerciseQuery}
              onChange={(event) => setExerciseQuery(event.target.value)}
              placeholder={lang === 'vi' ? 'Tìm bài tập' : 'Search exercises'}
              aria-label={lang === 'vi' ? 'Tìm bài tập' : 'Search exercises'}
            />
          </label>
          <label className="trainer-builder-filter">
            <Filter aria-hidden="true" size={14} />
            <select
              value={selectedMuscle ? (selectedMuscleName ?? 'all') : muscleFilter}
              onChange={(event) => {
                setSelectedMuscle(null);
                setMuscleFilter(event.target.value);
              }}
              aria-label={lang === 'vi' ? 'Lọc nhóm cơ' : 'Filter muscle group'}
            >
              <option value="all">{lang === 'vi' ? 'Tất cả nhóm cơ' : 'All muscle groups'}</option>
              {[...new Set(trainerExercises.map((exercise) => exercise.muscle))].map((muscle) => (
                <option value={muscle} key={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </label>
          <div className="trainer-builder-library-list">
            {filteredExercises.map((exercise) => {
              const scheduledDays = selectedDays.filter((selectedDay) =>
                exercises.some(
                  (item) => item.exerciseId === exercise.id && item.day === selectedDay,
                ),
              );
              const isScheduled = scheduledDays.length === selectedDays.length;
              return (
                <article key={exercise.id} className={cn(isScheduled && 'is-scheduled')}>
                  <button
                    type="button"
                    className="trainer-builder-exercise-mark"
                    onClick={() => setPreview(exercise)}
                    aria-label={`${lang === 'vi' ? 'Xem video' : 'View video'} ${exercise.name}`}
                  >
                    <TrainerExerciseArtwork exercise={exercise} compact />
                  </button>
                  <div>
                    <strong>{exercise.name}</strong>
                    <span>
                      {exercise.equipment} · {exercise.muscle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddExercise(exercise.id)}
                    aria-label={
                      isScheduled
                        ? `${exercise.name} scheduled for every selected day`
                        : `Add ${exercise.name}`
                    }
                    className={cn(isScheduled && 'is-scheduled')}
                  >
                    {isScheduled ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </article>
              );
            })}
            {filteredExercises.length === 0 && (
              <div className="trainer-builder-library-empty">
                {lang === 'vi' ? 'Không tìm thấy bài tập.' : 'No exercises found.'}
              </div>
            )}
          </div>
        </aside>
        <section className="trainer-builder-canvas">
          <header>
            <div>
              <span>
                {selectedDays.map((selectedDay) => dayLabels[lang][selectedDay]).join(' · ')} / WEEK{' '}
                {draftWeek}
              </span>
              <h2>{draftName}</h2>
            </div>
            <em>
              {visible.length} exercises · {selectedDays.length} days
            </em>
          </header>
          {visible.length === 0 ? (
            <div className="trainer-empty">
              <Dumbbell />
              <strong>No exercises for this day</strong>
            </div>
          ) : (
            visible.map((exercise, index) => {
              const catalog = getTrainerExercise(exercise.exerciseId);
              return (
                <article className="trainer-plan-exercise" key={exercise.uid}>
                  <header>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{catalog?.name}</h3>
                      <p>
                        {catalog?.muscle} · {catalog?.trackingType}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => moveExercise(exercise.uid, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${catalog?.name ?? 'exercise'} up`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExercise(exercise.uid, 1)}
                        disabled={index === visible.length - 1}
                        aria-label={`Move ${catalog?.name ?? 'exercise'} down`}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.uid)}
                        aria-label={`Remove ${catalog?.name ?? 'exercise'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </header>
                  <label className="trainer-day-select">
                    <span>Training day</span>
                    <select
                      value={exercise.day}
                      onChange={(event) =>
                        handleDayChange(
                          exercise.uid,
                          exercise.exerciseId,
                          event.target.value as TrainerWeekday,
                        )
                      }
                    >
                      {weekdays.map((weekday) => (
                        <option value={weekday} key={weekday}>
                          {dayLabels[lang][weekday]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <PrescriptionFields
                    exercise={exercise}
                    update={(patch) => updateExercise(exercise.uid, patch)}
                  />
                </article>
              );
            })
          )}
        </section>
        <aside className="trainer-builder-side">
          <section className="trainer-panel trainer-live-map">
            <div className="trainer-live-map__header">
              <span>LIVE MUSCLE MAP</span>
              <span className="muscle-map__gender">{lang === 'vi' ? 'Nam' : 'Male'}</span>
            </div>
            <MaleAnatomyMuscleMap
              selected={selectedMuscle}
              activeMuscles={activeMuscles}
              volumeByMuscle={muscleVolume}
              locale={lang}
              label={(muscle) => MUSCLES[muscle].name[lang]}
              onSelect={(muscle) => {
                setMuscleFilter('all');
                setSelectedMuscle((current) => (current === muscle ? null : muscle));
              }}
            />
            {selectedMuscle && (
              <div className="trainer-live-map__selection" role="status">
                <strong>{MUSCLES[selectedMuscle].name[lang]}</strong>
                <span>
                  {filteredExercises.length} {lang === 'vi' ? 'bài tập' : 'exercises'}
                </span>
                <button
                  type="button"
                  onPointerDown={() => {
                    setSelectedMuscle(null);
                    setMuscleFilter('all');
                  }}
                  onClick={() => {
                    setSelectedMuscle(null);
                    setMuscleFilter('all');
                  }}
                >
                  {lang === 'vi' ? 'Xóa lọc' : 'Clear'}
                </button>
              </div>
            )}
          </section>
          <section className="trainer-panel trainer-summary">
            <span>WORKOUT SUMMARY</span>
            <dl>
              <div>
                <dt>Exercises</dt>
                <dd>{exercises.length}</dd>
              </div>
              <div>
                <dt>Total sets</dt>
                <dd>{totalSets}</dd>
              </div>
              <div>
                <dt>Est. duration</dt>
                <dd>~{Math.max(20, exercises.length * 8)} min</dd>
              </div>
            </dl>
            <h3>Volume by muscle</h3>
            {[
              ...new Set(
                exercises
                  .map((exercise) => getTrainerExercise(exercise.exerciseId)?.muscle)
                  .filter(Boolean),
              ),
            ].map((muscle) => (
              <div className="trainer-volume" key={muscle}>
                <span>{muscle}</span>
                <i>
                  <b
                    style={{
                      width: `${Math.min(100, 28 + exercises.filter((exercise) => getTrainerExercise(exercise.exerciseId)?.muscle === muscle).length * 24)}%`,
                    }}
                  />
                </i>
              </div>
            ))}
          </section>
        </aside>
      </div>
      <TrainerExercisePreviewDialog
        exercise={preview}
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        lang={lang}
      />
    </div>
  );
}

export function TrainerMemberWorkoutPage() {
  const lang = useWorkspaceLanguage();
  const selectedMemberId = useTrainerWorkspaceStore((state) => state.selectedMemberId);
  const plans = useTrainerWorkspaceStore((state) => state.plans);
  const loadMemberPlan = useTrainerWorkspaceStore((state) => state.loadMemberPlan);
  const update = useTrainerWorkspaceStore((state) => state.updateMemberPlanExercise);
  const [day, setDay] = useState<TrainerWeekday>('monday');
  const member = getTrainerMember(selectedMemberId) ?? trainerMembers[0]!;
  const plan = plans.find((item) => item.memberId === member.id);
  const exercises = plan?.exercises.filter((exercise) => exercise.day === day) ?? [];
  return (
    <div className="trainer-workspace-page">
      <div className="trainer-context-tools">
        <MemberSelect value={member.id} onChange={loadMemberPlan} />
      </div>
      <section className="trainer-member-hero">
        <MemberAvatar name={member.name} />
        <div>
          <h2>{member.name}</h2>
          <p>
            {plan?.name} · Week {plan?.week} · {member.age} years · {member.goal} · {member.weight}{' '}
            kg · {member.experience}
          </p>
        </div>
        <StatusBadge status={member.status} />
      </section>
      <div className="trainer-day-tabs">
        {weekdays.map((weekday) => (
          <button
            type="button"
            className={cn(day === weekday && 'is-active')}
            key={weekday}
            onClick={() => setDay(weekday)}
          >
            {dayLabels[lang][weekday]}
          </button>
        ))}
      </div>
      <section className="trainer-metric-grid is-compact">
        <article>
          <Dumbbell />
          <span>Exercises</span>
          <strong>{exercises.length}</strong>
        </article>
        <article>
          <Check />
          <span>Completed</span>
          <strong>{exercises.filter((item) => item.completed).length}</strong>
        </article>
        <article>
          <Activity />
          <span>Target load</span>
          <strong>
            {exercises
              .reduce((sum, item) => sum + item.sets * item.reps * item.load, 0)
              .toLocaleString()}{' '}
            kg
          </strong>
        </article>
        <article>
          <Activity />
          <span>Actual load</span>
          <strong>
            {exercises
              .reduce((sum, item) => sum + item.actualSets * item.actualReps * item.actualLoad, 0)
              .toLocaleString()}{' '}
            kg
          </strong>
        </article>
      </section>
      <div className="trainer-workout-list">
        {exercises.map((exercise) => {
          const catalog = getTrainerExercise(exercise.exerciseId);
          return (
            <article key={exercise.uid}>
              <div className="trainer-exercise-media">
                <Play />
              </div>
              <header>
                <div>
                  <span>{catalog?.trackingType}</span>
                  <h2>{catalog?.name}</h2>
                </div>
                <StatusBadge status={exercise.completed ? 'completed' : 'pending'} />
              </header>
              <div className="trainer-target-actual">
                <section>
                  <h3>TARGET</h3>
                  <PrescriptionFields
                    exercise={exercise}
                    update={(patch) => update(member.id, exercise.uid, patch)}
                  />
                </section>
                <section>
                  <h3>ACTUAL</h3>
                  <div className="trainer-prescription-grid">
                    <label>
                      <span>Sets</span>
                      <input
                        type="number"
                        min="0"
                        value={exercise.actualSets}
                        onChange={(event) =>
                          update(member.id, exercise.uid, {
                            actualSets: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Reps</span>
                      <input
                        type="number"
                        min="0"
                        value={exercise.actualReps}
                        onChange={(event) =>
                          update(member.id, exercise.uid, {
                            actualReps: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Load (kg)</span>
                      <input
                        type="number"
                        min="0"
                        value={exercise.actualLoad}
                        onChange={(event) =>
                          update(member.id, exercise.uid, {
                            actualLoad: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className={cn('trainer-complete-toggle', exercise.completed && 'is-complete')}
                      onClick={() =>
                        update(member.id, exercise.uid, { completed: !exercise.completed })
                      }
                    >
                      <Check size={14} />
                      {exercise.completed ? 'Completed' : 'Mark complete'}
                    </button>
                  </div>
                </section>
              </div>
            </article>
          );
        })}
      </div>
      <section className="trainer-panel trainer-history-table">
        <div className="trainer-panel-heading">
          <div>
            <span>READ ONLY</span>
            <h2>Training history</h2>
          </div>
          <History />
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Workout</th>
              <th>Exercises</th>
              <th>Completed</th>
              <th>Duration</th>
              <th>Load</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-09-22</td>
              <td>{plan?.name}</td>
              <td>4</td>
              <td>4/4</td>
              <td>52 min</td>
              <td>12,840 kg</td>
              <td>
                <StatusBadge status="completed" />
              </td>
            </tr>
            <tr>
              <td>2026-09-18</td>
              <td>{plan?.name}</td>
              <td>3</td>
              <td>3/3</td>
              <td>46 min</td>
              <td>11,920 kg</td>
              <td>
                <StatusBadge status="completed" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

const emptyAppointment = (): TrainerAppointment => ({
  id: `appt-${Date.now()}`,
  memberId: 'alex',
  type: 'In-person training',
  date: '2026-09-30',
  time: '09:00',
  duration: 60,
  status: 'pending',
  notes: '',
});

const appointmentMobileCopy = {
  en: {
    type: 'Type',
    time: 'Time',
    duration: 'Duration',
    notes: 'Notes',
    edit: 'Edit appointment',
    minutes: 'min',
  },
  vi: {
    type: 'Loại lịch',
    time: 'Thời gian',
    duration: 'Thời lượng',
    notes: 'Ghi chú',
    edit: 'Chỉnh sửa lịch hẹn',
    minutes: 'phút',
  },
} as const;

export function TrainerAppointmentsPage() {
  const lang = useWorkspaceLanguage();
  const mobileCopy = appointmentMobileCopy[lang];
  const appointments = useTrainerWorkspaceStore((state) => state.appointments);
  const saveAppointment = useTrainerWorkspaceStore((state) => state.saveAppointment);
  const [editing, setEditing] = useState<TrainerAppointment | null>(null);
  const save = () => {
    if (!editing) return;
    saveAppointment(editing);
    setEditing(null);
    toast.success(lang === 'vi' ? 'Đã lưu lịch hẹn.' : 'Appointment saved.');
  };
  return (
    <div className="trainer-workspace-page">
      <div className="trainer-context-tools">
        <button
          className="trainer-primary-action"
          type="button"
          onClick={() => setEditing(emptyAppointment())}
        >
          <Plus size={15} />
          Create appointment
        </button>
      </div>
      <section className="trainer-table-panel trainer-appointments-table" aria-label="Appointments">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  <strong>{getTrainerMember(appointment.memberId)?.name}</strong>
                </td>
                <td>{appointment.type}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.duration} min</td>
                <td>
                  <StatusBadge status={appointment.status} />
                </td>
                <td>{appointment.notes}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditing(appointment)}
                    aria-label="Edit appointment"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="trainer-appointment-mobile-list" aria-label="Appointments">
        {appointments.map((appointment) => (
          <article key={appointment.id}>
            <header>
              <div>
                <span>{getTrainerMember(appointment.memberId)?.name}</span>
                <small>{appointment.type}</small>
              </div>
              <StatusBadge status={appointment.status} />
            </header>
            <dl>
              <div>
                <dt>{mobileCopy.time}</dt>
                <dd>
                  <time dateTime={`${appointment.date}T${appointment.time}`}>
                    {appointment.date} · {appointment.time}
                  </time>
                </dd>
              </div>
              <div>
                <dt>{mobileCopy.duration}</dt>
                <dd>
                  {appointment.duration} {mobileCopy.minutes}
                </dd>
              </div>
            </dl>
            {appointment.notes ? (
              <p>
                <span>{mobileCopy.notes}</span>
                {appointment.notes}
              </p>
            ) : null}
            <button
              type="button"
              className="trainer-appointment-mobile-edit"
              onClick={() => setEditing(appointment)}
              aria-label={mobileCopy.edit}
            >
              <Pencil size={14} />
              {mobileCopy.edit}
            </button>
          </article>
        ))}
      </section>
      {editing && (
        <div className="trainer-modal-backdrop" role="presentation">
          <section
            className="trainer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-title"
          >
            <header>
              <div>
                <span>APPOINTMENT</span>
                <h2 id="appointment-title">
                  {appointments.some((item) => item.id === editing.id)
                    ? 'Update appointment'
                    : 'Create appointment'}
                </h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X />
              </button>
            </header>
            <div className="trainer-modal-grid">
              <label>
                <span>Member</span>
                <select
                  value={editing.memberId}
                  onChange={(event) => setEditing({ ...editing, memberId: event.target.value })}
                >
                  {trainerMembers.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Appointment type</span>
                <select
                  value={editing.type}
                  onChange={(event) => setEditing({ ...editing, type: event.target.value })}
                >
                  <option>In-person training</option>
                  <option>Video check-in</option>
                  <option>Body assessment</option>
                </select>
              </label>
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={editing.date}
                  onChange={(event) => setEditing({ ...editing, date: event.target.value })}
                />
              </label>
              <label>
                <span>Time</span>
                <input
                  type="time"
                  value={editing.time}
                  onChange={(event) => setEditing({ ...editing, time: event.target.value })}
                />
              </label>
              <label>
                <span>Duration</span>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={editing.duration}
                  onChange={(event) =>
                    setEditing({ ...editing, duration: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={editing.status}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      status: event.target.value as TrainerAppointment['status'],
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="is-full">
                <span>Notes</span>
                <textarea
                  value={editing.notes}
                  onChange={(event) => setEditing({ ...editing, notes: event.target.value })}
                />
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" className="is-primary" onClick={save}>
                <Save size={15} />
                Save appointment
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

const coachingEvents = [
  {
    id: 1,
    memberId: 'alex',
    date: '2026-09-25',
    type: 'Workout activity',
    title: 'Progressive load updated',
    note: 'Bench press target increased after two clean sessions.',
  },
  {
    id: 2,
    memberId: 'mai',
    date: '2026-09-24',
    type: 'AI assessment review',
    title: 'Squat form reviewed',
    note: 'Added tempo squat and ankle mobility preparation.',
  },
  {
    id: 3,
    memberId: 'minh',
    date: '2026-09-22',
    type: 'Trainer note',
    title: 'Recovery adjustment',
    note: 'Reduced lower-body volume by 15% for this week.',
  },
  {
    id: 4,
    memberId: 'alex',
    date: '2026-09-18',
    type: 'Session',
    title: 'Week 3 check-in',
    note: 'Technique stable and adherence remains above 90%.',
  },
];

export function TrainerCoachingHistoryPage() {
  const [memberId, setMemberId] = useState('all');
  const events = coachingEvents.filter(
    (event) => memberId === 'all' || event.memberId === memberId,
  );
  return (
    <div className="trainer-workspace-page">
      <div className="trainer-context-tools">
        <label className="trainer-member-select">
          <UsersRound size={16} />
          <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
            <option value="all">All Members</option>
            {trainerMembers.map((member) => (
              <option value={member.id} key={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section className="trainer-timeline">
        {events.map((event) => (
          <article key={event.id}>
            <time>{event.date}</time>
            <i />
            <div>
              <span>{event.type}</span>
              <h2>{event.title}</h2>
              <strong>{getTrainerMember(event.memberId)?.name}</strong>
              <p>{event.note}</p>
              <button type="button">
                View coaching detail <ChevronRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

const incomeRows = [
  {
    id: 1,
    package: 'Strength Foundation · 8 sessions',
    memberId: 'alex',
    date: '2026-09-02',
    status: 'active',
    amount: 3200000,
  },
  {
    id: 2,
    package: 'Progress Coaching · 16 sessions',
    memberId: 'mai',
    date: '2026-08-18',
    status: 'active',
    amount: 5600000,
  },
  {
    id: 3,
    package: 'Power Cycle · 12 sessions',
    memberId: 'minh',
    date: '2026-07-27',
    status: 'completed',
    amount: 4400000,
  },
  {
    id: 4,
    package: 'Strength Foundation · 8 sessions',
    memberId: 'hana',
    date: '2026-07-12',
    status: 'completed',
    amount: 3200000,
  },
];

export function TrainerIncomePage() {
  const total = incomeRows.reduce((sum, row) => sum + row.amount, 0);
  const active = incomeRows.filter((row) => row.status === 'active').length;
  return (
    <div className="trainer-workspace-page">
      <section className="trainer-metric-grid">
        <article>
          <CircleDollarSign />
          <span>Total income</span>
          <strong>{new Intl.NumberFormat('vi-VN').format(total)} ₫</strong>
        </article>
        <article>
          <ClipboardList />
          <span>Package sales</span>
          <strong>{incomeRows.length}</strong>
        </article>
        <article>
          <Activity />
          <span>Active packages</span>
          <strong>{active}</strong>
        </article>
        <article>
          <UsersRound />
          <span>Package Members</span>
          <strong>{new Set(incomeRows.map((row) => row.memberId)).size}</strong>
        </article>
      </section>
      <div className="trainer-chart-grid is-income">
        <MiniLineChart
          values={[3200000, 5600000, 4400000, 3200000, 6100000, 7200000, 6900000]}
          label="Income history"
          suffix=" ₫"
        />
      </div>
      <section className="trainer-table-panel">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Member</th>
              <th>Purchase / start date</th>
              <th>Status</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
            {incomeRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.package}</strong>
                </td>
                <td>{getTrainerMember(row.memberId)?.name}</td>
                <td>{row.date}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td>
                  <strong>{new Intl.NumberFormat('vi-VN').format(row.amount)} ₫</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
