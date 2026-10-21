import { http, HttpResponse } from 'msw';

import type { BranchReviewDto, OfferReviewDto } from '@/features/marketplace-review/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// In-memory review queues (reset on reload). Like the backend, rejecting needs a reason and a decided item leaves the queue.
const path = (p: string) => `*${p}`;
const E = ENDPOINTS.marketplaceReview;
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });
const fail = (status: number, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode: 'Domain' }, { status });

const branches: BranchReviewDto[] = [
  {
    id: 'review-branch-1',
    gymId: 'gym-1',
    gymName: 'Fit Central',
    name: 'Fit Central District 3',
    city: 'Ho Chi Minh City',
    addressLine1: '45 Vo Van Tan',
    status: 'Draft',
    createdAtUtc: '2026-10-20T03:00:00.000Z',
  },
];
const offers: OfferReviewDto[] = [
  {
    id: 'review-offer-1',
    gymId: 'gym-1',
    gymName: 'Fit Central',
    gymBranchId: 'branch-main',
    branchName: 'Fit Central District 1',
    title: 'PT 12 buổi',
    price: 3_600_000,
    currencyCode: 'VND',
    status: 'PendingAdminReview',
    rejectionReason: null,
    isPublished: true,
    createdAtUtc: '2026-10-20T04:00:00.000Z',
  },
];

const reasonOf = async (request: Request) =>
  ((await request.json()) as { reason?: string }).reason?.trim();

export const marketplaceReviewHandlers = [
  http.get(path(E.branches), () =>
    ok(branches.filter((b) => b.status === 'Draft' || b.status === 'PendingReview')),
  ),
  http.get(path(E.offers), () => ok(offers.filter((o) => o.status === 'PendingAdminReview'))),

  http.post(path('/admin/approvals/branches/:id/:decision'), async ({ params, request }) => {
    const branch = branches.find((b) => b.id === params.id);
    if (!branch) return fail(404, '404: Không tìm thấy');
    const approve = params.decision === 'approve';
    if (!approve && !(await reasonOf(request)))
      return fail(400, 'Cần nêu lý do khi từ chối chi nhánh.');
    branch.status = approve ? 'Approved' : 'Rejected';
    return ok(branch);
  }),

  http.post(path('/admin/approvals/offers/:id/:decision'), async ({ params, request }) => {
    const offer = offers.find((o) => o.id === params.id);
    if (!offer) return fail(404, '404: Không tìm thấy');
    const approve = params.decision === 'approve';
    const reason = await reasonOf(request);
    if (!approve && !reason) return fail(400, 'Cần nêu lý do khi từ chối gói.');
    offer.status = approve ? 'Approved' : 'Rejected';
    offer.rejectionReason = approve ? null : (reason ?? null);
    return ok(offer);
  }),
];
