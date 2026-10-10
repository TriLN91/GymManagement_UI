import { ArrowLeft, Building2, CalendarDays, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { platformGyms } from '../model/mockData';

import { PlatformGymOperations } from './PlatformGymOperations';

import { ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty';
import { WorkspacePage } from '@/shared/ui/workspace';

import './platform-gyms.css';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

const copy = {
  en: {
    sample: 'Sample data',
    active: 'Active gyms',
    trainers: 'trainers',
    members: 'members',
    detail: 'Detail',
    back: 'Back to gyms',
    gymProfile: 'Gym profile',
    activeMembers: 'Active members',
    joined: 'Joined platform',
    offers: 'Service offers',
    events: 'Gym events',
    unavailable: 'Gym is unavailable.',
    published: 'Published',
    paused: 'Paused',
    upcoming: 'Upcoming',
    completed: 'Completed',
  },
  vi: {
    sample: 'Dữ liệu minh họa',
    active: 'Gym đang hoạt động',
    trainers: 'Trainer',
    members: 'Member',
    detail: 'Chi tiết',
    back: 'Quay lại Gym',
    gymProfile: 'Hồ sơ Gym',
    activeMembers: 'Member đang hoạt động',
    joined: 'Tham gia nền tảng',
    offers: 'Gói dịch vụ',
    events: 'Sự kiện của Gym',
    unavailable: 'Không tìm thấy phòng Gym.',
    published: 'Đang hiển thị',
    paused: 'Tạm dừng',
    upcoming: 'Sắp diễn ra',
    completed: 'Đã kết thúc',
  },
} as const;

function useCopy() {
  const { i18n } = useTranslation();
  return copy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
}

function OfferStatus({ status }: { status: 'published' | 'paused' }) {
  const t = useCopy();
  return (
    <Badge variant={status === 'published' ? 'accent' : 'neutral'}>
      {status === 'published' ? t.published : t.paused}
    </Badge>
  );
}

export function PlatformGymsPage() {
  const t = useCopy();
  return (
    <WorkspacePage width="wide" className="platform-gyms-page">
      <h1 className="sr-only">{t.active}</h1>
      <div className="platform-gyms-toolbar">
        <Badge variant="neutral">
          {t.active} · {platformGyms.length}
        </Badge>
        <span className="platform-gym-sample">{t.sample}</span>
      </div>
      <div className="platform-gym-grid">
        {platformGyms.map((gym) => (
          <article className="platform-gym-card" key={gym.id}>
            <div className="platform-gym-card__mark" aria-hidden="true">
              {gym.name.slice(0, 1)}
            </div>
            <div className="platform-gym-card__content">
              <strong>{gym.name}</strong>
              <span>{gym.owner}</span>
              <address>{gym.address}</address>
            </div>
            <div className="platform-gym-card__footer">
              <span>
                {gym.trainers.length} {t.trainers} ·{' '}
                {gym.members.filter((member) => member.status === 'active').length} {t.members}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.superadmin.activeGymDetailPath(gym.id)}>{t.detail}</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </WorkspacePage>
  );
}

export function PlatformGymDetailPage() {
  const t = useCopy();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US';
  const { gymId } = useParams();
  const gym = platformGyms.find((item) => item.id === gymId);
  if (!gym)
    return (
      <WorkspacePage width="wide">
        <EmptyState
          title={t.unavailable}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.superadmin.activeGyms}>{t.back}</Link>
            </Button>
          }
        />
      </WorkspacePage>
    );
  return (
    <WorkspacePage width="wide" className="platform-gyms-page">
      <h1 className="sr-only">{gym.name}</h1>
      <div className="platform-gyms-toolbar">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.superadmin.activeGyms}>
            <ArrowLeft size={15} aria-hidden="true" />
            {t.back}
          </Link>
        </Button>
        <Badge variant="neutral">{t.sample}</Badge>
      </div>
      <section className="platform-gym-detail-identity">
        <div className="platform-gym-card__mark" aria-hidden="true">
          {gym.name.slice(0, 1)}
        </div>
        <div>
          <span>{t.gymProfile}</span>
          <h2>{gym.name}</h2>
          <p>
            {gym.owner} · {gym.address}
          </p>
        </div>
      </section>
      <dl className="platform-gym-metrics">
        <div>
          <dt>
            <UsersRound size={15} aria-hidden="true" />
            {t.trainers}
          </dt>
          <dd>{gym.trainers.length}</dd>
        </div>
        <div>
          <dt>
            <UsersRound size={15} aria-hidden="true" />
            {t.activeMembers}
          </dt>
          <dd>{gym.members.filter((member) => member.status === 'active').length}</dd>
        </div>
        <div>
          <dt>
            <Building2 size={15} aria-hidden="true" />
            {t.joined}
          </dt>
          <dd>{formatDate(gym.joinedAt, locale)}</dd>
        </div>
      </dl>
      <PlatformGymOperations gym={gym} />
      <section className="platform-gym-detail-card">
        <h2>{t.offers}</h2>
        <div className="platform-gym-row-list">
          {gym.offers.map((offer) => (
            <div key={offer.id}>
              <div>
                <strong>{offer.name}</strong>
                <span>{offer.type}</span>
              </div>
              <OfferStatus status={offer.status} />
            </div>
          ))}
        </div>
      </section>
      <section className="platform-gym-detail-card">
        <h2>{t.events}</h2>
        <div className="platform-gym-row-list">
          {gym.events.map((event) => (
            <div key={event.id}>
              <div>
                <strong>{event.name}</strong>
                <span>
                  <CalendarDays size={13} aria-hidden="true" />
                  {formatDate(event.date, locale)}
                </span>
              </div>
              <Badge variant="neutral">
                {event.status === 'upcoming' ? t.upcoming : t.completed}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </WorkspacePage>
  );
}
