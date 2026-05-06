/**
 * Anthropic Claude AI Client 实现
 * 使用 @anthropic-ai/sdk 与 Claude API 交互
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIClient, ChatMessage, ChatOptions, ChatResponse } from './client';

/**
 * Anthropic Claude Client 实现
 */
export class AnthropicAIClient implements AIClient {
  private client: Anthropic;
  private model: string;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config?: {
    apiKey?: string;
    baseURL?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    // 从环境变量或配置中获取 API Key
    const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;
    const baseURL = config?.baseURL || process.env.ANTHROPIC_BASE_URL;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.client = new Anthropic({
      apiKey,
      baseURL,
      defaultHeaders: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    this.model = config?.model || process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022';
    this.defaultTemperature = config?.temperature || parseFloat(process.env.LLM_TEMPERATURE || '0.7');
    this.defaultMaxTokens = config?.maxTokens || parseInt(process.env.LLM_MAX_TOKENS || '4096');
  }

  /**
   * 发送聊天请求到 Claude API
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    try {
      // 将消息格式转换为 Anthropic 格式
      const anthropicMessages = this.convertMessages(messages);

      // 提取 system 消息
      const systemMessage = messages.find(m => m.role === 'system')?.content;

      // 调用 Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || this.defaultMaxTokens,
        temperature: options?.temperature || this.defaultTemperature,
        system: systemMessage,
        messages: anthropicMessages,
      });

      // 提取文本内容
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as { type: 'text'; text: string }).text)
        .join('\n');

      return {
        content,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Failed to call Anthropic API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 转换消息格式
   * 将通用格式转换为 Anthropic 格式
   */
  private convertMessages(messages: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    // 过滤掉 system 消息（已在 API 调用中单独处理）
    return messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }

  /**
   * 获取客户端名称
   */
  getName(): string {
    return `Anthropic Claude (${this.model})`;
  }

  /**
   * 检查客户端是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      // 发送一个简单的测试请求
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Anthropic client availability check failed:', error);
      return false;
    }
  }
}

/**
 * 创建 Anthropic AI Client 实例
 */
export function createAnthropicAIClient(config?: {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): AIClient {
  return new AnthropicAIClient(config);
}
