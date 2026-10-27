import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { apiGet } from '@/shared/api/client';

export function useDistributionGym() {
  const user = useAuthStore((state) => state.user);
  const [selected, setSelected] = useState('');
  const context = useQuery({
    queryKey: ['distribution-gym', user?.id],
    enabled: Boolean(user),
    queryFn: () =>
      apiGet<{ gymId: string; gymName: string; canManageInventory: boolean }[]>(
        '/gym-distribution/context',
      ),
  });
  const gyms = context.data ?? [];
  const gym = gyms.find((x) => x.gymId === selected) ?? (gyms.length === 1 ? gyms[0] : undefined);
  return { context, gyms, gym, gymId: gym?.gymId ?? '', setSelected };
}
