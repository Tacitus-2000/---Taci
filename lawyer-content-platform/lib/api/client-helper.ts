/**
 * Client API 辅助函数
 * 提供授权验证和 user_id → client_id 转换
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiError } from '@/lib/api/response';
import { CLIENT_TOKEN_COOKIE } from '@/lib/auth/constants';

/**
 * 从请求中获取认证的用户 ID
 *
 * @param request - Next.js 请求对象
 * @returns 认证的用户 ID，如果未认证则返回 null
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const clientToken = cookieStore.get(CLIENT_TOKEN_COOKIE)?.value;

    if (!clientToken) {
      return null;
    }

    const payload = await verifyToken(clientToken);

    if (!payload || payload.role !== 'client') {
      return null;
    }

    return payload.userId;
  } catch (error) {
    console.error('[Client Helper] Failed to get authenticated user:', error);
    return null;
  }
}

/**
 * 解析并验证 client_id（实际上是 user_id）
 *
 * 1. 验证用户已认证
 * 2. 验证请求的 user_id 与认证用户匹配（授权检查）
 * 3. 通过 user_id 查找对应的 client_id
 *
 * @param request - Next.js 请求对象
 * @param requestedUserId - 请求中的 user_id（参数名可能是 client_id）
 * @returns 解析后的 client_id 或错误响应
 */
export async function resolveClientId(
  request: NextRequest,
  requestedUserId: string
): Promise<{ clientId: string } | NextResponse> {
  // Step 1: 获取认证用户
  const authenticatedUserId = await getAuthenticatedUserId(request);

  if (!authenticatedUserId) {
    return apiError('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Step 2: 授权检查 - 确保用户只能访问自己的数据
  if (authenticatedUserId !== requestedUserId) {
    console.warn(
      `[Client Helper] Authorization failed: authenticated=${authenticatedUserId}, requested=${requestedUserId}`
    );
    return apiError('FORBIDDEN', 'Access denied', 403);
  }

  // Step 3: 通过 user_id 查找对应的 client_id
  const supabase = getSupabaseAdmin();

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', requestedUserId)
    .single();

  if (clientError) {
    if (clientError.code === 'PGRST116') {
      console.error('[Client Helper] No client found for user:', requestedUserId);
      return apiError('CLIENT_NOT_FOUND', 'Client not found', 404);
    }
    console.error('[Client Helper] Failed to fetch client:', clientError);
    return apiError('DATABASE_ERROR', 'Failed to fetch client', 500, clientError);
  }

  if (!client) {
    return apiError('CLIENT_NOT_FOUND', 'Client not found', 404);
  }

  return { clientId: client.id };
}

/**
 * 类型守卫：检查结果是否为错误响应
 */
export function isErrorResponse(
  result: { clientId: string } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
