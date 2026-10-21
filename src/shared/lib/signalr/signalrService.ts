import {
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

import type {
  AiCoachingEvent,
  AppointmentEvent,
  MovementFormWarningEvent,
  MovementProgressEvent,
  NotificationView,
  OrderPaymentEvent,
  PlanFeedbackEvent,
} from './types';

import { tokenManager } from '@/shared/api/client';
import { env } from '@/shared/config/env';

class FitnessSignalRService {
  private connection: HubConnection | null = null;
  private connectingPromise: Promise<void> | null = null;

  private getHubUrl(): string {
    const base = env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}/hubs/fitness`;
  }

  public getConnection(): HubConnection | null {
    return this.connection;
  }

  public isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  public async start(): Promise<void> {
    // In mock environments (MSW enabled / E2E tests), no backend server runs at localhost:5167.
    // Skip opening a WebSocket to avoid connection negotiation failures.
    if (env.VITE_ENABLE_MSW) {
      return;
    }

    const token = tokenManager.getAccess();
    if (!token) return;

    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => tokenManager.getAccess() ?? '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.None)
        .build();
    }

    this.connectingPromise = (async () => {
      try {
        if (this.connection?.state === HubConnectionState.Disconnected) {
          await this.connection.start();
        }
      } catch (err) {
        if (import.meta.env.DEV && !env.VITE_ENABLE_MSW) {
          console.warn('[SignalR] Connection start failed:', err);
        }
      } finally {
        this.connectingPromise = null;
      }
    })();

    return this.connectingPromise;
  }

  public async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        if (import.meta.env.DEV && !env.VITE_ENABLE_MSW) {
          console.warn('[SignalR] Connection stop failed:', err);
        }
      } finally {
        this.connection = null;
      }
    }
  }

  // Group helpers
  public async joinOrder(orderId: string): Promise<void> {
    if (this.isConnected()) {
      await this.connection?.invoke('JoinOrderGroup', orderId);
    }
  }

  public async leaveOrder(orderId: string): Promise<void> {
    if (this.isConnected()) {
      await this.connection?.invoke('LeaveOrderGroup', orderId);
    }
  }

  public async joinAppointment(appointmentId: string): Promise<void> {
    if (this.isConnected()) {
      await this.connection?.invoke('JoinAppointmentGroup', appointmentId);
    }
  }

  public async leaveAppointment(appointmentId: string): Promise<void> {
    if (this.isConnected()) {
      await this.connection?.invoke('LeaveAppointmentGroup', appointmentId);
    }
  }

  public async joinMovementSession(sessionId: string): Promise<void> {
    if (this.isConnected()) {
      await this.connection?.invoke('JoinMovementSessionGroup', sessionId);
    }
  }

  public async leaveMovementSession(sessionId: string): Promise<void> {
    if (this.isConnected()) {
      await this.connection?.invoke('LeaveMovementSessionGroup', sessionId);
    }
  }

  // Strongly-typed event subscription listeners
  public onNotification(callback: (notification: NotificationView) => void): () => void {
    const handler = (data: NotificationView) => callback(data);
    this.connection?.on('ReceiveNotification', handler);
    return () => this.connection?.off('ReceiveNotification', handler);
  }

  public onUnreadCount(callback: (count: number) => void): () => void {
    const handler = (count: number) => callback(count);
    this.connection?.on('UnreadNotificationCountUpdated', handler);
    return () => this.connection?.off('UnreadNotificationCountUpdated', handler);
  }

  public onAppointmentUpdated(callback: (event: AppointmentEvent) => void): () => void {
    const handler = (data: AppointmentEvent) => callback(data);
    this.connection?.on('AppointmentUpdated', handler);
    return () => this.connection?.off('AppointmentUpdated', handler);
  }

  public onOrderPaymentUpdated(callback: (event: OrderPaymentEvent) => void): () => void {
    const handler = (data: OrderPaymentEvent) => callback(data);
    this.connection?.on('OrderPaymentUpdated', handler);
    return () => this.connection?.off('OrderPaymentUpdated', handler);
  }

  public onMovementProgress(callback: (event: MovementProgressEvent) => void): () => void {
    const handler = (data: MovementProgressEvent) => callback(data);
    this.connection?.on('MovementAssessmentProgress', handler);
    return () => this.connection?.off('MovementAssessmentProgress', handler);
  }

  public onMovementWarning(callback: (event: MovementFormWarningEvent) => void): () => void {
    const handler = (data: MovementFormWarningEvent) => callback(data);
    this.connection?.on('MovementFormWarning', handler);
    return () => this.connection?.off('MovementFormWarning', handler);
  }

  public onAiCoachingUpdated(callback: (event: AiCoachingEvent) => void): () => void {
    const handler = (data: AiCoachingEvent) => callback(data);
    this.connection?.on('AiCoachingStatusUpdated', handler);
    return () => this.connection?.off('AiCoachingStatusUpdated', handler);
  }

  public onPlanFeedbackReceived(callback: (event: PlanFeedbackEvent) => void): () => void {
    const handler = (data: PlanFeedbackEvent) => callback(data);
    this.connection?.on('PlanFeedbackReceived', handler);
    return () => this.connection?.off('PlanFeedbackReceived', handler);
  }
}

export const signalRService = new FitnessSignalRService();
