/**
 * Client API - Profile
 * GET /api/client/profile?client_id={uuid}
 *
 * 获取客户档案信息（排除 internal_notes）
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired } from '@/lib/api/validation';
import type { ClientProfilePublic } from '@/types/client';

/**
 * GET /api/client/profile
 * 获取客户档案
 *
 * Query Parameters:
 * - client_id: string (required) - 客户 ID
 *
 * 数据过滤规则:
 * - 只返回 visible_to_client = true 的档案
 * - 排除 internal_notes 字段
 * - 只返回当前 client_id 的数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    // 验证必填参数
    const validClientId = validateRequired(clientId, 'client_id');
    validateUUID(validClientId, 'client_id');

    const supabase = getSupabaseClient();

    // 查询客户档案
    // 使用显式字段选择，排除 internal_notes
    const { data, error } = await supabase
      .from('client_profiles')
      .select(`
        id,
        client_id,
        industry_id,
        client_name,
        industry_name,
        niche_direction,
        target_customer,
        advantages,
        customer_pain_points,
        tone_style,
        taboo_expressions,
        conversion_goal,
        visible_to_client,
        created_at,
        updated_at
      `)
      .eq('client_id', validClientId)
      .eq('visible_to_client', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.error('[Client API] Profile not found for client:', validClientId);
        return apiError('PROFILE_NOT_FOUND', 'Client profile not found or not visible', 404);
      }
      console.error('[Client API] Failed to fetch client profile:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch client profile', 500, error);
    }

    if (!data) {
      return apiError('PROFILE_NOT_FOUND', 'Client profile not found or not visible', 404);
    }

    // 过滤数据（虽然已经排除了 internal_notes，但保持一致性）
    const response: ClientProfilePublic = data as ClientProfilePublic;

    return apiSuccess(response);
  } catch (error) {
    console.error('[Client API] GET /api/client/profile error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
