import type {
  AssistantConversation,
  AssistantConversationDetail,
  AssistantRun,
  AssistantRunEvent,
} from '../model/types';

import { apiDelete, apiGet, apiPost, openApiEventStream } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const base = ENDPOINTS.assistant.conversations;
const uuid = () => crypto.randomUUID();

export const assistantApi = {
  list: () => apiGet<AssistantConversation[]>(base),
  create: (title?: string) => apiPost<AssistantConversation, { title?: string }>(base, { title }),
  get: (conversationId: string) => apiGet<AssistantConversationDetail>(`${base}/${conversationId}`),
  send: (conversationId: string, content: string) =>
    apiPost<AssistantRun, { content: string; clientMessageId: string; idempotencyKey: string }>(
      `${base}/${conversationId}/messages`,
      { content, clientMessageId: uuid(), idempotencyKey: uuid() },
    ),
  submit: (conversationId: string, messageId: string, value: unknown) =>
    apiPost<AssistantRun, { value: unknown; idempotencyKey: string }>(
      `${base}/${conversationId}/interactions/${messageId}/submit`,
      { value, idempotencyKey: uuid() },
    ),
  run: (conversationId: string, runId: string) =>
    apiGet<AssistantRun>(`${base}/${conversationId}/runs/${runId}`),
  cancel: (conversationId: string, runId: string) =>
    apiPost<boolean>(`${base}/${conversationId}/runs/${runId}/cancel`),
  remove: (conversationId: string) => apiDelete<void>(`${base}/${conversationId}`),
  events: (conversationId: string, runId: string, signal: AbortSignal) =>
    openApiEventStream<AssistantRunEvent>(`${base}/${conversationId}/runs/${runId}/events`, signal),
};
