/**
 * 文案生成 Agent
 * 负责根据选题生成文案草稿
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';
import { createAIClient } from '../ai/client';
import { SCRIPT_SYSTEM_PROMPT, buildScriptPrompt } from '../ai/prompts/scriptPrompt';
import { fixChinesePunctuation } from '../utils/jsonFixer';

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
   * 生成文案草稿（使用 Claude API）
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
    const selectedTopic = state.selectedTopic as Record<string, any>;
    const clientProfile = state.clientProfile as Record<string, any>;
    const industryTemplate = state.industryTemplate as Record<string, any>;

    // 构建 Prompt
    const prompt = buildScriptPrompt(selectedTopic, clientProfile, industryTemplate);

    // 调用 Claude API
    const aiClient = createAIClient();
    const response = await aiClient.chat(
      [{ role: 'user', content: prompt }],
      { system: SCRIPT_SYSTEM_PROMPT }
    );

    // 解析 JSON 响应
    let scriptData: any;
    let jsonString = response.content;

    try {
      // 尝试直接解析
      scriptData = JSON.parse(jsonString);
    } catch (firstError) {
      // 尝试提取 ```json 代码块
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }

      try {
        // 再次尝试解析
        scriptData = JSON.parse(jsonString);
      } catch (secondError) {
        // 使用 JSON 修复工具
        console.log('[ScriptAgent] JSON 解析失败，尝试修复...');
        const fixedJson = fixChinesePunctuation(jsonString);
        try {
          scriptData = JSON.parse(fixedJson);
          console.log('[ScriptAgent] JSON 修复成功');
        } catch (thirdError) {
          console.error('[ScriptAgent] JSON 修复失败');
          console.error('原始响应长度:', response.content.length);
          console.error('原始响应前 500 字符:', response.content.substring(0, 500));
          throw new Error(`无法解析 AI 响应为 JSON 格式: ${thirdError instanceof Error ? thirdError.message : '未知错误'}`);
        }
      }
    }

    // 验证必需字段
    const requiredFields = ['title', 'hook', 'body', 'cta', 'platform', 'structure_type', 'style_note'];
    for (const field of requiredFields) {
      if (!scriptData[field]) {
        throw new Error(`生成的文案缺少必需字段: ${field}`);
      }
    }

    return scriptData;
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
