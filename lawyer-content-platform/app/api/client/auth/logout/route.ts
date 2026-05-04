/**
 * Client 登出 API
 */

import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth/session';
import type { LoginResponse } from '@/types/auth';

export async function POST() {
  try {
    // 删除 Client Cookie
    await deleteAuthCookie('client');

    return NextResponse.json<LoginResponse>({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    console.error('Client 登出错误:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '登出失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}
