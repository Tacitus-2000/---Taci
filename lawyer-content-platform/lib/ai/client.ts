/**
 * AI Client 接口定义
 * 定义与 AI 模型交互的标准接口
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  system?: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

/**
 * AI Client 接口
 * 所有 AI 客户端实现都应该实现这个接口
 */
export interface AIClient {
  /**
   * 发送聊天请求
   * @param messages - 消息列表
   * @param options - 可选配置
   * @returns AI 响应
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;

  /**
   * 获取客户端名称
   */
  getName(): string;

  /**
   * 检查客户端是否可用
   */
  isAvailable(): Promise<boolean>;
}

/**
 * AI Client 工厂函数类型
 */
export type AIClientFactory = () => AIClient;

/**
 * AI Client 配置
 */
export interface AIClientConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
}

/**
 * 创建 AI Client 实例
 * 根据环境变量或配置选择 Mock 或真实 API
 */
export function createAIClient(config?: AIClientConfig): AIClient {
  // 检查是否配置了 Anthropic API Key
  const useRealAPI = config?.apiKey || process.env.ANTHROPIC_API_KEY;

  if (useRealAPI) {
    // 使用真实的 Anthropic API
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAnthropicAIClient } = require('./anthropic');
    return createAnthropicAIClient({
      apiKey: config?.apiKey,
      baseURL: config?.baseURL || process.env.ANTHROPIC_BASE_URL,
      model: config?.model,
      timeout: config?.timeout,
    });
  } else {
    // 使用 Mock 实现
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMockAIClient } = require('./mock');
    // 传递 timeout 作为 delay 参数
    return createMockAIClient(config?.timeout);
  }
}
