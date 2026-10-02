import type { GymOwnerDashboardResources } from './types';

function localDate(daysFromToday: number, hour = 9, minute = 0) {
  const value = new Date();
  value.setHours(hour, minute, 0, 0);
  value.setDate(value.getDate() + daysFromToday);
  return value.toISOString();
}

export const gymOwnerDashboardMockResources: GymOwnerDashboardResources = {
  trainers: {
    state: 'loaded',
    data: [
      { id: 'trainer-minh', name: 'Minh Tran', status: 'active' },
      { id: 'trainer-hana', name: 'Hana Kim', status: 'active' },
      { id: 'trainer-linh', name: 'Linh Pham', status: 'active' },
      { id: 'trainer-alex', name: 'Alex Volkov', status: 'hidden' },
      { id: 'trainer-mai', name: 'Mai Nguyen', status: 'suspended' },
      { id: 'trainer-jordan', name: 'Jordan Lee', status: 'unlinked' },
    ],
  },
  assignments: {
    state: 'loaded',
    data: [
      {
        id: 'assignment-001',
        memberName: 'Alex Volkov',
        packageName: 'Strength Foundation',
        trainerName: 'Minh Tran',
        startsOn: localDate(-18),
        endsOn: localDate(26),
        status: 'active',
      },
      {
        id: 'assignment-002',
        memberName: 'Mai Nguyen',
        packageName: 'Sustainable Fat Loss',
        trainerName: 'Hana Kim',
        startsOn: localDate(-11),
        endsOn: localDate(34),
        status: 'active',
      },
      {
        id: 'assignment-003',
        memberName: 'Jordan Lee',
        packageName: 'Endurance Reset',
        trainerName: 'Linh Pham',
        startsOn: localDate(-70),
        endsOn: localDate(-8),
        status: 'historical',
      },
    ],
  },
  ptSales: {
    state: 'loaded',
    data: [
      {
        id: 'pt-order-1042',
        packageName: 'Strength Foundation',
        trainerName: 'Minh Tran',
        purchasedAt: localDate(-1, 15, 20),
        status: 'confirmed',
      },
      {
        id: 'pt-order-1041',
        packageName: 'Sustainable Fat Loss',
        trainerName: 'Hana Kim',
        purchasedAt: localDate(-2, 11, 10),
        status: 'confirmed',
      },
      {
        id: 'pt-order-1039',
        packageName: 'Mobility Starter',
        trainerName: 'Linh Pham',
        purchasedAt: localDate(-3, 18, 5),
        status: 'pending',
      },
    ],
  },
  appointments: {
    state: 'loaded',
    data: [
      {
        id: 'appointment-001',
        memberName: 'Alex Volkov',
        trainerName: 'Minh Tran',
        startsAt: localDate(0, 14, 30),
        status: 'confirmed',
        type: 'coaching',
      },
      {
        id: 'appointment-002',
        memberName: 'Mai Nguyen',
        trainerName: 'Hana Kim',
        startsAt: localDate(1, 9, 0),
        status: 'pending',
        type: 'assessment',
      },
      {
        id: 'appointment-003',
        memberName: 'Jordan Lee',
        trainerName: 'Linh Pham',
        startsAt: localDate(2, 17, 15),
        status: 'cancelled',
        type: 'planReview',
      },
    ],
  },
  alerts: {
    state: 'loaded',
    data: [
      {
        id: 'alert-assignment',
        severity: 'high',
        message: 'assignmentRequired',
        subject: 'Mobility Starter · PT-1039',
        occurredAt: localDate(-1, 18, 5),
      },
      {
        id: 'alert-cancelled',
        severity: 'high',
        message: 'appointmentCancelled',
        subject: 'Jordan Lee · Linh Pham',
        occurredAt: localDate(-1, 16, 45),
      },
      {
        id: 'alert-trainer',
        severity: 'medium',
        message: 'trainerReviewPending',
        subject: 'Quang Pham',
        occurredAt: localDate(-2, 10, 30),
      },
      {
        id: 'alert-upcoming',
        severity: 'low',
        message: 'appointmentUpcoming',
        subject: 'Alex Volkov · Minh Tran',
        occurredAt: localDate(0, 14, 30),
      },
    ],
  },
};
