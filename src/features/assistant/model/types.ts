export type AssistantChoice = { value: string; label: string; description?: string | null };
export type AssistantFormField = {
  name: string;
  label: string;
  inputType: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  placeholder?: string | null;
  min?: number | null;
  max?: number | null;
  options?: AssistantChoice[] | null;
};
export type AssistantInteraction = {
  version: '1';
  type: 'single_choice' | 'multiple_choice' | 'form' | 'data_card' | 'progress' | 'error';
  id: string;
  title: string;
  description?: string | null;
  options?: AssistantChoice[] | null;
  fields?: AssistantFormField[] | null;
  data?: unknown;
  minSelections?: number | null;
  maxSelections?: number | null;
};
export type AssistantConversation = {
  id: string;
  title: string;
  createdAtUtc: string;
  lastMessageAtUtc?: string | null;
  latestRunStatus?: string | null;
};
export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAtUtc: string;
  interaction?: AssistantInteraction | null;
  interactionStatus: 'none' | 'required' | 'completed' | 'cancelled';
  interactionResponse?: unknown;
};
export type AssistantConversationDetail = {
  conversation: AssistantConversation;
  messages: AssistantMessage[];
  nextCursor?: string | null;
};
export type AssistantRun = {
  id: string;
  conversationId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  correlationId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  errorCode?: string | null;
};
export type AssistantRunEvent = { sequence: number; type: string; data: unknown };
