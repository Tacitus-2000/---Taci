/**
 * Client API - Calendar
 * GET /api/client/calendar?client_id={uuid}
 *
 * 获取内容日历（选题和文案的时间线）
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired } from '@/lib/api/validation';
import type { CalendarResponse, CalendarItem } from '@/types/client';

/**
 * GET /api/client/calendar
 * 获取内容日历
 *
 * Query Parameters:
 * - client_id: string (required) - 客户 ID
 * - limit: number (optional) - 返回的项目数量，默认 50，最大 200
 *
 * 数据过滤规则:
 * - 只返回 visible_to_client = true 的内容
 * - 排除 internal_only = true 的内容
 * - Topics: 只返回 status = 'approved'
 * - Scripts: 只返回 status IN ('approved', 'published')
 * - 按创建时间倒序排列
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
    let limit = 50;
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1 || limit > 200) {
        return apiError('INVALID_REQUEST', 'Invalid limit: must be between 1 and 200', 400);
      }
    }

    const supabase = getSupabaseClient();

    // 查询选题
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id, title, status, created_at, updated_at')
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (topicsError) {
      console.error('[Client API] Failed to fetch topics for calendar:', topicsError);
      return apiError('DATABASE_ERROR', 'Failed to fetch topics', 500, topicsError);
    }

    // 查询文案
    const { data: scripts, error: scriptsError } = await supabase
      .from('scripts')
      .select('id, title, status, created_at, updated_at')
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .in('status', ['approved', 'published'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (scriptsError) {
      console.error('[Client API] Failed to fetch scripts for calendar:', scriptsError);
      return apiError('DATABASE_ERROR', 'Failed to fetch scripts', 500, scriptsError);
    }

    // 合并并转换为日历项
    const calendarItems: CalendarItem[] = [
      ...(topics || []).map((topic) => ({
        id: topic.id,
        type: 'topic' as const,
        title: topic.title,
        status: topic.status,
        created_at: topic.created_at,
        updated_at: topic.updated_at,
      })),
      ...(scripts || []).map((script) => ({
        id: script.id,
        type: 'script' as const,
        title: script.title,
        status: script.status,
        created_at: script.created_at,
        updated_at: script.updated_at,
      })),
    ];

    // 按创建时间倒序排序
    calendarItems.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // 限制返回数量
    const limitedItems = calendarItems.slice(0, limit);

    // 计算统计信息
    const summary = {
      total_topics: topics?.length || 0,
      total_scripts: scripts?.length || 0,
      approved_topics: topics?.filter((t) => t.status === 'approved').length || 0,
      published_scripts: scripts?.filter((s) => s.status === 'published').length || 0,
    };

    const response: CalendarResponse = {
      items: limitedItems,
      summary,
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Client API] GET /api/client/calendar error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
