import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { MemberNotificationsPage } from './MemberProfilePages';

import { notificationsApi } from '@/features/notifications/api/notificationsApi';
import i18n from '@/i18n';

vi.mock('@/features/notifications/api/notificationsApi', () => ({
  notificationsApi: { listMine: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
}));
beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage('en');
});

it('keeps notification failures distinct from empty history and retries against the server', async () => {
  vi.mocked(notificationsApi.listMine)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({
      items: [
        {
          id: 'real-1',
          title: 'Server appointment notice',
          body: 'Your actual notice',
          createdAtUtc: '2026-10-28T00:00:00Z',
          type: 'appointment',
          relatedId: null,
          isRead: true,
        },
      ],
      unreadCount: 0,
    });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemberNotificationsPage />
    </QueryClientProvider>,
  );
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.queryByText('Server appointment notice')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Server appointment notice')).toBeInTheDocument();
  expect(screen.queryByText(/Linh Nguyễn/)).not.toBeInTheDocument();
  client.clear();
});
