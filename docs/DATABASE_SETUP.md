# 数据库初始化指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL
   - Anon Key
   - Service Role Key

## 2. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

填写以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon Key
SUPABASE_SERVICE_ROLE_KEY=你的Service Role Key
JWT_SECRET=生成的随机密钥
```

生成 JWT_SECRET：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. 运行数据库迁移

在 Supabase Dashboard 中执行以下 SQL 文件：

1. `supabase/migrations/20260504000000_create_users.sql` - 创建 users 表
2. `supabase/migrations/20260504000001_seed_test_users.sql` - 插入测试用户

或使用 Supabase CLI：

```bash
supabase db push
```

## 4. 验证数据库

检查 users 表是否创建成功：

```sql
SELECT * FROM users;
```

应该看到 2 个测试用户：
- admin@example.com (role: admin)
- client@example.com (role: client)

## 5. 测试认证

启动开发服务器：

```bash
npm run dev
```

访问登录页面：
- Admin: http://localhost:3000/admin/login
- Client: http://localhost:3000/client/login

使用测试账号登录：
- Admin: admin@example.com / admin123
- Client: client@example.com / client123

## 故障排查

### 问题：JWT_SECRET 未设置

**错误信息**: `JWT_SECRET 环境变量未设置`

**解决方案**: 确保 `.env.local` 文件存在且包含 `JWT_SECRET`

### 问题：users 表不存在

**错误信息**: `relation "users" does not exist`

**解决方案**: 运行数据库迁移文件

### 问题：登录失败

**错误信息**: `邮箱或密码错误`

**解决方案**: 
1. 检查测试用户是否已插入
2. 检查密码哈希值是否正确
3. 检查 Supabase 连接是否正常
