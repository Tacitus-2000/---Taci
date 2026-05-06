# 阶段 0: 环境准备 - 完成指南

## ✅ 已完成的工作

1. **依赖安装** ✅
   - @anthropic-ai/sdk (v0.94.0)
   - langchain (v1.3.5)
   - @langchain/anthropic (v1.3.28)
   - tsx (v4.21.0)

2. **环境变量配置** ✅
   - 已在 `.env.local` 中添加所有必需的配置项
   - LLM 模型配置已设置
   - Agent 配置已设置

3. **AI 客户端实现** ✅
   - `lib/ai/anthropic.ts` - Anthropic Claude 客户端
   - `lib/ai/client.ts` - 自动选择 Mock 或真实 API
   - 完整实现 AIClient 接口

4. **测试脚本** ✅
   - `scripts/test-anthropic.ts` - API 连接测试
   - npm 脚本已配置

---

## ⏳ 待完成步骤

### 步骤 1: 获取 Anthropic API Key

1. 访问 [Anthropic Console](https://console.anthropic.com)
2. 登录或注册账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key（格式类似：`sk-ant-api03-...`）

### 步骤 2: 配置 API Key

打开 `.env.local` 文件,找到这一行:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

将 `your_anthropic_api_key_here` 替换为你的真实 API Key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

### 步骤 3: 验证配置

运行测试脚本验证 API 连接:

```bash
npm run test:anthropic
```

**预期输出**:
```
🧪 开始测试 Anthropic API 连接...

📋 检查环境变量:
   ✅ ANTHROPIC_API_KEY: sk-ant-api...
   ✅ LLM_MODEL: claude-3-5-sonnet-20241022
   ✅ LLM_TEMPERATURE: 0.7
   ✅ LLM_MAX_TOKENS: 4096

🔧 创建 AI 客户端...
   ✅ 客户端创建成功: Anthropic Claude (claude-3-5-sonnet-20241022)

🔍 检查 API 可用性...
   ✅ API 可用

💬 测试简单对话...
   ✅ 响应成功 (耗时: XXXms)
   📝 响应内容: [AI 的自我介绍]

📊 Token 使用情况:
   - 输入 tokens: XX
   - 输出 tokens: XX
   - 总计 tokens: XX

🧪 测试 JSON 格式响应...
   ✅ JSON 响应成功
   📝 响应内容: [JSON 格式的律师档案]

✅ 所有测试通过！Anthropic API 配置正确。
```

---

## 🎯 验收标准

阶段 0 完成的标准:

- ✅ 所有依赖包安装成功
- ✅ 环境变量配置完整
- ⏳ 测试脚本运行成功（需要配置 API Key）
- ⏳ API 调用返回正常响应

---

## 📝 配置文件清单

### 新增文件
1. `lib/ai/anthropic.ts` - Anthropic 客户端实现
2. `scripts/test-anthropic.ts` - API 测试脚本
3. `STAGE_0_SETUP.md` - 本文件

### 修改文件
1. `.env.local` - 添加 Claude API 配置
2. `lib/ai/client.ts` - 支持真实 API
3. `package.json` - 添加依赖和测试脚本

---

## 🚀 下一步

完成 API Key 配置并验证成功后,即可进入:

**阶段 1: 数据采集 Agent**
- 修改 DataAgent 实现真实数据库查询
- 预计时间: 2-3 小时

---

## ⚠️ 常见问题

### Q: API Key 在哪里获取?
A: 访问 https://console.anthropic.com，登录后在 API Keys 页面创建。

### Q: 测试失败怎么办?
A: 检查以下几点:
1. API Key 是否正确复制（包含 `sk-ant-api03-` 前缀）
2. 网络连接是否正常
3. API Key 是否有足够的配额

### Q: 如何查看 API 使用量?
A: 在 Anthropic Console 的 Usage 页面可以查看。

### Q: 测试脚本可以重复运行吗?
A: 可以,每次运行会消耗少量 tokens（约 100-200 tokens）。

---

**创建日期**: 2026-05-06  
**状态**: 等待用户配置 API Key
