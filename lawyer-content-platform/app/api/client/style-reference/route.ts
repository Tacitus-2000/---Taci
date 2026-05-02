/**
 * Client API - Style Reference
 * GET /api/client/style-reference?client_id={uuid}
 *
 * 获取风格参考（已发布的优质文案 + 档案中的风格设定）
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired } from '@/lib/api/validation';
import type { StyleReferenceResponse, StyleReferenceItem } from '@/types/client';

/**
 * GET /api/client/style-reference
 * 获取风格参考
 *
 * Query Parameters:
 * - client_id: string (required) - 客户 ID
 * - limit: number (optional) - 返回的参考文案数量，默认 10，最大 50
 *
 * 数据过滤规则:
 * - 只返回 visible_to_client = true 的文案
 * - 只返回 status = 'published' 的文案
 * - 排除 internal_only = true 的文案
 * - 从客户档案中提取 tone_style 和 taboo_expressions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const limitParam = searchParams.get('limit');

    // 验证必填参数
    const validClientId = validateRequired(clientId, 'client_id');
    validateUUID(validClientId, 'client_id');

    // 验证 limit 参数
    let limit = 10;
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1 || limit > 50) {
        return apiError('INVALID_REQUEST', 'Invalid limit: must be between 1 and 50', 400);
      }
    }

    const supabase = getSupabaseClient();

    // 查询客户档案（获取风格设定）
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('tone_style, taboo_expressions')
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[Client API] Failed to fetch profile for style reference:', profileError);
      return apiError('DATABASE_ERROR', 'Failed to fetch profile', 500, profileError);
    }

    // 查询已发布的文案作为风格参考
    const { data: scripts, error: scriptsError } = await supabase
      .from('scripts')
      .select('id, title, body, usage_advice, created_at')
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (scriptsError) {
      console.error('[Client API] Failed to fetch scripts for style reference:', scriptsError);
      return apiError('DATABASE_ERROR', 'Failed to fetch scripts', 500, scriptsError);
    }

    // 转换为风格参考项
    const references: StyleReferenceItem[] = (scripts || []).map((script) => ({
      id: script.id,
      title: script.title,
      body: script.body,
      usage_advice: script.usage_advice,
      created_at: script.created_at,
    }));

    const response: StyleReferenceResponse = {
      references,
      profile: {
        tone_style: profile?.tone_style || null,
        taboo_expressions: profile?.taboo_expressions || null,
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Client API] GET /api/client/style-reference error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
