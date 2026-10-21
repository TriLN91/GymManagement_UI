import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SignalRContext } from './SignalRContext';

import { useAuthStore } from '@/features/auth';
import { type ConnectionState, signalRService } from '@/shared/lib/signalr';

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');

  useEffect(() => {
    if (!isHydrated) return;

    let mounted = true;

    if (isAuthenticated) {
      setConnectionState('Connecting');
      void signalRService.start().then(() => {
        if (!mounted) return;
        setConnectionState(signalRService.isConnected() ? 'Connected' : 'Disconnected');
      });

      // Hook global push notifications
      const unsubNotify = signalRService.onNotification((notification) => {
        toast.info(notification.title, {
          description: notification.body,
        });
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      const unsubAppointment = signalRService.onAppointmentUpdated((event) => {
        toast.info(event.message, {
          description: `Trạng thái: ${event.status}`,
        });
        void queryClient.invalidateQueries({ queryKey: ['appointments'] });
        void queryClient.invalidateQueries({ queryKey: ['appointment', event.appointmentId] });
      });

      const unsubOrder = signalRService.onOrderPaymentUpdated((event) => {
        toast.success(event.message, {
          description: `Đơn hàng #${event.orderId.slice(0, 8)} đã cập nhật.`,
        });
        void queryClient.invalidateQueries({ queryKey: ['orders'] });
        void queryClient.invalidateQueries({ queryKey: ['order', event.orderId] });
      });

      const unsubAi = signalRService.onAiCoachingUpdated((event) => {
        toast.success(event.message);
        void queryClient.invalidateQueries({ queryKey: ['coaching'] });
      });

      const unsubFeedback = signalRService.onPlanFeedbackReceived((event) => {
        toast.info(event.message);
        void queryClient.invalidateQueries({ queryKey: ['coaching', 'plan-feedback'] });
      });

      return () => {
        mounted = false;
        unsubNotify();
        unsubAppointment();
        unsubOrder();
        unsubAi();
        unsubFeedback();
        void signalRService.stop();
        setConnectionState('Disconnected');
      };
    } else {
      void signalRService.stop();
      setConnectionState('Disconnected');
    }
  }, [isAuthenticated, isHydrated, queryClient]);

  return (
    <SignalRContext.Provider value={{ connectionState, service: signalRService }}>
      {children}
    </SignalRContext.Provider>
  );
}
