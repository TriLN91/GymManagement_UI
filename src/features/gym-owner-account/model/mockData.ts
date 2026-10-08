import type { AccountResourceState, GymOwnerNotification, ImportantActivityRecord } from './types';

import { ROUTES } from '@/shared/config/constants';

export const gymOwnerNotificationResource: AccountResourceState<
  ReadonlyArray<GymOwnerNotification>
> = {
  state: 'loaded',
  data: [
    {
      id: 'owner-notification-order-1048',
      event: 'purchase_payment',
      title: { en: 'New purchase confirmed', vi: 'Đã xác nhận giao dịch mới' },
      message: {
        en: 'Order FIT-2026-1048 is ready for Gym operational processing.',
        vi: 'Đơn FIT-2026-1048 đã sẵn sàng để Gym xử lý vận hành.',
      },
      createdAt: '2026-10-05T08:20:00+07:00',
      initiallyRead: false,
      target: ROUTES.admin.orderDetailPath('FIT-2026-1048'),
    },
    {
      id: 'owner-notification-trainer-approved',
      event: 'trainer_approval',
      title: { en: 'Trainer approved by Platform', vi: 'Trainer đã được Platform phê duyệt' },
      message: {
        en: 'Minh Lê can now continue account activation.',
        vi: 'Minh Lê có thể tiếp tục kích hoạt tài khoản.',
      },
      createdAt: '2026-10-04T14:10:00+07:00',
      initiallyRead: false,
      target: ROUTES.admin.pts,
    },
    {
      id: 'owner-notification-dispute-status',
      event: 'settlement_refund_dispute',
      title: { en: 'Dispute request recorded', vi: 'Yêu cầu dispute đã được ghi nhận' },
      message: {
        en: 'Platform is reviewing the submitted request for order FIT-2026-1048.',
        vi: 'Platform đang xem xét yêu cầu đã gửi cho đơn FIT-2026-1048.',
      },
      createdAt: '2026-10-03T10:35:00+07:00',
      initiallyRead: true,
      target: ROUTES.admin.settlements,
    },
    {
      id: 'owner-notification-offer-review',
      event: 'offer_moderation',
      title: { en: 'Offer moderation update', vi: 'Cập nhật kiểm duyệt Offer' },
      message: {
        en: 'Platform recorded a moderation update for a published offer.',
        vi: 'Platform đã ghi nhận cập nhật kiểm duyệt cho một Offer đã xuất bản.',
      },
      createdAt: '2026-10-02T16:45:00+07:00',
      initiallyRead: true,
      target: null,
    },
    {
      id: 'owner-notification-platform-announcement',
      event: 'platform_announcement',
      title: { en: 'Platform service announcement', vi: 'Thông báo dịch vụ từ Platform' },
      message: {
        en: 'Scheduled maintenance is recorded for the upcoming service window.',
        vi: 'Bảo trì định kỳ đã được ghi nhận cho khung dịch vụ sắp tới.',
      },
      createdAt: '2026-10-01T09:00:00+07:00',
      initiallyRead: true,
      target: null,
    },
  ],
};

export const importantActivityResource: AccountResourceState<
  ReadonlyArray<ImportantActivityRecord>
> = {
  state: 'loaded',
  data: [
    {
      id: 'activity-sign-in-otp',
      event: 'sign_in_otp',
      occurredAt: '2026-10-05T09:12:00+07:00',
      activity: { en: 'Email OTP sign-in completed', vi: 'Hoàn tất đăng nhập bằng email OTP' },
      context: { en: 'Gym Owner session', vi: 'Phiên Gym Owner' },
      result: 'success',
    },
    {
      id: 'activity-refund-request',
      event: 'refund_dispute_submitted',
      occurredAt: '2026-10-03T10:34:00+07:00',
      activity: { en: 'Dispute request submitted', vi: 'Đã gửi yêu cầu dispute' },
      context: { en: 'Order FIT-2026-1048', vi: 'Đơn FIT-2026-1048' },
      result: 'submitted',
    },
    {
      id: 'activity-offer-lifecycle',
      event: 'offer_lifecycle_changed',
      occurredAt: '2026-10-02T16:40:00+07:00',
      activity: { en: 'Offer lifecycle updated', vi: 'Đã cập nhật vòng đời Offer' },
      context: { en: 'Published to Paused', vi: 'Published sang Paused' },
      result: 'success',
    },
    {
      id: 'activity-trainer-lifecycle',
      event: 'trainer_lifecycle_changed',
      occurredAt: '2026-10-02T11:25:00+07:00',
      activity: { en: 'Trainer status updated', vi: 'Đã cập nhật trạng thái Trainer' },
      context: { en: 'Trainer TR-014 · Active', vi: 'Trainer TR-014 · Active' },
      result: 'success',
    },
    {
      id: 'activity-sensitive-profile',
      event: 'sensitive_profile_changed',
      occurredAt: '2026-09-28T13:18:00+07:00',
      activity: {
        en: 'Sensitive Gym profile change submitted',
        vi: 'Đã gửi thay đổi hồ sơ Gym nhạy cảm',
      },
      context: { en: 'Pending Platform re-review', vi: 'Chờ Platform xét duyệt lại' },
      result: 'submitted',
    },
    {
      id: 'activity-password',
      event: 'password_changed',
      occurredAt: '2026-09-20T07:45:00+07:00',
      activity: { en: 'Account password changed', vi: 'Đã thay đổi mật khẩu tài khoản' },
      context: { en: 'Gym Owner account', vi: 'Tài khoản Gym Owner' },
      result: 'success',
    },
  ],
};
