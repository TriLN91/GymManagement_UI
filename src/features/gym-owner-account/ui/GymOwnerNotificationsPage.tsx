import {
  Bell,
  Check,
  ChevronRight,
  CircleDollarSign,
  Megaphone,
  PackageCheck,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { gymOwnerNotificationResource } from '../model/mockData';
import { isAllowedGymOwnerNotificationTarget } from '../model/notificationNavigation';
import type { GymOwnerNotificationEvent } from '../model/types';
import { useGymOwnerAccountStore } from '../model/useGymOwnerAccountStore';

import { AccountResourceStateView } from './AccountResourceState';
import { gymOwnerAccountCopy } from './copy';

import { Badge } from '@/shared/ui/badge';
import { WorkspacePage } from '@/shared/ui/workspace';

import './gym-owner-account.css';

const eventIcons = {
  purchase_payment: CircleDollarSign,
  trainer_approval: UserRoundCheck,
  offer_moderation: PackageCheck,
  settlement_refund_dispute: ShieldCheck,
  platform_announcement: Megaphone,
} satisfies Record<GymOwnerNotificationEvent, typeof Bell>;

export function GymOwnerNotificationsPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const text = gymOwnerAccountCopy[isVi ? 'vi' : 'en'];
  const locale = isVi ? 'vi-VN' : 'en-US';
  const readIds = useGymOwnerAccountStore((state) => state.readNotificationIds);
  const markRead = useGymOwnerAccountStore((state) => state.markNotificationRead);
  const notifications =
    gymOwnerNotificationResource.state === 'loaded' ? gymOwnerNotificationResource.data : [];
  const unreadCount = notifications.filter(
    (notification) => !notification.initiallyRead && !readIds.includes(notification.id),
  ).length;

  return (
    <WorkspacePage width="wide" className="gym-account-page">
      <h1 className="sr-only">{text.notifications}</h1>
      <div className="gym-account-toolbar">
        <Badge variant={unreadCount > 0 ? 'accent' : 'neutral'}>
          <Bell aria-hidden="true" size={13} />
          {text.unread}: {unreadCount}
        </Badge>
      </div>

      <AccountResourceStateView
        resource={gymOwnerNotificationResource}
        loadingLabel={text.loadingNotifications}
        emptyLabel={text.emptyNotifications}
        errorLabel={text.errorNotifications}
      >
        {(items) => (
          <section className="gym-notification-list" aria-label={text.notifications}>
            {items.map((item) => {
              const Icon = eventIcons[item.event];
              const isRead = item.initiallyRead || readIds.includes(item.id);
              const content = (
                <>
                  <span className="gym-notification-icon">
                    <Icon aria-hidden="true" size={19} />
                  </span>
                  <span className="gym-notification-copy">
                    <span className="gym-notification-meta">
                      <strong>{item.title[isVi ? 'vi' : 'en']}</strong>
                      <Badge variant={isRead ? 'neutral' : 'accent'}>
                        {isRead ? text.read : text.unread}
                      </Badge>
                    </span>
                    <span>{item.message[isVi ? 'vi' : 'en']}</span>
                    <time dateTime={item.createdAt}>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(item.createdAt))}
                    </time>
                  </span>
                  {isAllowedGymOwnerNotificationTarget(item.target) ? (
                    <ChevronRight aria-hidden="true" size={18} />
                  ) : isRead ? (
                    <Check aria-hidden="true" size={17} />
                  ) : null}
                </>
              );

              return isAllowedGymOwnerNotificationTarget(item.target) ? (
                <Link
                  key={item.id}
                  to={item.target}
                  className={isRead ? undefined : 'is-unread'}
                  aria-label={`${text.open}: ${item.title[isVi ? 'vi' : 'en']}`}
                  onClick={() => markRead(item.id)}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  className={isRead ? undefined : 'is-unread'}
                  aria-label={`${text.markRead}: ${item.title[isVi ? 'vi' : 'en']}`}
                  onClick={() => markRead(item.id)}
                >
                  {content}
                </button>
              );
            })}
          </section>
        )}
      </AccountResourceStateView>
    </WorkspacePage>
  );
}
