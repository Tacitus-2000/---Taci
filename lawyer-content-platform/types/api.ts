import type { PositioningInput } from './agent';
import type { WorkflowResult, WorkflowConfig } from '../assistant-owned/types/workflow';
import type { WorkflowStatus } from './database';

/**
 * POST /api/workflow/start
 */
export interface StartWorkflowRequest {
  input: PositioningInput;
  config?: Partial<WorkflowConfig>;
}

export interface StartWorkflowResponse {
  workflowId: string;
  status: WorkflowStatus;
  message: string;
}

/**
 * GET /api/workflow/status?workflowId=xxx
 */
export interface GetWorkflowStatusRequest {
  workflowId: string;
}

export interface GetWorkflowStatusResponse {
  workflowId: string;
  status: WorkflowStatus;
  currentStep?: string;
  progress: number;
  startedAt: string;
  updatedAt: string;
  estimatedTimeRemaining?: number;
}

/**
 * GET /api/workflow/result?workflowId=xxx
 */
export interface GetWorkflowResultRequest {
  workflowId: string;
}

export interface GetWorkflowResultResponse {
  workflowId: string;
  status: WorkflowStatus;
  result?: WorkflowResult;
  error?: string;
}

/**
 * GET /api/health
 */
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: 'ok' | 'down';
    ai: 'ok' | 'down';
  };
  version: string;
}
