import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assistantApi } from '../api/assistantApi';
import type { AssistantConversationDetail, AssistantRun } from '../model/types';

import { AssistantPage } from './AssistantPage';

import { ErrorBoundary } from '@/shared/ui/error-boundary';

vi.mock('../api/assistantApi', () => ({
  assistantApi: {
    list: vi.fn(),
    create: vi.fn(),
    get: vi.fn(),
    send: vi.fn(),
    submit: vi.fn(),
    events: vi.fn(),
    run: vi.fn(),
    cancel: vi.fn(),
  },
}));

const conversation = (id: string) => ({ id, title: id, createdAtUtc: '2026-10-22T00:00:00Z' });
const completedRun: AssistantRun = {
  id: 'run-1',
  conversationId: 'saved',
  status: 'completed',
  correlationId: 'correlation-1',
  model: 'test',
  promptTokens: 0,
  completionTokens: 0,
  estimatedCostUsd: 0,
};
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
const caught = vi.fn();
const view = (key = 'initial') => (
  <StrictMode>
    <ErrorBoundary onError={caught} fallback={() => <div role="alert">Assistant crashed</div>}>
      <AssistantPage key={key} />
    </ErrorBoundary>
  </StrictMode>
);

describe('Assistant page lifecycle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Chrome 155 returns a Promise here, unlike older Chromium and jsdom.
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(() => Promise.resolve()),
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(assistantApi.list).mockResolvedValue([conversation('saved'), conversation('other')]);
    vi.mocked(assistantApi.get).mockImplementation((id) =>
      Promise.resolve({
        conversation: conversation(id),
        messages: [
          {
            id: id + '-answer',
            role: 'assistant',
            content: id + ' answer',
            createdAtUtc: '2026-10-22T00:00:00Z',
            interactionStatus: 'none',
          },
        ],
      }),
    );
    vi.mocked(assistantApi.run).mockResolvedValue(completedRun);
    vi.mocked(assistantApi.cancel).mockResolvedValue(true);
  });

  afterEach(() => {
    if (scrollDescriptor)
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor);
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
    vi.restoreAllMocks();
  });

  it('loads, changes conversations, remounts and unmounts with Promise-returning scrolling', async () => {
    const page = render(view());
    expect(await screen.findByText('saved answer')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /other/ }));
    expect(await screen.findByText('other answer')).toBeVisible();
    page.rerender(view('return-to-assistant'));
    expect(await screen.findByText('saved answer')).toBeVisible();
    expect(() => page.unmount()).not.toThrow();
    expect(caught).not.toHaveBeenCalled();
  });

  it('creates, sends, recovers from stream failure and submits an interaction', async () => {
    let detail: AssistantConversationDetail = { conversation: conversation('saved'), messages: [] };
    vi.mocked(assistantApi.list).mockResolvedValue([]);
    vi.mocked(assistantApi.create).mockResolvedValue(conversation('saved'));
    vi.mocked(assistantApi.get).mockImplementation(() => Promise.resolve(detail));
    vi.mocked(assistantApi.send).mockImplementation(() => {
      detail = {
        ...detail,
        messages: [
          {
            id: 'choice',
            role: 'assistant',
            content: 'Choose a goal',
            createdAtUtc: '2026-10-22T00:00:00Z',
            interactionStatus: 'required',
            interaction: {
              version: '1',
              type: 'single_choice',
              id: 'goal',
              title: 'Goal',
              options: [{ value: 'strength', label: 'Build strength' }],
            },
          },
        ],
      };
      return Promise.resolve(completedRun);
    });
    vi.mocked(assistantApi.events)
      .mockRejectedValueOnce(new Error('Stream disconnected'))
      .mockResolvedValue([]);
    vi.mocked(assistantApi.submit).mockImplementation(() => {
      detail = {
        ...detail,
        messages: [
          {
            id: 'reply',
            role: 'assistant',
            content: 'Saved choice',
            createdAtUtc: '2026-10-22T00:00:00Z',
            interactionStatus: 'none',
          },
        ],
      };
      return Promise.resolve(completedRun);
    });
    const page = render(view());
    fireEvent.click(screen.getByRole('button', { name: /New/ }));
    await waitFor(() => expect(assistantApi.get).toHaveBeenCalledWith('saved'));
    fireEvent.change(screen.getByLabelText('Message FitFlex Assistant'), {
      target: { value: 'Help me' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Build strength' }));
    expect(await screen.findByText('Saved choice')).toBeVisible();
    expect(assistantApi.send).toHaveBeenCalledWith('saved', 'Help me');
    expect(assistantApi.submit).toHaveBeenCalledWith('saved', 'choice', 'strength');
    expect(assistantApi.run).toHaveBeenCalledTimes(2);
    expect(assistantApi.events).toHaveBeenCalledTimes(2);
    page.unmount();
    expect(caught).not.toHaveBeenCalled();
  });

  it.each(['cancel', 'leave'])(
    'aborts an active stream when the user chooses to %s',
    async (action) => {
      let activeSignal: AbortSignal | undefined;
      vi.mocked(assistantApi.send).mockResolvedValue({ ...completedRun, status: 'running' });
      vi.mocked(assistantApi.events).mockImplementation((_conversationId, _runId, signal) => {
        activeSignal = signal;
        return new Promise((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Cancelled', 'AbortError')),
            { once: true },
          );
        });
      });
      const page = render(view());
      await screen.findByText('saved answer');
      fireEvent.change(screen.getByLabelText('Message FitFlex Assistant'), {
        target: { value: 'Hello' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
      const cancel = await screen.findByRole('button', { name: 'Cancel assistant run' });
      if (action === 'cancel') {
        fireEvent.click(cancel);
        await waitFor(() => expect(assistantApi.cancel).toHaveBeenCalledWith('saved', 'run-1'));
        await screen.findByRole('button', { name: 'Send message' });
      }
      page.unmount();
      expect(activeSignal?.aborted).toBe(true);
      expect(caught).not.toHaveBeenCalled();
    },
  );
});
