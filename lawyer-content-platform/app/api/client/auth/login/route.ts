/**
 * Client 登录 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/session';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: '邮箱和密码不能为空',
        },
        { status: 400 }
      );
    }

    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 查询用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'client')
      .single<User>();

    if (error || !user) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: '邮箱或密码错误',
        },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: '邮箱或密码错误',
        },
        { status: 401 }
      );
    }

    // 生成 JWT Token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 设置 Cookie
    await setAuthCookie(token, 'client');

    // 返回成功响应
    return NextResponse.json<LoginResponse>({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Client 登录错误:', error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: '服务器错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}
