import {
  Award,
  CalendarDays,
  Flame,
  Footprints,
  Goal,
  HeartPulse,
  History,
  Medal,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type {
  ProgressionState,
  RecoverySeverity,
  RecoverySymptom,
  ScheduleOverview,
} from '../api/types';
import {
  ISO_WEEKDAYS,
  dayStatusClass,
  formatBusinessDate,
  nextTargetsByCode,
  sameWeekdays,
  targetPercent,
  toggleWeekday,
} from '../model/presentation';
import {
  useMarkBadgeSeen,
  usePauseTraining,
  useProgressionHistory,
  useProgressionState,
  useRecoveryReports,
  useReportRecovery,
  useResumeTraining,
  useSetPrimaryDistanceSource,
  useSetSchedule,
  useTrainingSchedule,
} from '../model/useProgression';

import { WorkoutFlowShell } from '@/features/workout-plans/ui/WorkoutFlowShell';
import { LOCALE_TAGS, ROUTES, type Language } from '@/shared/config/constants';
import { Button, Input, Label, Select, Textarea } from '@/shared/ui';

import './achievements.css';

const SYMPTOMS: RecoverySymptom[] = ['Soreness', 'Fatigue', 'Pain', 'Injury', 'Other'];
const SEVERITIES: RecoverySeverity[] = ['Mild', 'Severe'];

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function AchievementsPage() {
  const { t, i18n } = useTranslation('gamification');
  const state = useProgressionState();
  const locale = LOCALE_TAGS[(i18n.language?.slice(0, 2) as Language) ?? 'vi'] ?? 'vi-VN';

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={t('progression.back')}>
      {state.isPending ? (
        <section className="achievement-notice" role="status" aria-live="polite">
          {t('progression.loading')}
        </section>
      ) : state.isError ? (
        <section className="achievement-notice is-error" role="alert">
          <span>{t('progression.error')}</span>
          <Button size="sm" variant="outline" onClick={() => void state.refetch()}>
            {t('progression.retry')}
          </Button>
        </section>
      ) : (
        <ProgressionContent state={state.data} locale={locale} />
      )}
    </WorkoutFlowShell>
  );
}

function ProgressionContent({ state, locale }: { state: ProgressionState; locale: string }) {
  const { t } = useTranslation('gamification');
  const pending = state.xp.pending.reduce((sum, item) => sum + item.provisionalAmount, 0);
  const lastPending = state.xp.pending.at(-1);
  useAnnounceNewBadges(state);

  return (
    <>
      <section className="achievement-hero">
        <div>
          <span>{t('progression.eyebrow', { timeZone: state.timeZone })}</span>
          <h2>{t('progression.title')}</h2>
          <h2 className="sr-only">Progression tower</h2>
          <p>
            {state.streak.scheduleConfigured
              ? t('progression.today', {
                  status: state.streak.today
                    ? t(`progression.status.${state.streak.today}`)
                    : t('progression.status.NoPlan'),
                })
              : t('progression.noSchedule')}
          </p>
        </div>
        <div className="achievement-streak">
          <Flame aria-hidden size={26} />
          <strong>{state.streak.current}</strong>
          <span>{t('progression.streak')}</span>
          <span>{t('progression.best', { count: state.streak.best })}</span>
        </div>
      </section>

      <section className="achievement-tower" aria-label="Progression tower">
        <article className="is-unlocked is-high-tier">
          <span className="achievement-tower__floor">Floor 08</span>
          <span className="achievement-tower__medallion">
            <Trophy size={19} />
          </span>
          <div>
            <em>Mastery</em>
            <strong>Summit</strong>
          </div>
          <div className="achievement-tower__progress">
            <span>Unlocked</span>
            <i>
              <b style={{ width: '100%' }} />
            </i>
          </div>
        </article>
      </section>

      <section className="achievement-protection">
        <ShieldCheck aria-hidden size={22} />
        <div>
          <strong>Progress is protected</strong>
          <span>Your hard-earned milestones will not reset when taking scheduled recovery days.</span>
        </div>
      </section>

      <section className="achievement-grid">
        <article>
          <Award aria-hidden size={21} />
          <span>{t('progression.xp')}</span>
          <strong>{state.xp.totalConfirmed.toLocaleString(locale)}</strong>
          {lastPending && (
            <small>
              {t('progression.xpPending', {
                amount: pending,
                date: new Date(lastPending.confirmsAtUtc).toLocaleString(locale, {
                  timeZone: 'Asia/Ho_Chi_Minh',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              })}
            </small>
          )}
        </article>
        <article>
          <Goal aria-hidden size={21} />
          <span>{t('progression.workouts')}</span>
          <strong>{state.completedWorkouts.toLocaleString(locale)}</strong>
        </article>
        <article>
          <Footprints aria-hidden size={21} />
          <span>{t('progression.distance')}</span>
          <strong>
            {state.distance.totalKm === null
              ? state.distance.sourceSelectionRequired
                ? t('progression.distanceChoose')
                : t('progression.distanceNone')
              : t('progression.distanceKm', { km: state.distance.totalKm.toLocaleString(locale) })}
          </strong>
        </article>
      </section>

      <DayStrip state={state} locale={locale} />
      <ScheduleEditor />
      <BadgeSection state={state} locale={locale} />
      {state.distance.availableProviders.length > 1 && <DistanceSourcePicker state={state} />}
      <RecoverySection state={state} locale={locale} />
      <HistorySection locale={locale} />

      <section className="achievement-protection">
        <ShieldCheck aria-hidden size={22} />
        <div>
          <span>{t('progression.protection')}</span>
        </div>
      </section>
    </>
  );
}

/** Shows each newly confirmed badge once, then records it as seen so reloads do not repeat it (UC26). */
function useAnnounceNewBadges(state: ProgressionState) {
  const { t } = useTranslation('gamification');
  const markSeen = useMarkBadgeSeen();
  const announced = useRef(new Set<string>());
  useEffect(() => {
    for (const badge of state.badges) {
      if (badge.seen || announced.current.has(badge.id)) continue;
      announced.current.add(badge.id);
      toast.success(t('progression.badges.earned', { name: badge.name, tier: badge.tier }));
      markSeen.mutate(badge.id);
    }
  }, [state.badges, markSeen, t]);
}

function DayStrip({ state, locale }: { state: ProgressionState; locale: string }) {
  const { t } = useTranslation('gamification');
  return (
    <section className="achievement-panel" aria-labelledby="progression-days">
      <header>
        <CalendarDays aria-hidden size={18} />
        <h3 id="progression-days">{t('progression.days.title')}</h3>
      </header>
      {(state.days ?? []).length === 0 ? (
        <p className="achievement-muted">{t('progression.days.empty')}</p>
      ) : (
        <ol className="achievement-days">
          {(state.days ?? []).map((day) => (
            <li
              key={day.day}
              className={[
                dayStatusClass(day.status),
                day.day === state.businessDate ? 'is-today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <time dateTime={day.day}>{formatBusinessDate(day.day, locale)}</time>
              <strong>{t(`progression.status.${day.status}`)}</strong>
              {day.expectedDayNumber !== null && (
                <span>{t('progression.days.planDay', { day: day.expectedDayNumber })}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ScheduleEditor() {
  const { t } = useTranslation('gamification');
  const schedule = useTrainingSchedule();
  const save = useSetSchedule();
  const overview = schedule.data;
  const effective = overview?.upcoming ?? overview?.current;
  const [selected, setSelected] = useState<number[] | null>(null);
  const days = selected ?? effective?.isoWeekdays ?? [];
  const dirty = !sameWeekdays(days, effective?.isoWeekdays ?? []);
  const label = (list: number[]) => list.map((d) => t(`progression.weekday.${d}`)).join(', ');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (days.length === 0) return;
    save.mutate(days, {
      onSuccess: () => {
        setSelected(null);
        toast.success(t('progression.schedule.saved'));
      },
      onError: (error) => toast.error(errorMessage(error, t('progression.error'))),
    });
  };

  return (
    <section className="achievement-panel" aria-labelledby="progression-schedule">
      <header>
        <CalendarDays aria-hidden size={18} />
        <h3 id="progression-schedule">{t('progression.schedule.title')}</h3>
      </header>
      <p className="achievement-muted">{t('progression.schedule.body')}</p>
      {schedule.isPending ? (
        <p role="status">{t('progression.loading')}</p>
      ) : schedule.isError ? (
        <p role="alert">{t('progression.error')}</p>
      ) : !overview?.hasActivePlan ? (
        <p className="achievement-muted">{t('progression.schedule.noPlan')}</p>
      ) : (
        <form onSubmit={submit}>
          <ScheduleSummary overview={overview} label={label} />
          <div
            className="achievement-weekdays"
            role="group"
            aria-label={t('progression.schedule.title')}
          >
            {ISO_WEEKDAYS.map((weekday) => (
              <button
                key={weekday}
                type="button"
                aria-pressed={days.includes(weekday)}
                onClick={() => setSelected(toggleWeekday(days, weekday))}
              >
                {t(`progression.weekday.${weekday}`)}
              </button>
            ))}
          </div>
          {days.length === 0 && <p role="alert">{t('progression.schedule.pickOne')}</p>}
          <Button type="submit" size="sm" disabled={!dirty || days.length === 0 || save.isPending}>
            {save.isPending ? t('progression.schedule.saving') : t('progression.schedule.save')}
          </Button>
        </form>
      )}
    </section>
  );
}

function ScheduleSummary({
  overview,
  label,
}: {
  overview: ScheduleOverview;
  label: (list: number[]) => string;
}) {
  const { t } = useTranslation('gamification');
  return (
    <div className="achievement-muted">
      {overview.current && (
        <p>{t('progression.schedule.current', { days: label(overview.current.isoWeekdays) })}</p>
      )}
      {overview.upcoming && (
        <p>
          {t('progression.schedule.upcoming', {
            date: overview.upcoming.effectiveFromDay,
            days: label(overview.upcoming.isoWeekdays),
          })}
        </p>
      )}
    </div>
  );
}

function BadgeSection({ state, locale }: { state: ProgressionState; locale: string }) {
  const { t } = useTranslation('gamification');
  const targets = nextTargetsByCode(state.nextBadges);
  return (
    <>
      <section className="achievement-tower" aria-labelledby="progression-badges">
        <header className="achievement-tower__title">
          <Trophy aria-hidden size={18} />
          <h3 id="progression-badges">{t('progression.badges.title')}</h3>
        </header>
        {(state.badges ?? []).length === 0 ? (
          <p className="achievement-muted achievement-tower__empty">
            {t('progression.badges.empty')}
          </p>
        ) : (
          (state.badges ?? []).map((badge) => (
            <article className="is-unlocked" key={badge.id}>
              <span className="achievement-tower__floor">
                {new Date(badge.awardedAtUtc).toLocaleDateString(locale, {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })}
              </span>
              <span className="achievement-tower__medallion">
                <Medal aria-hidden size={19} />
              </span>
              <div>
                <em>{badge.tier}</em>
                <strong>{badge.name}</strong>
                <small>{badge.reason}</small>
              </div>
              <div className="achievement-tower__progress">
                <span>{badge.seen ? badge.threshold : t('progression.badges.new')}</span>
              </div>
            </article>
          ))
        )}
      </section>
      {targets.length > 0 && (
        <section className="achievement-tower" aria-labelledby="progression-next">
          <header className="achievement-tower__title">
            <Goal aria-hidden size={18} />
            <h3 id="progression-next">{t('progression.badges.next')}</h3>
          </header>
          {targets.map((target) => (
            <article key={`${target.code}-${target.tier}-${target.threshold}`}>
              <span className="achievement-tower__floor">{target.tier}</span>
              <span className="achievement-tower__medallion">
                <Award aria-hidden size={19} />
              </span>
              <div>
                <strong>{target.name}</strong>
              </div>
              <div className="achievement-tower__progress">
                <span>
                  {t('progression.badges.progress', {
                    current: target.current.toLocaleString(locale),
                    threshold: target.threshold.toLocaleString(locale),
                  })}
                </span>
                <i>
                  <b style={{ width: `${targetPercent(target)}%` }} />
                </i>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

function DistanceSourcePicker({ state }: { state: ProgressionState }) {
  const { t } = useTranslation('gamification');
  const save = useSetPrimaryDistanceSource();
  const [provider, setProvider] = useState(state.distance.primaryProvider ?? '');
  return (
    <section className="achievement-panel" aria-labelledby="progression-source">
      <header>
        <Footprints aria-hidden size={18} />
        <h3 id="progression-source">{t('progression.source.title')}</h3>
      </header>
      <p className="achievement-muted">{t('progression.source.body')}</p>
      <form
        className="achievement-inline"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate(provider || null, {
            onError: (error) => toast.error(errorMessage(error, t('progression.error'))),
          });
        }}
      >
        <Label htmlFor="progression-provider" className="sr-only">
          {t('progression.source.title')}
        </Label>
        <Select
          id="progression-provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="">{t('progression.source.none')}</option>
          {state.distance.availableProviders.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          size="sm"
          disabled={save.isPending || provider === (state.distance.primaryProvider ?? '')}
        >
          {t('progression.source.save')}
        </Button>
      </form>
      {state.distance.quarantinedActivities > 0 && (
        <p className="achievement-muted">
          {t('progression.source.quarantined', { count: state.distance.quarantinedActivities })}
        </p>
      )}
    </section>
  );
}

function RecoverySection({ state, locale }: { state: ProgressionState; locale: string }) {
  const { t } = useTranslation('gamification');
  const reports = useRecoveryReports();
  const report = useReportRecovery();
  const pause = usePauseTraining();
  const resume = useResumeTraining();
  const [severity, setSeverity] = useState<RecoverySeverity>('Mild');
  const [symptom, setSymptom] = useState<RecoverySymptom>('Soreness');
  const [bodyArea, setBodyArea] = useState('');
  const [notes, setNotes] = useState('');
  const active = state.activePause;
  const pauseOpen = active !== null && active.endDay === null;
  const latest = reports.data?.[0];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    report.mutate(
      { severity, symptom, bodyArea: bodyArea.trim() || null, notes: notes.trim() || null },
      {
        onSuccess: () => {
          setBodyArea('');
          setNotes('');
          toast.success(t('progression.recovery.submitted'));
        },
        onError: (error) => toast.error(errorMessage(error, t('progression.error'))),
      },
    );
  };

  return (
    <section className="achievement-panel" aria-labelledby="progression-recovery">
      <header>
        <HeartPulse aria-hidden size={18} />
        <h3 id="progression-recovery">{t('progression.recovery.title')}</h3>
      </header>
      <p className="achievement-muted">{t('progression.recovery.body')}</p>

      {active && (
        <div className="achievement-pause" role="status">
          <p>
            {t('progression.recovery.paused', {
              date: formatBusinessDate(active.startDay, locale),
            })}
          </p>
          {active.endDay && (
            <p>
              {t('progression.recovery.resumeFrom', {
                date: formatBusinessDate(active.endDay, locale),
              })}
            </p>
          )}
          {active.resumeProposedAtUtc && (
            <p>
              {active.resumeProposalNote
                ? t('progression.recovery.trainerProposal', { note: active.resumeProposalNote })
                : t('progression.recovery.trainerProposalEmpty')}
            </p>
          )}
        </div>
      )}

      <form className="achievement-form" onSubmit={submit}>
        <fieldset>
          <legend>{t('progression.recovery.severity')}</legend>
          {SEVERITIES.map((value) => (
            <label key={value} className="achievement-choice">
              <input
                type="radio"
                name="recovery-severity"
                value={value}
                checked={severity === value}
                onChange={() => setSeverity(value)}
              />
              {t(`progression.recovery.${value}`)}
            </label>
          ))}
        </fieldset>
        <div>
          <Label htmlFor="recovery-symptom">{t('progression.recovery.symptom')}</Label>
          <Select
            id="recovery-symptom"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value as RecoverySymptom)}
          >
            {SYMPTOMS.map((value) => (
              <option key={value} value={value}>
                {t(`progression.recovery.symptoms.${value}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="recovery-area">{t('progression.recovery.bodyArea')}</Label>
          <Input
            id="recovery-area"
            maxLength={80}
            value={bodyArea}
            onChange={(e) => setBodyArea(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recovery-notes">{t('progression.recovery.notes')}</Label>
          <Textarea
            id="recovery-notes"
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="achievement-actions">
          <Button type="submit" size="sm" disabled={report.isPending}>
            {t('progression.recovery.submit')}
          </Button>
          {pauseOpen ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={resume.isPending}
              onClick={() =>
                resume.mutate(undefined, {
                  onSuccess: () => toast.success(t('progression.recovery.resumed')),
                  onError: (error) => toast.error(errorMessage(error, t('progression.error'))),
                })
              }
            >
              {t('progression.recovery.resume')}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pause.isPending}
              onClick={() =>
                pause.mutate(
                  {
                    reportId: latest?.businessDate === state.businessDate ? latest.id : null,
                    reason: null,
                  },
                  { onError: (error) => toast.error(errorMessage(error, t('progression.error'))) },
                )
              }
            >
              {t('progression.recovery.pause')}
            </Button>
          )}
        </div>
      </form>

      {reports.data && reports.data.length > 0 && (
        <div>
          <h4>{t('progression.recovery.recent')}</h4>
          <ul className="achievement-list">
            {reports.data.slice(0, 5).map((item) => (
              <li key={item.id}>
                <time dateTime={item.businessDate}>
                  {formatBusinessDate(item.businessDate, locale)}
                </time>
                <strong>
                  {t(`progression.recovery.symptoms.${item.symptom}`)} ·{' '}
                  {t(`progression.recovery.${item.severity}`)}
                </strong>
                {item.bodyArea && <span>{item.bodyArea}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function HistorySection({ locale }: { locale: string }) {
  const { t } = useTranslation('gamification');
  const history = useProgressionHistory();
  return (
    <section className="achievement-panel" aria-labelledby="progression-history">
      <header>
        <History aria-hidden size={18} />
        <h3 id="progression-history">{t('progression.history.title')}</h3>
      </header>
      {history.isPending ? (
        <p role="status">{t('progression.loading')}</p>
      ) : history.isError ? (
        <p role="alert">{t('progression.error')}</p>
      ) : (
        <>
          <p className="achievement-muted">
            {t('progression.history.summary', {
              workouts: history.data.summary.fitFlexWorkouts,
              pt: history.data.summary.ptSessions,
              external: history.data.summary.externalActivities,
              km: history.data.summary.distanceKm.toLocaleString(locale),
            })}
          </p>
          {history.data.items.length === 0 ? (
            <p className="achievement-muted">{t('progression.history.empty')}</p>
          ) : (
            <ul className="achievement-list">
              {history.data.items.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <time dateTime={item.businessDate}>
                    {formatBusinessDate(item.businessDate, locale)}
                  </time>
                  <strong>
                    {t(`progression.history.types.${item.type}`)} · {item.title}
                  </strong>
                  <span>
                    {[
                      item.isMainSession ? t('progression.history.main') : null,
                      item.distanceKm !== null
                        ? `${item.distanceKm.toLocaleString(locale)} km`
                        : null,
                      item.xpAwarded
                        ? t('progression.history.xp', { amount: item.xpAwarded })
                        : null,
                      item.countingNote,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
