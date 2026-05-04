/**
 * 密码重置请求 API（预留）
 * TODO: 实现密码重置请求功能
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ResetPasswordRequest, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { email } = body;

    // 验证输入
    if (!email) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: '邮箱不能为空',
        },
        { status: 400 }
      );
    }

    // TODO: 实现密码重置请求逻辑
    // 1. 检查邮箱是否存在
    // 2. 生成重置 Token
    // 3. 发送重置邮件
    // 4. 返回成功响应

    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '密码重置功能暂未开放',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('密码重置请求错误:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '服务器错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}
