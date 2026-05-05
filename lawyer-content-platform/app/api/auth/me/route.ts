/**
 * 获取当前用户信息 API
 * 从 httpOnly Cookie 中读取 JWT token 并返回用户信息
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { ADMIN_TOKEN_COOKIE, CLIENT_TOKEN_COOKIE } from '@/lib/auth/constants';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 尝试获取 admin token
    const adminToken = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
    if (adminToken) {
      const payload = await verifyToken(adminToken);
      if (payload) {
        return NextResponse.json({
          success: true,
          user: {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
          },
        });
      }
    }

    // 尝试获取 client token
    const clientToken = cookieStore.get(CLIENT_TOKEN_COOKIE)?.value;
    if (clientToken) {
      const payload = await verifyToken(clientToken);
      if (payload) {
        return NextResponse.json({
          success: true,
          user: {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
          },
        });
      }
    }

    // 未找到有效 token
    return NextResponse.json(
      {
        success: false,
        message: '未登录',
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误',
      },
      { status: 500 }
    );
  }
}
