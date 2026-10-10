import {
  Award,
  CalendarDays,
  Crown,
  Flame,
  Goal,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { calculateAchievementProgress } from '../model/achievementProgress';

import { useWorkoutSessionStore } from '@/features/workout-plans/model/useWorkoutSessionStore';
import { WorkoutFlowShell } from '@/features/workout-plans/ui/WorkoutFlowShell';
import { ROUTES } from '@/shared/config/constants';

import './achievements.css';

interface TowerLevel {
  id: string;
  title: string;
  category: string;
  value: number;
  target: number;
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
}

export function AchievementsPage() {
  const { t } = useTranslation();
  const sessions = useWorkoutSessionStore((state) => state.completedSessions);
  const progress = calculateAchievementProgress(sessions);
  const copy = {
    title: t('gamification:achievementTower.achievementsPage.title'),
    back: t('gamification:achievementTower.achievementsPage.back'),
    tower: t('gamification:achievementTower.achievementsPage.tower'),
    floor: t('gamification:achievementTower.achievementsPage.floor'),
    next: t('gamification:achievementTower.achievementsPage.next'),
    streak: t('gamification:achievementTower.achievementsPage.streak'),
    weekly: t('gamification:achievementTower.achievementsPage.weekly'),
    shield: t('gamification:achievementTower.achievementsPage.shield'),
    shieldBody: t('gamification:achievementTower.achievementsPage.shieldBody'),
    unlocked: t('gamification:achievementTower.achievementsPage.unlocked'),
    sessions: t('gamification:achievementTower.achievementsPage.sessions'),
    volume: t('gamification:achievementTower.achievementsPage.volume'),
    highestLoad: t('gamification:achievementTower.achievementsPage.highestLoad'),
    first: t('gamification:achievementTower.achievementsPage.first'),
    week: t('gamification:achievementTower.achievementsPage.week'),
    sevenDays: t('gamification:achievementTower.achievementsPage.sevenDays'),
    month: t('gamification:achievementTower.achievementsPage.month'),
    season: t('gamification:achievementTower.achievementsPage.season'),
    pr: t('gamification:achievementTower.achievementsPage.pr'),
    year: t('gamification:achievementTower.achievementsPage.year'),
    summit: t('gamification:achievementTower.achievementsPage.summit'),
    start: t('gamification:achievementTower.achievementsPage.start'),
    consistency: t('gamification:achievementTower.achievementsPage.consistency'),
    mastery: t('gamification:achievementTower.achievementsPage.mastery'),
  };

  const levels: TowerLevel[] = [
    {
      id: 'first-session',
      title: copy.first,
      category: copy.start,
      value: progress.totalSessions,
      target: 1,
      icon: Goal,
    },
    {
      id: 'weekly-rhythm',
      title: copy.week,
      category: copy.consistency,
      value: progress.bestWeekSessions,
      target: 3,
      icon: CalendarDays,
    },
    {
      id: 'seven-day-streak',
      title: copy.sevenDays,
      category: copy.consistency,
      value: progress.longestStreak,
      target: 7,
      icon: Flame,
    },
    {
      id: 'month',
      title: copy.month,
      category: copy.consistency,
      value: progress.bestMonthSessions,
      target: 12,
      icon: Medal,
    },
    {
      id: 'season',
      title: copy.season,
      category: copy.consistency,
      value: progress.activeMonths,
      target: 3,
      icon: Award,
    },
    {
      id: 'records',
      title: copy.pr,
      category: copy.mastery,
      value: progress.recordBreaks,
      target: 3,
      icon: Trophy,
    },
    {
      id: 'year',
      title: copy.year,
      category: copy.mastery,
      value: progress.bestYearSessions,
      target: 100,
      icon: Sparkles,
    },
    {
      id: 'summit',
      title: copy.summit,
      category: copy.mastery,
      value: progress.totalSessions,
      target: 250,
      icon: Crown,
    },
  ];
  const nextLevel = levels.find((level) => level.value < level.target) ?? levels.at(-1);
  const unlockedCount = levels.filter((level) => level.value >= level.target).length;
  const weeklyPercent = Math.min(100, Math.round((progress.sessionsThisWeek / 3) * 100));

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={copy.back}>
      <section className="achievement-hero">
        <div>
          <span>PROGRESSION / {unlockedCount.toString().padStart(2, '0')}</span>
          <h2>{copy.tower}</h2>
          <p>
            {copy.next}: {nextLevel?.title}
          </p>
        </div>
        <div className="achievement-streak">
          <Flame aria-hidden size={26} />
          <strong>{progress.currentStreak}</strong>
          <span>{copy.streak}</span>
        </div>
      </section>

      <section className="achievement-weekly" aria-label={copy.weekly}>
        <div>
          <CalendarDays aria-hidden size={20} />
          <strong>{copy.weekly}</strong>
        </div>
        <span>{Math.min(progress.sessionsThisWeek, 3)}/3</span>
        <i>
          <b style={{ width: `${weeklyPercent}%` }} />
        </i>
      </section>

      <section className="achievement-tower" aria-label={copy.tower}>
        {[...levels].reverse().map((level, reverseIndex) => {
          const Icon = level.icon;
          const percentage = Math.min(100, Math.round((level.value / level.target) * 100));
          const unlocked = percentage === 100;
          const floor = levels.length - reverseIndex;
          return (
            <article
              className={[unlocked ? 'is-unlocked' : '', floor >= 6 ? 'is-high-tier' : '']
                .filter(Boolean)
                .join(' ')}
              key={level.id}
            >
              <span className="achievement-tower__floor">
                {copy.floor} {String(floor).padStart(2, '0')}
              </span>
              <span className="achievement-tower__medallion">
                <Icon aria-hidden size={19} />
              </span>
              <div>
                <em>{level.category}</em>
                <strong>{level.title}</strong>
              </div>
              <div className="achievement-tower__progress">
                <span>{unlocked ? copy.unlocked : `${level.value}/${level.target}`}</span>
                <i>
                  <b style={{ width: `${percentage}%` }} />
                </i>
              </div>
            </article>
          );
        })}
      </section>

      <section className="achievement-grid">
        <article>
          <Goal aria-hidden size={21} />
          <span>{copy.sessions}</span>
          <strong>{progress.totalSessions}</strong>
        </article>
        <article>
          <Trophy aria-hidden size={21} />
          <span>{copy.volume}</span>
          <strong>{progress.totalVolumeKg.toLocaleString()} kg</strong>
        </article>
        <article>
          <Award aria-hidden size={21} />
          <span>{copy.highestLoad}</span>
          <strong>{progress.highestLoadKg.toLocaleString()} kg</strong>
        </article>
      </section>
      <section className="achievement-protection">
        <ShieldCheck aria-hidden size={22} />
        <div>
          <strong>{copy.shield}</strong>
          <span>{copy.shieldBody}</span>
        </div>
      </section>
    </WorkoutFlowShell>
  );
}
