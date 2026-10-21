import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { notificationsApi } from '../api/notificationsApi';
import type { NotificationListDto } from '../api/types';

import { NotificationBell } from './NotificationBell';

vi.mock('../api/notificationsApi', () => ({
  notificationsApi: { listMine: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
}));

const inbox: NotificationListDto = {
  unreadCount: 2,
  items: [
    {
      id: 'n-1',
      type: 'appointment.proposed',
      title: 'Đề xuất buổi tập mới',
      body: 'Có đề xuất buổi tập lúc 09:00 22/10/2026.',
      relatedId: 'ap-1',
      isRead: false,
      createdAtUtc: '2026-10-21T01:00:00Z',
    },
    {
      id: 'n-2',
      type: 'appointment.makeup',
      title: 'Hẹn lịch khác',
      body: 'Buổi không diễn ra và không bị trừ.',
      relatedId: 'ap-2',
      isRead: false,
      createdAtUtc: '2026-10-21T02:00:00Z',
    },
  ],
};

function renderBell() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NotificationBell />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.resetAllMocks());

it('shows the unread count and lists notifications when opened', async () => {
  vi.mocked(notificationsApi.listMine).mockResolvedValue(inbox);
  const user = userEvent.setup();
  renderBell();

  expect(await screen.findByTestId('notification-badge')).toHaveTextContent('2');
  await user.click(screen.getByRole('button', { name: /2 chưa đọc/ }));
  expect(await screen.findByText('Đề xuất buổi tập mới')).toBeVisible();
  expect(screen.getAllByTestId('notification')).toHaveLength(2);
});

it('marks one notification and then all of them as read', async () => {
  vi.mocked(notificationsApi.listMine).mockResolvedValue(inbox);
  vi.mocked(notificationsApi.markRead).mockResolvedValue(true);
  vi.mocked(notificationsApi.markAllRead).mockResolvedValue(true);
  const user = userEvent.setup();
  renderBell();

  await user.click(await screen.findByRole('button', { name: /chưa đọc/ }));
  await user.click((await screen.findAllByRole('button', { name: 'Đánh dấu đã đọc' }))[0]!);
  await waitFor(() => expect(notificationsApi.markRead).toHaveBeenCalledWith('n-1'));

  await user.click(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' }));
  await waitFor(() => expect(notificationsApi.markAllRead).toHaveBeenCalledTimes(1));
});

it('shows an empty state without a badge when there is nothing', async () => {
  vi.mocked(notificationsApi.listMine).mockResolvedValue({ items: [], unreadCount: 0 });
  const user = userEvent.setup();
  renderBell();

  await user.click(await screen.findByRole('button', { name: 'Thông báo' }));
  expect(await screen.findByText('Chưa có thông báo nào.')).toBeVisible();
  expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
});
