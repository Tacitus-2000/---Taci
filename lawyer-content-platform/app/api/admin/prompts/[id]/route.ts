/**
 * Admin API - Single Prompt Management
 * GET /api/admin/prompts/[id] - 获取单个提示词
 * PUT /api/admin/prompts/[id] - 更新提示词
 * DELETE /api/admin/prompts/[id] - 删除提示词
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateEnum } from '@/lib/api/validation';
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
 * GET /api/admin/prompts/[id]
 * 获取单个提示词模板
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('RECORD_NOT_FOUND', 'Prompt not found', 404);
      }
      console.error('[Admin API] Failed to fetch prompt:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch prompt', 500, error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('[Admin API] GET /api/admin/prompts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * PUT /api/admin/prompts/[id]
 * 更新提示词模板
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    validateUUID(id, 'id');

    const body = await request.json();

    // 如果提供了 agent_type，验证其值
    if (body.agent_type) {
      validateEnum(body.agent_type, AGENT_TYPES, 'agent_type');
    }

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    const supabase = getSupabaseAdmin();

    // 构建更新对象
    const updateData: Record<string, unknown> = {};

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

    return apiSuccess(data);
  } catch (error) {
    console.error('[Admin API] PUT /api/admin/prompts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * DELETE /api/admin/prompts/[id]
 * 删除提示词模板
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();

    // 删除数据
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin API] Failed to delete prompt:', error);
      return apiError('DATABASE_ERROR', 'Failed to delete prompt', 500, error);
    }

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error('[Admin API] DELETE /api/admin/prompts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
