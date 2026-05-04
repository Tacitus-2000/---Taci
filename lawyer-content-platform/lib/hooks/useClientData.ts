/**
 * useClientData Hooks
 * React Query Hooks for Client API
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api/client-api';
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
import { useToast } from './useToast';

/**
 * Query Keys
 */
export const clientQueryKeys = {
  all: ['client'] as const,
  profile: (clientId: string) => [...clientQueryKeys.all, 'profile', clientId] as const,
  topics: (clientId: string, params?: Record<string, unknown>) =>
    [...clientQueryKeys.all, 'topics', clientId, params] as const,
  topic: (clientId: string, topicId: string) =>
    [...clientQueryKeys.all, 'topic', clientId, topicId] as const,
  scripts: (clientId: string, params?: Record<string, unknown>) =>
    [...clientQueryKeys.all, 'scripts', clientId, params] as const,
  script: (clientId: string, scriptId: string) =>
    [...clientQueryKeys.all, 'script', clientId, scriptId] as const,
  calendar: (clientId: string, params?: Record<string, unknown>) =>
    [...clientQueryKeys.all, 'calendar', clientId, params] as const,
  styleReferences: (clientId: string) =>
    [...clientQueryKeys.all, 'styleReferences', clientId] as const,
  feedback: (clientId: string, params?: Record<string, unknown>) =>
    [...clientQueryKeys.all, 'feedback', clientId, params] as const,
};

/**
 * 获取客户档案
 */
export function useClientProfile(clientId: string) {
  return useQuery({
    queryKey: clientQueryKeys.profile(clientId),
    queryFn: () => clientApi.getProfile(clientId),
    enabled: !!clientId,
  });
}

/**
 * 更新客户档案
 */
export function useUpdateClientProfile(clientId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: Partial<ClientProfilePublic>) =>
      clientApi.updateProfile(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.profile(clientId) });
      success('档案更新成功');
    },
    onError: (err: Error) => {
      error('档案更新失败', err.message);
    },
  });
}

/**
 * 获取选题列表
 */
export function useTopics(
  clientId: string,
  params?: {
    status?: 'draft' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: clientQueryKeys.topics(clientId, params),
    queryFn: () => clientApi.getTopics(clientId, params),
    enabled: !!clientId,
  });
}

/**
 * 获取单个选题
 */
export function useTopic(clientId: string, topicId: string) {
  return useQuery({
    queryKey: clientQueryKeys.topic(clientId, topicId),
    queryFn: () => clientApi.getTopic(clientId, topicId),
    enabled: !!clientId && !!topicId,
  });
}

/**
 * 获取文案列表
 */
export function useScripts(
  clientId: string,
  params?: {
    status?: 'draft' | 'reviewed' | 'approved' | 'published';
    topic_id?: string;
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: clientQueryKeys.scripts(clientId, params),
    queryFn: () => clientApi.getScripts(clientId, params),
    enabled: !!clientId,
  });
}

/**
 * 获取单个文案
 */
export function useScript(clientId: string, scriptId: string) {
  return useQuery({
    queryKey: clientQueryKeys.script(clientId, scriptId),
    queryFn: () => clientApi.getScript(clientId, scriptId),
    enabled: !!clientId && !!scriptId,
  });
}

/**
 * 获取内容日历
 */
export function useCalendar(
  clientId: string,
  params?: {
    start_date?: string;
    end_date?: string;
  }
) {
  return useQuery({
    queryKey: clientQueryKeys.calendar(clientId, params),
    queryFn: () => clientApi.getCalendar(clientId, params),
    enabled: !!clientId,
  });
}

/**
 * 获取风格参考
 */
export function useStyleReferences(clientId: string) {
  return useQuery({
    queryKey: clientQueryKeys.styleReferences(clientId),
    queryFn: () => clientApi.getStyleReferences(clientId),
    enabled: !!clientId,
  });
}

/**
 * 提交反馈
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ClientFeedbackRequest) => clientApi.submitFeedback(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.feedback(variables.client_id),
      });
      success('反馈提交成功');
    },
    onError: (err: Error) => {
      error('反馈提交失败', err.message);
    },
  });
}

/**
 * 生成文案
 */
export function useGenerateScript() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: GenerateScriptRequest) => clientApi.generateScript(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientQueryKeys.scripts(variables.client_id),
      });
      success('文案生成成功');
    },
    onError: (err: Error) => {
      error('文案生成失败', err.message);
    },
  });
}

/**
 * 获取反馈历史
 */
export function useFeedbackHistory(
  clientId: string,
  params?: {
    content_type?: 'profile' | 'topic' | 'script' | 'general';
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: clientQueryKeys.feedback(clientId, params),
    queryFn: () => clientApi.getFeedbackHistory(clientId, params),
    enabled: !!clientId,
  });
}
