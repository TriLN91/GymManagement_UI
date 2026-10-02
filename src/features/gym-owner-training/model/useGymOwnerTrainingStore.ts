import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  seedAssignmentExceptions,
  seedGymPTPackages,
  seedGymTrainers,
  seedTrainerAssignments,
} from './mockData';
import type {
  GymAssignmentException,
  GymPTPackage,
  GymPTPackageInput,
  GymTrainerAssignment,
  GymTrainerInput,
  GymTrainerProfile,
  TrainerOperationalStatus,
} from './types';

import { STORAGE_KEYS } from '@/shared/config/constants';

interface GymOwnerTrainingState {
  trainers: GymTrainerProfile[];
  assignments: GymTrainerAssignment[];
  assignmentExceptions: GymAssignmentException[];
  packages: GymPTPackage[];
  createTrainer: (input: GymTrainerInput) => string;
  updateTrainer: (trainerId: string, input: GymTrainerInput) => boolean;
  submitTrainer: (trainerId: string) => boolean;
  setTrainerOperationalStatus: (trainerId: string, status: TrainerOperationalStatus) => boolean;
  resolveAssignmentException: (exceptionId: string, replacementTrainerId: string) => boolean;
  createPackage: (input: GymPTPackageInput) => string;
  updatePackage: (packageId: string, input: GymPTPackageInput) => boolean;
  publishPackage: (packageId: string) => boolean;
  reset: () => void;
}

const cloneTrainer = (trainer: GymTrainerProfile): GymTrainerProfile => ({
  ...trainer,
  specializations: [...trainer.specializations],
});

const clonePackage = (gymPackage: GymPTPackage): GymPTPackage => ({
  ...gymPackage,
  name: { ...gymPackage.name },
  features: gymPackage.features.map((feature) => ({ ...feature })),
});

const initialState = () => ({
  trainers: seedGymTrainers.map(cloneTrainer),
  assignments: seedTrainerAssignments.map((assignment) => ({ ...assignment })),
  assignmentExceptions: seedAssignmentExceptions.map((exception) => ({ ...exception })),
  packages: seedGymPTPackages.map(clonePackage),
});

function canTransitionOperationalStatus(
  current: TrainerOperationalStatus | null,
  next: TrainerOperationalStatus,
) {
  if (!current || current === 'unlinked' || current === next) return false;
  if (next === 'unlinked') return true;
  if (current === 'active') return next === 'hidden' || next === 'suspended';
  return next === 'active';
}

export const useGymOwnerTrainingStore = create<GymOwnerTrainingState>()(
  persist(
    (set, get) => ({
      ...initialState(),
      createTrainer: (input) => {
        const id = `trainer-${crypto.randomUUID()}`;
        set((state) => ({
          trainers: [
            {
              ...input,
              specializations: [...input.specializations],
              id,
              approvalStatus: 'draft',
              operationalStatus: null,
              rejectionReason: null,
              submittedAt: null,
              createdAt: new Date().toISOString(),
            },
            ...state.trainers,
          ],
        }));
        return id;
      },
      updateTrainer: (trainerId, input) => {
        const trainer = get().trainers.find((item) => item.id === trainerId);
        if (!trainer || !['draft', 'rejected'].includes(trainer.approvalStatus)) return false;
        set((state) => ({
          trainers: state.trainers.map((item) =>
            item.id === trainerId
              ? { ...item, ...input, specializations: [...input.specializations] }
              : item,
          ),
        }));
        return true;
      },
      submitTrainer: (trainerId) => {
        const trainer = get().trainers.find((item) => item.id === trainerId);
        if (!trainer || !['draft', 'rejected'].includes(trainer.approvalStatus)) return false;
        set((state) => ({
          trainers: state.trainers.map((item) =>
            item.id === trainerId
              ? {
                  ...item,
                  approvalStatus: 'pending',
                  rejectionReason: null,
                  submittedAt: new Date().toISOString(),
                }
              : item,
          ),
        }));
        return true;
      },
      setTrainerOperationalStatus: (trainerId, status) => {
        const trainer = get().trainers.find((item) => item.id === trainerId);
        if (
          !trainer ||
          trainer.approvalStatus !== 'approved' ||
          !canTransitionOperationalStatus(trainer.operationalStatus, status)
        ) {
          return false;
        }
        set((state) => ({
          trainers: state.trainers.map((item) =>
            item.id === trainerId ? { ...item, operationalStatus: status } : item,
          ),
        }));
        return true;
      },
      resolveAssignmentException: (exceptionId, replacementTrainerId) => {
        const exception = get().assignmentExceptions.find((item) => item.id === exceptionId);
        const replacement = get().trainers.find((item) => item.id === replacementTrainerId);
        if (
          !exception ||
          exception.status !== 'open' ||
          !replacement ||
          replacement.approvalStatus !== 'approved' ||
          replacement.operationalStatus !== 'active'
        ) {
          return false;
        }
        set((state) => ({
          assignmentExceptions: state.assignmentExceptions.map((item) =>
            item.id === exceptionId
              ? {
                  ...item,
                  status: 'resolved',
                  replacementTrainerId,
                  resolvedAt: new Date().toISOString(),
                }
              : item,
          ),
          assignments: state.assignments.map((assignment) =>
            assignment.memberEmail === exception.memberEmail && assignment.status === 'active'
              ? { ...assignment, trainerId: replacementTrainerId }
              : assignment,
          ),
        }));
        return true;
      },
      createPackage: (input) => {
        const id = `package-${crypto.randomUUID()}`;
        const timestamp = new Date().toISOString();
        set((state) => ({
          packages: [
            {
              ...input,
              name: { ...input.name },
              features: input.features.map((feature) => ({ ...feature })),
              id,
              publicationStatus: 'draft',
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.packages,
          ],
        }));
        return id;
      },
      updatePackage: (packageId, input) => {
        const gymPackage = get().packages.find((item) => item.id === packageId);
        if (!gymPackage || gymPackage.publicationStatus !== 'draft') return false;
        set((state) => ({
          packages: state.packages.map((item) =>
            item.id === packageId
              ? {
                  ...item,
                  ...input,
                  name: { ...input.name },
                  features: input.features.map((feature) => ({ ...feature })),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        }));
        return true;
      },
      publishPackage: (packageId) => {
        const gymPackage = get().packages.find((item) => item.id === packageId);
        if (!gymPackage || gymPackage.publicationStatus !== 'draft') return false;
        set((state) => ({
          packages: state.packages.map((item) =>
            item.id === packageId
              ? {
                  ...item,
                  publicationStatus: 'published',
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        }));
        return true;
      },
      reset: () => set(initialState()),
    }),
    {
      name: STORAGE_KEYS.gymOwnerTrainingManagement,
      version: 1,
    },
  ),
);

export { canTransitionOperationalStatus };
