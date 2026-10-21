import { passwordApi } from './passwordApi';
import { sessionApi } from './sessionApi';

export * from './passwordApi';
export * from './sessionApi';
export * from './types';

/** Unified Auth API facade preserving backwards compatibility */
export const authApi = {
  ...sessionApi,
  ...passwordApi,
};
