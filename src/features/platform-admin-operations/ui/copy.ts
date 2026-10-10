import type {
  MarketplaceListingKind,
  MarketplaceListingStatus,
  PlatformCampaignAudience,
  PlatformCampaignStatus,
} from '../model/types';

export const operationsCopy = {
  en: {
    sample: 'Sample data',
    detail: 'Detail',
    back: 'Back to list',
    listing: 'Listing moderation',
    campaigns: 'Campaign management',
    notifications: 'Notifications',
    published: 'Published',
    changesRequested: 'Changes requested',
    hidden: 'Hidden',
    suspended: 'Suspended',
    restore: 'Restore',
    requestChanges: 'Request changes',
    hide: 'Hide',
    suspend: 'Suspend',
    restrictionTitle: 'Restrict public content',
    restrictionDescription:
      'A reason and note are required. This action is audited and sends a notification.',
    restrictionReason: 'Reason',
    restrictionNote: 'Note',
    restrictionError: 'Choose a reason and enter a note.',
    confirmRestore: 'Restore this listing?',
    confirmRestoreDescription:
      'The listing will return to published status and the action will be audited.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    content: 'Published content',
    history: 'Moderation history',
    created: 'Created',
    publisher: 'Publisher',
    status: 'Status',
    gymProfile: 'Gym profile',
    trainerProfile: 'Trainer profile',
    offer: 'Offer',
    ptPackage: 'PT package',
    draft: 'Draft',
    scheduled: 'Scheduled',
    active: 'Active',
    paused: 'Paused',
    ended: 'Ended',
    archived: 'Archived',
    createCampaign: 'Create campaign',
    editCampaign: 'Edit campaign',
    save: 'Save',
    name: 'Name',
    audience: 'Audience',
    message: 'Message',
    startsAt: 'Starts at',
    endsAt: 'Ends at',
    transition: 'Change status',
    invalidCampaign: 'Enter a name, message, and valid start and end times.',
    cannotEdit: 'This campaign can no longer be edited.',
    member: 'Member',
    gymOwner: 'Gym Owner',
    trainer: 'Trainer',
    noListings: 'There are no listings to moderate.',
    noCampaigns: 'There are no campaigns to show.',
    noNotifications: 'There are no notifications.',
    markRead: 'Open',
  },
  vi: {
    sample: 'Dữ liệu minh họa',
    detail: 'Xem chi tiết',
    back: 'Quay lại danh sách',
    listing: 'Kiểm duyệt listing',
    campaigns: 'Quản lý chiến dịch',
    notifications: 'Thông báo',
    published: 'Đã hiển thị',
    changesRequested: 'Yêu cầu chỉnh sửa',
    hidden: 'Đã ẩn',
    suspended: 'Đã tạm ngưng',
    restore: 'Khôi phục',
    requestChanges: 'Yêu cầu chỉnh sửa',
    hide: 'Ẩn',
    suspend: 'Tạm ngưng',
    restrictionTitle: 'Hạn chế nội dung công khai',
    restrictionDescription:
      'Lý do và ghi chú là bắt buộc. Thao tác được ghi audit và gửi thông báo.',
    restrictionReason: 'Lý do',
    restrictionNote: 'Ghi chú',
    restrictionError: 'Hãy chọn lý do và nhập ghi chú.',
    confirmRestore: 'Khôi phục listing này?',
    confirmRestoreDescription: 'Listing sẽ trở về trạng thái hiển thị và thao tác được ghi audit.',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    content: 'Nội dung đã hiển thị',
    history: 'Lịch sử kiểm duyệt',
    created: 'Ngày tạo',
    publisher: 'Đơn vị đăng',
    status: 'Trạng thái',
    gymProfile: 'Hồ sơ Gym',
    trainerProfile: 'Hồ sơ Trainer',
    offer: 'Offer',
    ptPackage: 'Gói PT',
    draft: 'Bản nháp',
    scheduled: 'Đã lên lịch',
    active: 'Đang hoạt động',
    paused: 'Đã tạm dừng',
    ended: 'Đã kết thúc',
    archived: 'Đã lưu trữ',
    createCampaign: 'Tạo chiến dịch',
    editCampaign: 'Chỉnh sửa chiến dịch',
    save: 'Lưu',
    name: 'Tên',
    audience: 'Đối tượng',
    message: 'Nội dung',
    startsAt: 'Bắt đầu',
    endsAt: 'Kết thúc',
    transition: 'Đổi trạng thái',
    invalidCampaign: 'Nhập tên, nội dung, thời điểm bắt đầu và kết thúc hợp lệ.',
    cannotEdit: 'Chiến dịch này không thể chỉnh sửa nữa.',
    member: 'Member',
    gymOwner: 'Gym Owner',
    trainer: 'Trainer',
    noListings: 'Không có listing cần kiểm duyệt.',
    noCampaigns: 'Không có chiến dịch để hiển thị.',
    noNotifications: 'Không có thông báo.',
    markRead: 'Mở',
  },
} as const;
export type OperationsCopy = (typeof operationsCopy)['en'] | (typeof operationsCopy)['vi'];
export const restrictionReasons = {
  en: ['Content needs clarification', 'Content is inaccurate', 'Policy review required', 'Other'],
  vi: ['Nội dung cần làm rõ', 'Nội dung chưa chính xác', 'Cần rà soát chính sách', 'Khác'],
} as const;
export function listingKindLabel(kind: MarketplaceListingKind, copy: OperationsCopy) {
  return kind === 'gym_profile'
    ? copy.gymProfile
    : kind === 'trainer_profile'
      ? copy.trainerProfile
      : kind === 'offer'
        ? copy.offer
        : copy.ptPackage;
}
export function listingStatusLabel(status: MarketplaceListingStatus, copy: OperationsCopy) {
  return status === 'published'
    ? copy.published
    : status === 'changes_requested'
      ? copy.changesRequested
      : status === 'hidden'
        ? copy.hidden
        : copy.suspended;
}
export function campaignStatusLabel(status: PlatformCampaignStatus, copy: OperationsCopy) {
  return copy[status];
}
export function audienceLabel(audience: PlatformCampaignAudience, copy: OperationsCopy) {
  return audience === 'member'
    ? copy.member
    : audience === 'gym_owner'
      ? copy.gymOwner
      : copy.trainer;
}
