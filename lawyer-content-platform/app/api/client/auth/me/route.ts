/**
 * 获取当前 Client 用户信息 API
 * 只读取 client_token，避免与 admin_token 冲突
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { CLIENT_TOKEN_COOKIE } from '@/lib/auth/constants';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 只读取 client token
    const clientToken = cookieStore.get(CLIENT_TOKEN_COOKIE)?.value;

    if (!clientToken) {
      return NextResponse.json(
        {
          success: false,
          message: '未登录',
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(clientToken);

    if (!payload || payload.role !== 'client') {
      return NextResponse.json(
        {
          success: false,
          message: '无效的客户凭证',
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
    console.error('获取客户信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误',
      },
      { status: 500 }
    );
  }
}
