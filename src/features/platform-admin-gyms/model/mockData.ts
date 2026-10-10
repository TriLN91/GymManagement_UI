import type { PlatformGym } from './types';

function weekDate(dayOffset: number) {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + dayOffset);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

export const platformGyms: ReadonlyArray<PlatformGym> = [
  {
    id: 'northstar-fitness',
    name: 'Northstar Fitness',
    owner: 'Minh Nguyen',
    address: 'District 7, Ho Chi Minh City',
    joinedAt: '2026-04-14T00:00:00.000Z',
    trainers: [
      {
        id: 'trainer-minh',
        name: 'Minh Tran',
        email: 'minh.tran@fit.local',
        specialization: 'Strength',
        status: 'active',
      },
      {
        id: 'trainer-hana',
        name: 'Hana Kim',
        email: 'hana.kim@fit.local',
        specialization: 'Conditioning',
        status: 'active',
      },
      {
        id: 'trainer-linh',
        name: 'Linh Pham',
        email: 'linh.pham@fit.local',
        specialization: 'Mobility',
        status: 'hidden',
      },
    ],
    members: [
      {
        id: 'member-alex',
        name: 'Alex Volkov',
        email: 'alex@fit.local',
        joinedAt: '2026-05-16',
        trainerId: 'trainer-minh',
        status: 'active',
      },
      {
        id: 'member-mai',
        name: 'Mai Nguyen',
        email: 'mai@fit.local',
        joinedAt: '2026-06-08',
        trainerId: 'trainer-hana',
        status: 'active',
      },
      {
        id: 'member-jordan',
        name: 'Jordan Lee',
        email: 'jordan.member@fit.local',
        joinedAt: '2026-07-19',
        trainerId: 'trainer-linh',
        status: 'active',
      },
      {
        id: 'member-thao',
        name: 'Thao Le',
        email: 'thao@fit.local',
        joinedAt: '2026-08-04',
        status: 'paused',
      },
    ],
    appointments: [
      {
        id: 'northstar-appt-1',
        trainerId: 'trainer-minh',
        memberId: 'member-alex',
        date: weekDate(0),
        time: '08:00',
        durationMinutes: 60,
        type: 'coaching',
        status: 'confirmed',
      },
      {
        id: 'northstar-appt-2',
        trainerId: 'trainer-hana',
        memberId: 'member-mai',
        date: weekDate(1),
        time: '10:30',
        durationMinutes: 45,
        type: 'assessment',
        status: 'pending',
      },
      {
        id: 'northstar-appt-3',
        trainerId: 'trainer-linh',
        memberId: 'member-jordan',
        date: weekDate(2),
        time: '17:15',
        durationMinutes: 45,
        type: 'plan_review',
        status: 'confirmed',
      },
      {
        id: 'northstar-appt-4',
        trainerId: 'trainer-minh',
        memberId: 'member-alex',
        date: weekDate(4),
        time: '15:00',
        durationMinutes: 60,
        type: 'coaching',
        status: 'confirmed',
      },
      {
        id: 'northstar-appt-5',
        trainerId: 'trainer-hana',
        memberId: 'member-mai',
        date: weekDate(6),
        time: '09:00',
        durationMinutes: 60,
        type: 'coaching',
        status: 'confirmed',
      },
    ],
    offers: [
      { id: 'offer-n1', name: 'Open Gym Membership', type: 'Membership', status: 'published' },
      { id: 'offer-n2', name: 'Weekend Day Pass', type: 'Day Pass', status: 'published' },
      { id: 'offer-n3', name: 'Strength Fundamentals', type: 'Class', status: 'paused' },
    ],
    events: [
      {
        id: 'event-n1',
        name: 'Strength assessment day',
        date: '2026-10-18T00:00:00.000Z',
        status: 'upcoming',
      },
      {
        id: 'event-n2',
        name: 'Community lifting session',
        date: '2026-09-20T00:00:00.000Z',
        status: 'completed',
      },
    ],
  },
  {
    id: 'pulse-collective',
    name: 'Pulse Collective',
    owner: 'Lan Pham',
    address: 'District 3, Ho Chi Minh City',
    joinedAt: '2026-05-02T00:00:00.000Z',
    trainers: [
      {
        id: 'trainer-nhi',
        name: 'Nhi Vu',
        email: 'nhi@pulse.local',
        specialization: 'Pilates',
        status: 'active',
      },
      {
        id: 'trainer-bao',
        name: 'Bao Nguyen',
        email: 'bao@pulse.local',
        specialization: 'Strength',
        status: 'active',
      },
    ],
    members: [
      {
        id: 'member-lan',
        name: 'Lan Do',
        email: 'lan.do@fit.local',
        joinedAt: '2026-07-03',
        trainerId: 'trainer-nhi',
        status: 'active',
      },
      {
        id: 'member-quynh',
        name: 'Quynh Tran',
        email: 'quynh@fit.local',
        joinedAt: '2026-07-21',
        trainerId: 'trainer-bao',
        status: 'active',
      },
    ],
    appointments: [
      {
        id: 'pulse-appt-1',
        trainerId: 'trainer-nhi',
        memberId: 'member-lan',
        date: weekDate(1),
        time: '07:30',
        durationMinutes: 50,
        type: 'coaching',
        status: 'confirmed',
      },
      {
        id: 'pulse-appt-2',
        trainerId: 'trainer-bao',
        memberId: 'member-quynh',
        date: weekDate(3),
        time: '18:00',
        durationMinutes: 60,
        type: 'coaching',
        status: 'pending',
      },
    ],
    offers: [
      { id: 'offer-p1', name: 'Studio Membership', type: 'Membership', status: 'published' },
      { id: 'offer-p2', name: 'First Session Trial', type: 'Trial', status: 'published' },
    ],
    events: [
      {
        id: 'event-p1',
        name: 'Mobility workshop',
        date: '2026-10-25T00:00:00.000Z',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'forge-training',
    name: 'Forge Training Club',
    owner: 'Quoc Tran',
    address: 'Thu Duc City, Ho Chi Minh City',
    joinedAt: '2026-06-19T00:00:00.000Z',
    trainers: [
      {
        id: 'trainer-khoa',
        name: 'Khoa Pham',
        email: 'khoa@forge.local',
        specialization: 'Functional training',
        status: 'active',
      },
    ],
    members: [
      {
        id: 'member-huy',
        name: 'Huy Le',
        email: 'huy@fit.local',
        joinedAt: '2026-08-12',
        trainerId: 'trainer-khoa',
        status: 'active',
      },
    ],
    appointments: [
      {
        id: 'forge-appt-1',
        trainerId: 'trainer-khoa',
        memberId: 'member-huy',
        date: weekDate(4),
        time: '06:30',
        durationMinutes: 60,
        type: 'coaching',
        status: 'confirmed',
      },
    ],
    offers: [
      {
        id: 'offer-f1',
        name: 'Functional Training Pack',
        type: 'Other Service',
        status: 'published',
      },
    ],
    events: [
      { id: 'event-f1', name: 'Open house', date: '2026-08-14T00:00:00.000Z', status: 'completed' },
    ],
  },
];
