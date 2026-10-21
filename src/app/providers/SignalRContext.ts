import { createContext, useContext } from 'react';

import type { ConnectionState, signalRService } from '@/shared/lib/signalr';

export interface SignalRContextValue {
  connectionState: ConnectionState;
  service: typeof signalRService;
}

export const SignalRContext = createContext<SignalRContextValue | null>(null);

export function useSignalR(): SignalRContextValue {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return ctx;
}
