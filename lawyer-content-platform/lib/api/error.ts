/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 预定义的错误类型
 */
export const ErrorCodes = {
  // 通用错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // 工作流错误
  WORKFLOW_NOT_FOUND: 'WORKFLOW_NOT_FOUND',
  WORKFLOW_FAILED: 'WORKFLOW_FAILED',
  WORKFLOW_TIMEOUT: 'WORKFLOW_TIMEOUT',

  // Agent 错误
  AGENT_ERROR: 'AGENT_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',

  // 数据库错误
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
} as const;

/**
 * 创建预定义错误
 */
export function createError(
  code: keyof typeof ErrorCodes,
  message: string,
  status?: number,
  details?: unknown
): ApiError {
  return new ApiError(ErrorCodes[code], message, status, details);
}
