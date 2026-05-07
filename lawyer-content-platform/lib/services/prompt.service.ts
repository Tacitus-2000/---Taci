/**
 * 提示词模板服务
 * 负责提示词模板的 CRUD 操作
 */

import { getAdminSupabaseClient } from '@/lib/supabase/admin-client';
import type {
  PromptTemplate,
  PromptTemplateInsert,
  PromptTemplateUpdate,
  PromptTemplateAgentType,
} from '@/types/database';

export class PromptService {
  /**
   * 获取所有提示词模板（按 agent_type 分组）
   */
  static async listPrompts(options?: {
    agentType?: PromptTemplateAgentType;
    activeOnly?: boolean;
  }): Promise<PromptTemplate[]> {
    const supabase = getAdminSupabaseClient();
    let query = supabase
      .from('prompt_templates')
      .select('*')
      .order('agent_type', { ascending: true })
      .order('version', { ascending: false });

    if (options?.agentType) {
      query = query.eq('agent_type', options.agentType);
    }

    if (options?.activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list prompts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 获取单个提示词模板
   */
  static async getPrompt(id: string): Promise<PromptTemplate | null> {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取指定 Agent 的激活提示词
   */
  static async getActivePrompt(
    agentType: PromptTemplateAgentType
  ): Promise<PromptTemplate | null> {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('agent_type', agentType)
      .eq('active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get active prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * 创建提示词模板
   */
  static async createPrompt(
    prompt: PromptTemplateInsert
  ): Promise<PromptTemplate> {
    const supabase = getAdminSupabaseClient();

    // 如果设置为 active，先将同类型的其他模板设为 inactive
    if (prompt.active) {
      await this.deactivateOtherPrompts(prompt.agent_type);
    }

    const { data, error } = await supabase
      .from('prompt_templates')
      .insert(prompt)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新提示词模板
   */
  static async updatePrompt(
    id: string,
    updates: PromptTemplateUpdate
  ): Promise<PromptTemplate> {
    const supabase = getAdminSupabaseClient();

    // 如果设置为 active，先将同类型的其他模板设为 inactive
    if (updates.active) {
      const existing = await this.getPrompt(id);
      if (existing) {
        await this.deactivateOtherPrompts(existing.agent_type, id);
      }
    }

    const { data, error } = await supabase
      .from('prompt_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * 删除提示词模板
   */
  static async deletePrompt(id: string): Promise<void> {
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }
  }

  /**
   * 将指定 Agent 类型的其他提示词设为 inactive
   */
  private static async deactivateOtherPrompts(
    agentType: PromptTemplateAgentType,
    excludeId?: string
  ): Promise<void> {
    const supabase = getAdminSupabaseClient();
    let query = supabase
      .from('prompt_templates')
      .update({ active: false })
      .eq('agent_type', agentType);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to deactivate prompts: ${error.message}`);
    }
  }

  /**
   * 按 Agent 类型分组获取提示词
   */
  static async getPromptsByAgentType(): Promise<
    Record<PromptTemplateAgentType, PromptTemplate[]>
  > {
    const prompts = await this.listPrompts();
    const grouped: Record<string, PromptTemplate[]> = {};

    for (const prompt of prompts) {
      if (!grouped[prompt.agent_type]) {
        grouped[prompt.agent_type] = [];
      }
      grouped[prompt.agent_type].push(prompt);
    }

    return grouped as Record<PromptTemplateAgentType, PromptTemplate[]>;
  }
}
