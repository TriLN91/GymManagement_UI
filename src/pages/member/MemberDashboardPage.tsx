import { Activity, Camera, Map, Play } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';

interface PlanCard {
  target: string;
  name: string;
  a: string;
  b: string;
}

const LABEL = 'text-[10px] font-bold uppercase tracking-widest text-forest/50';
const BADGE =
  'rounded-full border border-forest/20 bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest';
const POINTS = [
  [5, 80],
  [25, 60],
  [45, 90],
  [65, 50],
  [85, 30],
] as const;
const X_LABELS = [5, 25, 45, 65, 85];

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}

export function MemberDashboardPage() {
  const { t } = useTranslation('dashboard');
  const cards = t('plan.cards', { returnObjects: true }) as PlanCard[];
  const days = t('chart.days', { returnObjects: true }) as string[];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Left: Active Routine */}
        <div className="relative overflow-hidden rounded-xl border border-forest/20 bg-[var(--energy-lime-soft)] p-6 lg:col-span-2">
          <div className="bg-mint/5 pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full blur-3xl"></div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Map className="h-4 w-4 text-forest/40" />
            <div className="rounded-sm border border-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-forest/60">
              {t('plan.generated')}
            </div>
            <div className="rounded-sm bg-energy px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-forest">
              {t('plan.phase')}
            </div>
          </div>

          <h2 className="mb-4 font-syne text-2xl font-bold text-forest">{t('plan.title')}</h2>

          <div className="mb-8 flex flex-wrap items-end gap-6">
            {(
              [
                ['04', t('plan.exercises')],
                ['50', t('plan.minutes')],
                ['60.0', t('plan.kcal')],
              ] as const
            ).map(([value, label], i) => (
              <Fragment key={label}>
                {i > 0 ? <div className="text-3xl font-light text-forest/20">/</div> : null}
                <div>
                  <span className="font-syne text-4xl font-bold text-forest">{value}</span>
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                    {label}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.name}
                className="flex aspect-square flex-col justify-between rounded-lg border border-forest/10 bg-energy p-4"
              >
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/60">
                  {card.target}
                </div>
                <div className="mb-4 font-syne text-lg font-bold leading-tight text-forest">
                  {card.name}
                </div>
                <div className="mt-auto flex justify-between border-t border-forest/10 pt-2 text-xs font-bold text-forest">
                  <span>{card.a}</span>
                  <span>{card.b}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-forest/70">
              <Activity className="h-4 w-4 text-mint" />
              {t('plan.rpe')} <span className="font-bold text-forest">7.5</span>
            </div>
            <Button className="h-10 gap-2 rounded-full bg-forest px-6 font-bold text-white hover:bg-forest/90">
              {t('plan.start')} <Play className="h-3 w-3 fill-white" />
            </Button>
          </div>
        </div>

        {/* Right: Setup Progress */}
        <div className="relative flex h-full flex-col rounded-xl border border-forest/20 bg-white p-6 lg:col-span-1">
          <div className="mb-6 flex items-start justify-between">
            <h3 className="font-syne text-xl font-bold leading-none text-forest">
              {t('setup.title')}
            </h3>
            <div className="bg-mint/20 rounded-sm px-2 py-1 text-right text-[10px] font-bold uppercase tracking-widest text-forest">
              {t('setup.progress')} <br />
              {t('setup.done')}
            </div>
          </div>

          <p className="mb-8 text-sm font-medium leading-relaxed text-forest/70">
            {t('setup.lead')}
          </p>

          <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center justify-between border-b border-forest/10 pb-4">
              <div>
                <div className={`mb-1 ${LABEL}`}>{t('setup.goalLabel')}</div>
                <div className="text-sm font-bold text-forest">{t('setup.goal')}</div>
              </div>
              <div className={BADGE}>{t('setup.completed')}</div>
            </div>

            <div className="flex items-center justify-between border-b border-forest/10 pb-4">
              <div>
                <div className={`mb-1 ${LABEL}`}>{t('setup.bodyLabel')}</div>
                <div className="text-sm font-bold text-forest">{t('setup.body')}</div>
              </div>
              <div className={BADGE}>{t('setup.completed')}</div>
            </div>

            <div className="flex items-center justify-between border-b border-forest/10 pb-4">
              <div>
                <div className={`mb-1 ${LABEL}`}>{t('setup.medicalLabel')}</div>
                <div className="text-sm font-bold text-red-500">{t('setup.notUpdated')}</div>
              </div>
              <div className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-bold uppercase text-red-600">
                {t('setup.missing')}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-energy bg-[var(--energy-lime-soft)] p-4">
            <div className="mb-2 flex justify-between text-xs font-bold text-forest">
              <span>{t('setup.accuracy')}</span>
              <span>50%</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
              <div className="h-full w-1/2 bg-energy"></div>
            </div>
            <div className="text-[10px] font-medium text-forest/60">
              {t('setup.accuracyHintBefore')}{' '}
              <span className="font-bold">{t('setup.accuracyHintStrong')}</span>.
            </div>
          </div>

          <Button className="mt-6 h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90">
            {t('setup.finish')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(
          [
            ['one', Activity],
            ['two', Camera],
          ] as const
        ).map(([key, Icon]) => (
          <div
            key={key}
            className="group flex flex-col items-center justify-between gap-6 rounded-xl border border-forest/20 bg-white p-6 transition-colors hover:border-mint sm:flex-row sm:items-start"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-forest/20">
              <Icon className="h-5 w-5 text-forest" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className={`mb-2 ${LABEL}`}>{t(`actions.${key}.tag`)}</div>
              <h3 className="mb-2 font-syne text-xl font-bold leading-tight text-forest">
                <Lines text={t(`actions.${key}.title`)} />
              </h3>
              <p className="mx-auto max-w-[200px] text-xs font-medium leading-relaxed text-forest/70 sm:mx-0">
                {t(`actions.${key}.body`)}
              </p>
            </div>
            <Button className="shrink-0 rounded-full bg-forest px-6 font-bold text-white transition-colors hover:bg-forest/90">
              {t(`actions.${key}.cta`)}
            </Button>
          </div>
        ))}
      </div>

      {/* Biometric Chart Area */}
      <div className="rounded-xl border border-forest/20 bg-white p-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className={`mb-1 ${LABEL}`}>{t('chart.tag')}</div>
            <h3 className="font-syne text-2xl font-bold text-forest">{t('chart.title')}</h3>
          </div>
          <div className="flex gap-2">
            <Button className="h-8 rounded-full bg-forest text-xs font-bold text-white hover:bg-forest/90">
              {t('chart.aiAnalysis')}
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded-full border-forest/20 text-xs font-bold text-forest"
            >
              {t('chart.nextPlan')}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="border-energy/50 relative flex h-[300px] flex-col overflow-hidden rounded-lg border bg-[var(--energy-lime-faint)] p-6 lg:col-span-2">
            <div className="mb-8 flex justify-between text-xs font-bold text-forest/60">
              <span>{t('chart.volume')}</span>
              <span>
                {t('chart.peak')} <span className="text-forest">{t('chart.peakValue')}</span>
              </span>
            </div>

            {/* Decorative chart: illustrative data only. */}
            <div className="relative h-full w-full flex-1 border-b border-l border-forest/10 pb-4">
              <svg
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                {[20, 40, 60, 80].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="#345C32"
                    strokeOpacity="0.05"
                    strokeWidth="0.5"
                  />
                ))}
                <polygon
                  points="5,80 25,60 45,90 65,50 85,30 85,100 5,100"
                  fill="#345C32"
                  fillOpacity="0.05"
                />
                <polyline
                  points={POINTS.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill="none"
                  stroke="#345C32"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {POINTS.slice(0, 4).map(([x, y]) => (
                  <circle
                    key={x}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="#A7F0DD"
                    stroke="#345C32"
                    strokeWidth="0.5"
                  />
                ))}
                <circle
                  cx="85"
                  cy="30"
                  r="2.5"
                  fill="var(--energy-lime)"
                  stroke="#345C32"
                  strokeWidth="1"
                />
                {X_LABELS.map((x, i) => (
                  <text
                    key={x}
                    x={x}
                    y="108"
                    fontSize="3"
                    fill="#345C32"
                    opacity="0.5"
                    textAnchor="middle"
                  >
                    {days[i]}
                  </text>
                ))}
              </svg>
              <div className="absolute bottom-0 left-[-25px] flex h-full flex-col items-end justify-between pb-4 pt-1 text-[8px] font-medium text-forest/50">
                <span>20,000</span>
                <span>15,000</span>
                <span>10,000</span>
                <span>5,000</span>
                <span>0</span>
              </div>
            </div>
          </div>

          <div className="flex h-[300px] flex-col justify-between gap-4">
            <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 p-4">
              <div className={`mb-2 ${LABEL}`}>{t('chart.cycle')}</div>
              <div className="mb-2 flex items-end justify-between">
                <div className="font-syne text-3xl font-bold text-forest">
                  3 <span className="text-forest/30">/ 5</span>
                </div>
                <span className="rounded-sm border border-forest/20 bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest">
                  {t('chart.onTrack')}
                </span>
              </div>
              <div className="text-xs font-medium text-forest/70">{t('chart.cycleNote')}</div>
            </div>

            <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 p-4">
              <div className={`mb-2 ${LABEL}`}>{t('chart.newVolume')}</div>
              <div className="mb-2 flex items-end justify-between">
                <div className="font-syne text-3xl font-bold text-forest">
                  57.5 <span className="text-lg font-medium text-forest/50">KG</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-forest">
                  {t('chart.perWeek')}
                </span>
              </div>
              <div className="text-xs font-medium text-forest/70">{t('chart.newVolumeNote')}</div>
            </div>

            <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 bg-[var(--energy-lime-soft)] p-4">
              <div className={`mb-2 ${LABEL}`}>{t('chart.formScore')}</div>
              <div className="mb-2 flex items-end justify-between">
                <div className="font-syne text-3xl font-bold text-forest">
                  93.4 <span className="text-lg font-medium text-forest/50">/ 100</span>
                </div>
                <span className="rounded-sm bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest">
                  {t('chart.veryGood')}
                </span>
              </div>
              <div className="text-xs font-medium text-forest/70">{t('chart.formNote')}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-forest/10 pt-4">
          <div className="text-[10px] font-medium text-forest/60">{t('chart.footnote')}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
            {t('chart.integrity')}
          </div>
        </div>
      </div>
    </div>
  );
}
