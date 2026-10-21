import type { NotificationListDto } from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const notificationsApi = {
  listMine: (take = 30) =>
    apiGet<NotificationListDto>(ENDPOINTS.notifications.mine, { params: { take } }),
  markRead: (id: string) => apiPost<boolean>(ENDPOINTS.notifications.read(id)),
  markAllRead: () => apiPost<boolean>(ENDPOINTS.notifications.readAll),
};
