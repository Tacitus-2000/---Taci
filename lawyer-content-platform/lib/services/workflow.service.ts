/**
 * WorkflowService - 工作流服务层
 * 负责工作流的数据库操作
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowRecord {
  id: string;
  status: WorkflowStatus;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export class WorkflowService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * 创建新的工作流
   */
  async createWorkflow(input: Record<string, unknown>): Promise<string> {
    const { data, error } = await this.supabase
      .from('workflows')
      .insert({
        status: 'pending',
        input: input as unknown as Record<string, unknown>,
        result: null,
        error: null,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create workflow: ${error.message}`);
    }

    return data.id;
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(id: string): Promise<WorkflowStatus | null> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('status')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        return null;
      }
      throw new Error(`Failed to get workflow status: ${error.message}`);
    }

    return data.status as WorkflowStatus;
  }

  /**
   * 获取工作流完整信息
   */
  async getWorkflow(id: string): Promise<WorkflowRecord | null> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        return null;
      }
      throw new Error(`Failed to get workflow: ${error.message}`);
    }

    return data as WorkflowRecord;
  }

  /**
   * 获取工作流结果
   */
  async getWorkflowResult(id: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('result, status')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        return null;
      }
      throw new Error(`Failed to get workflow result: ${error.message}`);
    }

    return data.result as Record<string, unknown> | null;
  }

  /**
   * 更新工作流状态
   */
  async updateWorkflowStatus(
    id: string,
    status: WorkflowStatus,
    error?: string
  ): Promise<void> {
    const updateData: {
      status: WorkflowStatus;
      error?: string;
      completed_at?: string;
    } = {
      status,
    };

    if (error) {
      updateData.error = error;
    }

    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await this.supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      throw new Error(`Failed to update workflow status: ${updateError.message}`);
    }
  }

  /**
   * 更新工作流结果
   */
  async updateWorkflowResult(
    id: string,
    result: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('workflows')
      .update({
        result,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update workflow result: ${error.message}`);
    }
  }

  /**
   * 列出所有工作流（支持分页）
   */
  async listWorkflows(
    limit: number = 10,
    offset: number = 0
  ): Promise<WorkflowRecord[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list workflows: ${error.message}`);
    }

    return (data as WorkflowRecord[]) || [];
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await this.supabase.from('workflows').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  }
}

/**
 * 创建 WorkflowService 实例
 */
export function createWorkflowService(): WorkflowService {
  return new WorkflowService();
}
