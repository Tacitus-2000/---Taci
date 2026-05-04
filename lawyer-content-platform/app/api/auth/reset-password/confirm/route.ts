/**
 * 密码重置确认 API（预留）
 * TODO: 实现密码重置确认功能
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ResetPasswordConfirmRequest, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordConfirmRequest = await request.json();
    const { token, newPassword } = body;

    // 验证输入
    if (!token || !newPassword) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Token 和新密码不能为空',
        },
        { status: 400 }
      );
    }

    // TODO: 实现密码重置确认逻辑
    // 1. 验证 Token 有效性
    // 2. 检查 Token 是否过期
    // 3. 加密新密码
    // 4. 更新用户密码
    // 5. 使 Token 失效
    // 6. 返回成功响应

    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '密码重置功能暂未开放',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('密码重置确认错误:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '服务器错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}
