export interface NotificationView {
  id: string;
  type: string;
  title: string;
  body: string;
  relatedId?: string | null;
  isRead: boolean;
  createdAtUtc: string;
}

export interface AppointmentEvent {
  appointmentId: string;
  status: string;
  action: string;
  message: string;
  timestampUtc: string;
}

export interface OrderPaymentEvent {
  orderId: string;
  status: string;
  totalAmount: number;
  message: string;
  timestampUtc: string;
}

export interface MovementProgressEvent {
  sessionId: string;
  progressPercent: number;
  stage: string;
  message: string;
}

export interface MovementFormWarningEvent {
  sessionId: string;
  exerciseName: string;
  errorCode: string;
  message: string;
  recommendation: string;
}

export interface AiCoachingEvent {
  requestId: string;
  status: string;
  message: string;
  timestampUtc: string;
}

export interface PlanFeedbackEvent {
  assignmentId: string;
  feedbackId: string;
  authorRole: string;
  message: string;
  timestampUtc: string;
}

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';
