/**
 * Debug API - Environment Variables Check
 * GET /api/debug/env
 *
 * 用于调试环境变量加载情况
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 检查关键环境变量
  const envCheck = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...${process.env.ANTHROPIC_API_KEY.substring(process.env.ANTHROPIC_API_KEY.length - 4)}`
      : '❌ MISSING',
    ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || '❌ MISSING',
    LLM_MODEL: process.env.LLM_MODEL || '❌ MISSING',
    NODE_ENV: process.env.NODE_ENV || 'unknown',

    // Supabase 环境变量（用于对比）
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? '✅ SET'
      : '❌ MISSING',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...`
      : '❌ MISSING',
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: envCheck,
    message: '环境变量检查完成',
  });
}
