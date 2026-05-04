/**
 * Next.js Middleware - 路由保护
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyRequestToken,
  matchesPathPrefix,
  isPublicRoute,
} from '@/lib/auth/middleware';
import {
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  CLIENT_ROUTES,
  ADMIN_LOGIN_PATH,
  CLIENT_LOGIN_PATH,
} from '@/lib/auth/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过公开路由
  if (isPublicRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // 检查 Admin 路由
  if (matchesPathPrefix(pathname, ADMIN_ROUTES)) {
    const payload = await verifyRequestToken(request, 'admin');

    if (!payload) {
      // 未认证，重定向到 Admin 登录页
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }

    if (payload.role !== 'admin') {
      // 角色不匹配，重定向到 Admin 登录页
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }

    return NextResponse.next();
  }

  // 检查 Client 路由
  if (matchesPathPrefix(pathname, CLIENT_ROUTES)) {
    const payload = await verifyRequestToken(request, 'client');

    if (!payload) {
      // 未认证，重定向到 Client 登录页
      return NextResponse.redirect(new URL(CLIENT_LOGIN_PATH, request.url));
    }

    if (payload.role !== 'client') {
      // 角色不匹配，重定向到 Client 登录页
      return NextResponse.redirect(new URL(CLIENT_LOGIN_PATH, request.url));
    }

    return NextResponse.next();
  }

  // 其他路由放行
  return NextResponse.next();
}

// 配置 Middleware 匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
