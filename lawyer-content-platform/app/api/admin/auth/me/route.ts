/**
 * 获取当前 Admin 用户信息 API
 * 只读取 admin_token，避免与 client_token 冲突
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth/constants';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 只读取 admin token
    const adminToken = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

    if (!adminToken) {
      return NextResponse.json(
        {
          success: false,
          message: '未登录',
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(adminToken);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: '无效的管理员凭证',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误',
      },
      { status: 500 }
    );
  }
}
