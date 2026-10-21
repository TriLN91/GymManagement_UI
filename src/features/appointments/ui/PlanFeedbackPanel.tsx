import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type {
  FeedbackDomain,
  FeedbackKind,
  PlanFeedbackDto,
  SessionAssignmentDto,
} from '../api/types';
import { errorText, formatDateTime } from '../model/format';
import { useFeedbackList, useReplyFeedback, useSendFeedback } from '../model/useFeedback';

import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

type Role = 'Member' | 'Trainer';

function FeedbackItem({
  item,
  role,
  locale,
}: {
  item: PlanFeedbackDto;
  role: Role;
  locale: string;
}) {
  const { t } = useTranslation('appointments');
  const reply = useReplyFeedback();
  const [text, setText] = useState('');

  const send = async () => {
    try {
      await reply.mutateAsync({ id: item.id, reply: text.trim() });
      toast.success(t('feedback.replied'));
      setText('');
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  return (
    <li className="appointment-card" data-testid="plan-feedback">
      <header>
        <div>
          <h3>
            {t(`feedback.kind.${item.kind}`)} · {t(`feedback.domain.${item.domain}`)}
          </h3>
          <p>
            {role === 'Trainer' ? item.memberName : item.trainerName} ·{' '}
            {formatDateTime(item.createdAtUtc, locale)}
          </p>
        </div>
      </header>
      <p className="appointment-note">{item.message}</p>
      {item.trainerReply ? (
        <p className="appointment-note">
          {t('feedback.reply')}: {item.trainerReply}
        </p>
      ) : role === 'Trainer' ? (
        <form
          className="appointment-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <label>
            {t('feedback.yourReply')}
            <Textarea
              required
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <Button type="submit" size="sm" disabled={reply.isPending || text.trim() === ''}>
            {t('feedback.sendReply')}
          </Button>
        </form>
      ) : (
        <p className="appointment-hint">{t('feedback.waiting')}</p>
      )}
    </li>
  );
}

/**
 * Member: send feedback or a change request about the plan to the Trainer (FR-CF04-03). Trainer: read and answer them.
 * The plan itself still changes only through the CF01 plan flow.
 */
export function PlanFeedbackPanel({
  role,
  assignments,
  locale,
}: {
  role: Role;
  assignments: SessionAssignmentDto[];
  locale: string;
}) {
  const { t } = useTranslation('appointments');
  const list = useFeedbackList(role);
  const send = useSendFeedback();
  const [assignmentId, setAssignmentId] = useState('');
  const [kind, setKind] = useState<FeedbackKind>('Feedback');
  const [domain, setDomain] = useState<FeedbackDomain>('Workout');
  const [message, setMessage] = useState('');

  const selected = assignmentId || assignments[0]?.id || '';

  const submit = async () => {
    try {
      await send.mutateAsync({
        assignmentId: selected,
        body: { kind, domain, message: message.trim() },
      });
      toast.success(t('feedback.sent'));
      setMessage('');
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  return (
    <section className="appointment-section" aria-label={t('feedback.heading')}>
      <h2>{t('feedback.heading')}</h2>

      {role === 'Member' && assignments.length > 0 ? (
        <form
          className="appointment-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {assignments.length > 1 ? (
            <label>
              {t('propose.assignment')}
              <Select value={selected} onChange={(event) => setAssignmentId(event.target.value)}>
                {assignments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.trainerName}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
          <label>
            {t('feedback.kindLabel')}
            <Select value={kind} onChange={(event) => setKind(event.target.value as FeedbackKind)}>
              <option value="Feedback">{t('feedback.kind.Feedback')}</option>
              <option value="ChangeRequest">{t('feedback.kind.ChangeRequest')}</option>
            </Select>
          </label>
          <label>
            {t('feedback.domainLabel')}
            <Select
              value={domain}
              onChange={(event) => setDomain(event.target.value as FeedbackDomain)}
            >
              <option value="Workout">{t('feedback.domain.Workout')}</option>
              <option value="Nutrition">{t('feedback.domain.Nutrition')}</option>
            </Select>
          </label>
          <label>
            {t('feedback.message')}
            <Textarea
              required
              minLength={3}
              maxLength={1000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <Button type="submit" disabled={send.isPending || message.trim().length < 3}>
            {t('feedback.send')}
          </Button>
        </form>
      ) : null}

      {list.isPending ? <p role="status">{t('list.loading')}</p> : null}
      {list.isError ? <p role="alert">{t('list.error')}</p> : null}
      {list.isSuccess && list.data.length === 0 ? <p>{t('feedback.empty')}</p> : null}
      <ul className="space-y-3">
        {(list.data ?? []).map((item) => (
          <FeedbackItem key={item.id} item={item} role={role} locale={locale} />
        ))}
      </ul>
    </section>
  );
}
