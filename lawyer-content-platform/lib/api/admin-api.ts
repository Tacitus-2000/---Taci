/**
 * Admin API - 管理端 API 封装
 * 提供管理端页面所需的所有 API 方法
 */

import { apiClient } from './client';
import type {
  ClientResponse,
  ClientListResponse,
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientProfileResponse,
  ClientProfileListResponse,
  ClientProfileCreateRequest,
  ClientProfileUpdateRequest,
  TopicResponse,
  TopicListResponse,
  TopicCreateRequest,
  TopicUpdateRequest,
  ScriptResponse,
  ScriptListResponse,
  ScriptCreateRequest,
  ScriptUpdateRequest,
  AgentRunResponse,
  AgentRunListResponse,
  AgentRunQueryParams,
  PaginationParams,
  PromptResponse,
  PromptListResponse,
  PromptCreateRequest,
  PromptUpdateRequest,
} from '@/types/admin';

/**
 * 管理端 API 类
 */
export class AdminApi {
  /**
   * ========================================
   * Clients API
   * ========================================
   */

  /**
   * 获取客户列表
   */
  async getClients(params?: PaginationParams): Promise<ClientListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/admin/clients${query ? `?${query}` : ''}`;

    return apiClient.get<ClientListResponse>(endpoint);
  }

  /**
   * 获取单个客户
   */
  async getClient(clientId: string): Promise<ClientResponse> {
    return apiClient.get<ClientResponse>(`/admin/clients/${clientId}`);
  }

  /**
   * 创建客户
   */
  async createClient(data: ClientCreateRequest): Promise<ClientResponse> {
    return apiClient.post<ClientResponse>('/admin/clients', data);
  }

  /**
   * 更新客户
   */
  async updateClient(
    clientId: string,
    data: ClientUpdateRequest
  ): Promise<ClientResponse> {
    return apiClient.put<ClientResponse>(`/admin/clients/${clientId}`, data);
  }

  /**
   * 删除客户
   */
  async deleteClient(clientId: string): Promise<void> {
    return apiClient.delete(`/admin/clients/${clientId}`);
  }

  /**
   * ========================================
   * Client Profiles API
   * ========================================
   */

  /**
   * 获取客户档案列表
   */
  async getClientProfiles(
    params?: PaginationParams
  ): Promise<ClientProfileListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/admin/client-profiles${query ? `?${query}` : ''}`;

    return apiClient.get<ClientProfileListResponse>(endpoint);
  }

  /**
   * 获取单个客户档案
   */
  async getClientProfile(profileId: string): Promise<ClientProfileResponse> {
    return apiClient.get<ClientProfileResponse>(
      `/admin/client-profiles/${profileId}`
    );
  }

  /**
   * 创建客户档案
   */
  async createClientProfile(
    data: ClientProfileCreateRequest
  ): Promise<ClientProfileResponse> {
    return apiClient.post<ClientProfileResponse>(
      '/admin/client-profiles',
      data
    );
  }

  /**
   * 更新客户档案
   */
  async updateClientProfile(
    profileId: string,
    data: ClientProfileUpdateRequest
  ): Promise<ClientProfileResponse> {
    return apiClient.put<ClientProfileResponse>(
      `/admin/client-profiles/${profileId}`,
      data
    );
  }

  /**
   * 删除客户档案
   */
  async deleteClientProfile(profileId: string): Promise<void> {
    return apiClient.delete(`/admin/client-profiles/${profileId}`);
  }

  /**
   * ========================================
   * Topics API
   * ========================================
   */

  /**
   * 获取选题列表
   */
  async getTopics(params?: PaginationParams): Promise<TopicListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/admin/topics${query ? `?${query}` : ''}`;

    return apiClient.get<TopicListResponse>(endpoint);
  }

  /**
   * 获取单个选题
   */
  async getTopic(topicId: string): Promise<TopicResponse> {
    return apiClient.get<TopicResponse>(`/admin/topics/${topicId}`);
  }

  /**
   * 创建选题
   */
  async createTopic(data: TopicCreateRequest): Promise<TopicResponse> {
    return apiClient.post<TopicResponse>('/admin/topics', data);
  }

  /**
   * 更新选题
   */
  async updateTopic(
    topicId: string,
    data: TopicUpdateRequest
  ): Promise<TopicResponse> {
    return apiClient.put<TopicResponse>(`/admin/topics/${topicId}`, data);
  }

  /**
   * 删除选题
   */
  async deleteTopic(topicId: string): Promise<void> {
    return apiClient.delete(`/admin/topics/${topicId}`);
  }

  /**
   * ========================================
   * Scripts API
   * ========================================
   */

  /**
   * 获取文案列表
   */
  async getScripts(params?: PaginationParams): Promise<ScriptListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/admin/scripts${query ? `?${query}` : ''}`;

    return apiClient.get<ScriptListResponse>(endpoint);
  }

  /**
   * 获取单个文案
   */
  async getScript(scriptId: string): Promise<ScriptResponse> {
    return apiClient.get<ScriptResponse>(`/admin/scripts/${scriptId}`);
  }

  /**
   * 创建文案
   */
  async createScript(data: ScriptCreateRequest): Promise<ScriptResponse> {
    return apiClient.post<ScriptResponse>('/admin/scripts', data);
  }

  /**
   * 更新文案
   */
  async updateScript(
    scriptId: string,
    data: ScriptUpdateRequest
  ): Promise<ScriptResponse> {
    return apiClient.put<ScriptResponse>(`/admin/scripts/${scriptId}`, data);
  }

  /**
   * 删除文案
   */
  async deleteScript(scriptId: string): Promise<void> {
    return apiClient.delete(`/admin/scripts/${scriptId}`);
  }

  /**
   * ========================================
   * Agent Runs API（只读）
   * ========================================
   */

  /**
   * 获取 Agent 运行记录列表
   */
  async getAgentRuns(
    params?: AgentRunQueryParams
  ): Promise<AgentRunListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.client_id)
      queryParams.append('client_id', params.client_id);
    if (params?.industry_id)
      queryParams.append('industry_id', params.industry_id);
    if (params?.task_type)
      queryParams.append('task_type', params.task_type);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const endpoint = `/admin/agent-runs${query ? `?${query}` : ''}`;

    return apiClient.get<AgentRunListResponse>(endpoint);
  }

  /**
   * 获取单个 Agent 运行记录（包含步骤）
   */
  async getAgentRun(runId: string): Promise<AgentRunResponse> {
    return apiClient.get<AgentRunResponse>(`/admin/agent-runs/${runId}`);
  }

  /**
   * ========================================
   * Prompts API
   * ========================================
   */

  /**
   * 获取提示词列表
   */
  async getPrompts(params?: PaginationParams): Promise<PromptListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/admin/prompts${query ? `?${query}` : ''}`;

    return apiClient.get<PromptListResponse>(endpoint);
  }

  /**
   * 获取单个提示词
   */
  async getPrompt(id: string): Promise<PromptResponse> {
    return apiClient.get<PromptResponse>(`/admin/prompts/${id}`);
  }

  /**
   * 创建提示词
   */
  async createPrompt(data: PromptCreateRequest): Promise<PromptResponse> {
    return apiClient.post<PromptResponse>('/admin/prompts', data);
  }

  /**
   * 更新提示词
   */
  async updatePrompt(
    id: string,
    data: PromptUpdateRequest
  ): Promise<PromptResponse> {
    return apiClient.put<PromptResponse>(`/admin/prompts/${id}`, data);
  }

  /**
   * 删除提示词
   */
  async deletePrompt(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/prompts/${id}`);
  }
}

// 导出单例
export const adminApi = new AdminApi();
