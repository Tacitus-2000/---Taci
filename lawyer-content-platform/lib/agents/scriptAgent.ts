/**
 * 文案生成 Agent
 * 负责根据选题生成文案草稿
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

/**
 * 文案生成 Agent 类
 *
 * 职责：
 * - 根据选题生成文案草稿
 * - 遵循行业模板的内容规范
 * - 适配客户的风格偏好
 * - 记录日志到 state.logs
 */
export class ScriptAgent {
  /**
   * 执行文案生成
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push('[ScriptAgent] 开始文案生成');

    try {
      // 验证前置条件
      if (!state.selectedTopic) {
        throw new Error('缺少选题数据');
      }

      if (!state.clientProfile) {
        throw new Error('缺少客户档案数据');
      }

      if (!state.industryTemplate) {
        throw new Error('缺少行业模板数据');
      }

      logs.push('[ScriptAgent] 前置条件验证通过');

      // Mock: 模拟 AI 生成文案
      const draftScript = await this.generateScript(state);
      logs.push(`[ScriptAgent] 生成文案草稿 - 标题: ${draftScript.title}`);
      logs.push(`[ScriptAgent] 文案长度: ${this.estimateLength(draftScript)} 字`);

      logs.push('[ScriptAgent] 文案生成完成');

      return {
        draftScript,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[ScriptAgent] 文案生成失败: ${errorMessage}`);

      return {
        logs,
        error: `文案生成失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 生成文案草稿（Mock 实现）
   *
   * @param state - 当前 Agent 状态
   * @returns 文案草稿
   */
  private async generateScript(state: AgentState): Promise<{
    title: string;
    hook?: string;
    body?: string;
    cta?: string;
    platform?: string;
    structure_type?: string;
    style_note?: string;
  }> {
    const topic = state.selectedTopic as Record<string, unknown>;
    const clientProfile = state.clientProfile as Record<string, unknown>;
    const industryTemplate = state.industryTemplate as Record<string, unknown>;

    const topicTitle = topic.title as string;
    const topicDescription = topic.description as string;
    const expertise = ((clientProfile.expertise as string[]) || ['法律咨询'])[0];
    const complianceRules = industryTemplate.complianceRules as Record<string, unknown>;
    const disclaimer = complianceRules?.requiredDisclaimer as string;

    // Mock 数据：模拟 AI 生成的文案
    return {
      title: topicTitle,
      hook: `你知道吗？在${expertise}领域，90%的企业都曾因为忽视这些细节而遭受损失。今天，我们就来聊聊如何避免这些常见误区。`,
      body: `${topicDescription}

## 一、常见误区解析

很多企业在处理${expertise}相关事务时，往往会陷入以下几个误区：

**误区一：认为口头约定也有法律效力**
虽然口头约定在某些情况下确实具有法律效力，但在实际操作中，缺乏书面证据往往导致维权困难。建议所有重要事项都应签订书面合同。

**误区二：忽视合同细节条款**
很多企业签合同时只关注价格和交付时间，却忽略了违约责任、争议解决等关键条款。这些"小细节"往往在纠纷发生时起到决定性作用。

**误区三：认为法律问题可以事后解决**
预防永远比补救更重要。等到问题发生再寻求法律帮助，往往已经错过了最佳处理时机，增加了解决成本。

## 二、风险防范建议

基于多年的执业经验，我总结了以下几点实用建议：

1. **建立完善的合同管理制度**：所有合同都应经过法务审核，重要合同建议咨询专业律师。

2. **保留完整的证据链**：包括合同、邮件、聊天记录、付款凭证等，这些都可能成为维权的关键证据。

3. **定期进行法律风险排查**：建议每季度进行一次全面的法律风险评估，及时发现和解决潜在问题。

4. **建立应急预案**：针对可能出现的法律纠纷，提前制定应对方案，避免临时抱佛脚。

## 三、实战案例分享

让我分享一个真实案例：某科技公司因为合同中缺少知识产权归属条款，导致核心技术被供应商主张权利，最终不得不支付高额赔偿。这个案例告诉我们，合同条款的完整性至关重要。

## 四、总结

${expertise}看似复杂，但只要掌握正确的方法，就能有效规避风险。记住这三个关键词：预防、规范、专业。`,
      cta: `如果你在${expertise}方面有任何疑问，欢迎在评论区留言，或者私信咨询。让我们一起守护企业的合法权益！

关注我，获取更多实用的法律知识和风险防范技巧。`,
      platform: '微信公众号',
      structure_type: '问题解析型',
      style_note: disclaimer || '本内容仅供参考，不构成正式法律意见',
    };
  }

  /**
   * 估算文案长度
   *
   * @param script - 文案草稿
   * @returns 估算字数
   */
  private estimateLength(script: {
    title: string;
    hook?: string;
    body?: string;
    cta?: string;
  }): number {
    const title = script.title || '';
    const hook = script.hook || '';
    const body = script.body || '';
    const cta = script.cta || '';

    return title.length + hook.length + body.length + cta.length;
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'ScriptAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责根据选题生成文案草稿';
  }
}

/**
 * 创建文案生成 Agent 实例
 */
export function createScriptAgent(): ScriptAgent {
  return new ScriptAgent();
}
