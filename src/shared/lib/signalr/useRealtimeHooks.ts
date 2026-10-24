import { useEffect } from 'react';

import { signalRService } from './signalrService';
import type {
  AppointmentEvent,
  MovementFormWarningEvent,
  MovementProgressEvent,
  OrderPaymentEvent,
} from './types';

/**
 * Hook for subscribing to real-time payment updates of a specific order
 */
export function useOrderRealtime(
  orderId?: string | null,
  onPaid?: (event: OrderPaymentEvent) => void,
) {
  useEffect(() => {
    if (!orderId) return;

    void signalRService.joinOrder(orderId);

    const unsub = signalRService.onOrderPaymentUpdated((event) => {
      if (event.orderId.toLowerCase() === orderId.toLowerCase()) {
        onPaid?.(event);
      }
    });

    return () => {
      unsub();
      void signalRService.leaveOrder(orderId);
    };
  }, [orderId, onPaid]);
}

/**
 * Hook for subscribing to real-time appointment updates (reschedule, acceptance, cancellation)
 */
export function useAppointmentRealtime(
  appointmentId?: string | null,
  onUpdate?: (event: AppointmentEvent) => void,
) {
  useEffect(() => {
    if (!appointmentId) return;

    void signalRService.joinAppointment(appointmentId);

    const unsub = signalRService.onAppointmentUpdated((event) => {
      if (event.appointmentId.toLowerCase() === appointmentId.toLowerCase()) {
        onUpdate?.(event);
      }
    });

    return () => {
      unsub();
      void signalRService.leaveAppointment(appointmentId);
    };
  }, [appointmentId, onUpdate]);
}

/**
 * Hook for subscribing to real-time AI movement pose assessment and video analysis progress
 */
export function useMovementAssessmentRealtime(
  sessionId?: string | null,
  callbacks?: {
    onProgress?: (event: MovementProgressEvent) => void;
    onWarning?: (event: MovementFormWarningEvent) => void;
  },
) {
  useEffect(() => {
    if (!sessionId) return;

    void signalRService.joinMovementSession(sessionId);

    const unsubProgress = callbacks?.onProgress
      ? signalRService.onMovementProgress((event) => {
          if (event.sessionId.toLowerCase() === sessionId.toLowerCase()) {
            callbacks.onProgress?.(event);
          }
        })
      : () => {};

    const unsubWarning = callbacks?.onWarning
      ? signalRService.onMovementWarning((event) => {
          if (event.sessionId.toLowerCase() === sessionId.toLowerCase()) {
            callbacks.onWarning?.(event);
          }
        })
      : () => {};

    return () => {
      unsubProgress();
      unsubWarning();
      void signalRService.leaveMovementSession(sessionId);
    };
  }, [sessionId, callbacks]);
}
