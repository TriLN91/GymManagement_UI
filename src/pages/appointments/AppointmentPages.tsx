import {
  AvailabilityEditor,
  ManagedAssignmentsPanel,
  SessionsBoard,
} from '@/features/appointments';
import { GymOwnerAssignmentExceptionsPage } from '@/features/gym-owner-training';

/** Trainer: sessions with their Members plus the weekly availability editor. */
export function TrainerAppointmentsPage() {
  return (
    <>
      <SessionsBoard role="Trainer" />
      <div className="appointments-page">
        <AvailabilityEditor />
      </div>
    </>
  );
}

/** Member: sessions with their Trainer and the change-Trainer flow. */
export function PTAppointmentsPage() {
  return <SessionsBoard role="Member" />;
}

/** Gym Admin / Branch Manager: assignments of their branches next to the existing exception queue. */
export function TrainerAssignmentsPage() {
  return (
    <>
      <GymOwnerAssignmentExceptionsPage />
      <div className="appointments-page">
        <ManagedAssignmentsPanel />
      </div>
    </>
  );
}
