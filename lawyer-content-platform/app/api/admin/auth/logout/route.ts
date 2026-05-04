/**
 * Admin 登出 API
 */

import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth/session';
import type { LoginResponse } from '@/types/auth';

export async function POST() {
  try {
    // 删除 Admin Cookie
    await deleteAuthCookie('admin');

    return NextResponse.json<LoginResponse>({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    console.error('Admin 登出错误:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '登出失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}
