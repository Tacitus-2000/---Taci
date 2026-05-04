/**
 * 用户注册 API（预留）
 * TODO: 实现用户注册功能
 */

import { NextRequest, NextResponse } from 'next/server';
import type { RegisterRequest, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, role } = body;

    // 验证输入
    if (!email || !password || !role) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: '邮箱、密码和角色不能为空',
        },
        { status: 400 }
      );
    }

    // TODO: 实现注册逻辑
    // 1. 检查邮箱是否已存在
    // 2. 加密密码
    // 3. 创建用户记录（包括 name 字段）
    // 4. 发送验证邮件（可选）
    // 5. 返回成功响应

    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '注册功能暂未开放',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '服务器错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}
