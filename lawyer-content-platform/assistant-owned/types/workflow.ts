import type {
  PositioningInput,
  PositioningOutput,
  TopicOutput,
  ContentOutput,
  ReviewOutput,
  RewriteOutput,
} from './agent';

export type WorkflowState = {
  input: PositioningInput;
  positioning?: PositioningOutput;
  topics?: TopicOutput;
  content?: ContentOutput;
  review?: ReviewOutput;
  finalContent?: ContentOutput | RewriteOutput;
  currentStep: WorkflowStep;
  error?: string;
  retryCount: number;
  maxRetries: number;
};

export type WorkflowStep =
  | 'positioning'
  | 'topic'
  | 'content'
  | 'review'
  | 'rewrite'
  | 'completed'
  | 'failed';

export interface WorkflowConfig {
  maxRetries: number;
  topicCount: number;
  contentStyle: 'professional' | 'casual' | 'educational';
  contentLength: 'short' | 'medium' | 'long';
  autoRewrite: boolean;
}

export interface WorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed';
  positioning: PositioningOutput;
  topics: TopicOutput;
  content: ContentOutput | RewriteOutput;
  review: ReviewOutput;
  executionTime: number;
  steps: Array<{
    step: WorkflowStep;
    duration: number;
    success: boolean;
    error?: string;
  }>;
}
