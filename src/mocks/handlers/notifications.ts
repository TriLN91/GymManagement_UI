import { http, HttpResponse } from 'msw';

import type { NotificationDto } from '@/features/notifications/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// In-memory inbox (reset on reload). The real events are written by the backend in the same transaction as the change.
const path = (p: string) => `*${p}`;
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });

const inbox: NotificationDto[] = [
  {
    id: 'notification-welcome',
    type: 'system.welcome',
    title: 'Chào mừng đến FitFlex',
    body: 'Thông báo về lịch tập, đổi Trainer và gói tập sẽ xuất hiện ở đây.',
    relatedId: null,
    isRead: false,
    createdAtUtc: '2026-10-21T01:00:00.000Z',
  },
];

const view = () => ({ items: inbox, unreadCount: inbox.filter((n) => !n.isRead).length });

export const notificationHandlers = [
  http.get(path(ENDPOINTS.notifications.mine), () => ok(view())),
  http.post(path('/notifications/read-all'), () => {
    inbox.forEach((n) => (n.isRead = true));
    return ok(true);
  }),
  http.post(path('/notifications/:id/read'), ({ params }) => {
    const found = inbox.find((n) => n.id === params.id);
    if (!found)
      return HttpResponse.json(
        { isSuccess: false, message: '404', data: null, errorCode: 'NotFound' },
        { status: 404 },
      );
    found.isRead = true;
    return ok(true);
  }),
];
