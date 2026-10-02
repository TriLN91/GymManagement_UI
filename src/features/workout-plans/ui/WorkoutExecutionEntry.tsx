import { Navigate } from 'react-router-dom';

import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';

import { ROUTES } from '@/shared/config/constants';

export function WorkoutExecutionEntry() {
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  return (
    <Navigate
      replace
      to={
        activeSession
          ? ROUTES.member.workoutSessionPath(activeSession.dayId)
          : ROUTES.member.workoutSchedule
      }
    />
  );
}
