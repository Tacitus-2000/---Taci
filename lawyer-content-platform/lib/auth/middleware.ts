/**
 * 认证中间件工具函数
 */

import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { ADMIN_TOKEN_COOKIE, CLIENT_TOKEN_COOKIE } from './constants';
import type { JWTPayload, UserRole } from '@/types/auth';

/**
 * 从请求中获取 Token
 */
export function getTokenFromRequest(
  request: NextRequest,
  role: UserRole
): string | undefined {
  const cookieName = role === 'admin' ? ADMIN_TOKEN_COOKIE : CLIENT_TOKEN_COOKIE;
  return request.cookies.get(cookieName)?.value;
}

/**
 * 验证请求中的 Token
 */
export async function verifyRequestToken(
  request: NextRequest,
  role: UserRole
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request, role);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * 检查路径是否匹配前缀
 */
export function matchesPathPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * 检查路径是否为公开路由
 */
export function isPublicRoute(path: string, publicRoutes: string[]): boolean {
  return publicRoutes.includes(path);
}
