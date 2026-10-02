import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PendingAssessment {
  id: string;
  exerciseId: string;
  sessionId?: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  status: 'pending';
}

interface AssessmentState {
  assessments: PendingAssessment[];
  queueAssessment: (
    input: Omit<PendingAssessment, 'id' | 'createdAt' | 'status'>,
  ) => PendingAssessment;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      assessments: [],
      queueAssessment: (input) => {
        const assessment: PendingAssessment = {
          ...input,
          id: `assessment-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({ assessments: [assessment, ...state.assessments] }));
        return assessment;
      },
    }),
    { name: 'fit:ai-assessments:v1', version: 1 },
  ),
);
