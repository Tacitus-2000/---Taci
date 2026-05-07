/**
 * Admin API - Prompts Management
 * 提供 Prompt 模板的 CRUD 操作
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateRequired, validateEnum } from '@/lib/api/validation';
import type {
  PromptCreateRequest,
  PromptUpdateRequest,
  PromptResponse,
  PromptListResponse,
} from '@/types/admin';
import type { PromptTemplateAgentType } from '@/types/database';

const AGENT_TYPES: readonly PromptTemplateAgentType[] = [
  'supervisor',
  'data',
  'profile',
  'topic',
  'script',
  'readability_review',
  'risk_review',
  'rewrite',
];

/**
 * GET /api/admin/prompts
 * 获取 Prompt 模板列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const industryId = searchParams.get('industry_id');
    const agentType = searchParams.get('agent_type');
    const active = searchParams.get('active');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 构建查询
    let query = supabase.from('prompt_templates').select('*', { count: 'exact' });

    // 按 industry_id 筛选
    if (industryId) {
      if (industryId === 'null') {
        query = query.is('industry_id', null);
      } else {
        validateUUID(industryId, 'industry_id');
        query = query.eq('industry_id', industryId);
      }
    }

    // 按 agent_type 筛选
    if (agentType) {
      validateEnum(agentType, AGENT_TYPES, 'agent_type');
      query = query.eq('agent_type', agentType);
    }

    // 按 active 筛选
    if (active !== null && active !== undefined) {
      const isActive = active === 'true';
      query = query.eq('active', isActive);
    }

    // 获取总数
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[Admin API] Failed to count prompts:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count prompts', 500, countError);
    }

    // 获取分页数据
    query = supabase.from('prompt_templates').select('*');

    if (industryId) {
      if (industryId === 'null') {
        query = query.is('industry_id', null);
      } else {
        query = query.eq('industry_id', industryId);
      }
    }

    if (agentType) {
      query = query.eq('agent_type', agentType);
    }

    if (active !== null && active !== undefined) {
      const isActive = active === 'true';
      query = query.eq('active', isActive);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch prompts:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch prompts', 500, error);
    }

    const response: PromptListResponse = {
      data: data || [],
      meta: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] GET /api/admin/prompts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/prompts
 * 创建新 Prompt 模板
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PromptCreateRequest;

    // 验证必填字段
    validateRequired(body.agent_type, 'agent_type');
    validateEnum(body.agent_type, AGENT_TYPES, 'agent_type');
    validateRequired(body.template_name, 'template_name');

    // 至少需要 system_prompt 或 user_prompt_template 之一
    if (!body.system_prompt && !body.user_prompt_template && !body.template_body) {
      return apiError('INVALID_REQUEST', 'At least one of system_prompt, user_prompt_template, or template_body is required', 400);
    }

    const supabase = getSupabaseAdmin();

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    // 插入数据
    const { data, error } = await supabase
      .from('prompt_templates')
      .insert({
        industry_id: body.industry_id || null,
        agent_type: body.agent_type,
        template_name: body.template_name,
        template_body: body.template_body || body.user_prompt_template || '',
        system_prompt: body.system_prompt || null,
        user_prompt_template: body.user_prompt_template || null,
        description: body.description || null,
        version: body.version || '1.0.0',
        active: body.active ?? true,
        created_by: body.created_by || 'admin',
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Failed to create prompt:', error);
      return apiError('DATABASE_ERROR', 'Failed to create prompt', 500, error);
    }

    const response: PromptResponse = data;
    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Admin API] POST /api/admin/prompts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * PUT /api/admin/prompts/:id
 * 更新 Prompt 模板
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing prompt id', 400);
    }

    validateUUID(id, 'id');

    const body = (await request.json()) as PromptUpdateRequest;

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    // 如果提供了 agent_type，验证其值
    if (body.agent_type) {
      validateEnum(body.agent_type, AGENT_TYPES, 'agent_type');
    }

    const supabase = getSupabaseAdmin();

    // 构建更新对象
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.industry_id !== undefined) updateData.industry_id = body.industry_id;
    if (body.agent_type !== undefined) updateData.agent_type = body.agent_type;
    if (body.template_name !== undefined) updateData.template_name = body.template_name;
    if (body.template_body !== undefined) updateData.template_body = body.template_body;
    if (body.system_prompt !== undefined) updateData.system_prompt = body.system_prompt;
    if (body.user_prompt_template !== undefined) updateData.user_prompt_template = body.user_prompt_template;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.version !== undefined) updateData.version = body.version;
    if (body.active !== undefined) updateData.active = body.active;

    // 更新数据
    const { data, error } = await supabase
      .from('prompt_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('RECORD_NOT_FOUND', 'Prompt not found', 404);
      }
      console.error('[Admin API] Failed to update prompt:', error);
      return apiError('DATABASE_ERROR', 'Failed to update prompt', 500, error);
    }

    const response: PromptResponse = data;
    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] PUT /api/admin/prompts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * DELETE /api/admin/prompts/:id
 * 删除 Prompt 模板
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing prompt id', 400);
    }

    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();

    // 删除数据
    const { error } = await supabase.from('prompt_templates').delete().eq('id', id);

    if (error) {
      console.error('[Admin API] Failed to delete prompt:', error);
      return apiError('DATABASE_ERROR', 'Failed to delete prompt', 500, error);
    }

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error('[Admin API] DELETE /api/admin/prompts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
