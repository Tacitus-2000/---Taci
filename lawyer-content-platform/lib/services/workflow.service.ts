/**
 * WorkflowService - 工作流服务层
 * 负责工作流的数据库操作
 */

import { getAdminSupabaseClient } from '@/lib/supabase/admin-client';
import type { SupabaseClient } from '@supabase/supabase-js';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';
export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed';

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

export interface AgentRunRecord {
  id: string;
  client_id: string | null;
  industry_id: string | null;
  task_type: string;
  status: AgentRunStatus;
  input_summary: string | null;
  output_summary: string | null;
  error_message: string | null;
  internal_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentRunStepRecord {
  id: string;
  agent_run_id: string;
  agent_name: string;
  role: string;
  input_payload: Record<string, unknown> | null;
  output_payload: Record<string, unknown> | null;
  status: AgentRunStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export class WorkflowService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getAdminSupabaseClient();
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

  // ==================== Agent Runs 操作 ====================

  /**
   * 创建 Agent Run 记录
   */
  async createAgentRun(params: {
    clientId?: string;
    industryId?: string;
    taskType: string;
    inputSummary?: string;
    internalOnly?: boolean;
  }): Promise<string> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .insert({
        client_id: params.clientId || null,
        industry_id: params.industryId || null,
        task_type: params.taskType,
        status: 'pending',
        input_summary: params.inputSummary || null,
        output_summary: null,
        error_message: null,
        internal_only: params.internalOnly ?? true,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create agent run: ${error.message}`);
    }

    return data.id;
  }

  /**
   * 更新 Agent Run 状态
   */
  async updateAgentRunStatus(
    id: string,
    status: AgentRunStatus,
    errorMessage?: string
  ): Promise<void> {
    const updateData: {
      status: AgentRunStatus;
      error_message?: string;
      updated_at: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await this.supabase
      .from('agent_runs')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update agent run status: ${error.message}`);
    }
  }

  /**
   * 更新 Agent Run 输出摘要
   */
  async updateAgentRunOutput(
    id: string,
    outputSummary: string,
    status: AgentRunStatus = 'completed'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('agent_runs')
      .update({
        output_summary: outputSummary,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update agent run output: ${error.message}`);
    }
  }

  /**
   * 获取 Agent Run 记录
   */
  async getAgentRun(id: string): Promise<AgentRunRecord | null> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get agent run: ${error.message}`);
    }

    return data as AgentRunRecord;
  }

  /**
   * 列出 Agent Runs（支持分页和过滤）
   */
  async listAgentRuns(params: {
    clientId?: string;
    status?: AgentRunStatus;
    limit?: number;
    offset?: number;
  }): Promise<AgentRunRecord[]> {
    let query = this.supabase
      .from('agent_runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.clientId) {
      query = query.eq('client_id', params.clientId);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const limit = params.limit || 10;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list agent runs: ${error.message}`);
    }

    return (data as AgentRunRecord[]) || [];
  }

  // ==================== Agent Run Steps 操作 ====================

  /**
   * 创建 Agent Run Step 记录
   */
  async createAgentRunStep(params: {
    agentRunId: string;
    agentName: string;
    role: string;
    inputPayload?: Record<string, unknown>;
  }): Promise<string> {
    const { data, error } = await this.supabase
      .from('agent_run_steps')
      .insert({
        agent_run_id: params.agentRunId,
        agent_name: params.agentName,
        role: params.role,
        input_payload: params.inputPayload || null,
        output_payload: null,
        status: 'pending',
        error_message: null,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create agent run step: ${error.message}`);
    }

    return data.id;
  }

  /**
   * 更新 Agent Run Step 状态
   */
  async updateAgentRunStepStatus(
    id: string,
    status: AgentRunStatus,
    errorMessage?: string
  ): Promise<void> {
    const updateData: {
      status: AgentRunStatus;
      error_message?: string;
      updated_at: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await this.supabase
      .from('agent_run_steps')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update agent run step status: ${error.message}`);
    }
  }

  /**
   * 更新 Agent Run Step 输出
   */
  async updateAgentRunStepOutput(
    id: string,
    outputPayload: Record<string, unknown>,
    status: AgentRunStatus = 'completed'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('agent_run_steps')
      .update({
        output_payload: outputPayload,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update agent run step output: ${error.message}`);
    }
  }

  /**
   * 获取 Agent Run Step 记录
   */
  async getAgentRunStep(id: string): Promise<AgentRunStepRecord | null> {
    const { data, error } = await this.supabase
      .from('agent_run_steps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get agent run step: ${error.message}`);
    }

    return data as AgentRunStepRecord;
  }

  /**
   * 列出某个 Agent Run 的所有步骤
   */
  async listAgentRunSteps(agentRunId: string): Promise<AgentRunStepRecord[]> {
    const { data, error } = await this.supabase
      .from('agent_run_steps')
      .select('*')
      .eq('agent_run_id', agentRunId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to list agent run steps: ${error.message}`);
    }

    return (data as AgentRunStepRecord[]) || [];
  }
}

/**
 * 创建 WorkflowService 实例
 */
export function createWorkflowService(): WorkflowService {
  return new WorkflowService();
}
