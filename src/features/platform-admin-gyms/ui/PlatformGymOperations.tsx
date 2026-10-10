import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PlatformGym, PlatformGymAppointment } from '../model/types';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

const labels = {
  en: {
    trainers: 'Trainers',
    members: 'Members',
    schedule: 'Booking schedule',
    sample: 'Sample records',
    searchTrainers: 'Search trainers',
    searchMembers: 'Search members',
    allStatuses: 'All statuses',
    allTrainers: 'All trainers',
    active: 'Active',
    hidden: 'Hidden',
    paused: 'Paused',
    name: 'Name',
    contact: 'Contact',
    focus: 'Focus',
    status: 'Status',
    assignedTrainer: 'Trainer',
    joined: 'Joined',
    noTrainer: 'No trainers match these filters.',
    noMember: 'No members match these filters.',
    noBooking: 'No bookings for this week and trainer.',
    viewSchedule: 'View schedule',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    thisWeek: 'This week',
    confirmed: 'Confirmed',
    pending: 'Pending',
    coaching: 'Training session',
    assessment: 'Assessment',
    plan_review: 'Plan review',
    minutes: 'min',
    bookings: 'bookings',
    unassigned: 'Unassigned',
  },
  vi: {
    trainers: 'Trainer',
    members: 'Member',
    schedule: 'Lịch hẹn tập',
    sample: 'Dữ liệu minh họa',
    searchTrainers: 'Tìm Trainer',
    searchMembers: 'Tìm Member',
    allStatuses: 'Mọi trạng thái',
    allTrainers: 'Tất cả Trainer',
    active: 'Đang hoạt động',
    hidden: 'Đã ẩn',
    paused: 'Tạm dừng',
    name: 'Tên',
    contact: 'Liên hệ',
    focus: 'Chuyên môn',
    status: 'Trạng thái',
    assignedTrainer: 'Trainer phụ trách',
    joined: 'Đăng ký',
    noTrainer: 'Không có Trainer phù hợp bộ lọc.',
    noMember: 'Không có Member phù hợp bộ lọc.',
    noBooking: 'Không có lịch hẹn trong tuần này với Trainer đã chọn.',
    viewSchedule: 'Xem lịch',
    previousWeek: 'Tuần trước',
    nextWeek: 'Tuần sau',
    thisWeek: 'Tuần này',
    confirmed: 'Đã xác nhận',
    pending: 'Chờ xác nhận',
    coaching: 'Buổi tập',
    assessment: 'Đánh giá',
    plan_review: 'Xem lại kế hoạch',
    minutes: 'phút',
    bookings: 'lịch hẹn',
    unassigned: 'Chưa phân công',
  },
} as const;

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function addDays(date: Date, count: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function matchText(query: string, ...values: string[]) {
  return values.some((value) =>
    value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
}

function BookingCard({
  booking,
  gym,
  t,
}: {
  booking: PlatformGymAppointment;
  gym: PlatformGym;
  t: (typeof labels)['en'] | (typeof labels)['vi'];
}) {
  const trainer = gym.trainers.find((item) => item.id === booking.trainerId);
  const member = gym.members.find((item) => item.id === booking.memberId);
  return (
    <li className="platform-booking">
      <div className="platform-booking__top">
        <time dateTime={`${booking.date}T${booking.time}`}>{booking.time}</time>
        <Badge variant={booking.status === 'confirmed' ? 'accent' : 'neutral'}>
          {t[booking.status]}
        </Badge>
      </div>
      <strong>
        {trainer?.name ?? '—'} → {member?.name ?? '—'}
      </strong>
      <span>
        {t[booking.type]} · {booking.durationMinutes} {t.minutes}
      </span>
    </li>
  );
}

export function PlatformGymOperations({ gym }: { gym: PlatformGym }) {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const t = labels[isVi ? 'vi' : 'en'];
  const locale = isVi ? 'vi-VN' : 'en-US';
  const [trainerQuery, setTrainerQuery] = useState('');
  const [trainerStatus, setTrainerStatus] = useState('all');
  const [memberQuery, setMemberQuery] = useState('');
  const [memberStatus, setMemberStatus] = useState('all');
  const [memberTrainer, setMemberTrainer] = useState('all');
  const [scheduleTrainer, setScheduleTrainer] = useState('all');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const scheduleRef = useRef<HTMLElement>(null);
  const trainerRows = gym.trainers.filter(
    (trainer) =>
      matchText(trainerQuery, trainer.name, trainer.email, trainer.specialization) &&
      (trainerStatus === 'all' || trainer.status === trainerStatus),
  );
  const memberRows = gym.members.filter(
    (member) =>
      matchText(memberQuery, member.name, member.email) &&
      (memberStatus === 'all' || member.status === memberStatus) &&
      (memberTrainer === 'all' || member.trainerId === memberTrainer),
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const visibleBookings = gym.appointments.filter(
    (booking) =>
      (scheduleTrainer === 'all' || booking.trainerId === scheduleTrainer) &&
      booking.date >= dateKey(days[0]!) &&
      booking.date <= dateKey(days[6]!),
  );
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <section
        className="platform-gym-detail-card platform-gym-people"
        aria-labelledby="gym-trainers-heading"
      >
        <div className="platform-gym-section-heading">
          <h2 id="gym-trainers-heading">{t.trainers}</h2>
          <span>
            {trainerRows.length} / {gym.trainers.length}
          </span>
        </div>
        <div className="platform-gym-filters">
          <label>
            <span>{t.searchTrainers}</span>
            <span className="platform-gym-search">
              <Search size={15} aria-hidden="true" />
              <Input
                value={trainerQuery}
                onChange={(event) => setTrainerQuery(event.target.value)}
                placeholder={t.searchTrainers}
              />
            </span>
          </label>
          <label>
            <span>{t.status}</span>
            <Select
              value={trainerStatus}
              onChange={(event) => setTrainerStatus(event.target.value)}
            >
              <option value="all">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="hidden">{t.hidden}</option>
            </Select>
          </label>
        </div>
        <TableContainer className="platform-gym-table-shell">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.name}</TableHead>
                <TableHead>{t.contact}</TableHead>
                <TableHead>{t.focus}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead aria-label={t.viewSchedule} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainerRows.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>
                    <strong>{trainer.name}</strong>
                  </TableCell>
                  <TableCell>{trainer.email}</TableCell>
                  <TableCell>{trainer.specialization}</TableCell>
                  <TableCell>
                    <Badge variant={trainer.status === 'active' ? 'accent' : 'neutral'}>
                      {t[trainer.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setScheduleTrainer(trainer.id);
                        scheduleRef.current?.scrollIntoView({
                          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                            ? 'auto'
                            : 'smooth',
                          block: 'start',
                        });
                      }}
                    >
                      {t.viewSchedule}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {trainerRows.length === 0 && <p className="platform-gym-empty">{t.noTrainer}</p>}
      </section>
      <section
        className="platform-gym-detail-card platform-gym-people"
        aria-labelledby="gym-members-heading"
      >
        <div className="platform-gym-section-heading">
          <h2 id="gym-members-heading">{t.members}</h2>
          <span>
            {memberRows.length} / {gym.members.length}
          </span>
        </div>
        <div className="platform-gym-filters">
          <label>
            <span>{t.searchMembers}</span>
            <span className="platform-gym-search">
              <Search size={15} aria-hidden="true" />
              <Input
                value={memberQuery}
                onChange={(event) => setMemberQuery(event.target.value)}
                placeholder={t.searchMembers}
              />
            </span>
          </label>
          <label>
            <span>{t.status}</span>
            <Select value={memberStatus} onChange={(event) => setMemberStatus(event.target.value)}>
              <option value="all">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="paused">{t.paused}</option>
            </Select>
          </label>
          <label>
            <span>{t.assignedTrainer}</span>
            <Select
              value={memberTrainer}
              onChange={(event) => setMemberTrainer(event.target.value)}
            >
              <option value="all">{t.allTrainers}</option>
              {gym.trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <TableContainer className="platform-gym-table-shell">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.name}</TableHead>
                <TableHead>{t.contact}</TableHead>
                <TableHead>{t.assignedTrainer}</TableHead>
                <TableHead>{t.joined}</TableHead>
                <TableHead>{t.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberRows.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <strong>{member.name}</strong>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {gym.trainers.find((trainer) => trainer.id === member.trainerId)?.name ??
                      t.unassigned}
                  </TableCell>
                  <TableCell>
                    <time dateTime={member.joinedAt}>
                      {dateLabel.format(new Date(`${member.joinedAt}T00:00:00`))}
                    </time>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'accent' : 'neutral'}>
                      {t[member.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {memberRows.length === 0 && <p className="platform-gym-empty">{t.noMember}</p>}
      </section>
      <section
        ref={scheduleRef}
        className="platform-gym-detail-card platform-gym-calendar"
        aria-labelledby="gym-schedule-heading"
      >
        <div className="platform-gym-section-heading">
          <h2 id="gym-schedule-heading">
            <CalendarDays size={17} aria-hidden="true" />
            {t.schedule}
          </h2>
          <span>
            {visibleBookings.length} {t.bookings}
          </span>
        </div>
        <div className="platform-gym-calendar-controls">
          <label>
            <span>{t.trainers}</span>
            <Select
              value={scheduleTrainer}
              onChange={(event) => setScheduleTrainer(event.target.value)}
            >
              <option value="all">{t.allTrainers}</option>
              {gym.trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </Select>
          </label>
          <div className="platform-gym-week-nav">
            <Button
              variant="outline"
              size="sm"
              aria-label={t.previousWeek}
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
            >
              {t.thisWeek}
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label={t.nextWeek}
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
          <strong>
            {dateLabel.format(days[0])} – {dateLabel.format(days[6])}
          </strong>
        </div>
        <div className="platform-gym-week" role="list" aria-label={t.schedule}>
          {days.map((day) => {
            const key = dateKey(day);
            const bookings = visibleBookings
              .filter((booking) => booking.date === key)
              .sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div className="platform-gym-day" role="listitem" key={key}>
                <div className="platform-gym-day__head">
                  <span>{new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day)}</span>
                  <strong>{day.getDate()}</strong>
                </div>
                <ul>
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} gym={gym} t={t} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        {visibleBookings.length === 0 && <p className="platform-gym-empty">{t.noBooking}</p>}
      </section>
    </>
  );
}
