import { UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssignmentDto } from '../api/types';
import {
  useAssignedMemberPlans,
  useAssignedMemberProfile,
  useMyAssignments,
} from '../model/useAssignedMembers';

import { LOCALE_TAGS, type Language } from '@/shared/config/constants';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function MemberProfile({ memberProfileId }: { memberProfileId: string }) {
  const { t } = useTranslation('trainer');
  const profile = useAssignedMemberProfile(memberProfileId, true);

  if (profile.isPending) return <p role="status">{t('assignedMembers.loadingProfile')}</p>;
  if (profile.isError) return <p role="alert">{t('assignedMembers.profileError')}</p>;
  const { goal, training } = profile.data;

  return (
    <dl className="trainer-assigned-profile">
      <div>
        <dt>{t('assignedMembers.goal')}</dt>
        <dd>
          {goal ? `${goal.goalType}${goal.description ? ` · ${goal.description}` : ''}` : '—'}
        </dd>
      </div>
      <div>
        <dt>{t('assignedMembers.training')}</dt>
        <dd>
          {training
            ? t('assignedMembers.trainingSummary', {
                level: training.experienceLevel,
                days: training.weeklyWorkoutDays,
                minutes: training.sessionDurationMinutes,
              })
            : '—'}
        </dd>
      </div>
      <div>
        <dt>{t('assignedMembers.limitations')}</dt>
        <dd>
          {training?.hasLimitations
            ? (training.limitationNotes ?? t('assignedMembers.yes'))
            : t('assignedMembers.none')}
        </dd>
      </div>
    </dl>
  );
}

function MemberPlans({ memberProfileId }: { memberProfileId: string }) {
  const { t } = useTranslation('trainer');
  const plans = useAssignedMemberPlans(memberProfileId, true);
  if (plans.isPending) return <p role="status">{t('assignedMembers.loadingPlans')}</p>;
  if (plans.isError) return <p role="alert">{t('assignedMembers.plansError')}</p>;
  const workout = plans.data.workout;
  return (
    <div className="trainer-assigned-profile">
      <strong>{t('assignedMembers.plans')}</strong>
      {workout.length === 0 ? (
        <p>{t('assignedMembers.noPlans')}</p>
      ) : (
        <ul>
          {workout.map((plan) => {
            const latest = [...plan.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
            return (
              <li key={plan.id} data-testid="member-plan">
                {plan.name} · {plan.status}
                {latest
                  ? ` · ${t('assignedMembers.planVersion', { number: latest.versionNumber, count: latest.exercises.length })}`
                  : ''}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AssignedMemberCard({ assignment, locale }: { assignment: AssignmentDto; locale: string }) {
  const { t } = useTranslation('trainer');
  const [open, setOpen] = useState(false);
  const permissions = [
    assignment.canReadFitness ? t('assignedMembers.canRead') : null,
    assignment.canManageWorkout ? t('assignedMembers.canWorkout') : null,
    assignment.canManageNutrition ? t('assignedMembers.canNutrition') : null,
  ].filter((item): item is string => item !== null);

  return (
    <article className="trainer-member-card trainer-assigned-card">
      <div className="trainer-member-card__content">
        <header>
          <div>
            <h3>{assignment.memberName}</h3>
            <span>
              {assignment.isCurrent ? t('assignedMembers.current') : t('assignedMembers.ended')}
              {' · '}
              {formatDate(assignment.startsAtUtc, locale)} –{' '}
              {formatDate(assignment.endsAtUtc, locale)}
            </span>
          </div>
        </header>
        <ul className="trainer-assigned-permissions">
          {permissions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <footer>
          <button
            type="button"
            className="is-secondary"
            disabled={!assignment.canReadFitness}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t('assignedMembers.hideProfile') : t('assignedMembers.viewProfile')}
          </button>
        </footer>
        {open ? <MemberProfile memberProfileId={assignment.memberProfileId} /> : null}
        {open && assignment.canReadFitness ? (
          <MemberPlans memberProfileId={assignment.memberProfileId} />
        ) : null}
      </div>
    </article>
  );
}

/** Members assigned to the signed-in Trainer, read from the backend (CF04 assignment + CF01 profile). */
export function AssignedMembersPanel() {
  const { t, i18n } = useTranslation('trainer');
  const language: Language = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  const assignments = useMyAssignments();
  const list = assignments.data ?? [];

  return (
    <section className="trainer-assigned-panel" aria-labelledby="assigned-members-heading">
      <h2 id="assigned-members-heading">
        <UsersRound aria-hidden="true" size={16} /> {t('assignedMembers.title')}
      </h2>
      {assignments.isPending ? <p role="status">{t('assignedMembers.loading')}</p> : null}
      {assignments.isError ? <p role="alert">{t('assignedMembers.error')}</p> : null}
      {assignments.isSuccess && list.length === 0 ? <p>{t('assignedMembers.empty')}</p> : null}
      <div className="trainer-member-grid">
        {list.map((assignment) => (
          <AssignedMemberCard
            key={assignment.id}
            assignment={assignment}
            locale={LOCALE_TAGS[language]}
          />
        ))}
      </div>
    </section>
  );
}
