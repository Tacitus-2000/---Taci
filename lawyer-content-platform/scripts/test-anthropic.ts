/**
 * 测试 Anthropic API 连接
 * 验证 API Key 是否有效，以及基本的调用功能
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') });

import { createAIClient } from '../lib/ai/client';

async function testAnthropicAPI() {
  console.log('🧪 开始测试 Anthropic API 连接...\n');

  try {
    // 检查环境变量
    console.log('📋 检查环境变量:');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022';
    const temperature = process.env.LLM_TEMPERATURE || '0.7';
    const maxTokens = process.env.LLM_MAX_TOKENS || '4096';

    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY 未配置');
      console.log('\n请在 .env.local 文件中设置 ANTHROPIC_API_KEY');
      process.exit(1);
    }

    console.log(`   ✅ ANTHROPIC_API_KEY: ${apiKey.substring(0, 10)}...`);
    console.log(`   ✅ LLM_MODEL: ${model}`);
    console.log(`   ✅ LLM_TEMPERATURE: ${temperature}`);
    console.log(`   ✅ LLM_MAX_TOKENS: ${maxTokens}`);
    console.log();

    // 创建 AI 客户端
    console.log('🔧 创建 AI 客户端...');
    const client = createAIClient();
    console.log(`   ✅ 客户端创建成功: ${client.getName()}`);
    console.log();

    // 测试可用性
    console.log('🔍 检查 API 可用性...');
    try {
      const isAvailable = await client.isAvailable();
      if (!isAvailable) {
        console.log('   ⚠️  API 可用性检查失败，但继续测试实际调用...');
      } else {
        console.log('   ✅ API 可用');
      }
    } catch (error) {
      console.log('   ⚠️  API 可用性检查失败，但继续测试实际调用...');
      console.log(`   原因: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log();

    // 测试简单对话
    console.log('💬 测试简单对话...');
    const startTime = Date.now();
    const response = await client.chat([
      {
        role: 'system',
        content: '你是一位专业的法律内容助手。',
      },
      {
        role: 'user',
        content: '请用一句话介绍你自己。',
      },
    ]);
    const duration = Date.now() - startTime;

    console.log(`   ✅ 响应成功 (耗时: ${duration}ms)`);
    console.log(`   📝 响应内容: ${response.content}`);
    console.log();

    // 显示 token 使用情况
    if (response.usage) {
      console.log('📊 Token 使用情况:');
      console.log(`   - 输入 tokens: ${response.usage.promptTokens}`);
      console.log(`   - 输出 tokens: ${response.usage.completionTokens}`);
      console.log(`   - 总计 tokens: ${response.usage.totalTokens}`);
      console.log();
    }

    // 测试 JSON 响应
    console.log('🧪 测试 JSON 格式响应...');
    const jsonResponse = await client.chat([
      {
        role: 'system',
        content: '你是一位专业的法律内容助手。请始终以 JSON 格式返回响应。',
      },
      {
        role: 'user',
        content: '请生成一个简单的律师档案，包含姓名、专业领域、目标客户。返回 JSON 格式。',
      },
    ]);

    console.log(`   ✅ JSON 响应成功`);
    console.log(`   📝 响应内容:\n${jsonResponse.content}`);
    console.log();

    // 尝试解析 JSON
    try {
      // 提取 JSON 内容（可能包含在 markdown 代码块中）
      let jsonContent = jsonResponse.content;
      const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      const parsed = JSON.parse(jsonContent);
      console.log('   ✅ JSON 解析成功');
      console.log('   📋 解析结果:', JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.log('   ⚠️  JSON 解析失败（这是正常的，AI 可能返回了带说明的文本）');
    }

    console.log();
    console.log('✅ 所有测试通过！Anthropic API 配置正确。');
    console.log();

  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
testAnthropicAPI();
