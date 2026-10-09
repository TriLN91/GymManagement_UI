import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  CircleAlert,
  ClipboardCheck,
  Dumbbell,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  calculateProfileReadiness,
  toggleExclusiveValue,
  useProfileSetupStore,
  useSyncFitnessProfile,
  type MemberFitnessProfile,
  type TernaryAnswer,
} from '@/features/member-fitness';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

import './profile-setup.css';

type Option = { value: string; label: string };

function getCopy(isVi: boolean) {
  return isVi
    ? {
        back: 'Quay lại Dashboard',
        eyebrow: 'HỒ SƠ THỂ CHẤT & SỨC KHỎE',
        title: 'Thiết lập nền tảng cho plan của bạn',
        intro:
          'Thông tin được dùng để AI và PT chọn mức độ, bài tập, khối lượng và lịch tập phù hợp.',
        saved: 'Tự động lưu trên thiết bị',
        completeness: 'Hoàn thiện',
        next: 'Tiếp tục',
        previous: 'Quay lại',
        save: 'Lưu hồ sơ & xem Workout Plans',
        saveReview: 'Lưu hồ sơ & về Dashboard',
        required: 'Hãy hoàn thành các trường bắt buộc trước khi tiếp tục.',
        savedDone: 'Hồ sơ tập luyện đã được lưu.',
        syncFailed: 'Chưa đồng bộ được hồ sơ lên máy chủ. Hồ sơ vẫn được lưu trên thiết bị này.',
        optional: 'Không bắt buộc',
        chooseMany: 'Có thể chọn nhiều',
        steps: [
          ['Chỉ số cơ thể', 'Dữ liệu nền'],
          ['Mục tiêu', 'Kết quả mong muốn'],
          ['Sức khỏe', 'Sàng lọc an toàn'],
          ['Vận động', 'Đau và chấn thương'],
          ['Tập luyện', 'Kinh nghiệm và lịch'],
          ['Phục hồi', 'Thói quen và quyền riêng tư'],
          ['Xem lại', 'Mức sẵn sàng'],
        ],
        sections: {
          body: ['Chỉ số cơ thể', 'Các số đo gần nhất giúp plan chính xác hơn.'],
          goals: ['Mục tiêu tập luyện', 'AI/PT sẽ ưu tiên mục tiêu chính khi có xung đột.'],
          health: ['Sàng lọc trước vận động', 'Nếu không chắc, hãy chọn “Không rõ”.'],
          movement: [
            'Đau, chấn thương và giới hạn',
            'Thông tin này giúp thay thế động tác không phù hợp.',
          ],
          training: [
            'Năng lực và điều kiện tập',
            'Plan sẽ được xếp theo thời gian và thiết bị thực tế.',
          ],
          recovery: [
            'Phục hồi và chia sẻ dữ liệu',
            'Giấc ngủ và căng thẳng ảnh hưởng trực tiếp đến tải tập.',
          ],
          review: ['Xem lại hồ sơ', 'Bạn có thể quay lại bất kỳ bước nào để chỉnh sửa.'],
        },
        fields: {
          dob: 'Ngày sinh',
          sex: 'Giới tính sinh học',
          female: 'Nữ',
          male: 'Nam',
          intersex: 'Liên giới tính',
          preferNot: 'Không muốn trả lời',
          height: 'Chiều cao',
          weight: 'Cân nặng',
          waist: 'Vòng eo',
          bodyFat: 'Tỷ lệ mỡ',
          heartRate: 'Nhịp tim lúc nghỉ',
          source: 'Nguồn số đo',
          self: 'Tự nhập',
          scale: 'Cân thông minh',
          scan: 'Body scan tại Gym',
          primaryGoal: 'Mục tiêu chính',
          targetWeight: 'Cân nặng mục tiêu',
          targetDate: 'Thời hạn mong muốn',
          secondaryGoals: 'Mục tiêu bổ sung',
          focusAreas: 'Khu vực muốn ưu tiên',
          conditions: 'Tình trạng sức khỏe đã biết',
          details: 'Chi tiết bệnh nền hoặc chỉ định theo dõi',
          medications: 'Thuốc đang sử dụng',
          allergies: 'Dị ứng cần lưu ý',
          surgeries: 'Phẫu thuật hoặc điều trị lớn trước đây',
          currentPain: 'Bạn hiện có đau hoặc sưng ảnh hưởng đến vận động?',
          painAreas: 'Vị trí đau / chấn thương',
          painLevel: 'Mức đau hiện tại',
          injuryDetails: 'Mô tả chấn thương và thời điểm xảy ra',
          restrictions: 'Giới hạn hoặc động tác bác sĩ/PT yêu cầu tránh',
          experience: 'Kinh nghiệm tập luyện',
          activityLevel: 'Mức vận động hằng ngày',
          cardioDays: 'Số ngày cardio mỗi tuần',
          cardioMinutes: 'Phút cardio mỗi buổi',
          strengthDays: 'Số ngày tập sức mạnh mỗi tuần',
          availableDays: 'Ngày có thể tập',
          session: 'Thời lượng mỗi buổi',
          environments: 'Nơi tập',
          equipment: 'Thiết bị sẵn có',
          preferred: 'Bài tập hoặc môn vận động yêu thích',
          avoided: 'Bài tập không thích hoặc muốn tránh',
          sleep: 'Giấc ngủ trung bình',
          stress: 'Mức căng thẳng hiện tại',
          work: 'Đặc điểm công việc',
          smoking: 'Bạn có hút thuốc hoặc nicotine?',
          alcohol: 'Số đơn vị đồ uống có cồn mỗi tuần',
        },
        yes: 'Có',
        no: 'Không',
        unsure: 'Không rõ',
        none: 'Không có',
        privacyTitle: 'Quyền sử dụng dữ liệu',
        shareTrainer: 'Cho phép PT đang được phân công xem hồ sơ sức khỏe và vận động này.',
        accuracy: 'Tôi xác nhận thông tin đã nhập là đúng theo hiểu biết hiện tại.',
        screeningConsent:
          'Tôi hiểu đây là bước sàng lọc vận động, không thay thế chẩn đoán hoặc tư vấn y tế.',
        reviewLabels: {
          body: 'Cơ thể',
          goal: 'Mục tiêu',
          health: 'Sức khỏe',
          schedule: 'Lịch tập',
          bmi: 'BMI tham khảo',
        },
        readiness: {
          ready: ['Có thể tạo plan', 'AI có thể tạo bản nháp plan từ hồ sơ hiện tại.'],
          pt_review: [
            'Cần PT xem lại',
            'Plan chỉ nên hoàn tất sau khi PT xem tình trạng được ghi nhận.',
          ],
          medical_review: [
            'Cần xác minh trước khi tạo plan',
            'Tạm giữ việc tự động tạo plan cường độ cao cho đến khi có xác minh phù hợp.',
          ],
        },
      }
    : {
        back: 'Back to Dashboard',
        eyebrow: 'PHYSICAL & HEALTH PROFILE',
        title: 'Build the foundation for your plan',
        intro:
          'AI and your Trainer use this information to select suitable intensity, exercises, load and schedule.',
        saved: 'Auto-saved on this device',
        completeness: 'Complete',
        next: 'Continue',
        previous: 'Back',
        save: 'Save profile & view Workout Plans',
        saveReview: 'Save profile & return to Dashboard',
        required: 'Complete the required fields before continuing.',
        savedDone: 'Your fitness profile has been saved.',
        syncFailed: 'Could not sync your profile to the server. It is still saved on this device.',
        optional: 'Optional',
        chooseMany: 'Select multiple',
        steps: [
          ['Body metrics', 'Baseline data'],
          ['Goals', 'Desired outcomes'],
          ['Health', 'Safety screening'],
          ['Movement', 'Pain and injury'],
          ['Training', 'Experience and schedule'],
          ['Recovery', 'Habits and privacy'],
          ['Review', 'Readiness level'],
        ],
        sections: {
          body: ['Body metrics', 'Recent measurements help improve plan accuracy.'],
          goals: [
            'Training goals',
            'AI and your Trainer prioritize the primary goal when goals conflict.',
          ],
          health: ['Pre-activity screening', 'Choose “Unsure” whenever you are not certain.'],
          movement: [
            'Pain, injury and limitations',
            'This information helps replace unsuitable exercises.',
          ],
          training: [
            'Training ability and access',
            'The plan fits your actual time and equipment.',
          ],
          recovery: [
            'Recovery and data sharing',
            'Sleep and stress directly affect training load.',
          ],
          review: ['Review your profile', 'Return to any step if something needs changing.'],
        },
        fields: {
          dob: 'Date of birth',
          sex: 'Sex at birth',
          female: 'Female',
          male: 'Male',
          intersex: 'Intersex',
          preferNot: 'Prefer not to answer',
          height: 'Height',
          weight: 'Weight',
          waist: 'Waist',
          bodyFat: 'Body fat',
          heartRate: 'Resting heart rate',
          source: 'Measurement source',
          self: 'Self reported',
          scale: 'Smart scale',
          scan: 'Gym body scan',
          primaryGoal: 'Primary goal',
          targetWeight: 'Target weight',
          targetDate: 'Target date',
          secondaryGoals: 'Secondary goals',
          focusAreas: 'Priority areas',
          conditions: 'Known health conditions',
          details: 'Condition details or monitoring instructions',
          medications: 'Current medications',
          allergies: 'Relevant allergies',
          surgeries: 'Previous surgery or major treatment',
          currentPain: 'Do you currently have pain or swelling that affects movement?',
          painAreas: 'Pain / injury areas',
          painLevel: 'Current pain level',
          injuryDetails: 'Describe the injury and when it occurred',
          restrictions: 'Movements a clinician or Trainer told you to avoid',
          experience: 'Training experience',
          activityLevel: 'Daily activity level',
          cardioDays: 'Cardio days per week',
          cardioMinutes: 'Cardio minutes per session',
          strengthDays: 'Strength days per week',
          availableDays: 'Available training days',
          session: 'Session duration',
          environments: 'Training locations',
          equipment: 'Available equipment',
          preferred: 'Preferred exercises or activities',
          avoided: 'Exercises you dislike or want to avoid',
          sleep: 'Average sleep',
          stress: 'Current stress level',
          work: 'Work pattern',
          smoking: 'Do you smoke or use nicotine?',
          alcohol: 'Alcoholic drinks per week',
        },
        yes: 'Yes',
        no: 'No',
        unsure: 'Unsure',
        none: 'None',
        privacyTitle: 'Data permissions',
        shareTrainer: 'Allow your assigned Trainer to view this health and movement profile.',
        accuracy: 'I confirm this information is accurate to the best of my knowledge.',
        screeningConsent:
          'I understand this is activity screening and does not replace medical diagnosis or advice.',
        reviewLabels: {
          body: 'Body',
          goal: 'Goal',
          health: 'Health',
          schedule: 'Schedule',
          bmi: 'Reference BMI',
        },
        readiness: {
          ready: [
            'Ready for plan creation',
            'AI can create a draft plan from the current profile.',
          ],
          pt_review: [
            'Trainer review needed',
            'A Trainer should review the recorded condition before the plan is finalized.',
          ],
          medical_review: [
            'Verification needed before plan creation',
            'Automatic high-intensity plan creation is held until appropriate verification is available.',
          ],
        },
      };
}

function toOptions(items: Array<[string, string]>): Option[] {
  return items.map(([value, label]) => ({ value, label }));
}

const goals = (isVi: boolean): Option[] =>
  toOptions([
    ['muscle_gain', isVi ? 'Tăng cơ' : 'Build muscle'],
    ['fat_loss', isVi ? 'Giảm mỡ' : 'Lose fat'],
    ['strength', isVi ? 'Tăng sức mạnh' : 'Build strength'],
    ['endurance', isVi ? 'Tăng sức bền' : 'Improve endurance'],
    ['mobility', isVi ? 'Cải thiện vận động' : 'Improve mobility'],
    ['general', isVi ? 'Sức khỏe tổng thể' : 'General fitness'],
  ]);

const days = (isVi: boolean): Option[] =>
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
    (value, index) => ({
      value,
      label:
        (isVi
          ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]) ?? value,
    }),
  );

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <label className="profile-field">
      <span>
        {label} {optional && <small>{optional}</small>}
      </span>
      {children}
    </label>
  );
}

function ChoiceGrid({
  options,
  value,
  onChange,
  compact,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('profile-choice-grid', compact && 'is-compact')}>
      {options.map((option) => (
        <button
          type="button"
          className={cn('profile-choice', value === option.value && 'is-selected')}
          onClick={() => onChange(option.value)}
          key={option.value}
        >
          <span>{option.label}</span>
          {value === option.value && <Check size={16} />}
        </button>
      ))}
    </div>
  );
}

function ChipGroup({
  options,
  values,
  onChange,
}: {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="profile-chips">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={cn(values.includes(option.value) && 'is-selected')}
          onClick={() =>
            onChange(
              values.includes(option.value)
                ? values.filter((value) => value !== option.value)
                : [...values, option.value],
            )
          }
        >
          {values.includes(option.value) && <Check size={13} />}
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Ternary({
  value,
  onChange,
  labels,
}: {
  value: TernaryAnswer;
  onChange: (value: TernaryAnswer) => void;
  labels: [string, string, string];
}) {
  return (
    <div className="profile-ternary">
      {(['yes', 'no', 'unsure'] as TernaryAnswer[]).map((answer, index) => (
        <button
          type="button"
          key={answer}
          className={cn(value === answer && 'is-selected')}
          onClick={() => onChange(answer)}
        >
          {labels[index]}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ title, body }: { title: string; body: string }) {
  return (
    <header className="profile-section-header">
      <h2>{title}</h2>
      <p>{body}</p>
    </header>
  );
}

function parseNumber(value: string) {
  return value === '' ? null : Number(value);
}

const focusOptions = (isVi: boolean): Option[] =>
  toOptions([
    ['full_body', isVi ? 'Toàn thân' : 'Full body'],
    ['chest', isVi ? 'Ngực' : 'Chest'],
    ['back', isVi ? 'Lưng' : 'Back'],
    ['shoulders', isVi ? 'Vai' : 'Shoulders'],
    ['arms', isVi ? 'Tay' : 'Arms'],
    ['core', 'Core'],
    ['glutes', isVi ? 'Mông' : 'Glutes'],
    ['legs', isVi ? 'Chân' : 'Legs'],
  ]);

const painOptions = (isVi: boolean): Option[] =>
  toOptions([
    ['neck', isVi ? 'Cổ' : 'Neck'],
    ['shoulder', isVi ? 'Vai' : 'Shoulder'],
    ['elbow', isVi ? 'Khuỷu tay' : 'Elbow'],
    ['wrist', isVi ? 'Cổ tay' : 'Wrist'],
    ['upper_back', isVi ? 'Lưng trên' : 'Upper back'],
    ['lower_back', isVi ? 'Lưng dưới' : 'Lower back'],
    ['hip', isVi ? 'Hông' : 'Hip'],
    ['knee', isVi ? 'Đầu gối' : 'Knee'],
    ['ankle', isVi ? 'Cổ chân' : 'Ankle'],
  ]);

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = getCopy(isVi);
  const profile = useProfileSetupStore((state) => state.profile);
  const step = useProfileSetupStore((state) => state.currentStep);
  const setProfile = useProfileSetupStore((state) => state.setProfile);
  const setStep = useProfileSetupStore((state) => state.setCurrentStep);
  const completeProfile = useProfileSetupStore((state) => state.completeProfile);
  const syncProfile = useSyncFitnessProfile();
  const readiness = useMemo(() => calculateProfileReadiness(profile), [profile]);
  const setSection = <K extends keyof MemberFitnessProfile>(
    section: K,
    value: MemberFitnessProfile[K],
  ) => setProfile({ ...profile, [section]: value });
  const identity = profile.identity;
  const goal = profile.goals;
  const training = profile.training;

  const healthQuestions: Array<[keyof MemberFitnessProfile['health']['screening'], string]> = [
    [
      'heartOrChestSymptoms',
      isVi
        ? 'Trong 6 tháng qua, bạn có bệnh tim/đột quỵ hoặc đau, tức ngực khi sinh hoạt hay vận động?'
        : 'In the past six months, have you had heart disease, stroke, or chest pain during daily activity or exercise?',
    ],
    [
      'highBloodPressure',
      isVi
        ? 'Bạn được chẩn đoán hoặc điều trị huyết áp cao?'
        : 'Have you been diagnosed with or treated for high blood pressure?',
    ],
    [
      'dizzinessOrFainting',
      isVi
        ? 'Bạn có chóng mặt, choáng hoặc từng mất ý thức khi vận động?'
        : 'Do you experience dizziness, lightheadedness or loss of consciousness during activity?',
    ],
    [
      'breathlessAtRest',
      isVi ? 'Bạn có khó thở ngay cả khi nghỉ?' : 'Do you experience shortness of breath at rest?',
    ],
    [
      'recentConcussion',
      isVi ? 'Bạn có bị chấn động não gần đây?' : 'Have you had a recent concussion?',
    ],
    [
      'providerRestriction',
      isVi
        ? 'Bác sĩ từng yêu cầu bạn tránh hoặc điều chỉnh vận động?'
        : 'Has a healthcare professional told you to avoid or modify physical activity?',
    ],
  ];
  const conditionOptions: Option[] = toOptions([
    ['none', copy.none],
    ['cardiovascular', isVi ? 'Tim mạch' : 'Cardiovascular'],
    ['hypertension', isVi ? 'Cao huyết áp' : 'Hypertension'],
    ['diabetes', isVi ? 'Tiểu đường' : 'Diabetes'],
    ['asthma', isVi ? 'Hen / hô hấp' : 'Asthma / respiratory'],
    ['arthritis', isVi ? 'Viêm khớp' : 'Arthritis'],
    ['osteoporosis', isVi ? 'Loãng xương' : 'Osteoporosis'],
    ['neurological', isVi ? 'Thần kinh' : 'Neurological'],
    ['kidney', isVi ? 'Thận' : 'Kidney disease'],
    ['cancer', isVi ? 'Ung thư' : 'Cancer'],
    ['pregnancy', isVi ? 'Mang thai / sau sinh' : 'Pregnancy / postpartum'],
    ['other', isVi ? 'Khác' : 'Other'],
  ]);

  const validateStep = () => {
    if (
      step === 0 &&
      (!identity.dateOfBirth ||
        !identity.sexAtBirth ||
        !identity.heightCm ||
        !identity.weightKg ||
        !identity.measurementSource)
    )
      return false;
    if (step === 1 && !goal.primary) return false;
    if (
      step === 2 &&
      (profile.health.conditions.length === 0 ||
        Object.values(profile.health.screening).some((answer) => !answer))
    )
      return false;
    if (
      step === 3 &&
      (!profile.movement.currentPain ||
        (profile.movement.currentPain === 'yes' && profile.movement.painAreas.length === 0))
    )
      return false;
    if (
      step === 4 &&
      (!training.experience ||
        !training.activityLevel ||
        training.availableDays.length === 0 ||
        !training.sessionMinutes ||
        training.environments.length === 0)
    )
      return false;
    if (
      step === 5 &&
      (!profile.recovery.sleepHours ||
        !profile.recovery.stressLevel ||
        !profile.recovery.workPattern ||
        !profile.recovery.smoking ||
        !profile.consent.dataAccuracy ||
        !profile.consent.screeningAcknowledged)
    )
      return false;
    return true;
  };
  const next = () => {
    if (!validateStep()) {
      toast.error(copy.required);
      return;
    }
    setStep(Math.min(6, step + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="profile-setup-page">
      <header className="profile-setup-topbar">
        <Link to={ROUTES.member.root}>
          <ArrowLeft size={15} /> {copy.back}
        </Link>
        <span>
          <LockKeyhole size={14} /> {copy.saved}
        </span>
      </header>
      <div className="profile-setup-shell">
        <aside className="profile-stepper">
          {copy.steps.map(([title, detail], index) => (
            <button
              type="button"
              key={title}
              className={cn(index === step && 'is-active', index < step && 'is-complete')}
              onClick={() => index <= step && setStep(index)}
            >
              <span>{index < step ? <Check size={14} /> : index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
            </button>
          ))}
        </aside>
        <main className="profile-form-card">
          {step === 0 && (
            <BodyStep copy={copy} profile={profile} readiness={readiness} setSection={setSection} />
          )}
          {step === 1 && (
            <GoalStep copy={copy} isVi={isVi} profile={profile} setSection={setSection} />
          )}
          {step === 2 && (
            <HealthStep
              copy={copy}
              profile={profile}
              questions={healthQuestions}
              conditions={conditionOptions}
              setSection={setSection}
            />
          )}
          {step === 3 && (
            <MovementStep copy={copy} isVi={isVi} profile={profile} setSection={setSection} />
          )}
          {step === 4 && (
            <TrainingStep copy={copy} isVi={isVi} profile={profile} setSection={setSection} />
          )}
          {step === 5 && (
            <RecoveryStep copy={copy} isVi={isVi} profile={profile} setSection={setSection} />
          )}
          {step === 6 && (
            <ReviewStep copy={copy} isVi={isVi} profile={profile} readiness={readiness} />
          )}
          <footer className="profile-form-actions">
            <button
              type="button"
              className="is-secondary"
              disabled={step === 0}
              onClick={() => setStep(Math.max(0, step - 1))}
            >
              <ChevronLeft size={17} /> {copy.previous}
            </button>
            {step < 6 ? (
              <button type="button" className="is-primary" onClick={next}>
                {copy.next} <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="is-primary"
                onClick={() => {
                  completeProfile();
                  // Best effort: the local copy is the source of truth for the wizard; a failed
                  // sync is reported by the global mutation error toast and retried on next save.
                  syncProfile.mutate(profile, { onError: () => toast.error(copy.syncFailed) });
                  toast.success(copy.savedDone);
                  void navigate(
                    readiness.level === 'medical_review'
                      ? ROUTES.member.root
                      : ROUTES.member.workout,
                  );
                }}
              >
                {readiness.level === 'medical_review' ? copy.saveReview : copy.save}{' '}
                <ArrowRight size={17} />
              </button>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}

type Copy = ReturnType<typeof getCopy>;
type SetSection = <K extends keyof MemberFitnessProfile>(
  section: K,
  value: MemberFitnessProfile[K],
) => void;

function BodyStep({
  copy,
  profile,
  readiness,
  setSection,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  readiness: ReturnType<typeof calculateProfileReadiness>;
  setSection: SetSection;
}) {
  const data = profile.identity;
  const number = (key: keyof typeof data, value: string) =>
    setSection('identity', { ...data, [key]: parseNumber(value) });
  return (
    <>
      <SectionHeader title={copy.sections.body[0] ?? ''} body={copy.sections.body[1] ?? ''} />
      <div className="profile-form-grid">
        <Field label={copy.fields.dob}>
          <input
            type="date"
            value={data.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSection('identity', { ...data, dateOfBirth: e.target.value })}
          />
        </Field>
        <Field label={copy.fields.sex}>
          <select
            value={data.sexAtBirth}
            onChange={(e) =>
              setSection('identity', {
                ...data,
                sexAtBirth: e.target.value as typeof data.sexAtBirth,
              })
            }
          >
            <option value="">—</option>
            <option value="female">{copy.fields.female}</option>
            <option value="male">{copy.fields.male}</option>
            <option value="intersex">{copy.fields.intersex}</option>
            <option value="prefer_not">{copy.fields.preferNot}</option>
          </select>
        </Field>
        <UnitNumber
          label={copy.fields.height}
          unit="cm"
          value={data.heightCm}
          min={100}
          max={230}
          onChange={(v) => number('heightCm', v)}
        />
        <UnitNumber
          label={copy.fields.weight}
          unit="kg"
          value={data.weightKg}
          min={25}
          max={350}
          step="0.1"
          onChange={(v) => number('weightKg', v)}
        />
        <UnitNumber
          label={copy.fields.waist}
          unit="cm"
          optional={copy.optional}
          value={data.waistCm}
          min={35}
          max={250}
          onChange={(v) => number('waistCm', v)}
        />
        <UnitNumber
          label={copy.fields.bodyFat}
          unit="%"
          optional={copy.optional}
          value={data.bodyFatPercent}
          min={2}
          max={70}
          step="0.1"
          onChange={(v) => number('bodyFatPercent', v)}
        />
        <UnitNumber
          label={copy.fields.heartRate}
          unit="bpm"
          optional={copy.optional}
          value={data.restingHeartRate}
          min={30}
          max={220}
          onChange={(v) => number('restingHeartRate', v)}
        />
        <div className="profile-field">
          <span>
            Blood pressure <small>{copy.optional}</small>
          </span>
          <div className="profile-blood-pressure">
            <input
              type="number"
              placeholder="SYS"
              value={data.systolicBp ?? ''}
              onChange={(e) => number('systolicBp', e.target.value)}
            />
            <span>/</span>
            <input
              type="number"
              placeholder="DIA"
              value={data.diastolicBp ?? ''}
              onChange={(e) => number('diastolicBp', e.target.value)}
            />
          </div>
        </div>
        <Field label={copy.fields.source}>
          <select
            value={data.measurementSource}
            onChange={(e) =>
              setSection('identity', {
                ...data,
                measurementSource: e.target.value as typeof data.measurementSource,
              })
            }
          >
            <option value="">—</option>
            <option value="self_reported">{copy.fields.self}</option>
            <option value="smart_scale">{copy.fields.scale}</option>
            <option value="gym_scan">{copy.fields.scan}</option>
          </select>
        </Field>
      </div>
      {readiness.bmi && (
        <div className="profile-metric-strip">
          <Activity size={19} />
          <span>{copy.reviewLabels.bmi}</span>
          <strong>{readiness.bmi.toFixed(1)}</strong>
        </div>
      )}
    </>
  );
}

function UnitNumber({
  label,
  unit,
  optional,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  optional?: string;
  value: number | null;
  min: number;
  max: number;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} optional={optional}>
      <div className="profile-unit-input">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>{unit}</span>
      </div>
    </Field>
  );
}

function GoalStep({
  copy,
  isVi,
  profile,
  setSection,
}: {
  copy: Copy;
  isVi: boolean;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const data = profile.goals;
  return (
    <>
      <SectionHeader title={copy.sections.goals[0] ?? ''} body={copy.sections.goals[1] ?? ''} />
      <Block title={copy.fields.primaryGoal}>
        <ChoiceGrid
          options={goals(isVi)}
          value={data.primary}
          onChange={(primary) =>
            setSection('goals', { ...data, primary: primary as typeof data.primary })
          }
        />
      </Block>
      <Block title={copy.fields.secondaryGoals} note={copy.chooseMany}>
        <ChipGroup
          options={goals(isVi).filter((o) => o.value !== data.primary)}
          values={data.secondary}
          onChange={(secondary) => setSection('goals', { ...data, secondary })}
        />
      </Block>
      <div className="profile-form-grid">
        <UnitNumber
          label={copy.fields.targetWeight}
          unit="kg"
          optional={copy.optional}
          value={data.targetWeightKg}
          min={25}
          max={350}
          step="0.1"
          onChange={(v) => setSection('goals', { ...data, targetWeightKg: parseNumber(v) })}
        />
        <Field label={copy.fields.targetDate} optional={copy.optional}>
          <input
            type="date"
            value={data.targetDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSection('goals', { ...data, targetDate: e.target.value })}
          />
        </Field>
      </div>
      <Block title={copy.fields.focusAreas} note={copy.chooseMany}>
        <ChipGroup
          options={focusOptions(isVi)}
          values={data.focusAreas}
          onChange={(focusAreas) => setSection('goals', { ...data, focusAreas })}
        />
      </Block>
    </>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="profile-block">
      <h3>
        {title} {note && <small>{note}</small>}
      </h3>
      {children}
    </div>
  );
}

function HealthStep({
  copy,
  profile,
  questions,
  conditions,
  setSection,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  questions: Array<[keyof MemberFitnessProfile['health']['screening'], string]>;
  conditions: Option[];
  setSection: SetSection;
}) {
  const data = profile.health;
  return (
    <>
      <SectionHeader title={copy.sections.health[0] ?? ''} body={copy.sections.health[1] ?? ''} />
      <div className="profile-question-list">
        {questions.map(([key, question], index) => (
          <div className="profile-question" key={key}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{question}</strong>
            <Ternary
              value={data.screening[key]}
              labels={[copy.yes, copy.no, copy.unsure]}
              onChange={(answer) =>
                setSection('health', { ...data, screening: { ...data.screening, [key]: answer } })
              }
            />
          </div>
        ))}
      </div>
      <Block title={copy.fields.conditions} note={copy.chooseMany}>
        <div className="profile-chips">
          {conditions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={cn(data.conditions.includes(option.value) && 'is-selected')}
              onClick={() =>
                setSection('health', {
                  ...data,
                  conditions: toggleExclusiveValue(data.conditions, option.value),
                })
              }
            >
              {data.conditions.includes(option.value) && <Check size={13} />}
              {option.label}
            </button>
          ))}
        </div>
      </Block>
      <div className="profile-form-grid">
        <TextField
          label={copy.fields.details}
          value={data.conditionDetails}
          onChange={(conditionDetails) => setSection('health', { ...data, conditionDetails })}
          optional={copy.optional}
        />
        <TextField
          label={copy.fields.medications}
          value={data.medications}
          onChange={(medications) => setSection('health', { ...data, medications })}
          optional={copy.optional}
        />
        <TextField
          label={copy.fields.allergies}
          value={data.allergies}
          onChange={(allergies) => setSection('health', { ...data, allergies })}
          optional={copy.optional}
        />
        <TextField
          label={copy.fields.surgeries}
          value={data.surgeries}
          onChange={(surgeries) => setSection('health', { ...data, surgeries })}
          optional={copy.optional}
        />
      </div>
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: string;
}) {
  return (
    <Field label={label} optional={optional}>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function MovementStep({
  copy,
  isVi,
  profile,
  setSection,
}: {
  copy: Copy;
  isVi: boolean;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const data = profile.movement;
  return (
    <>
      <SectionHeader
        title={copy.sections.movement[0] ?? ''}
        body={copy.sections.movement[1] ?? ''}
      />
      <div className="profile-feature-question">
        <div>
          <HeartPulse size={22} />
          <strong>{copy.fields.currentPain}</strong>
        </div>
        <Ternary
          value={data.currentPain}
          labels={[copy.yes, copy.no, copy.unsure]}
          onChange={(currentPain) => setSection('movement', { ...data, currentPain })}
        />
      </div>
      {data.currentPain === 'yes' && (
        <>
          <Block title={copy.fields.painAreas} note={copy.chooseMany}>
            <ChipGroup
              options={painOptions(isVi)}
              values={data.painAreas}
              onChange={(painAreas) => setSection('movement', { ...data, painAreas })}
            />
          </Block>
          <div className="profile-range">
            <span>{copy.fields.painLevel}</span>
            <input
              type="range"
              min="0"
              max="10"
              value={data.painLevel}
              onChange={(e) =>
                setSection('movement', { ...data, painLevel: Number(e.target.value) })
              }
            />
            <strong>{data.painLevel}/10</strong>
          </div>
        </>
      )}
      <div className="profile-form-grid">
        <TextField
          label={copy.fields.injuryDetails}
          value={data.injuryDetails}
          onChange={(injuryDetails) => setSection('movement', { ...data, injuryDetails })}
          optional={copy.optional}
        />
        <TextField
          label={copy.fields.restrictions}
          value={data.movementRestrictions}
          onChange={(movementRestrictions) =>
            setSection('movement', { ...data, movementRestrictions })
          }
          optional={copy.optional}
        />
      </div>
    </>
  );
}

function TrainingStep({
  copy,
  isVi,
  profile,
  setSection,
}: {
  copy: Copy;
  isVi: boolean;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const data = profile.training;
  const equipment: Option[] = toOptions([
    ['bodyweight', isVi ? 'Trọng lượng cơ thể' : 'Bodyweight'],
    ['dumbbells', isVi ? 'Tạ đơn' : 'Dumbbells'],
    ['barbell', isVi ? 'Thanh đòn' : 'Barbell'],
    ['machines', isVi ? 'Máy tập' : 'Machines'],
    ['bands', isVi ? 'Dây kháng lực' : 'Bands'],
    ['cardio', isVi ? 'Máy cardio' : 'Cardio machines'],
  ]);
  return (
    <>
      <SectionHeader
        title={copy.sections.training[0] ?? ''}
        body={copy.sections.training[1] ?? ''}
      />
      <Block title={copy.fields.experience}>
        <ChoiceGrid
          compact
          options={[
            {
              value: 'beginner',
              label: isVi ? 'Mới tập · dưới 6 tháng' : 'Beginner · under 6 months',
            },
            {
              value: 'intermediate',
              label: isVi ? 'Trung cấp · 6–24 tháng' : 'Intermediate · 6–24 months',
            },
            {
              value: 'advanced',
              label: isVi ? 'Nâng cao · trên 2 năm' : 'Advanced · over 2 years',
            },
          ]}
          value={data.experience}
          onChange={(experience) =>
            setSection('training', { ...data, experience: experience as typeof data.experience })
          }
        />
      </Block>
      <Block title={copy.fields.activityLevel}>
        <ChoiceGrid
          compact
          options={[
            { value: 'sedentary', label: isVi ? 'Ít vận động' : 'Sedentary' },
            { value: 'light', label: isVi ? 'Vận động nhẹ' : 'Lightly active' },
            { value: 'moderate', label: isVi ? 'Vận động vừa' : 'Moderately active' },
            { value: 'high', label: isVi ? 'Vận động cao' : 'Highly active' },
          ]}
          value={data.activityLevel}
          onChange={(activityLevel) =>
            setSection('training', {
              ...data,
              activityLevel: activityLevel as typeof data.activityLevel,
            })
          }
        />
      </Block>
      <div className="profile-form-grid is-three">
        <UnitNumber
          label={copy.fields.cardioDays}
          unit="days"
          optional={copy.optional}
          value={data.cardioDays}
          min={0}
          max={7}
          onChange={(v) => setSection('training', { ...data, cardioDays: parseNumber(v) })}
        />
        <UnitNumber
          label={copy.fields.cardioMinutes}
          unit="min"
          optional={copy.optional}
          value={data.cardioMinutes}
          min={0}
          max={300}
          onChange={(v) => setSection('training', { ...data, cardioMinutes: parseNumber(v) })}
        />
        <UnitNumber
          label={copy.fields.strengthDays}
          unit="days"
          optional={copy.optional}
          value={data.strengthDays}
          min={0}
          max={7}
          onChange={(v) => setSection('training', { ...data, strengthDays: parseNumber(v) })}
        />
      </div>
      <Block title={copy.fields.availableDays}>
        <ChipGroup
          options={days(isVi)}
          values={data.availableDays}
          onChange={(availableDays) => setSection('training', { ...data, availableDays })}
        />
      </Block>
      <Block title={copy.fields.session}>
        <ChoiceGrid
          compact
          options={[30, 45, 60, 75, 90].map((m) => ({ value: String(m), label: `${m} min` }))}
          value={String(data.sessionMinutes ?? '')}
          onChange={(value) =>
            setSection('training', {
              ...data,
              sessionMinutes: Number(value) as typeof data.sessionMinutes,
            })
          }
        />
      </Block>
      <div className="profile-form-grid">
        <Block title={copy.fields.environments}>
          <ChipGroup
            options={[
              { value: 'gym', label: isVi ? 'Phòng Gym' : 'Gym' },
              { value: 'home', label: isVi ? 'Tại nhà' : 'Home' },
              { value: 'outdoor', label: isVi ? 'Ngoài trời' : 'Outdoor' },
            ]}
            values={data.environments}
            onChange={(environments) => setSection('training', { ...data, environments })}
          />
        </Block>
        <Block title={copy.fields.equipment} note={copy.optional}>
          <ChipGroup
            options={equipment}
            values={data.equipment}
            onChange={(equipmentValues) =>
              setSection('training', { ...data, equipment: equipmentValues })
            }
          />
        </Block>
        <TextField
          label={copy.fields.preferred}
          value={data.preferredExercises}
          onChange={(preferredExercises) => setSection('training', { ...data, preferredExercises })}
          optional={copy.optional}
        />
        <TextField
          label={copy.fields.avoided}
          value={data.avoidedExercises}
          onChange={(avoidedExercises) => setSection('training', { ...data, avoidedExercises })}
          optional={copy.optional}
        />
      </div>
    </>
  );
}

function RecoveryStep({
  copy,
  isVi,
  profile,
  setSection,
}: {
  copy: Copy;
  isVi: boolean;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const data = profile.recovery;
  return (
    <>
      <SectionHeader
        title={copy.sections.recovery[0] ?? ''}
        body={copy.sections.recovery[1] ?? ''}
      />
      <div className="profile-form-grid">
        <UnitNumber
          label={copy.fields.sleep}
          unit="hours"
          value={data.sleepHours}
          min={2}
          max={14}
          step="0.5"
          onChange={(v) => setSection('recovery', { ...data, sleepHours: parseNumber(v) })}
        />
        <Field label={copy.fields.alcohol} optional={copy.optional}>
          <input
            type="number"
            min="0"
            max="50"
            value={data.alcoholPerWeek ?? ''}
            onChange={(e) =>
              setSection('recovery', { ...data, alcoholPerWeek: parseNumber(e.target.value) })
            }
          />
        </Field>
      </div>
      <Block title={copy.fields.stress}>
        <ChoiceGrid
          compact
          options={[1, 2, 3, 4, 5].map((value) => ({
            value: String(value),
            label: `${value} · ${(isVi ? ['Rất thấp', 'Thấp', 'Vừa', 'Cao', 'Rất cao'] : ['Very low', 'Low', 'Moderate', 'High', 'Very high'])[value - 1]}`,
          }))}
          value={String(data.stressLevel ?? '')}
          onChange={(value) =>
            setSection('recovery', {
              ...data,
              stressLevel: Number(value) as typeof data.stressLevel,
            })
          }
        />
      </Block>
      <Block title={copy.fields.work}>
        <ChoiceGrid
          compact
          options={[
            { value: 'mostly_sitting', label: isVi ? 'Chủ yếu ngồi' : 'Mostly sitting' },
            { value: 'mixed', label: isVi ? 'Ngồi và di chuyển' : 'Mixed' },
            { value: 'mostly_active', label: isVi ? 'Vận động nhiều' : 'Mostly active' },
            { value: 'shift_work', label: isVi ? 'Làm việc theo ca' : 'Shift work' },
          ]}
          value={data.workPattern}
          onChange={(workPattern) =>
            setSection('recovery', { ...data, workPattern: workPattern as typeof data.workPattern })
          }
        />
      </Block>
      <div className="profile-feature-question">
        <div>
          <CircleAlert size={22} />
          <strong>{copy.fields.smoking}</strong>
        </div>
        <Ternary
          value={data.smoking}
          labels={[copy.yes, copy.no, copy.unsure]}
          onChange={(smoking) => setSection('recovery', { ...data, smoking })}
        />
      </div>
      <section className="profile-consent">
        <h3>
          <ShieldCheck size={19} /> {copy.privacyTitle}
        </h3>
        {(
          [
            ['shareWithAssignedTrainer', copy.shareTrainer],
            ['dataAccuracy', copy.accuracy],
            ['screeningAcknowledged', copy.screeningConsent],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={profile.consent[key]}
              onChange={(e) =>
                setSection('consent', { ...profile.consent, [key]: e.target.checked })
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </section>
    </>
  );
}

function ReviewStep({
  copy,
  isVi,
  profile,
  readiness,
}: {
  copy: Copy;
  isVi: boolean;
  profile: MemberFitnessProfile;
  readiness: ReturnType<typeof calculateProfileReadiness>;
}) {
  const status = copy.readiness[readiness.level];
  return (
    <>
      <SectionHeader title={copy.sections.review[0] ?? ''} body={copy.sections.review[1] ?? ''} />
      <section className={cn('profile-readiness', `is-${readiness.level}`)}>
        {readiness.level === 'ready' ? <ClipboardCheck size={28} /> : <CircleAlert size={28} />}
        <div>
          <span>FIT® READINESS</span>
          <h2>{status[0] ?? ''}</h2>
          <p>{status[1] ?? ''}</p>
        </div>
        <strong className="profile-readiness__completeness">{readiness.completeness}%</strong>
      </section>
      <div className="profile-review-grid">
        <ReviewCard
          icon={<UserRound size={20} />}
          label={copy.reviewLabels.body}
          value={`${profile.identity.heightCm} cm · ${profile.identity.weightKg} kg`}
          detail={`${copy.reviewLabels.bmi}: ${readiness.bmi?.toFixed(1) ?? '—'}`}
        />
        <ReviewCard
          icon={<Target size={20} />}
          label={copy.reviewLabels.goal}
          value={goals(isVi).find((o) => o.value === profile.goals.primary)?.label ?? '—'}
          detail={profile.goals.targetDate || '—'}
        />
        <ReviewCard
          icon={<HeartPulse size={20} />}
          label={copy.reviewLabels.health}
          value={
            profile.health.conditions.includes('none')
              ? copy.none
              : `${profile.health.conditions.length} ${isVi ? 'mục cần lưu ý' : 'items recorded'}`
          }
          detail={profile.movement.painAreas.join(', ') || '—'}
        />
        <ReviewCard
          icon={<Dumbbell size={20} />}
          label={copy.reviewLabels.schedule}
          value={`${profile.training.availableDays.length} ${isVi ? 'ngày/tuần' : 'days/week'}`}
          detail={`${profile.training.sessionMinutes} min · ${profile.training.experience}`}
        />
      </div>
      <div className="profile-review-notice">
        <ShieldCheck size={18} />
        <span>
          {isVi
            ? 'AI chỉ nhận dữ liệu có cấu trúc cần thiết để đề xuất plan. PT chỉ xem được hồ sơ khi bạn cho phép và được phân công.'
            : 'AI receives only structured data needed for plan recommendations. A Trainer can view this profile only when assigned and permitted.'}
        </span>
      </div>
    </>
  );
}

function ReviewCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
