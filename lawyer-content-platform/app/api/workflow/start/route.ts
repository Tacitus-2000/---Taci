/**
 * 启动工作流 API
 * POST /api/workflow/start
 *
 * 注意: 此 API 已废弃，请使用新的工作流 API:
 * - POST /api/workflows/profile - 档案生成工作流
 * - POST /api/workflows/topic - 选题生成工作流
 * - POST /api/workflows/script - 文案生成工作流
 */

import { NextRequest } from 'next/server';
import { apiError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  return apiError(
    'DEPRECATED_API',
    '此 API 已废弃，请使用新的工作流 API: /api/workflows/{profile|topic|script}',
    410
  );
}
