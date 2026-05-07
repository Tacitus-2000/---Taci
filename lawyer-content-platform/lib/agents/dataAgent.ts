/**
 * 数据采集 Agent
 * 负责收集客户和行业数据
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';
import { getSupabaseAdmin } from '../supabase/admin';
import type { ClientProfile, IndustryTemplate } from '@/types/database';

/**
 * 数据采集 Agent 类
 *
 * 职责：
 * - 从数据库加载行业模板数据
 * - 从数据库加载客户档案数据
 * - 验证数据完整性
 * - 记录日志到 state.logs
 */
export class DataAgent {
  /**
   * 执行数据采集
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push(`[DataAgent] 开始数据采集 - clientId: ${state.clientId}, industryId: ${state.industryId}`);

    try {
      // Mock: 模拟从数据库加载行业模板
      const industryTemplate = await this.loadIndustryTemplate(state.industryId);
      logs.push(`[DataAgent] 成功加载行业模板 - industryId: ${state.industryId}`);

      // Mock: 模拟从数据库加载客户档案
      const clientProfile = await this.loadClientProfile(state.clientId);
      logs.push(`[DataAgent] 成功加载客户档案 - clientId: ${state.clientId}`);

      // 验证数据完整性
      this.validateData(industryTemplate, clientProfile);
      logs.push('[DataAgent] 数据验证通过');

      logs.push('[DataAgent] 数据采集完成');

      return {
        industryTemplate,
        clientProfile,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[DataAgent] 数据采集失败: ${errorMessage}`);

      return {
        logs,
        error: `数据采集失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 从数据库加载行业模板
   *
   * @param industryId - 行业 ID
   * @returns 行业模板数据
   */
  private async loadIndustryTemplate(industryId: string): Promise<Record<string, unknown>> {
    const supabase = getSupabaseAdmin();

    try {
      // 如果 industryId 为空或无效，直接返回默认模板
      if (!industryId || industryId.trim() === '') {
        console.warn(`[DataAgent] industryId 为空，使用默认模板`);
        return this.getDefaultIndustryTemplate(industryId);
      }

      // 查询行业模板
      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('industry_id', industryId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // 如果没有找到行业模板，返回默认模板
        if (error.code === 'PGRST116') {
          console.warn(`[DataAgent] 未找到行业模板 (industryId: ${industryId})，使用默认模板`);
          return this.getDefaultIndustryTemplate(industryId);
        }
        throw new Error(`查询行业模板失败: ${error.message}`);
      }

      if (!data) {
        console.warn(`[DataAgent] 行业模板为空 (industryId: ${industryId})，使用默认模板`);
        return this.getDefaultIndustryTemplate(industryId);
      }

      // 转换数据库记录为 Agent 使用的格式（agentStateSchema.IndustryTemplate）
      return {
        id: data.id,
        industry: data.template_name || '通用行业',
        contentGuidelines: {
          tone: data.review_rules?.[0]?.tone || '专业',
          style: data.review_rules?.[0]?.style || '正式',
          avoidTopics: data.risk_rules?.map((rule: any) => rule.keyword) || [],
        },
        platformSettings: {
          preferredPlatforms: ['微信公众号'],
          contentLength: {
            short: '500-800字',
            medium: '1000-1500字',
            long: '2000-3000字',
          },
        },
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`加载行业模板失败: ${errorMessage}`);
    }
  }

  /**
   * 获取默认行业模板（当数据库中没有时使用）
   *
   * @param industryId - 行业 ID
   * @returns 默认行业模板数据
   */
  private getDefaultIndustryTemplate(industryId: string): Record<string, unknown> {
    const now = new Date().toISOString();
    return {
      id: industryId,
      industry: '默认行业',
      contentGuidelines: {
        tone: '专业',
        style: '正式',
        avoidTopics: [],
      },
      platformSettings: {
        preferredPlatforms: ['微信公众号'],
        contentLength: {
          short: '500-800字',
          medium: '1000-1500字',
          long: '2000-3000字',
        },
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 从数据库加载客户档案
   *
   * @param clientId - 客户 ID
   * @returns 客户档案数据
   */
  private async loadClientProfile(clientId: string): Promise<Record<string, unknown>> {
    const supabase = getSupabaseAdmin();

    try {
      // 查询客户档案
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error(`未找到客户档案 (clientId: ${clientId})`);
        }
        throw new Error(`查询客户档案失败: ${error.message}`);
      }

      if (!data) {
        throw new Error(`客户档案为空 (clientId: ${clientId})`);
      }

      // 转换数据库记录为 Agent 使用的格式（agentStateSchema.ClientProfile）
      return {
        id: data.id,
        clientId: data.client_id,
        name: data.client_name || '未命名客户',
        expertise: data.niche_direction ? data.niche_direction.split('、').map((s: string) => s.trim()) : [],
        experience: data.advantages || '暂无经验描述',
        targetAudience: data.target_customer || '未指定目标客户',
        contentPreferences: {
          topics: data.niche_direction ? data.niche_direction.split('、').map((s: string) => s.trim()) : [],
          platforms: ['微信公众号'],
        },
        previousContent: {
          totalPosts: 0,
          avgEngagement: 0,
          topPerformingTopics: [],
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`加载客户档案失败: ${errorMessage}`);
    }
  }

  /**
   * 验证数据完整性
   *
   * @param industryTemplate - 行业模板数据
   * @param clientProfile - 客户档案数据
   * @throws 如果数据不完整则抛出错误
   */
  private validateData(
    industryTemplate: Record<string, unknown>,
    clientProfile: Record<string, unknown>
  ): void {
    // 验证行业模板（使用 agentStateSchema.IndustryTemplate 字段）
    if (!industryTemplate || typeof industryTemplate !== 'object') {
      throw new Error('行业模板数据无效');
    }

    if (!industryTemplate.industry) {
      throw new Error('行业模板缺少 industry 字段');
    }

    // 验证客户档案（使用 agentStateSchema.ClientProfile 字段）
    if (!clientProfile || typeof clientProfile !== 'object') {
      throw new Error('客户档案数据无效');
    }

    if (!clientProfile.name) {
      throw new Error('客户档案缺少 name 字段');
    }

    if (!clientProfile.clientId) {
      throw new Error('客户档案缺少 clientId 字段');
    }

    // 验证关键业务字段
    const warnings: string[] = [];

    if (!clientProfile.targetAudience) {
      warnings.push('客户档案缺少目标受众信息 (targetAudience)');
    }

    if (!clientProfile.contentPreferences) {
      warnings.push('客户档案缺少内容偏好信息 (contentPreferences)');
    }

    if (!clientProfile.expertise || (Array.isArray(clientProfile.expertise) && clientProfile.expertise.length === 0)) {
      warnings.push('客户档案缺少专业领域信息 (expertise)');
    }

    // 输出警告（不阻止执行）
    if (warnings.length > 0) {
      console.warn(`[DataAgent] 数据验证警告:\n${warnings.map(w => `  - ${w}`).join('\n')}`);
    }
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'DataAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责收集客户和行业数据';
  }
}

/**
 * 创建数据采集 Agent 实例
 */
export function createDataAgent(): DataAgent {
  return new DataAgent();
}
