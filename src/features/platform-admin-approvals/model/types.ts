export type PlatformApprovalKind = 'gym_application' | 'legal_change' | 'trainer_application';

export type PlatformApprovalStatus = 'pending' | 'approved' | 'rejected';

export type PlatformAccountRole = 'gym_owner' | 'trainer' | 'member';

export type PlatformAccountStatus = 'active' | 'suspended';

export type RejectionReason =
  'documentation_incomplete' | 'information_unverifiable' | 'requirements_not_met' | 'other';

export interface SubmittedDocument {
  id: string;
  label: string;
  category: string;
  submittedAt: string;
  /** Temporary local URL. Backend will replace this with an authorized document URL. */
  viewUrl: string;
}

export interface ApprovalTimelineEntry {
  id: string;
  at: string;
  label: string;
  note?: string;
}

export interface PlatformApprovalRecord {
  id: string;
  kind: PlatformApprovalKind;
  reference: string;
  applicantName: string;
  applicantEmail: string;
  organizationName?: string;
  submittedAt: string;
  status: PlatformApprovalStatus;
  identity: ReadonlyArray<{ label: string; value: string }>;
  submission: ReadonlyArray<{ label: string; value: string }>;
  documents: ReadonlyArray<SubmittedDocument>;
  timeline: ReadonlyArray<ApprovalTimelineEntry>;
  rejection?: { reason: RejectionReason; note: string };
}

export interface PlatformAccountRecord {
  id: string;
  fullName: string;
  email: string;
  role: PlatformAccountRole;
  relationship: string;
  createdAt: string;
  status: PlatformAccountStatus;
}

export type PlatformAuditAction =
  | 'approval_approved'
  | 'approval_rejected'
  | 'account_suspended'
  | 'listing_changes_requested'
  | 'listing_hidden'
  | 'listing_suspended'
  | 'listing_restored'
  | 'campaign_created'
  | 'campaign_updated'
  | 'campaign_status_changed'
  | 'commercial_configuration_updated';

export interface PlatformAuditEntry {
  id: string;
  at: string;
  actorId: 'platform-admin';
  action: PlatformAuditAction;
  subjectType: 'approval' | 'account' | 'listing' | 'campaign' | 'commercial_configuration';
  subjectId: string;
  metadata: {
    approvalKind?: PlatformApprovalKind;
    rejectionReason?: RejectionReason;
    note?: string;
    role?: PlatformAccountRole;
    fromStatus?: string;
    toStatus?: string;
    reason?: string;
  };
}
