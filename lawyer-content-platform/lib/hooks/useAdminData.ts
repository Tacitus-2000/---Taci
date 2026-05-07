/**
 * useAdminData Hooks
 * React Query Hooks for Admin API
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin-api';
import type {
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientProfileCreateRequest,
  ClientProfileUpdateRequest,
  TopicCreateRequest,
  TopicUpdateRequest,
  ScriptCreateRequest,
  ScriptUpdateRequest,
  PaginationParams,
  AgentRunQueryParams,
  PromptCreateRequest,
  PromptUpdateRequest,
} from '@/types/admin';
import { useToast } from './useToast';

/**
 * Query Keys
 */
export const adminQueryKeys = {
  all: ['admin'] as const,
  clients: (params?: PaginationParams) =>
    [...adminQueryKeys.all, 'clients', params] as const,
  client: (clientId: string) =>
    [...adminQueryKeys.all, 'client', clientId] as const,
  clientProfiles: (params?: PaginationParams) =>
    [...adminQueryKeys.all, 'clientProfiles', params] as const,
  clientProfile: (profileId: string) =>
    [...adminQueryKeys.all, 'clientProfile', profileId] as const,
  topics: (params?: PaginationParams) =>
    [...adminQueryKeys.all, 'topics', params] as const,
  topic: (topicId: string) =>
    [...adminQueryKeys.all, 'topic', topicId] as const,
  scripts: (params?: PaginationParams) =>
    [...adminQueryKeys.all, 'scripts', params] as const,
  script: (scriptId: string) =>
    [...adminQueryKeys.all, 'script', scriptId] as const,
  agentRuns: (params?: AgentRunQueryParams) =>
    [...adminQueryKeys.all, 'agentRuns', params] as const,
  agentRun: (runId: string) =>
    [...adminQueryKeys.all, 'agentRun', runId] as const,
  prompts: (params?: PaginationParams) =>
    [...adminQueryKeys.all, 'prompts', params] as const,
  prompt: (promptId: string) =>
    [...adminQueryKeys.all, 'prompt', promptId] as const,
};

/**
 * ========================================
 * Clients Hooks
 * ========================================
 */

/**
 * 获取客户列表
 */
export function useClients(params?: PaginationParams) {
  return useQuery({
    queryKey: adminQueryKeys.clients(params),
    queryFn: () => adminApi.getClients(params),
  });
}

/**
 * 获取单个客户
 */
export function useClient(clientId: string) {
  return useQuery({
    queryKey: adminQueryKeys.client(clientId),
    queryFn: () => adminApi.getClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * 创建客户
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ClientCreateRequest) => adminApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clients() });
      success('客户创建成功');
    },
    onError: (err: Error) => {
      error('客户创建失败', err.message);
    },
  });
}

/**
 * 更新客户
 */
export function useUpdateClient(clientId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ClientUpdateRequest) =>
      adminApi.updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.client(clientId) });
      success('客户更新成功');
    },
    onError: (err: Error) => {
      error('客户更新失败', err.message);
    },
  });
}

/**
 * 删除客户
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (clientId: string) => adminApi.deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clients() });
      success('客户删除成功');
    },
    onError: (err: Error) => {
      error('客户删除失败', err.message);
    },
  });
}

/**
 * ========================================
 * Client Profiles Hooks
 * ========================================
 */

/**
 * 获取客户档案列表
 */
export function useClientProfiles(params?: PaginationParams) {
  return useQuery({
    queryKey: adminQueryKeys.clientProfiles(params),
    queryFn: () => adminApi.getClientProfiles(params),
  });
}

/**
 * 获取单个客户档案
 */
export function useClientProfile(profileId: string) {
  return useQuery({
    queryKey: adminQueryKeys.clientProfile(profileId),
    queryFn: () => adminApi.getClientProfile(profileId),
    enabled: !!profileId,
  });
}

/**
 * 创建客户档案
 */
export function useCreateClientProfile() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ClientProfileCreateRequest) =>
      adminApi.createClientProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clientProfiles() });
      success('客户档案创建成功');
    },
    onError: (err: Error) => {
      error('客户档案创建失败', err.message);
    },
  });
}

/**
 * 更新客户档案
 */
export function useUpdateClientProfile(profileId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ClientProfileUpdateRequest) =>
      adminApi.updateClientProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clientProfiles() });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.clientProfile(profileId),
      });
      success('客户档案更新成功');
    },
    onError: (err: Error) => {
      error('客户档案更新失败', err.message);
    },
  });
}

/**
 * 删除客户档案
 */
export function useDeleteClientProfile() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (profileId: string) => adminApi.deleteClientProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clientProfiles() });
      success('客户档案删除成功');
    },
    onError: (err: Error) => {
      error('客户档案删除失败', err.message);
    },
  });
}

/**
 * ========================================
 * Topics Hooks
 * ========================================
 */

/**
 * 获取选题列表
 */
export function useAdminTopics(params?: PaginationParams) {
  return useQuery({
    queryKey: adminQueryKeys.topics(params),
    queryFn: () => adminApi.getTopics(params),
  });
}

/**
 * 获取单个选题
 */
export function useAdminTopic(topicId: string) {
  return useQuery({
    queryKey: adminQueryKeys.topic(topicId),
    queryFn: () => adminApi.getTopic(topicId),
    enabled: !!topicId,
  });
}

/**
 * 创建选题
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: TopicCreateRequest) => adminApi.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.topics() });
      success('选题创建成功');
    },
    onError: (err: Error) => {
      error('选题创建失败', err.message);
    },
  });
}

/**
 * 更新选题
 */
export function useUpdateTopic(topicId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: TopicUpdateRequest) =>
      adminApi.updateTopic(topicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.topics() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.topic(topicId) });
      success('选题更新成功');
    },
    onError: (err: Error) => {
      error('选题更新失败', err.message);
    },
  });
}

/**
 * 删除选题
 */
export function useDeleteTopic() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (topicId: string) => adminApi.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.topics() });
      success('选题删除成功');
    },
    onError: (err: Error) => {
      error('选题删除失败', err.message);
    },
  });
}

/**
 * ========================================
 * Scripts Hooks
 * ========================================
 */

/**
 * 获取文案列表
 */
export function useAdminScripts(params?: PaginationParams) {
  return useQuery({
    queryKey: adminQueryKeys.scripts(params),
    queryFn: () => adminApi.getScripts(params),
  });
}

/**
 * 获取单个文案
 */
export function useAdminScript(scriptId: string) {
  return useQuery({
    queryKey: adminQueryKeys.script(scriptId),
    queryFn: () => adminApi.getScript(scriptId),
    enabled: !!scriptId,
  });
}

/**
 * 创建文案
 */
export function useCreateScript() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ScriptCreateRequest) => adminApi.createScript(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.scripts() });
      success('文案创建成功');
    },
    onError: (err: Error) => {
      error('文案创建失败', err.message);
    },
  });
}

/**
 * 更新文案
 */
export function useUpdateScript(scriptId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ScriptUpdateRequest) =>
      adminApi.updateScript(scriptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.scripts() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.script(scriptId) });
      success('文案更新成功');
    },
    onError: (err: Error) => {
      error('文案更新失败', err.message);
    },
  });
}

/**
 * 删除文案
 */
export function useDeleteScript() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (scriptId: string) => adminApi.deleteScript(scriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.scripts() });
      success('文案删除成功');
    },
    onError: (err: Error) => {
      error('文案删除失败', err.message);
    },
  });
}

/**
 * ========================================
 * Agent Runs Hooks（只读）
 * ========================================
 */

/**
 * 获取 Agent 运行记录列表
 */
export function useAgentRuns(params?: AgentRunQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.agentRuns(params),
    queryFn: () => adminApi.getAgentRuns(params),
  });
}

/**
 * 获取单个 Agent 运行记录（包含步骤）
 */
export function useAgentRun(runId: string) {
  return useQuery({
    queryKey: adminQueryKeys.agentRun(runId),
    queryFn: () => adminApi.getAgentRun(runId),
    enabled: !!runId,
  });
}

/**
 * ========================================
 * Prompts Hooks
 * ========================================
 */

/**
 * 获取提示词列表
 */
export function usePrompts(params?: PaginationParams) {
  return useQuery({
    queryKey: adminQueryKeys.prompts(params),
    queryFn: () => adminApi.getPrompts(params),
  });
}

/**
 * 获取单个提示词
 */
export function usePrompt(promptId: string) {
  return useQuery({
    queryKey: adminQueryKeys.prompt(promptId),
    queryFn: () => adminApi.getPrompt(promptId),
    enabled: !!promptId,
  });
}

/**
 * 创建提示词
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: PromptCreateRequest) => adminApi.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.prompts() });
      success('提示词创建成功');
    },
    onError: (err: Error) => {
      error('提示词创建失败', err.message);
    },
  });
}

/**
 * 更新提示词
 */
export function useUpdatePrompt(promptId: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: PromptUpdateRequest) =>
      adminApi.updatePrompt(promptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.prompts() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.prompt(promptId) });
      success('提示词更新成功');
    },
    onError: (err: Error) => {
      error('提示词更新失败', err.message);
    },
  });
}

/**
 * 删除提示词
 */
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (promptId: string) => adminApi.deletePrompt(promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.prompts() });
      success('提示词删除成功');
    },
    onError: (err: Error) => {
      error('提示词删除失败', err.message);
    },
  });
}
