/**
 * Client API 数据过滤工具
 * 确保只返回客户可见的数据，排除敏感字段
 */

import type {
  ClientProfile,
  Topic,
  Script,
} from '@/types/database';
import type {
  ClientProfilePublic,
  TopicPublic,
  ScriptPublic,
} from '@/types/client';

/**
 * 过滤客户档案，排除 internal_notes
 */
export function filterClientProfile(profile: ClientProfile): ClientProfilePublic {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { internal_notes, ...publicProfile } = profile;
  return publicProfile;
}

/**
 * 过滤选题，只返回客户可见字段
 */
export function filterTopic(topic: Topic): TopicPublic {
  return {
    id: topic.id,
    client_id: topic.client_id,
    industry_id: topic.industry_id,
    title: topic.title,
    direction: topic.direction,
    status: topic.status,
    created_at: topic.created_at,
    updated_at: topic.updated_at,
  };
}

/**
 * 过滤文案，只返回客户可见字段
 */
export function filterScript(script: Script): ScriptPublic {
  return {
    id: script.id,
    client_id: script.client_id,
    topic_id: script.topic_id,
    title: script.title,
    body: script.body,
    usage_advice: script.usage_advice,
    status: script.status,
    created_at: script.created_at,
    updated_at: script.updated_at,
  };
}

/**
 * 批量过滤客户档案
 */
export function filterClientProfiles(profiles: ClientProfile[]): ClientProfilePublic[] {
  return profiles.map(filterClientProfile);
}

/**
 * 批量过滤选题
 */
export function filterTopics(topics: Topic[]): TopicPublic[] {
  return topics.map(filterTopic);
}

/**
 * 批量过滤文案
 */
export function filterScripts(scripts: Script[]): ScriptPublic[] {
  return scripts.map(filterScript);
}

/**
 * 验证数据是否对客户可见
 * 检查 visible_to_client 和 internal_only 标志
 */
export function isVisibleToClient(
  data: { visible_to_client?: boolean; internal_only?: boolean }
): boolean {
  // 如果 internal_only = true，则不可见
  if (data.internal_only === true) {
    return false;
  }

  // 如果 visible_to_client = false，则不可见
  if (data.visible_to_client === false) {
    return false;
  }

  // 默认可见
  return true;
}

/**
 * 过滤数组，只保留客户可见的项
 */
export function filterVisibleItems<T extends { visible_to_client?: boolean; internal_only?: boolean }>(
  items: T[]
): T[] {
  return items.filter(isVisibleToClient);
}
