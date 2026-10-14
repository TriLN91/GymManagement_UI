import { Bot, Loader2, MessageSquarePlus, Send, Square, UserRound } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { assistantApi } from '../api/assistantApi';
import type {
  AssistantConversation,
  AssistantConversationDetail,
  AssistantMessage,
  AssistantRun,
} from '../model/types';

import { Button } from '@/shared/ui/button/Button';

import './assistant.css';

type RendererProps = {
  message: AssistantMessage;
  disabled?: boolean;
  onSubmit: (value: unknown) => Promise<void>;
};

export function AssistantInteractionRenderer({ message, disabled, onSubmit }: RendererProps) {
  const interaction = message.interaction;
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  if (!interaction) return null;
  const completed = disabled || message.interactionStatus === 'completed';

  if (interaction.type === 'data_card') {
    return (
      <section className="assistant-card" aria-label={interaction.title}>
        <strong>{interaction.title}</strong>
        {interaction.description && <p>{interaction.description}</p>}
        <pre>{JSON.stringify(interaction.data ?? {}, null, 2)}</pre>
      </section>
    );
  }

  if (interaction.type === 'progress' || interaction.type === 'error') {
    return <div className={`assistant-state assistant-state--${interaction.type}`}>{interaction.description}</div>;
  }

  if (interaction.type === 'single_choice' || interaction.type === 'multiple_choice') {
    const multiple = interaction.type === 'multiple_choice';
    const choose = (value: string) => {
      if (!multiple) void onSubmit(value);
      else setSelected((current) =>
        current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      );
    };
    return (
      <fieldset className="assistant-interaction" disabled={completed}>
        <legend>{interaction.title}</legend>
        {interaction.description && <p>{interaction.description}</p>}
        <div className="assistant-choices">
          {interaction.options?.map((option) => (
            <button
              className={selected.includes(option.value) ? 'is-selected' : ''}
              key={option.value}
              onClick={() => choose(option.value)}
              type="button"
            >
              <strong>{option.label}</strong>
              {option.description && <span>{option.description}</span>}
            </button>
          ))}
        </div>
        {multiple && (
          <Button disabled={selected.length < (interaction.minSelections ?? 0)} onClick={() => void onSubmit(selected)}>
            Continue
          </Button>
        )}
        {message.interactionStatus === 'completed' && <small>Response submitted</small>}
      </fieldset>
    );
  }

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    const value = Object.fromEntries(
      (interaction.fields ?? []).map((field) => [
        field.name,
        field.inputType === 'number' ? Number(form[field.name]) : form[field.name],
      ]),
    );
    void onSubmit(value);
  };
  return (
    <form className="assistant-interaction" onSubmit={submitForm}>
      <h3>{interaction.title}</h3>
      {interaction.description && <p>{interaction.description}</p>}
      {interaction.fields?.map((field) => (
        <label key={field.name}>
          <span>{field.label}</span>
          {field.inputType === 'select' ? (
            <select
              disabled={completed}
              required={field.required}
              value={String(form[field.name] ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
            >
              <option value="">Select…</option>
              {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : field.inputType === 'boolean' ? (
            <input disabled={completed} type="checkbox" checked={Boolean(form[field.name])}
              onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))} />
          ) : (
            <input
              disabled={completed}
              max={field.max ?? undefined}
              min={field.min ?? undefined}
              placeholder={field.placeholder ?? undefined}
              required={field.required}
              type={field.inputType}
              value={String(form[field.name] ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
            />
          )}
        </label>
      ))}
      <Button disabled={completed} type="submit">Continue</Button>
    </form>
  );
}

export function AssistantPage() {
  const isSimulatedProvider = import.meta.env.VITE_ASSISTANT_PROVIDER_MODE === 'simulated';
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [detail, setDetail] = useState<AssistantConversationDetail>();
  const [input, setInput] = useState('');
  const [lastInput, setLastInput] = useState('');
  const [activeRun, setActiveRun] = useState<AssistantRun>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async (id: string) => {
    setDetail(await assistantApi.get(id));
  }, []);

  const loadConversations = useCallback(async () => {
    const items = await assistantApi.list();
    setConversations(items);
    if (!activeId && items[0]) setActiveId(items[0].id);
  }, [activeId]);

  useEffect(() => {
    void loadConversations().catch(() => setError('Could not load conversations.')).finally(() => setLoading(false));
  }, [loadConversations]);
  useEffect(() => {
    if (activeId) void loadDetail(activeId).catch(() => setError('Could not restore this conversation.'));
  }, [activeId, loadDetail]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [detail, activeRun]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const finishRun = async (run: AssistantRun) => {
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await assistantApi.events(run.conversationId, run.id, controller.signal);
    } catch (reason) {
      if (controller.signal.aborted) throw reason;
    }
    const recovered = await assistantApi.run(run.conversationId, run.id);
    if (recovered.status === 'failed') throw new Error(recovered.errorCode ?? 'Assistant run failed');
    if (recovered.status === 'cancelled') throw new Error('Assistant run was cancelled');
    await Promise.all([loadDetail(run.conversationId), loadConversations()]);
    setActiveRun(undefined);
  };

  const createConversation = async () => {
    setError(undefined);
    const created = await assistantApi.create();
    setConversations((current) => [created, ...current]);
    setActiveId(created.id); setDetail({ conversation: created, messages: [] });
  };

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || activeRun) return;
    setError(undefined); setLastInput(content);
    let id = activeId;
    if (!id) {
      const created = await assistantApi.create(content.slice(0, 80));
      id = created.id; setActiveId(id); setConversations([created, ...conversations]);
    }
    setInput('');
    try {
      const run = await assistantApi.send(id, content);
      setActiveRun(run); await finishRun(run);
    } catch (reason) {
      setActiveRun(undefined); setError(reason instanceof Error ? reason.message : 'The assistant could not respond.');
    }
  };

  const submitInteraction = async (messageId: string, value: unknown) => {
    if (!activeId || activeRun) return;
    setError(undefined);
    try {
      const run = await assistantApi.submit(activeId, messageId, value);
      setActiveRun(run); await finishRun(run);
    } catch (reason) {
      setActiveRun(undefined); setError(reason instanceof Error ? reason.message : 'Could not submit your response.');
    }
  };

  const cancel = async () => {
    if (!activeRun) return;
    abortRef.current?.abort();
    await assistantApi.cancel(activeRun.conversationId, activeRun.id);
    setActiveRun(undefined); await loadDetail(activeRun.conversationId);
  };

  return (
    <div className="assistant-page">
      <aside className="assistant-conversations">
        <div><h1>FitFlex Assistant</h1><Button size="sm" onClick={() => void createConversation()}><MessageSquarePlus size={16} /> New</Button></div>
        {loading && <Loader2 className="animate-spin" aria-label="Loading conversations" />}
        {conversations.map((conversation) => (
          <button className={conversation.id === activeId ? 'is-active' : ''} key={conversation.id}
            onClick={() => setActiveId(conversation.id)} type="button">
            <strong>{conversation.title}</strong><small>{conversation.latestRunStatus ?? 'Ready'}</small>
          </button>
        ))}
      </aside>
      <main className="assistant-chat">
        <header><div><Bot /><div><strong>FitFlex Assistant</strong><span>Account-aware, evidence-grounded guidance</span></div>
          {isSimulatedProvider && <mark className="assistant-provider-badge">Development simulation — no live LLM</mark>}
        </div></header>
        <div className="assistant-messages" aria-live="polite">
          {!detail?.messages.length && <div className="assistant-welcome"><Bot /><h2>How can I help?</h2><p>Try “Help me personalize my fitness experience” or “Show me my current training plan.”</p></div>}
          {detail?.messages.map((message) => (
            <article className={`assistant-message assistant-message--${message.role}`} key={message.id}>
              <span className="assistant-avatar">{message.role === 'assistant' ? <Bot size={18} /> : <UserRound size={18} />}</span>
              <div><p>{message.content}</p><AssistantInteractionRenderer message={message} disabled={Boolean(activeRun)}
                onSubmit={(value) => submitInteraction(message.id, value)} /></div>
            </article>
          ))}
          {activeRun && <div className="assistant-running"><Loader2 className="animate-spin" /> Thinking and checking your FitFlex data…</div>}
          {error && <div className="assistant-error" role="alert"><span>{error}</span>{lastInput && <Button variant="outline" size="sm" onClick={() => void send(lastInput)}>Retry</Button>}</div>}
          <div ref={bottomRef} />
        </div>
        <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void send(); }}>
          <textarea aria-label="Message FitFlex Assistant" maxLength={4000} placeholder="Ask about your plan, exercises, or fitness guidance…"
            value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); }
            }} />
          {activeRun ? <Button aria-label="Cancel assistant run" variant="outline" onClick={() => void cancel()} type="button"><Square size={16} /></Button>
            : <Button aria-label="Send message" disabled={!input.trim()} type="submit"><Send size={18} /></Button>}
        </form>
      </main>
    </div>
  );
}
