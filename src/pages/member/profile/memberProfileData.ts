export interface CompletedAssessmentRecord {
  id: string;
  exerciseId: string;
  exerciseName: { en: string; vi: string };
  createdAt: string;
  status: 'completed';
  score: number;
  summary: { en: string; vi: string };
  findings: Array<{
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    title: { en: string; vi: string };
    feedback: { en: string; vi: string };
  }>;
}

export interface TrainerAppointment {
  id: string;
  trainerName: string;
  trainerInitials: string;
  startsAt: string;
  durationMinutes: number;
  type: 'in_person' | 'video_checkin' | 'body_assessment';
  location: { en: string; vi: string };
  note: { en: string; vi: string };
  status: 'confirmed' | 'pending';
}

export const completedAssessments: CompletedAssessmentRecord[] = [
  {
    id: 'assessment-demo-bench-01',
    exerciseId: 'barbell-bench-press',
    exerciseName: { en: 'Barbell Bench Press', vi: 'Đẩy ngực với thanh đòn' },
    createdAt: '2026-09-21T09:15:00.000Z',
    status: 'completed',
    score: 84,
    summary: {
      en: 'Stable bar path with two setup adjustments recommended.',
      vi: 'Đường đi thanh đòn ổn định, cần điều chỉnh hai điểm ở tư thế chuẩn bị.',
    },
    findings: [
      {
        timestamp: '00:08',
        severity: 'medium',
        title: { en: 'Shoulder position', vi: 'Vị trí vai' },
        feedback: {
          en: 'Keep both shoulder blades retracted before the descent.',
          vi: 'Giữ hai bả vai khép lại trước khi hạ thanh đòn.',
        },
      },
      {
        timestamp: '00:19',
        severity: 'low',
        title: { en: 'Wrist alignment', vi: 'Căn chỉnh cổ tay' },
        feedback: {
          en: 'Stack the wrist more directly over the elbow.',
          vi: 'Đặt cổ tay thẳng hơn phía trên khuỷu tay.',
        },
      },
    ],
  },
  {
    id: 'assessment-demo-squat-01',
    exerciseId: 'barbell-back-squat',
    exerciseName: { en: 'Barbell Back Squat', vi: 'Back Squat với thanh đòn' },
    createdAt: '2026-09-14T10:40:00.000Z',
    status: 'completed',
    score: 76,
    summary: {
      en: 'Good depth; knee tracking becomes inconsistent near the final reps.',
      vi: 'Độ sâu tốt; hướng đầu gối chưa ổn định ở các rep cuối.',
    },
    findings: [
      {
        timestamp: '00:24',
        severity: 'high',
        title: { en: 'Right knee tracking', vi: 'Hướng đầu gối phải' },
        feedback: {
          en: 'Reduce load and keep the knee aligned with the second toe.',
          vi: 'Giảm mức tạ và giữ đầu gối thẳng theo hướng ngón chân thứ hai.',
        },
      },
    ],
  },
];

export const trainerAppointments: TrainerAppointment[] = [
  {
    id: 'appointment-linh-01',
    trainerName: 'Linh Nguyễn',
    trainerInitials: 'LN',
    startsAt: '2026-09-28T11:30:00.000Z',
    durationMinutes: 60,
    type: 'in_person',
    location: { en: 'Fit District · Strength floor', vi: 'Fit District · Khu tập sức mạnh' },
    note: {
      en: 'Technique review and weekly load adjustment.',
      vi: 'Kiểm tra kỹ thuật và điều chỉnh mức tải trong tuần.',
    },
    status: 'confirmed',
  },
  {
    id: 'appointment-linh-02',
    trainerName: 'Linh Nguyễn',
    trainerInitials: 'LN',
    startsAt: '2026-10-03T03:00:00.000Z',
    durationMinutes: 30,
    type: 'video_checkin',
    location: { en: 'Video check-in', vi: 'Trao đổi qua video' },
    note: {
      en: 'Review recovery, adherence and next-week schedule.',
      vi: 'Xem lại phục hồi, mức tuân thủ và lịch tập tuần tiếp theo.',
    },
    status: 'pending',
  },
  {
    id: 'appointment-scan-01',
    trainerName: 'Linh Nguyễn',
    trainerInitials: 'LN',
    startsAt: '2026-10-10T09:00:00.000Z',
    durationMinutes: 45,
    type: 'body_assessment',
    location: { en: 'Fit District · Assessment room', vi: 'Fit District · Phòng đánh giá' },
    note: {
      en: 'Monthly body measurements and movement screening.',
      vi: 'Đo chỉ số cơ thể và sàng lọc vận động hằng tháng.',
    },
    status: 'confirmed',
  },
];
