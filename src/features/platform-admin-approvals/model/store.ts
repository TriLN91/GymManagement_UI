import { create } from 'zustand';

import { initialPlatformAccounts, initialPlatformApprovals } from './mockData';
import type {
  PlatformAccountRecord,
  PlatformApprovalRecord,
  PlatformAuditEntry,
  RejectionReason,
} from './types';

interface PlatformApprovalState {
  approvals: ReadonlyArray<PlatformApprovalRecord>;
  accounts: ReadonlyArray<PlatformAccountRecord>;
  audit: ReadonlyArray<PlatformAuditEntry>;
  approve: (id: string) => void;
  reject: (id: string, reason: RejectionReason, note: string) => void;
  suspend: (id: string) => void;
  recordAudit: (entry: Omit<PlatformAuditEntry, 'id' | 'at' | 'actorId'>) => void;
}

function createAuditEntry(
  entry: Omit<PlatformAuditEntry, 'id' | 'at' | 'actorId'>,
): PlatformAuditEntry {
  return {
    ...entry,
    id: `audit-${crypto.randomUUID()}`,
    at: new Date().toISOString(),
    actorId: 'platform-admin',
  };
}

export const usePlatformApprovalStore = create<PlatformApprovalState>((set) => ({
  approvals: initialPlatformApprovals,
  accounts: initialPlatformAccounts,
  audit: [],
  approve: (id) =>
    set((state) => {
      const record = state.approvals.find((approval) => approval.id === id);
      if (!record || record.status !== 'pending') return state;
      const at = new Date().toISOString();
      return {
        approvals: state.approvals.map((approval) =>
          approval.id === id
            ? {
                ...approval,
                status: 'approved',
                timeline: [
                  ...approval.timeline,
                  { id: `event-${crypto.randomUUID()}`, at, label: 'Approved by Platform Admin' },
                ],
              }
            : approval,
        ),
        audit: [
          createAuditEntry({
            action: 'approval_approved',
            subjectType: 'approval',
            subjectId: id,
            metadata: { approvalKind: record.kind },
          }),
          ...state.audit,
        ],
      };
    }),
  reject: (id, reason, note) =>
    set((state) => {
      const record = state.approvals.find((approval) => approval.id === id);
      if (!record || record.status !== 'pending') return state;
      const at = new Date().toISOString();
      return {
        approvals: state.approvals.map((approval) =>
          approval.id === id
            ? {
                ...approval,
                status: 'rejected',
                rejection: { reason, note },
                timeline: [
                  ...approval.timeline,
                  {
                    id: `event-${crypto.randomUUID()}`,
                    at,
                    label: 'Rejected by Platform Admin',
                    note,
                  },
                ],
              }
            : approval,
        ),
        audit: [
          createAuditEntry({
            action: 'approval_rejected',
            subjectType: 'approval',
            subjectId: id,
            metadata: { approvalKind: record.kind, rejectionReason: reason, note },
          }),
          ...state.audit,
        ],
      };
    }),
  suspend: (id) =>
    set((state) => {
      const account = state.accounts.find((item) => item.id === id);
      if (!account || account.status === 'suspended') return state;
      return {
        accounts: state.accounts.map((item) =>
          item.id === id ? { ...item, status: 'suspended' } : item,
        ),
        audit: [
          createAuditEntry({
            action: 'account_suspended',
            subjectType: 'account',
            subjectId: id,
            metadata: { role: account.role },
          }),
          ...state.audit,
        ],
      };
    }),
  recordAudit: (entry) => set((state) => ({ audit: [createAuditEntry(entry), ...state.audit] })),
}));
