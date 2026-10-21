import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors AssistantController. The mock answers every message with one plain assistant reply (no tools).
const path = (p: string) => `*${p}`;
const base = ENDPOINTS.assistant.conversations;

const ok = (data: unknown, status = 200) =>
  HttpResponse.json({ isSuccess: true, message: `${status}: OK`, data }, { status });

interface MockMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAtUtc: string;
  interaction: null;
  interactionStatus: 'none';
}

interface MockConversation {
  id: string;
  title: string;
  createdAtUtc: string;
  lastMessageAtUtc: string | null;
  latestRunStatus: string | null;
  messages: MockMessage[];
}

let conversations: MockConversation[] = [];

const summary = (c: MockConversation) => ({
  id: c.id,
  title: c.title,
  createdAtUtc: c.createdAtUtc,
  lastMessageAtUtc: c.lastMessageAtUtc,
  latestRunStatus: c.latestRunStatus,
});

const run = (conversationId: string, runId: string) => ({
  id: runId,
  conversationId,
  status: 'completed',
  correlationId: runId,
  model: 'mock',
  promptTokens: 0,
  completionTokens: 0,
  estimatedCostUsd: 0,
});

export const assistantHandlers = [
  http.get(path(base), () => ok(conversations.map(summary))),

  http.post(path(base), async ({ request }) => {
    const input = (await request.json().catch(() => ({}))) as { title?: string };
    const now = new Date().toISOString();
    const conversation: MockConversation = {
      id: `conversation-${conversations.length + 1}`,
      title: input.title?.trim() || 'New conversation',
      createdAtUtc: now,
      lastMessageAtUtc: null,
      latestRunStatus: null,
      messages: [],
    };
    conversations = [conversation, ...conversations];
    return ok(summary(conversation), 201);
  }),

  http.get(path(`${base}/:conversationId`), ({ params }) => {
    const conversation = conversations.find((item) => item.id === params.conversationId);
    if (!conversation)
      return HttpResponse.json(
        { isSuccess: false, message: 'Not found', data: null, errorCode: 'NotFound' },
        { status: 404 },
      );
    return ok({
      conversation: summary(conversation),
      messages: conversation.messages,
      nextCursor: null,
    });
  }),

  http.post(path(`${base}/:conversationId/messages`), async ({ params, request }) => {
    const conversation = conversations.find((item) => item.id === params.conversationId);
    const input = (await request.json()) as { content: string };
    if (!conversation) return HttpResponse.json({ isSuccess: false }, { status: 404 });
    const now = new Date().toISOString();
    const runId = `run-${conversation.messages.length + 1}`;
    conversation.messages.push(
      {
        id: `${runId}-user`,
        role: 'user',
        content: input.content,
        createdAtUtc: now,
        interaction: null,
        interactionStatus: 'none',
      },
      {
        id: `${runId}-assistant`,
        role: 'assistant',
        content: 'This is a mock reply from the MSW assistant.',
        createdAtUtc: now,
        interaction: null,
        interactionStatus: 'none',
      },
    );
    conversation.lastMessageAtUtc = now;
    conversation.latestRunStatus = 'completed';
    return ok(run(conversation.id, runId), 202);
  }),

  http.get(path(`${base}/:conversationId/runs/:runId`), ({ params }) =>
    ok(run(String(params.conversationId), String(params.runId))),
  ),

  http.get(
    path(`${base}/:conversationId/runs/:runId/events`),
    () =>
      new HttpResponse('id: 1\nevent: run.completed\ndata: {}\n\n', {
        headers: { 'Content-Type': 'text/event-stream' },
      }),
  ),

  http.post(path(`${base}/:conversationId/runs/:runId/cancel`), () => ok(true)),

  http.delete(path(`${base}/:conversationId`), ({ params }) => {
    conversations = conversations.filter((item) => item.id !== params.conversationId);
    return new HttpResponse(null, { status: 204 });
  }),
];
