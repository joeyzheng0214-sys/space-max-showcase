import type { ComponentType } from "react";
export type AgentState = "idle" | "listening" | "thinking" | "speaking";
export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  taskIntensity: "low" | "medium" | "high";
  status: "planned" | "active" | "completed" | "cancelled";
  day?: number;
  sourceRecordIds?: string[];
  modified?: boolean;
  proposed?: boolean;
}
export interface ScheduleProposal {
  requestId?: string; id: string; day: number; taskId: string; title: string; baseRevision: number;
  before: ScheduleItem; after: ScheduleItem; summary: string; expiresAt: number;
  changes?: {before: ScheduleItem; after: ScheduleItem}[];
  previewEvents: ScheduleItem[];
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  source?: 'speech' | 'text';
  requestId?: string;
  replyTo?: string;
  speechStatus?: 'thinking' | 'editing' | 'resubmitting' | 'speaking' | 'completed' | 'interrupted' | 'failed';
}
export interface AnimationProps { agentState: AgentState; }
export interface Integrations { Animation?: ComponentType<AnimationProps>; }
