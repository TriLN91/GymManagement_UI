// Bodies of the backend StaffInvitationsController (SRS FR-SH-01): camelCase JSON.
export type InvitableRole = 'Trainer' | 'BranchManager';

export interface StaffInvitationDto {
  id: string;
  gymBranchId: string;
  branchName: string;
  email: string;
  role: InvitableRole;
  fullName: string | null;
  expiresAtUtc: string;
  status: 'Pending' | 'Accepted' | 'Revoked' | 'Expired';
  createdAtUtc: string;
  /** Only present in Development/Testing when no e-mail could be sent. */
  debugAcceptUrl?: string | null;
}

export interface StaffInvitationPreviewDto {
  email: string;
  role: InvitableRole;
  fullName: string | null;
  gymName: string;
  branchName: string;
  expiresAtUtc: string;
}

/** The backend rejects unknown fields: send exactly these keys. */
export interface CreateInvitationBody {
  email: string;
  role: InvitableRole;
  gymBranchId: string;
  fullName?: string;
}

export interface AcceptInvitationBody {
  token: string;
  fullName: string;
  password: string;
}
