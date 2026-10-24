import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { fitnessApi } from '../api/fitnessApi';
import { mergeBackendProfile } from '../api/hydrate';

import { useProfileSetupStore } from './useProfileSetupStore';

import { QUERY_KEYS } from '@/shared/config/constants';

/**
 * Restores the wizard from what the backend already holds (new device, cleared browser). The server
 * data lives in the query cache; it is merged into the local draft once, filling only empty fields,
 * so anything the Member already typed is never overwritten.
 */
export function useHydrateFitnessProfile() {
  const setProfile = useProfileSetupStore((state) => state.setProfile);
  const applied = useRef(false);

  const query = useQuery({
    queryKey: QUERY_KEYS.fitnessProfile(),
    queryFn: async () => {
      const [profile, body] = await Promise.all([
        fitnessApi.getProfile(),
        fitnessApi.getLatestBody(),
      ]);
      return { profile, body };
    },
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (!query.data || applied.current) return;
    applied.current = true;
    const local = useProfileSetupStore.getState().profile;
    setProfile(mergeBackendProfile(local, query.data.profile, query.data.body));
  }, [query.data, setProfile]);

  return query;
}
