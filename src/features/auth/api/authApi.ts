import { passwordApi } from './passwordApi';
import { sessionApi } from './sessionApi';

export * from './types';
export * from './sessionApi';
export * from './passwordApi';

/** Unified Auth API facade preserving backwards compatibility */
export const authApi = {
  ...sessionApi,
  ...passwordApi,
};
