/**
 * Session 管理（Cookie 操作）
 */

import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE, CLIENT_TOKEN_COOKIE, COOKIE_OPTIONS } from './constants';
import type { UserRole } from '@/types/auth';

/**
 * 根据角色获取 Cookie 名称
 */
function getCookieName(role: UserRole): string {
  return role === 'admin' ? ADMIN_TOKEN_COOKIE : CLIENT_TOKEN_COOKIE;
}

/**
 * 设置认证 Cookie
 */
export async function setAuthCookie(token: string, role: UserRole): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName(role);

  cookieStore.set(cookieName, token, COOKIE_OPTIONS);
}

/**
 * 获取认证 Cookie
 */
export async function getAuthCookie(role: UserRole): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieName = getCookieName(role);

  return cookieStore.get(cookieName)?.value;
}

/**
 * 删除认证 Cookie
 */
export async function deleteAuthCookie(role: UserRole): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName(role);

  cookieStore.delete(cookieName);
}

/**
 * 清除所有认证 Cookie
 */
export async function clearAllAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_TOKEN_COOKIE);
  cookieStore.delete(CLIENT_TOKEN_COOKIE);
}
