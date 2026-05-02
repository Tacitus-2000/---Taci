/**
 * Client API - Topics
 * GET /api/client/topics?client_id={uuid}
 *
 * 获取选题列表（只返回 approved 状态）
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired, validatePagination } from '@/lib/api/validation';
import type { TopicPublic } from '@/types/client';

/**
 * GET /api/client/topics
 * 获取选题列表
 *
 * Query Parameters:
 * - client_id: string (required) - 客户 ID
 * - page: number (optional) - 页码，默认 1
 * - limit: number (optional) - 每页数量，默认 20，最大 100
 *
 * 数据过滤规则:
 * - 只返回 visible_to_client = true 的选题
 * - 只返回 status = 'approved' 的选题
 * - 排除 internal_only = true 的选题
 * - 只返回当前 client_id 的数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // 验证必填参数
    const validClientId = validateRequired(clientId, 'client_id');
    validateUUID(validClientId, 'client_id');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseClient();

    // 构建查询 - 获取总数
    const countQuery = supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .eq('status', 'approved');

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('[Client API] Failed to count topics:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count topics', 500, countError);
    }

    // 查询选题列表
    // 使用显式字段选择
    const { data, error } = await supabase
      .from('topics')
      .select(`
        id,
        client_id,
        industry_id,
        title,
        direction,
        status,
        created_at,
        updated_at
      `)
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Client API] Failed to fetch topics:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch topics', 500, error);
    }

    // 过滤数据
    const filteredTopics: TopicPublic[] = data as TopicPublic[];

    const response = {
      data: filteredTopics,
      meta: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Client API] GET /api/client/topics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
