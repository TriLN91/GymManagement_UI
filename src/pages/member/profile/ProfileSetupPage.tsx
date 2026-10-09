import type { TFunction } from 'i18next';
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
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

import './profile-setup.css';

type Option = { value: string; label: string };

function getCopy(t: TFunction) {
  return {
    back: t('memberProfile:profileSetup.copy.back'),
    eyebrow: t('memberProfile:profileSetup.copy.eyebrow'),
    title: t('memberProfile:profileSetup.copy.title'),
    intro: t('memberProfile:profileSetup.copy.intro'),
    saved: t('memberProfile:profileSetup.copy.saved'),
    completeness: t('memberProfile:profileSetup.copy.completeness'),
    next: t('memberProfile:profileSetup.copy.next'),
    previous: t('memberProfile:profileSetup.copy.previous'),
    save: t('memberProfile:profileSetup.copy.save'),
    saveReview: t('memberProfile:profileSetup.copy.saveReview'),
    required: t('memberProfile:profileSetup.copy.required'),
    savedDone: t('memberProfile:profileSetup.copy.savedDone'),
    syncFailed: t('memberProfile:profileSetup.copy.syncFailed'),
    optional: t('memberProfile:profileSetup.copy.optional'),
    chooseMany: t('memberProfile:profileSetup.copy.chooseMany'),
    steps: [
      [
        t('memberProfile:profileSetup.copy.steps.0.0'),
        t('memberProfile:profileSetup.copy.steps.0.1'),
      ],
      [
        t('memberProfile:profileSetup.copy.steps.1.0'),
        t('memberProfile:profileSetup.copy.steps.1.1'),
      ],
      [
        t('memberProfile:profileSetup.copy.steps.2.0'),
        t('memberProfile:profileSetup.copy.steps.2.1'),
      ],
      [
        t('memberProfile:profileSetup.copy.steps.3.0'),
        t('memberProfile:profileSetup.copy.steps.3.1'),
      ],
      [
        t('memberProfile:profileSetup.copy.steps.4.0'),
        t('memberProfile:profileSetup.copy.steps.4.1'),
      ],
      [
        t('memberProfile:profileSetup.copy.steps.5.0'),
        t('memberProfile:profileSetup.copy.steps.5.1'),
      ],
      [
        t('memberProfile:profileSetup.copy.steps.6.0'),
        t('memberProfile:profileSetup.copy.steps.6.1'),
      ],
    ],
    sections: {
      body: [
        t('memberProfile:profileSetup.copy.sections.body.0'),
        t('memberProfile:profileSetup.copy.sections.body.1'),
      ],
      goals: [
        t('memberProfile:profileSetup.copy.sections.goals.0'),
        t('memberProfile:profileSetup.copy.sections.goals.1'),
      ],
      health: [
        t('memberProfile:profileSetup.copy.sections.health.0'),
        t('memberProfile:profileSetup.copy.sections.health.1'),
      ],
      movement: [
        t('memberProfile:profileSetup.copy.sections.movement.0'),
        t('memberProfile:profileSetup.copy.sections.movement.1'),
      ],
      training: [
        t('memberProfile:profileSetup.copy.sections.training.0'),
        t('memberProfile:profileSetup.copy.sections.training.1'),
      ],
      recovery: [
        t('memberProfile:profileSetup.copy.sections.recovery.0'),
        t('memberProfile:profileSetup.copy.sections.recovery.1'),
      ],
      review: [
        t('memberProfile:profileSetup.copy.sections.review.0'),
        t('memberProfile:profileSetup.copy.sections.review.1'),
      ],
    },
    fields: {
      dob: t('memberProfile:profileSetup.copy.fields.dob'),
      sex: t('memberProfile:profileSetup.copy.fields.sex'),
      female: t('memberProfile:profileSetup.copy.fields.female'),
      male: t('memberProfile:profileSetup.copy.fields.male'),
      intersex: t('memberProfile:profileSetup.copy.fields.intersex'),
      preferNot: t('memberProfile:profileSetup.copy.fields.preferNot'),
      height: t('memberProfile:profileSetup.copy.fields.height'),
      weight: t('memberProfile:profileSetup.copy.fields.weight'),
      waist: t('memberProfile:profileSetup.copy.fields.waist'),
      bodyFat: t('memberProfile:profileSetup.copy.fields.bodyFat'),
      heartRate: t('memberProfile:profileSetup.copy.fields.heartRate'),
      source: t('memberProfile:profileSetup.copy.fields.source'),
      self: t('memberProfile:profileSetup.copy.fields.self'),
      scale: t('memberProfile:profileSetup.copy.fields.scale'),
      scan: t('memberProfile:profileSetup.copy.fields.scan'),
      primaryGoal: t('memberProfile:profileSetup.copy.fields.primaryGoal'),
      targetWeight: t('memberProfile:profileSetup.copy.fields.targetWeight'),
      targetDate: t('memberProfile:profileSetup.copy.fields.targetDate'),
      secondaryGoals: t('memberProfile:profileSetup.copy.fields.secondaryGoals'),
      focusAreas: t('memberProfile:profileSetup.copy.fields.focusAreas'),
      conditions: t('memberProfile:profileSetup.copy.fields.conditions'),
      details: t('memberProfile:profileSetup.copy.fields.details'),
      medications: t('memberProfile:profileSetup.copy.fields.medications'),
      allergies: t('memberProfile:profileSetup.copy.fields.allergies'),
      surgeries: t('memberProfile:profileSetup.copy.fields.surgeries'),
      currentPain: t('memberProfile:profileSetup.copy.fields.currentPain'),
      painAreas: t('memberProfile:profileSetup.copy.fields.painAreas'),
      painLevel: t('memberProfile:profileSetup.copy.fields.painLevel'),
      injuryDetails: t('memberProfile:profileSetup.copy.fields.injuryDetails'),
      restrictions: t('memberProfile:profileSetup.copy.fields.restrictions'),
      experience: t('memberProfile:profileSetup.copy.fields.experience'),
      activityLevel: t('memberProfile:profileSetup.copy.fields.activityLevel'),
      cardioDays: t('memberProfile:profileSetup.copy.fields.cardioDays'),
      cardioMinutes: t('memberProfile:profileSetup.copy.fields.cardioMinutes'),
      strengthDays: t('memberProfile:profileSetup.copy.fields.strengthDays'),
      availableDays: t('memberProfile:profileSetup.copy.fields.availableDays'),
      session: t('memberProfile:profileSetup.copy.fields.session'),
      environments: t('memberProfile:profileSetup.copy.fields.environments'),
      equipment: t('memberProfile:profileSetup.copy.fields.equipment'),
      preferred: t('memberProfile:profileSetup.copy.fields.preferred'),
      avoided: t('memberProfile:profileSetup.copy.fields.avoided'),
      sleep: t('memberProfile:profileSetup.copy.fields.sleep'),
      stress: t('memberProfile:profileSetup.copy.fields.stress'),
      work: t('memberProfile:profileSetup.copy.fields.work'),
      smoking: t('memberProfile:profileSetup.copy.fields.smoking'),
      alcohol: t('memberProfile:profileSetup.copy.fields.alcohol'),
    },
    yes: t('memberProfile:profileSetup.copy.yes'),
    no: t('memberProfile:profileSetup.copy.no'),
    unsure: t('memberProfile:profileSetup.copy.unsure'),
    none: t('memberProfile:profileSetup.copy.none'),
    privacyTitle: t('memberProfile:profileSetup.copy.privacyTitle'),
    shareTrainer: t('memberProfile:profileSetup.copy.shareTrainer'),
    accuracy: t('memberProfile:profileSetup.copy.accuracy'),
    screeningConsent: t('memberProfile:profileSetup.copy.screeningConsent'),
    reviewLabels: {
      body: t('memberProfile:profileSetup.copy.reviewLabels.body'),
      goal: t('memberProfile:profileSetup.copy.reviewLabels.goal'),
      health: t('memberProfile:profileSetup.copy.reviewLabels.health'),
      schedule: t('memberProfile:profileSetup.copy.reviewLabels.schedule'),
      bmi: t('memberProfile:profileSetup.copy.reviewLabels.bmi'),
    },
    readinessEyebrow: t('memberProfile:profileSetup.copy.readinessEyebrow'),
    readiness: {
      ready: [
        t('memberProfile:profileSetup.copy.readiness.ready.0'),
        t('memberProfile:profileSetup.copy.readiness.ready.1'),
      ],
      pt_review: [
        t('memberProfile:profileSetup.copy.readiness.pt_review.0'),
        t('memberProfile:profileSetup.copy.readiness.pt_review.1'),
      ],
      medical_review: [
        t('memberProfile:profileSetup.copy.readiness.medical_review.0'),
        t('memberProfile:profileSetup.copy.readiness.medical_review.1'),
      ],
    },
  };
}

function toOptions(items: Array<[string, string]>): Option[] {
  return items.map(([value, label]) => ({ value, label }));
}

const goals = (t: TFunction): Option[] =>
  toOptions([
    ['muscle_gain', t('memberProfile:profileSetup.buildMuscle')],
    ['fat_loss', t('memberProfile:profileSetup.loseFat')],
    ['strength', t('memberProfile:profileSetup.buildStrength')],
    ['endurance', t('memberProfile:profileSetup.improveEndurance')],
    ['mobility', t('memberProfile:profileSetup.improveMobility')],
    ['general', t('memberProfile:profileSetup.generalFitness')],
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

const focusOptions = (t: TFunction): Option[] =>
  toOptions([
    ['full_body', t('memberProfile:profileSetup.fullBody')],
    ['chest', t('memberProfile:profileSetup.chest')],
    ['back', t('memberProfile:profileSetup.back')],
    ['shoulders', t('memberProfile:profileSetup.shoulders')],
    ['arms', t('memberProfile:profileSetup.arms')],
    ['core', 'Core'],
    ['glutes', t('memberProfile:profileSetup.glutes')],
    ['legs', t('memberProfile:profileSetup.legs')],
  ]);

const painOptions = (t: TFunction): Option[] =>
  toOptions([
    ['neck', t('memberProfile:profileSetup.neck')],
    ['shoulder', t('memberProfile:profileSetup.shoulder')],
    ['elbow', t('memberProfile:profileSetup.elbow')],
    ['wrist', t('memberProfile:profileSetup.wrist')],
    ['upper_back', t('memberProfile:profileSetup.upperBack')],
    ['lower_back', t('memberProfile:profileSetup.lowerBack')],
    ['hip', t('memberProfile:profileSetup.hip')],
    ['knee', t('memberProfile:profileSetup.knee')],
    ['ankle', t('memberProfile:profileSetup.ankle')],
  ]);

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = getCopy(t);
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
    ['heartOrChestSymptoms', t('memberProfile:profileSetup.inThePastSix')],
    ['highBloodPressure', t('memberProfile:profileSetup.haveYouBeenDiagnosed')],
    ['dizzinessOrFainting', t('memberProfile:profileSetup.doYouExperienceDizziness')],
    ['breathlessAtRest', t('memberProfile:profileSetup.doYouExperienceShortness')],
    ['recentConcussion', t('memberProfile:profileSetup.haveYouHadA')],
    ['providerRestriction', t('memberProfile:profileSetup.hasAHealthcareProfessional')],
  ];
  const conditionOptions: Option[] = toOptions([
    ['none', copy.none],
    ['cardiovascular', t('memberProfile:profileSetup.cardiovascular')],
    ['hypertension', t('memberProfile:profileSetup.hypertension')],
    ['diabetes', t('memberProfile:profileSetup.diabetes')],
    ['asthma', t('memberProfile:profileSetup.asthmaRespiratory')],
    ['arthritis', t('memberProfile:profileSetup.arthritis')],
    ['osteoporosis', t('memberProfile:profileSetup.osteoporosis')],
    ['neurological', t('memberProfile:profileSetup.neurological')],
    ['kidney', t('memberProfile:profileSetup.kidneyDisease')],
    ['cancer', t('memberProfile:profileSetup.cancer')],
    ['pregnancy', t('memberProfile:profileSetup.pregnancyPostpartum')],
    ['other', t('memberProfile:profileSetup.other')],
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
          {step === 1 && <GoalStep copy={copy} profile={profile} setSection={setSection} />}
          {step === 2 && (
            <HealthStep
              copy={copy}
              profile={profile}
              questions={healthQuestions}
              conditions={conditionOptions}
              setSection={setSection}
            />
          )}
          {step === 3 && <MovementStep copy={copy} profile={profile} setSection={setSection} />}
          {step === 4 && (
            <TrainingStep copy={copy} isVi={isVi} profile={profile} setSection={setSection} />
          )}
          {step === 5 && <RecoveryStep copy={copy} profile={profile} setSection={setSection} />}
          {step === 6 && <ReviewStep copy={copy} profile={profile} readiness={readiness} />}
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
  profile,
  setSection,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const { t } = useTranslation();
  const data = profile.goals;
  return (
    <>
      <SectionHeader title={copy.sections.goals[0] ?? ''} body={copy.sections.goals[1] ?? ''} />
      <Block title={copy.fields.primaryGoal}>
        <ChoiceGrid
          options={goals(t)}
          value={data.primary}
          onChange={(primary) =>
            setSection('goals', { ...data, primary: primary as typeof data.primary })
          }
        />
      </Block>
      <Block title={copy.fields.secondaryGoals} note={copy.chooseMany}>
        <ChipGroup
          options={goals(t).filter((o) => o.value !== data.primary)}
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
          options={focusOptions(t)}
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
  profile,
  setSection,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const { t } = useTranslation();
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
              options={painOptions(t)}
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
  const { t } = useTranslation();
  const data = profile.training;
  const equipment: Option[] = toOptions([
    ['bodyweight', t('memberProfile:profileSetup.bodyweight')],
    ['dumbbells', t('memberProfile:profileSetup.dumbbells')],
    ['barbell', t('memberProfile:profileSetup.barbell')],
    ['machines', t('memberProfile:profileSetup.machines')],
    ['bands', t('memberProfile:profileSetup.bands')],
    ['cardio', t('memberProfile:profileSetup.cardioMachines')],
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
              label: t('memberProfile:profileSetup.beginnerUnder6Months'),
            },
            {
              value: 'intermediate',
              label: t('memberProfile:profileSetup.intermediate624Months'),
            },
            {
              value: 'advanced',
              label: t('memberProfile:profileSetup.advancedOver2Years'),
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
            { value: 'sedentary', label: t('memberProfile:profileSetup.sedentary') },
            { value: 'light', label: t('memberProfile:profileSetup.lightlyActive') },
            { value: 'moderate', label: t('memberProfile:profileSetup.moderatelyActive') },
            { value: 'high', label: t('memberProfile:profileSetup.highlyActive') },
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
              { value: 'gym', label: t('memberProfile:profileSetup.gym') },
              { value: 'home', label: t('memberProfile:profileSetup.home') },
              { value: 'outdoor', label: t('memberProfile:profileSetup.outdoor') },
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
  profile,
  setSection,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const { t } = useTranslation();
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
            label: `${value} · ${[t('memberProfile:profileSetup.recoveryStep.0'), t('memberProfile:profileSetup.recoveryStep.1'), t('memberProfile:profileSetup.recoveryStep.2'), t('memberProfile:profileSetup.recoveryStep.3'), t('memberProfile:profileSetup.recoveryStep.4')][value - 1]}`,
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
            { value: 'mostly_sitting', label: t('memberProfile:profileSetup.mostlySitting') },
            { value: 'mixed', label: t('memberProfile:profileSetup.mixed') },
            { value: 'mostly_active', label: t('memberProfile:profileSetup.mostlyActive') },
            { value: 'shift_work', label: t('memberProfile:profileSetup.shiftWork') },
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
  profile,
  readiness,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  readiness: ReturnType<typeof calculateProfileReadiness>;
}) {
  const { t } = useTranslation();
  const status = copy.readiness[readiness.level];
  return (
    <>
      <SectionHeader title={copy.sections.review[0] ?? ''} body={copy.sections.review[1] ?? ''} />
      <section className={cn('profile-readiness', `is-${readiness.level}`)}>
        {readiness.level === 'ready' ? <ClipboardCheck size={28} /> : <CircleAlert size={28} />}
        <div>
          <span>
            {BRAND_MARK.toUpperCase()} {copy.readinessEyebrow}
          </span>
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
          value={goals(t).find((o) => o.value === profile.goals.primary)?.label ?? '—'}
          detail={profile.goals.targetDate || '—'}
        />
        <ReviewCard
          icon={<HeartPulse size={20} />}
          label={copy.reviewLabels.health}
          value={
            profile.health.conditions.includes('none')
              ? copy.none
              : `${profile.health.conditions.length} ${t('memberProfile:profileSetup.itemsRecorded')}`
          }
          detail={profile.movement.painAreas.join(', ') || '—'}
        />
        <ReviewCard
          icon={<Dumbbell size={20} />}
          label={copy.reviewLabels.schedule}
          value={`${profile.training.availableDays.length} ${t('memberProfile:profileSetup.daysWeek')}`}
          detail={`${profile.training.sessionMinutes} min · ${profile.training.experience}`}
        />
      </div>
      <div className="profile-review-notice">
        <ShieldCheck size={18} />
        <span>{t('memberProfile:profileSetup.aIReceivesOnlyStructured')}</span>
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
