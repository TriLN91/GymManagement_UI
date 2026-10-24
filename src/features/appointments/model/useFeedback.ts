import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { feedbackApi } from '../api/feedbackApi';
import type { CreateFeedbackBody } from '../api/types';

import { QUERY_KEYS } from '@/shared/config/constants';

/** Member: the feedback I sent. Trainer: the feedback sent to me (only while the assignment is active). */
export function useFeedbackList(role: 'Member' | 'Trainer') {
  return useQuery({
    queryKey: [...QUERY_KEYS.planFeedback(), role],
    queryFn: role === 'Member' ? feedbackApi.listMine : feedbackApi.listReceived,
  });
}

export function useSendFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { assignmentId: string; body: CreateFeedbackBody }) =>
      feedbackApi.create(v.assignmentId, v.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.planFeedback() }),
  });
}

export function useReplyFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; reply: string }) => feedbackApi.reply(v.id, v.reply),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.planFeedback() }),
  });
}
