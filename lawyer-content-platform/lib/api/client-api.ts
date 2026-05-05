/**
 * Client API - 客户端 API 封装
 * 提供客户端页面所需的所有 API 方法
 */

import { apiClient } from './client';
import type {
  ClientProfilePublic,
  TopicPublic,
  ScriptPublic,
  CalendarResponse,
  StyleReferenceResponse,
  ClientFeedbackRequest,
  ClientFeedbackResponse,
  GenerateScriptRequest,
  GenerateScriptResponse,
} from '@/types/client';

/**
 * 客户端 API 类
 */
export class ClientApi {
  /**
   * 获取客户档案
   */
  async getProfile(clientId: string): Promise<ClientProfilePublic> {
    return apiClient.get<ClientProfilePublic>(`/client/profile?client_id=${clientId}`);
  }

  /**
   * 更新客户档案
   */
  async updateProfile(
    clientId: string,
    data: Partial<ClientProfilePublic>
  ): Promise<ClientProfilePublic> {
    return apiClient.put<ClientProfilePublic>(
      `/client/profile?client_id=${clientId}`,
      data
    );
  }

  /**
   * 获取选题列表
   */
  async getTopics(
    clientId: string,
    params?: {
      status?: 'draft' | 'approved' | 'rejected';
      limit?: number;
      offset?: number;
    }
  ): Promise<TopicPublic[]> {
    const queryParams = new URLSearchParams({ client_id: clientId });
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/client/topics?${queryParams.toString()}`;

    const response = await apiClient.get<{ data: TopicPublic[]; meta: any }>(endpoint);
    return response.data;
  }

  /**
   * 获取单个选题
   */
  async getTopic(clientId: string, topicId: string): Promise<TopicPublic> {
    return apiClient.get<TopicPublic>(
      `/client/topics/${topicId}?client_id=${clientId}`
    );
  }

  /**
   * 获取文案列表
   */
  async getScripts(
    clientId: string,
    params?: {
      status?: 'draft' | 'reviewed' | 'approved' | 'published';
      topic_id?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ScriptPublic[]> {
    const queryParams = new URLSearchParams({ client_id: clientId });
    if (params?.status) queryParams.append('status', params.status);
    if (params?.topic_id) queryParams.append('topic_id', params.topic_id);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/client/scripts?${queryParams.toString()}`;

    const response = await apiClient.get<{ data: ScriptPublic[]; meta: any }>(endpoint);
    return response.data;
  }

  /**
   * 获取单个文案
   */
  async getScript(clientId: string, scriptId: string): Promise<ScriptPublic> {
    const response = await apiClient.get<{ data: ScriptPublic; meta?: any }>(
      `/client/scripts/${scriptId}?client_id=${clientId}`
    );
    return response.data;
  }

  /**
   * 获取内容日历
   */
  async getCalendar(
    clientId: string,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<CalendarResponse> {
    const queryParams = new URLSearchParams({ client_id: clientId });
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/client/calendar?${queryParams.toString()}`;

    // 修复：apiClient.get 已经解包了第一层，直接返回即可
    return apiClient.get<CalendarResponse>(endpoint);
  }

  /**
   * 获取风格参考
   */
  async getStyleReferences(
    clientId: string
  ): Promise<StyleReferenceResponse> {
    // 修复：apiClient.get 已经解包了第一层，直接返回即可
    return apiClient.get<StyleReferenceResponse>(
      `/client/style-reference?client_id=${clientId}`
    );
  }

  /**
   * 提交反馈
   */
  async submitFeedback(
    data: ClientFeedbackRequest
  ): Promise<ClientFeedbackResponse> {
    return apiClient.post<ClientFeedbackResponse>(
      `/client/feedback?client_id=${data.client_id}`,
      data
    );
  }

  /**
   * 生成文案
   */
  async generateScript(
    data: GenerateScriptRequest
  ): Promise<GenerateScriptResponse> {
    return apiClient.post<GenerateScriptResponse>(
      `/client/generate?client_id=${data.client_id}`,
      data
    );
  }

  /**
   * 获取反馈历史
   */
  async getFeedbackHistory(
    clientId: string,
    params?: {
      content_type?: 'profile' | 'topic' | 'script' | 'general';
      limit?: number;
      offset?: number;
    }
  ): Promise<ClientFeedbackResponse[]> {
    const queryParams = new URLSearchParams({ client_id: clientId });
    if (params?.content_type)
      queryParams.append('content_type', params.content_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/client/feedback?${queryParams.toString()}`;

    const response = await apiClient.get<{ data: ClientFeedbackResponse[]; meta: any }>(endpoint);
    return response.data;
  }
}

// 导出单例
export const clientApi = new ClientApi();
