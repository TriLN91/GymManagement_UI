import { create } from 'zustand';

import { initialDisputes } from './mockData';
import type { DisputeCase, DisputeStatus } from './types';
const next: Record<DisputeStatus, ReadonlyArray<DisputeStatus>> = {
  submitted: ['under_review'],
  under_review: ['need_information', 'approved', 'rejected'],
  need_information: ['under_review'],
  approved: ['resolved'],
  rejected: ['resolved'],
  resolved: [],
};
interface State {
  disputes: ReadonlyArray<DisputeCase>;
  transition: (id: string, status: DisputeStatus, note?: string) => boolean;
  sendMessage: (id: string, body: string) => boolean;
}
export const usePlatformGovernanceStore = create<State>((set) => ({
  disputes: initialDisputes,
  transition: (id, status, note) => {
    const current = usePlatformGovernanceStore.getState().disputes.find((d) => d.id === id);
    if (!current || !next[current.status].includes(status)) return false;
    const at = new Date().toISOString();
    set((state) => ({
      disputes: state.disputes.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              timeline: [
                ...d.timeline,
                { id: `d-${crypto.randomUUID()}`, at, label: status, note },
              ],
            }
          : d,
      ),
    }));
    return true;
  },
  sendMessage: (id, body) => {
    if (!body.trim()) return false;
    const at = new Date().toISOString();
    set((state) => ({
      disputes: state.disputes.map((d) =>
        d.id === id
          ? {
              ...d,
              messages: [
                ...d.messages,
                { id: `m-${crypto.randomUUID()}`, at, author: 'Platform Admin', body: body.trim() },
              ],
            }
          : d,
      ),
    }));
    return true;
  },
}));
