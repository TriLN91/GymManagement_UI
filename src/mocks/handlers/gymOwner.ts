import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

const path = (p: string) => `*${p}`;

export const gymOwnerHandlers = [
  http.get(path(ENDPOINTS.gymOwner.myBrands), () =>
    HttpResponse.json({
      data: [],
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
];
