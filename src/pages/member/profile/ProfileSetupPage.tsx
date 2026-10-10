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
  Flame,
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
  estimateEnergy,
  getInjuryAdvice,
  useProfileSetupStore,
  useSyncFitnessProfile,
  type MemberFitnessProfile,
  type TernaryAnswer,
  type YesNoAnswer,
} from '@/features/member-fitness';
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
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
    required: t('memberProfile:profileSetup.copy.required'),
    savedDone: t('memberProfile:profileSetup.copy.savedDone'),
    syncFailed: t('memberProfile:profileSetup.copy.syncFailed'),
    optional: t('memberProfile:profileSetup.copy.optional'),
    injuryAdvice: {
      train_lower: t('memberProfile:profileSetup.copy.injuryAdvice.train_lower'),
      train_upper: t('memberProfile:profileSetup.copy.injuryAdvice.train_upper'),
      rest: t('memberProfile:profileSetup.copy.injuryAdvice.rest'),
    },
    units: {
      days: t('memberProfile:profileSetup.copy.units.days'),
      min: t('memberProfile:profileSetup.copy.units.min'),
      hours: t('memberProfile:profileSetup.copy.units.hours'),
    },
    healthNotice: {
      lead: t('memberProfile:profileSetup.copy.healthNotice.lead'),
      items: t('memberProfile:profileSetup.copy.healthNotice.items', {
        returnObjects: true,
      }) as string[],
      footer: t('memberProfile:profileSetup.copy.healthNotice.footer'),
    },
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
      targetWeight: t('memberProfile:profileSetup.copy.fields.targetWeight'),
      targetDate: t('memberProfile:profileSetup.copy.fields.targetDate'),
      goals: t('memberProfile:profileSetup.copy.fields.goals'),
      upperInjury: t('memberProfile:profileSetup.copy.fields.upperInjury'),
      lowerInjury: t('memberProfile:profileSetup.copy.fields.lowerInjury'),
      upperBody: t('memberProfile:profileSetup.copy.fields.upperBody'),
      lowerBody: t('memberProfile:profileSetup.copy.fields.lowerBody'),
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
    ['cardio_endurance', t('memberProfile:profileSetup.improveCardioEndurance')],
    ['muscular_endurance', t('memberProfile:profileSetup.improveMuscularEndurance')],
    ['mobility', t('memberProfile:profileSetup.improveMobility')],
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

  const isStepValid = (index: number) => {
    if (
      index === 1 &&
      (!identity.dateOfBirth ||
        !identity.sexAtBirth ||
        !identity.heightCm ||
        !identity.weightKg ||
        !identity.activityLevel)
    )
      return false;
    if (index === 2 && goal.selected.length === 0) return false;
    if (index === 3 && (!profile.movement.upperBodyInjury || !profile.movement.lowerBodyInjury))
      return false;
    if (
      index === 4 &&
      (!training.experience ||
        training.availableDays.length === 0 ||
        !training.sessionMinutes ||
        training.environments.length === 0)
    )
      return false;
    if (
      index === 5 &&
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
    if (!isStepValid(step)) {
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
              className={cn(
                index === step && 'is-active',
                index !== step && index < 6 && isStepValid(index) && 'is-complete',
              )}
              onClick={() => {
                setStep(index);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span>
                {index !== step && index < 6 && isStepValid(index) ? (
                  <Check size={14} />
                ) : (
                  index + 1
                )}
              </span>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
            </button>
          ))}
        </aside>
        <main className="profile-form-card">
          {step === 0 && <HealthNoticeStep copy={copy} />}
          {step === 1 && (
            <BodyStep copy={copy} profile={profile} readiness={readiness} setSection={setSection} />
          )}
          {step === 2 && <GoalStep copy={copy} profile={profile} setSection={setSection} />}
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
                  // Steps can be filled in any order, so check every required step before saving.
                  const firstInvalid = [0, 1, 2, 3, 4, 5].find((index) => !isStepValid(index));
                  if (firstInvalid !== undefined) {
                    toast.error(copy.required);
                    setStep(firstInvalid);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  completeProfile();
                  // Best effort: the local copy is the source of truth for the wizard; a failed
                  // sync is reported by the global mutation error toast and retried on next save.
                  syncProfile.mutate(profile, { onError: () => toast.error(copy.syncFailed) });
                  toast.success(copy.savedDone);
                  void navigate(ROUTES.member.root);
                }}
              >
                {copy.save} <ArrowRight size={17} />
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

function EnergyCard({ identity }: { identity: MemberFitnessProfile['identity'] }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const estimate = useMemo(() => estimateEnergy(identity), [identity]);
  const number = new Intl.NumberFormat(locale);

  return (
    <section className="profile-energy" aria-live="polite">
      <header>
        <Flame size={18} aria-hidden="true" />
        <strong>{t('memberProfile:profileSetup.energy.title')}</strong>
      </header>
      {estimate.status === 'ok' ? (
        <>
          <dl>
            <div>
              <dt>{t('memberProfile:profileSetup.energy.ree')}</dt>
              <dd>
                {number.format(estimate.reeKcal)} <small>kcal</small>
              </dd>
            </div>
            <div>
              <dt>{t('memberProfile:profileSetup.energy.pal')}</dt>
              <dd>× {estimate.pal}</dd>
            </div>
            <div className="is-total">
              <dt>{t('memberProfile:profileSetup.energy.tdee')}</dt>
              <dd>
                ≈ {number.format(estimate.tdeeKcal)} <small>kcal</small>
              </dd>
              <span>
                {t('memberProfile:profileSetup.energy.range', {
                  low: number.format(estimate.tdeeLowKcal),
                  high: number.format(estimate.tdeeHighKcal),
                })}
              </span>
            </div>
          </dl>
          <p>{t('memberProfile:profileSetup.energy.disclaimer')}</p>
        </>
      ) : (
        <p>{t(`memberProfile:profileSetup.energy.${estimate.status}`)}</p>
      )}
    </section>
  );
}

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
  const { t } = useTranslation();
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
      </div>
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
            setSection('identity', {
              ...data,
              activityLevel: activityLevel as typeof data.activityLevel,
            })
          }
        />
      </Block>
      {readiness.bmi && (
        <div className="profile-metric-strip">
          <Activity size={19} />
          <span>{copy.reviewLabels.bmi}</span>
          <strong>{readiness.bmi.toFixed(1)}</strong>
        </div>
      )}
      <EnergyCard identity={data} />
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
      <Block title={copy.fields.goals} note={copy.chooseMany}>
        <ChipGroup
          options={goals(t)}
          values={data.selected}
          onChange={(selected) =>
            setSection('goals', { ...data, selected: selected as typeof data.selected })
          }
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

function HealthNoticeStep({ copy }: { copy: Copy }) {
  return (
    <>
      <SectionHeader title={copy.sections.health[0] ?? ''} body={copy.sections.health[1] ?? ''} />
      <section className="profile-health-notice" role="note">
        <CircleAlert size={20} aria-hidden="true" />
        <div>
          <p>{copy.healthNotice.lead}</p>
          <ul>
            {copy.healthNotice.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <small>{copy.healthNotice.footer}</small>
        </div>
      </section>
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

function YesNo({
  value,
  onChange,
  labels,
}: {
  value: YesNoAnswer;
  onChange: (value: YesNoAnswer) => void;
  labels: [string, string];
}) {
  return (
    <div className="profile-ternary">
      {(['yes', 'no'] as const).map((answer, index) => (
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

function MovementStep({
  copy,
  profile,
  setSection,
}: {
  copy: Copy;
  profile: MemberFitnessProfile;
  setSection: SetSection;
}) {
  const data = profile.movement;
  const advice = getInjuryAdvice(data);
  return (
    <>
      <SectionHeader
        title={copy.sections.movement[0] ?? ''}
        body={copy.sections.movement[1] ?? ''}
      />
      {(
        [
          ['upperBodyInjury', copy.fields.upperInjury],
          ['lowerBodyInjury', copy.fields.lowerInjury],
        ] as const
      ).map(([key, question]) => (
        <div className="profile-feature-question" key={key}>
          <div>
            <HeartPulse size={22} />
            <strong>{question}</strong>
          </div>
          <YesNo
            value={data[key]}
            labels={[copy.yes, copy.no]}
            onChange={(answer) => setSection('movement', { ...data, [key]: answer })}
          />
        </div>
      ))}
      {advice && advice !== 'none' && (
        <p className={cn('profile-health-notice', advice === 'rest' && 'is-rest')} role="note">
          <CircleAlert size={20} aria-hidden="true" />
          {copy.injuryAdvice[advice]}
        </p>
      )}
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
      <div className="profile-form-grid is-three">
        <UnitNumber
          label={copy.fields.cardioDays}
          unit={copy.units.days}
          optional={copy.optional}
          value={data.cardioDays}
          min={0}
          max={7}
          onChange={(v) => setSection('training', { ...data, cardioDays: parseNumber(v) })}
        />
        <UnitNumber
          label={copy.fields.cardioMinutes}
          unit={copy.units.min}
          optional={copy.optional}
          value={data.cardioMinutes}
          min={0}
          max={300}
          onChange={(v) => setSection('training', { ...data, cardioMinutes: parseNumber(v) })}
        />
        <UnitNumber
          label={copy.fields.strengthDays}
          unit={copy.units.days}
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
          options={[30, 45, 60, 75, 90].map((m) => ({
            value: String(m),
            label: `${m} ${copy.units.min}`,
          }))}
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
          unit={copy.units.hours}
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
          value={
            goals(t)
              .filter((o) => (profile.goals.selected as string[]).includes(o.value))
              .map((o) => o.label)
              .join(', ') || '—'
          }
          detail={profile.goals.targetDate || '—'}
        />
        <ReviewCard
          icon={<HeartPulse size={20} />}
          label={copy.reviewLabels.health}
          value={
            [
              profile.movement.upperBodyInjury === 'yes' ? copy.fields.upperBody : '',
              profile.movement.lowerBodyInjury === 'yes' ? copy.fields.lowerBody : '',
            ]
              .filter(Boolean)
              .join(', ') || copy.none
          }
          detail=""
        />
        <ReviewCard
          icon={<Dumbbell size={20} />}
          label={copy.reviewLabels.schedule}
          value={`${profile.training.availableDays.length} ${t('memberProfile:profileSetup.daysWeek')}`}
          detail={`${profile.training.sessionMinutes} ${copy.units.min} · ${profile.training.experience}`}
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
