import { http, HttpResponse } from 'msw';

import type { TrainerAppointmentView } from '@/features/marketplace';
import { ENDPOINTS } from '@/shared/api/endpoints';

const path = (p: string) => `*${p}`;

export const gymOwnerHandlers = [
  http.get(path(ENDPOINTS.gymOwner.myBrands), () =>
    HttpResponse.json({
      data: localStorage.getItem('fitflex:mock:trainer-api')
        ? [
            {
              id: 'brand-main',
              name: 'Fit Central',
              status: 'Approved',
              approvalStatus: 'Approved',
            },
          ]
        : [],
    }),
  ),

  http.get('*/gym-owner/brands/:brandId/dashboard', () =>
    HttpResponse.json({
      data: {
        brandId: 'b0000000-0000-0000-0000-000000000001',
        brandName: 'Fit Central',
        totalGross: 128500000,
        totalPlatformFee: 12850000,
        totalNetPayout: 115650000,
        totalOrders: 42,
        branchBreakdown: [
          {
            branchId: 'branch-main',
            branchName: 'Fit Central District 1',
            grossAmount: 78000000,
            platformCommissionAmount: 7800000,
            gymPayoutAmount: 70200000,
            orderCount: 26,
          },
        ],
      },
    }),
  ),

  http.get(path(ENDPOINTS.gymOwner.trainersOverview), () =>
    HttpResponse.json({
      data: {
        activeCount: 6,
        topTrainers: [],
      },
    }),
  ),

  http.get('*/gym-owner/branches/:branchId/dashboard', () =>
    HttpResponse.json({
      data: {
        branchId: 'branch-main',
        branchName: 'Fit Central District 1',
        grossAmount: 78000000,
        platformCommissionAmount: 7800000,
        gymPayoutAmount: 70200000,
        orderCount: 26,
      },
    }),
  ),

  http.get('*/marketplace/brands/:brandId/branches', () =>
    HttpResponse.json({
      data: [
        {
          id: 'branch-main',
          gymId: 'b0000000-0000-0000-0000-000000000001',
          brandName: 'Fit Central',
          branchName: 'Fit Central District 1',
          addressLine1: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
          city: 'Hồ Chí Minh',
          averageRating: 4.8,
          reviewCount: 38,
        },
      ],
    }),
  ),

  http.get('*/branch-manager/branches/:branchId/offers', ({ params }) => {
    const branchId = String(params.branchId);
    return HttpResponse.json({
      data: mockBranchOffers.filter((o) => !o.gymBranchId || o.gymBranchId === branchId),
    });
  }),

  http.post('*/branch-manager/branches/:branchId/offers', async ({ request, params }) => {
    const branchId = String(params.branchId);
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      durationType?: string;
      durationValue?: number;
      gymServicePrice?: number;
      isPublished?: boolean;
      minNoticeHours?: number;
    };
    const newOffer = {
      id: `offer-${Date.now()}`,
      gymId: 'b0000000-0000-0000-0000-000000000001',
      gymBranchId: branchId,
      title: body.title ?? 'Gói tập mới',
      description: body.description ?? '',
      durationType: body.durationType ?? 'Month',
      durationValue: typeof body.durationValue === 'number' ? body.durationValue : 1,
      gymServicePrice: typeof body.gymServicePrice === 'number' ? body.gymServicePrice : 0,
      includesPlus: false,
      plusDurationDays: 0,
      plusPrice: 0,
      approvalStatus: 'PendingAdminReview',
      isPublished: body.isPublished ?? true,
      minNoticeHours: body.minNoticeHours ? Number(body.minNoticeHours) : 24,
    };
    mockBranchOffers.unshift(newOffer);
    return HttpResponse.json({ data: newOffer }, { status: 201 });
  }),

  http.put('*/branch-manager/offers/:offerId', async ({ request, params }) => {
    const offerId = String(params.offerId);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = mockBranchOffers.findIndex((o) => o.id === offerId);
    if (idx >= 0) {
      mockBranchOffers[idx] = {
        ...mockBranchOffers[idx]!,
        ...body,
        approvalStatus:
          body.gymServicePrice !== undefined || body.title !== undefined
            ? 'PendingAdminReview'
            : mockBranchOffers[idx]!.approvalStatus,
      };
      return HttpResponse.json({ data: mockBranchOffers[idx] });
    }
    return HttpResponse.json({ message: 'Offer not found' }, { status: 404 });
  }),

  http.get('*/branch-manager/branches/:branchId/appointments', () => {
    return HttpResponse.json({ data: mockBranchAppointments });
  }),

  http.post(
    '*/branch-manager/appointments/:appointmentId/attendance',
    async ({ request, params }) => {
      const id = String(params.appointmentId);
      const body = (await request.json()) as { status: string; notes?: string };
      const appt = mockBranchAppointments.find((a) => a.id === id);
      if (appt) {
        appt.status = body.status;
        if (body.status === 'Completed' && !appt.completedAtUtc) {
          appt.completedAtUtc = new Date().toISOString();
        }
        if (body.notes !== undefined) {
          appt.notes = body.notes;
        }
        return HttpResponse.json({ data: appt });
      }
      return HttpResponse.json({ message: 'Appointment not found' }, { status: 404 });
    },
  ),

  http.post(
    '*/branch-manager/appointments/:appointmentId/reassign',
    async ({ request, params }) => {
      const id = String(params.appointmentId);
      const body = (await request.json()) as { newTrainerProfileId: string; reason: string };
      const appt = mockBranchAppointments.find((a) => a.id === id);
      if (appt) {
        const newTrainer = mockBranchTrainers.find((t) => t.id === body.newTrainerProfileId);
        appt.originalTrainerProfileId = appt.currentTrainerProfileId;
        appt.originalTrainerName = appt.currentTrainerName;
        appt.currentTrainerProfileId = body.newTrainerProfileId;
        appt.currentTrainerName = newTrainer ? newTrainer.fullName : 'PT Thay thế';
        appt.isReassigned = true;
        appt.reassignmentReason = body.reason;
        appt.status = 'Reassigned';
        return HttpResponse.json({ data: appt });
      }
      return HttpResponse.json({ message: 'Appointment not found' }, { status: 404 });
    },
  ),
];

const mockBranchOffers = [
  {
    id: 'offer-001',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    title: 'Gói Hội Viên Standard 1 Tháng',
    description:
      'Tập luyện không giới hạn toàn bộ khu vực Cardio, Tạ tự do, Tủ đồ và Phòng tắm nóng lạnh.',
    durationType: 'Month',
    durationValue: 1,
    gymServicePrice: 650000,
    includesPlus: false,
    plusDurationDays: 0,
    plusPrice: 0,
    approvalStatus: 'Approved',
    isPublished: true,
    minNoticeHours: 24,
  },
  {
    id: 'offer-002',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    title: 'Gói Hội Viên Tiết Kiệm 3 Tháng',
    description:
      'Thẻ tập 3 tháng ưu đãi, tặng kèm 01 buổi đo InBody định kỳ và tư vấn lộ trình tập luyện.',
    durationType: 'Month',
    durationValue: 3,
    gymServicePrice: 1800000,
    includesPlus: false,
    plusDurationDays: 0,
    plusPrice: 0,
    approvalStatus: 'Approved',
    isPublished: true,
    minNoticeHours: 24,
  },
  {
    id: 'offer-003',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    title: 'Thẻ Tập Trải Nghiệm 10 Buổi (Voucher)',
    description:
      'Thẻ linh hoạt 10 buổi tập tùy chọn trong 45 ngày, phù hợp cho người có lịch trình bận rộn.',
    durationType: 'Day',
    durationValue: 45,
    gymServicePrice: 500000,
    includesPlus: false,
    plusDurationDays: 0,
    plusPrice: 0,
    approvalStatus: 'PendingAdminReview',
    isPublished: true,
    minNoticeHours: 24,
  },
];

const today = new Date();
const dateStr = today.toISOString().split('T')[0];

export const mockBranchTrainers = [
  {
    id: 'trainer-01',
    fullName: 'Nguyễn Văn Tuấn',
    role: 'Senior PT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  },
  {
    id: 'trainer-02',
    fullName: 'Trần Quang Minh',
    role: 'Strength Coach',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  },
  {
    id: 'trainer-03',
    fullName: 'Lê Thu Trang',
    role: 'Mobility & Pilates',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
  },
  {
    id: 'trainer-04',
    fullName: 'Phạm Đức Hùng',
    role: 'Hypertrophy Specialist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  },
];

export const mockBranchAppointments: TrainerAppointmentView[] = [
  {
    id: 'appt-001',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    gymBranchName: 'Fit Central District 1',
    memberProfileId: 'mem-001',
    memberName: 'Hoàng Nam',
    originalTrainerProfileId: 'trainer-01',
    originalTrainerName: 'Nguyễn Văn Tuấn',
    currentTrainerProfileId: 'trainer-01',
    currentTrainerName: 'Nguyễn Văn Tuấn',
    scheduledAtUtc: `${dateStr}T08:00:00Z`,
    durationMinutes: 60,
    status: 'Scheduled',
    isReassigned: false,
    memberConsentApproved: true,
    notes:
      'Mục tiêu: Ngực & Tay sau. Bài tập chính: Barbell Bench Press 4x8 (60kg), Incline Dumbbell Press 3x10 (20kg), Triceps Pushdown 3x12. Học viên phản hồi khớp vai ổn định.',
  },
  {
    id: 'appt-002',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    gymBranchName: 'Fit Central District 1',
    memberProfileId: 'mem-002',
    memberName: 'Mai Linh',
    originalTrainerProfileId: 'trainer-02',
    originalTrainerName: 'Trần Quang Minh',
    currentTrainerProfileId: 'trainer-02',
    currentTrainerName: 'Trần Quang Minh',
    scheduledAtUtc: `${dateStr}T08:00:00Z`,
    durationMinutes: 60,
    status: 'Completed',
    completedAtUtc: `${dateStr}T09:00:00Z`,
    isReassigned: false,
    memberConsentApproved: true,
    notes:
      'Mục tiêu: Mông đùi & Cơ trung tâm. Bài tập: Barbell Squat 4x10 (45kg), Romanian Deadlift 3x10 (40kg), Hip Thrust 4x12 (60kg). Thể lực tốt, hoàn thành đúng giáo án.',
  },
  {
    id: 'appt-003',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    gymBranchName: 'Fit Central District 1',
    memberProfileId: 'mem-003',
    memberName: 'Quốc Bảo',
    originalTrainerProfileId: 'trainer-03',
    originalTrainerName: 'Lê Thu Trang',
    currentTrainerProfileId: 'trainer-03',
    currentTrainerName: 'Lê Thu Trang',
    scheduledAtUtc: `${dateStr}T08:00:00Z`,
    durationMinutes: 60,
    status: 'Scheduled',
    isReassigned: false,
    memberConsentApproved: true,
    notes:
      'Mục tiêu: Kéo giãn cơ bắp & Phục hồi cột sống. Bài tập: Cat-Cow, Hip Flexor Stretch, Deadbug 3x10, Bird-dog 3x10. Lưu ý hội viên có tiền sử mỏi thắt lưng.',
  },
  {
    id: 'appt-004',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    gymBranchName: 'Fit Central District 1',
    memberProfileId: 'mem-004',
    memberName: 'Võ Thanh Tùng',
    originalTrainerProfileId: 'trainer-04',
    originalTrainerName: 'Phạm Đức Hùng',
    currentTrainerProfileId: 'trainer-04',
    currentTrainerName: 'Phạm Đức Hùng',
    scheduledAtUtc: `${dateStr}T09:00:00Z`,
    durationMinutes: 60,
    status: 'Scheduled',
    isReassigned: false,
    memberConsentApproved: true,
    notes:
      'Mục tiêu: Lưng xô & Tay trước. Bài tập: Lat Pulldown 4x10 (50kg), Seated Cable Row 3x12 (45kg), Dumbbell Hammer Curl 3x12 (12kg).',
  },
  {
    id: 'appt-005',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    gymBranchName: 'Fit Central District 1',
    memberProfileId: 'mem-005',
    memberName: 'Đỗ Thảo Vy',
    originalTrainerProfileId: 'trainer-01',
    originalTrainerName: 'Nguyễn Văn Tuấn',
    currentTrainerProfileId: 'trainer-01',
    currentTrainerName: 'Nguyễn Văn Tuấn',
    scheduledAtUtc: `${dateStr}T18:00:00Z`,
    durationMinutes: 60,
    status: 'Scheduled',
    isReassigned: false,
    memberConsentApproved: true,
    notes:
      'Mục tiêu: HIIT & Đốt mỡ toàn thân. Bài tập: Kettlebell Swing 4x15 (16kg), Battle Rope 4x30s, Burpees 3x10.',
  },
  {
    id: 'appt-006',
    gymId: 'b0000000-0000-0000-0000-000000000001',
    gymBranchId: 'branch-main',
    gymBranchName: 'Fit Central District 1',
    memberProfileId: 'mem-006',
    memberName: 'Nguyễn Minh Khoa',
    originalTrainerProfileId: 'trainer-02',
    originalTrainerName: 'Trần Quang Minh',
    currentTrainerProfileId: 'trainer-02',
    currentTrainerName: 'Trần Quang Minh',
    scheduledAtUtc: `${dateStr}T18:00:00Z`,
    durationMinutes: 60,
    status: 'Scheduled',
    isReassigned: false,
    memberConsentApproved: true,
    notes:
      'Mục tiêu: Vai & Bụng. Bài tập: Overhead Press 4x8 (40kg), Dumbbell Lateral Raise 4x15 (8kg), Hanging Leg Raise 3x12.',
  },
];
