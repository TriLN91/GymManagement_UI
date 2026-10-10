import type { PlatformApprovalKind, PlatformApprovalStatus, RejectionReason } from '../model/types';

export const platformApprovalsCopy = {
  en: {
    sample: 'Sample data',
    detail: 'Detail',
    back: 'Back to queue',
    submitted: 'Submitted',
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    suspend: 'Suspend',
    cancel: 'Cancel',
    confirmApproval: 'Approve submitted record?',
    confirmApprovalDescription:
      'This records a platform approval for the submitted profile. The applicant will see the updated status.',
    confirmSuspend: 'Suspend this account?',
    confirmSuspendDescription:
      'The account will lose access. This action is recorded in the platform audit log.',
    rejectionTitle: 'Reject submitted record',
    rejectionDescription: 'Choose a reason and add a note for the applicant. Both are required.',
    rejectionReason: 'Reason',
    rejectionNote: 'Note for applicant',
    notePlaceholder: 'Explain what must be corrected before submitting again.',
    reasonRequired: 'Choose a rejection reason and enter a note.',
    documents: 'Submitted documents',
    submission: 'Submitted information',
    reviewHistory: 'Review history',
    auditRecorded: 'This action is recorded in the shared audit log.',
    noRecords: 'There are no pending records in this queue.',
    noAccountRecords: 'There are no account records to show.',
    notFound: 'This submitted record is unavailable.',
    accountIdentity: 'Account',
    accountRole: 'Role',
    relationship: 'Relationship',
    accountStatus: 'Status',
    created: 'Created',
    accountScope: 'Only the minimum operational account information is available here.',
    suspended: 'Suspended',
    active: 'Active',
    gymApplication: 'Gym application',
    legalChange: 'Legal information change',
    trainerApplication: 'Trainer application',
    gymOwner: 'Gym Owner',
    trainer: 'Trainer',
    member: 'Member',
    document: 'Document',
    documentType: 'Type',
    viewDocument: 'View PDF',
    status: 'Status',
  },
  vi: {
    sample: 'Dữ liệu minh họa',
    detail: 'Xem chi tiết',
    back: 'Quay lại hàng chờ',
    submitted: 'Đã nộp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối',
    approve: 'Phê duyệt',
    reject: 'Từ chối',
    suspend: 'Tạm ngưng',
    cancel: 'Hủy',
    confirmApproval: 'Phê duyệt hồ sơ đã nộp?',
    confirmApprovalDescription:
      'Thao tác này ghi nhận việc phê duyệt hồ sơ bởi nền tảng. Người nộp sẽ thấy trạng thái mới.',
    confirmSuspend: 'Tạm ngưng tài khoản này?',
    confirmSuspendDescription:
      'Tài khoản sẽ mất quyền truy cập. Thao tác được ghi nhận trong nhật ký kiểm toán nền tảng.',
    rejectionTitle: 'Từ chối hồ sơ đã nộp',
    rejectionDescription: 'Chọn lý do và ghi chú cho người nộp. Cả hai đều bắt buộc.',
    rejectionReason: 'Lý do',
    rejectionNote: 'Ghi chú cho người nộp',
    notePlaceholder: 'Nêu rõ nội dung cần điều chỉnh trước khi nộp lại.',
    reasonRequired: 'Hãy chọn lý do từ chối và nhập ghi chú.',
    documents: 'Tài liệu đã nộp',
    submission: 'Thông tin đã nộp',
    reviewHistory: 'Lịch sử xét duyệt',
    auditRecorded: 'Thao tác này được ghi nhận trong nhật ký kiểm toán dùng chung.',
    noRecords: 'Hàng chờ này hiện không có hồ sơ nào.',
    noAccountRecords: 'Hiện không có dữ liệu tài khoản để hiển thị.',
    notFound: 'Không tìm thấy hồ sơ đã nộp.',
    accountIdentity: 'Tài khoản',
    accountRole: 'Vai trò',
    relationship: 'Liên kết',
    accountStatus: 'Trạng thái',
    created: 'Ngày tạo',
    accountScope: 'Trang này chỉ hiển thị thông tin tài khoản tối thiểu phục vụ vận hành.',
    suspended: 'Đã tạm ngưng',
    active: 'Đang hoạt động',
    gymApplication: 'Hồ sơ Gym',
    legalChange: 'Thay đổi pháp lý',
    trainerApplication: 'Hồ sơ Trainer',
    gymOwner: 'Gym Owner',
    trainer: 'Trainer',
    member: 'Member',
    document: 'Tài liệu',
    documentType: 'Loại',
    viewDocument: 'Mở PDF',
    status: 'Trạng thái',
  },
} as const;

export type PlatformApprovalsCopy =
  (typeof platformApprovalsCopy)['en'] | (typeof platformApprovalsCopy)['vi'];

export const rejectionReasonLabels: Record<RejectionReason, { en: string; vi: string }> = {
  documentation_incomplete: { en: 'Documentation is incomplete', vi: 'Tài liệu chưa đầy đủ' },
  information_unverifiable: {
    en: 'Information cannot be verified',
    vi: 'Không thể xác minh thông tin',
  },
  requirements_not_met: { en: 'Requirements are not met', vi: 'Chưa đáp ứng yêu cầu' },
  other: { en: 'Other', vi: 'Khác' },
};

export function approvalKindLabel(kind: PlatformApprovalKind, copy: PlatformApprovalsCopy) {
  return kind === 'gym_application'
    ? copy.gymApplication
    : kind === 'legal_change'
      ? copy.legalChange
      : copy.trainerApplication;
}

export function approvalStatusLabel(status: PlatformApprovalStatus, copy: PlatformApprovalsCopy) {
  return status === 'approved'
    ? copy.approved
    : status === 'rejected'
      ? copy.rejected
      : copy.pending;
}
