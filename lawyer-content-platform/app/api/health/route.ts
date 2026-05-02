/**
 * 健康检查 API
 * GET /api/health
 */

import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/response';

export async function GET(_request: NextRequest) {
  return apiSuccess({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  });
}
