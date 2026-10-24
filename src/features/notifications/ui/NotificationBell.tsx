import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../model/useNotifications';

import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

/** Top-bar bell with the unread count; opens the user's in-app notifications (SRS FR-SH-04). */
export function NotificationBell({ className = 'member-icon-button' }: { className?: string }) {
  const { t } = useTranslation('notifications');
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = notifications.data?.unreadCount ?? 0;
  const items = notifications.data?.items ?? [];

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={unread > 0 ? t('bellUnread', { count: unread }) : t('bell')}
        onClick={() => setOpen(true)}
        style={{ position: 'relative' }}
      >
        <Bell aria-hidden="true" size={18} />
        {unread > 0 ? (
          <span
            data-testid="notification-badge"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 8,
              background: '#b42318',
              color: '#fff',
              fontSize: 10,
              lineHeight: '16px',
              textAlign: 'center',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('subtitle', { count: unread })}</DialogDescription>
          </DialogHeader>

          {notifications.isPending ? <p role="status">{t('loading')}</p> : null}
          {notifications.isError ? <p role="alert">{t('error')}</p> : null}
          {notifications.isSuccess && items.length === 0 ? <p>{t('empty')}</p> : null}

          <ul className="space-y-2" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            {items.map((item) => (
              <li
                key={item.id}
                data-testid="notification"
                className={item.isRead ? 'opacity-70' : 'font-medium'}
                style={{ borderBottom: '1px solid rgba(0,0,0,.08)', paddingBottom: 8 }}
              >
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.createdAtUtc))}
                </small>
                {!item.isRead ? (
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ marginLeft: 8 }}
                    disabled={markRead.isPending}
                    onClick={() => markRead.mutate(item.id)}
                  >
                    {t('markRead')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>

          {unread > 0 ? (
            <Button variant="outline" disabled={markAll.isPending} onClick={() => markAll.mutate()}>
              {t('markAll')}
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
