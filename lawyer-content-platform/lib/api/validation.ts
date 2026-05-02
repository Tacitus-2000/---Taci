/**
 * API 验证工具
 * 提供通用的验证函数
 */

/**
 * UUID v4 正则表达式
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 验证 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

/**
 * 验证并返回 UUID，如果无效则抛出错误
 */
export function validateUUID(uuid: string, fieldName = 'id'): string {
  if (!isValidUUID(uuid)) {
    throw new Error(`Invalid ${fieldName}: must be a valid UUID`);
  }
  return uuid;
}

/**
 * 分页参数验证结果
 */
export interface ValidatedPagination {
  page: number;
  limit: number;
  offset: number;
}

/**
 * 验证分页参数
 */
export function validatePagination(
  page?: string | number | null,
  limit?: string | number | null
): ValidatedPagination {
  // 解析 page
  let parsedPage = 1;
  if (page !== null && page !== undefined) {
    parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new Error('Invalid page: must be a positive integer');
    }
  }

  // 解析 limit
  let parsedLimit = 20;
  if (limit !== null && limit !== undefined) {
    parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new Error('Invalid limit: must be between 1 and 100');
    }
  }

  // 计算 offset
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
}

/**
 * 验证必填字段
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Missing required field: ${fieldName}`);
  }
  return value;
}

/**
 * 验证枚举值
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (!allowedValues.includes(value as T)) {
    throw new Error(
      `Invalid ${fieldName}: must be one of ${allowedValues.join(', ')}`
    );
  }
  return value as T;
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): string {
  if (minLength !== undefined && value.length < minLength) {
    throw new Error(
      `Invalid ${fieldName}: must be at least ${minLength} characters`
    );
  }
  if (maxLength !== undefined && value.length > maxLength) {
    throw new Error(
      `Invalid ${fieldName}: must be at most ${maxLength} characters`
    );
  }
  return value;
}

/**
 * 验证布尔值
 */
export function validateBoolean(
  value: unknown,
  fieldName: string
): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  throw new Error(`Invalid ${fieldName}: must be a boolean`);
}

/**
 * 安全解析 JSON
 */
export function safeParseJSON<T = unknown>(
  value: string,
  fieldName: string
): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Invalid ${fieldName}: must be valid JSON`);
  }
}
