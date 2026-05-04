# 成果验证指南

**项目名称**: 律师内容生成平台  
**验证日期**: 2026-05-04  
**当前进度**: 80%（已完成阶段 1-2）

---

## 📋 目录

1. [环境准备](#环境准备)
2. [数据库初始化](#数据库初始化)
3. [启动开发服务器](#启动开发服务器)
4. [验证 Admin 功能](#验证-admin-功能)
5. [验证 Client 功能](#验证-client-功能)
6. [验证认证系统](#验证认证系统)
7. [常见问题](#常见问题)

---

## 环境准备

### 1. 安装依赖

```bash
cd E:\Lawer-Contest\lawyer-content-platform
npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填写以下内容：

```bash
# Supabase 配置（需要先创建 Supabase 项目）
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# JWT 配置（生成随机密钥）
JWT_SECRET=你的_jwt_secret_至少32字符

# Node 环境
NODE_ENV=development
```

**生成 JWT_SECRET**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 数据库初始化

### 方式 1：使用 Supabase Dashboard（推荐）

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或选择现有项目
3. 进入 SQL Editor
4. 依次执行以下 SQL 文件：

**文件 1**: `E:\Lawer-Contest\supabase\migrations\20260504000000_create_users.sql`

```sql
-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**文件 2**: `E:\Lawer-Contest\supabase\migrations\20260504000001_seed_test_users.sql`

```sql
-- 插入测试用户
INSERT INTO users (email, password_hash, role, name)
VALUES 
  ('admin@example.com', '$2b$10$1A85ZyQCfiKEgt8JNe/X7ekhV.Jazpd74UL7jHYlf0JDB9/21OcDi', 'admin', '管理员'),
  ('client@example.com', '$2b$10$WWwm.OacaR1Sn14j/rSDQ.ucKG6mZD2J8sHBzQiIcgiBx/3dgcg.W', 'client', '测试客户')
ON CONFLICT (email) DO NOTHING;
```

5. 验证数据：

```sql
SELECT * FROM users;
```

应该看到 2 个测试用户。

### 方式 2：使用 Supabase CLI

```bash
cd E:\Lawer-Contest
supabase db push
```

---

## 启动开发服务器

```bash
cd E:\Lawer-Contest\lawyer-content-platform
npm run dev
```

服务器启动后，访问：http://localhost:3000

---

## 验证 Admin 功能

### 1. Admin 登录页面

**URL**: http://localhost:3000/admin/login

**测试账号**:
- 邮箱: `admin@example.com`
- 密码: `admin123`

**验证内容**:
- ✅ 页面正常显示
- ✅ 表单验证工作（邮箱格式、密码长度）
- ✅ 登录成功后跳转到 `/admin/dashboard`
- ✅ 登录失败显示错误提示

### 2. Admin 管理页面

登录成功后，验证以下页面：

#### 2.1 客户管理
**URL**: http://localhost:3000/admin/clients

**验证内容**:
- ✅ 客户列表展示
- ✅ 分页功能（20 条/页）
- ✅ 创建客户（点击"创建客户"按钮）
- ✅ 编辑客户（点击"编辑"按钮）
- ✅ 删除客户（点击"删除"按钮）
- ✅ 状态徽章显示

#### 2.2 客户档案管理
**URL**: http://localhost:3000/admin/client-profiles

**验证内容**:
- ✅ 档案列表展示
- ✅ 分页功能
- ✅ 创建档案
- ✅ 编辑档案（多字段表单）
- ✅ 删除档案
- ✅ 客户可见开关

#### 2.3 选题管理
**URL**: http://localhost:3000/admin/topics

**验证内容**:
- ✅ 选题列表展示
- ✅ 分页功能
- ✅ 创建选题
- ✅ 编辑选题
- ✅ 删除选题
- ✅ 状态管理（草稿/已通过/已拒绝）

#### 2.4 文案管理
**URL**: http://localhost:3000/admin/scripts

**验证内容**:
- ✅ 文案列表展示
- ✅ 分页功能
- ✅ 创建文案
- ✅ 编辑文案
- ✅ 删除文案
- ✅ 状态管理（草稿/已审查/已通过/已发布）

#### 2.5 Agent 运行记录
**URL**: http://localhost:3000/admin/agent-runs

**验证内容**:
- ✅ 运行记录列表展示
- ✅ 分页功能
- ✅ 查看详情（点击"查看详情"按钮）
- ✅ 状态展示
- ✅ 只读模式（无编辑/删除按钮）

### 3. Admin 登出

**验证内容**:
- ✅ 点击登出按钮
- ✅ 跳转到登录页面
- ✅ 无法访问 Admin 页面（自动重定向到登录页）

---

## 验证 Client 功能

### 1. Client 登录页面

**URL**: http://localhost:3000/client/login

**测试账号**:
- 邮箱: `client@example.com`
- 密码: `client123`

**验证内容**:
- ✅ 页面正常显示
- ✅ 表单验证工作
- ✅ 登录成功后跳转到 `/client/dashboard`
- ✅ 登录失败显示错误提示

### 2. Client 页面

登录成功后，验证以下页面：

#### 2.1 客户首页
**URL**: http://localhost:3000/client/dashboard

**验证内容**:
- ✅ 聚合数据展示
- ✅ 快速操作按钮
- ✅ 状态徽章（中文标签）

#### 2.2 客户档案
**URL**: http://localhost:3000/client/profile

**验证内容**:
- ✅ 档案信息展示
- ✅ 只显示 `visible_to_client = true` 的数据
- ✅ 不显示 `internal_notes` 字段

#### 2.3 风格参考
**URL**: http://localhost:3000/client/style-reference

**验证内容**:
- ✅ 风格指南展示
- ✅ 参考内容展示

#### 2.4 选题列表
**URL**: http://localhost:3000/client/topics

**验证内容**:
- ✅ 选题列表展示
- ✅ 分页功能
- ✅ 只显示 `status = 'approved'` 的选题
- ✅ 只显示 `visible_to_client = true` 的选题

#### 2.5 文案列表
**URL**: http://localhost:3000/client/scripts

**验证内容**:
- ✅ 文案列表展示
- ✅ 分页功能
- ✅ 展开/收起详情
- ✅ 只显示 `status IN ('approved', 'published')` 的文案

#### 2.6 内容日历
**URL**: http://localhost:3000/client/calendar

**验证内容**:
- ✅ 时间线展示
- ✅ 选题和文案混合显示
- ✅ 状态徽章（中文标签）

#### 2.7 反馈表单
**URL**: http://localhost:3000/client/feedback

**验证内容**:
- ✅ 表单展示
- ✅ 表单验证（React Hook Form + Zod）
- ✅ 提交成功显示提示
- ✅ 提交失败显示错误

#### 2.8 生成文案
**URL**: http://localhost:3000/client/generate

**验证内容**:
- ✅ 表单展示
- ✅ 选题选择器
- ✅ 表单验证
- ✅ 提交成功显示提示

### 3. Client 登出

**验证内容**:
- ✅ 点击登出按钮
- ✅ 跳转到登录页面
- ✅ 无法访问 Client 页面（自动重定向到登录页）

---

## 验证认证系统

### 1. 路由保护

#### 测试 1：未登录访问 Admin 页面

1. 打开浏览器隐私模式
2. 访问 http://localhost:3000/admin/clients
3. **预期结果**: 自动重定向到 `/admin/login`

#### 测试 2：未登录访问 Client 页面

1. 打开浏览器隐私模式
2. 访问 http://localhost:3000/client/dashboard
3. **预期结果**: 自动重定向到 `/client/login`

#### 测试 3：Admin 用户访问 Client 页面

1. 使用 Admin 账号登录
2. 访问 http://localhost:3000/client/dashboard
3. **预期结果**: 自动重定向到 `/admin/login`

#### 测试 4：Client 用户访问 Admin 页面

1. 使用 Client 账号登录
2. 访问 http://localhost:3000/admin/clients
3. **预期结果**: 自动重定向到 `/client/login`

### 2. Cookie 验证

#### 测试 1：检查 Cookie 设置

1. 登录 Admin 账号
2. 打开浏览器开发者工具（F12）
3. 进入 Application → Cookies → http://localhost:3000
4. **预期结果**: 看到 `admin_token` Cookie
5. **验证属性**:
   - ✅ HttpOnly: true
   - ✅ SameSite: Lax
   - ✅ Path: /
   - ✅ Max-Age: 604800（7 天）

#### 测试 2：检查 Cookie 隔离

1. 登录 Admin 账号（应该有 `admin_token`）
2. 登出
3. 登录 Client 账号（应该有 `client_token`）
4. **预期结果**: 两个 Cookie 独立存在，互不干扰

### 3. JWT Token 验证

#### 测试 1：Token 过期

1. 登录账号
2. 等待 7 天（或手动修改 Cookie 过期时间）
3. 刷新页面
4. **预期结果**: 自动重定向到登录页

#### 测试 2：Token 篡改

1. 登录账号
2. 打开开发者工具，修改 Cookie 中的 token 值
3. 刷新页面
4. **预期结果**: 自动重定向到登录页

### 4. 密码验证

#### 测试 1：错误密码

1. 访问登录页面
2. 输入正确的邮箱，错误的密码
3. **预期结果**: 显示"邮箱或密码错误"

#### 测试 2：不存在的邮箱

1. 访问登录页面
2. 输入不存在的邮箱
3. **预期结果**: 显示"邮箱或密码错误"（不泄露用户是否存在）

---

## 常见问题

### 问题 1：JWT_SECRET 未设置

**错误信息**: `JWT_SECRET 环境变量未设置，请在 .env.local 中配置`

**解决方案**:
1. 确保 `.env.local` 文件存在
2. 确保包含 `JWT_SECRET=你的密钥`
3. 重启开发服务器

### 问题 2：users 表不存在

**错误信息**: `relation "users" does not exist`

**解决方案**:
1. 检查是否执行了数据库迁移
2. 在 Supabase Dashboard 中执行 SQL 文件
3. 验证 users 表是否创建成功

### 问题 3：登录失败

**错误信息**: `邮箱或密码错误`

**解决方案**:
1. 检查测试用户是否已插入
2. 检查密码哈希值是否正确
3. 检查 Supabase 连接是否正常
4. 查看浏览器控制台和服务器日志

### 问题 4：页面无法访问

**错误信息**: `404 Not Found`

**解决方案**:
1. 确认开发服务器正在运行
2. 检查 URL 是否正确
3. 运行 `npm run build` 验证构建是否成功

### 问题 5：Cookie 未设置

**问题**: 登录成功但无法访问保护页面

**解决方案**:
1. 检查浏览器是否禁用了 Cookie
2. 检查是否在隐私模式下
3. 清除浏览器缓存和 Cookie
4. 检查开发者工具中的 Cookie 设置

---

## 验证清单

### 基础功能
- [ ] 开发服务器启动成功
- [ ] 数据库连接正常
- [ ] 环境变量配置正确

### Admin 功能
- [ ] Admin 登录成功
- [ ] 客户管理 CRUD 正常
- [ ] 客户档案管理 CRUD 正常
- [ ] 选题管理 CRUD 正常
- [ ] 文案管理 CRUD 正常
- [ ] Agent 运行记录查看正常
- [ ] Admin 登出成功

### Client 功能
- [ ] Client 登录成功
- [ ] 客户首页展示正常
- [ ] 客户档案展示正常
- [ ] 风格参考展示正常
- [ ] 选题列表展示正常
- [ ] 文案列表展示正常
- [ ] 内容日历展示正常
- [ ] 反馈表单提交成功
- [ ] 生成文案表单提交成功
- [ ] Client 登出成功

### 认证系统
- [ ] 路由保护正常（未登录重定向）
- [ ] 角色隔离正常（Admin/Client 互不访问）
- [ ] Cookie 设置正确（HttpOnly, SameSite）
- [ ] JWT Token 验证正常
- [ ] 密码验证安全（不泄露用户信息）

---

## 性能测试

### 页面加载速度

1. 打开浏览器开发者工具（F12）
2. 进入 Network 标签
3. 访问各个页面
4. **预期结果**: 
   - 首次加载 < 2 秒
   - 后续加载 < 500ms

### API 响应时间

1. 打开浏览器开发者工具（F12）
2. 进入 Network 标签
3. 执行 CRUD 操作
4. **预期结果**:
   - GET 请求 < 200ms
   - POST/PUT/DELETE 请求 < 500ms

---

## 下一步

验证完成后，可以继续：

1. **阶段 3：安全加固**
   - RLS 策略
   - 速率限制
   - 审计日志

2. **阶段 4：测试和验证**
   - 端到端测试
   - AI 工作流测试

3. **部署到生产环境**
   - 配置生产环境变量
   - 部署到 Vercel
   - 配置 Supabase 生产数据库

---

**验证指南版本**: V1.0  
**最后更新**: 2026-05-04  
**文档位置**: `E:\Lawer-Contest\docs\VERIFICATION_GUIDE.md`
