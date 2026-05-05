# 系统验证清单

## ✅ 已完成的修复

1. **认证层修复** - 所有 Client API 使用 SERVICE_ROLE_KEY
2. **授权层修复** - 添加了统一的授权检查（防止跨用户访问）
3. **代码质量** - TypeScript 编译通过，Next.js 构建成功

---

## 🧪 推荐的验证测试

### 1. 功能测试（正常流程）

```bash
# 访问 Client 登录页
http://localhost:3001/client/login

# 使用测试账号登录
client@example.com / client123

# 验证以下页面能正常显示数据：
✅ /client/dashboard - 仪表盘
✅ /client/topics - 选题列表
✅ /client/scripts - 文案列表
✅ /client/calendar - 日历
✅ /client/profile - 个人档案
✅ /client/style-reference - 风格参考
✅ /client/feedback - 反馈
✅ /client/generate - 生成文案
```

### 2. 安全测试（授权检查）

#### 测试 A：跨用户访问防护

```bash
# 1. 登录为 client@example.com
# 2. 打开浏览器开发者工具 (F12) → Network 标签
# 3. 访问 /client/topics 页面
# 4. 找到 API 请求，复制 Cookie
# 5. 使用 curl 测试跨用户访问：

# 正常访问（应该返回 200）
curl -X GET 'http://localhost:3001/api/client/topics?client_id=<当前用户的user_id>' \
  -H 'Cookie: <复制的Cookie>'

# 跨用户访问（应该返回 403 Forbidden）
curl -X GET 'http://localhost:3001/api/client/topics?client_id=00000000-0000-0000-0000-000000000000' \
  -H 'Cookie: <复制的Cookie>'
```

**预期结果**：
- ✅ 正常访问返回 `200 OK` + 数据
- ✅ 跨用户访问返回 `403 Forbidden` + `{"error": "FORBIDDEN", "message": "..."}`

#### 测试 B：未认证访问防护

```bash
# 不带 Cookie 访问（应该返回 401 Unauthorized）
curl -X GET 'http://localhost:3001/api/client/topics?client_id=<任意UUID>'

# 预期结果：401 Unauthorized
```

### 3. 数据完整性测试

```bash
# 在浏览器中测试以下操作：

1. 选题管理
   - ✅ 查看选题列表
   - ✅ 查看选题详情
   - ✅ 筛选选题（按状态、日期）

2. 文案管理
   - ✅ 查看文案列表
   - ✅ 查看文案详情
   - ✅ 筛选文案（按状态、选题）

3. 日历功能
   - ✅ 查看发布日历
   - ✅ 查看待发布内容

4. 个人档案
   - ✅ 查看档案信息
   - ✅ 查看风格偏好

5. 反馈功能
   - ✅ 查看反馈列表
   - ✅ 提交新反馈

6. 生成文案
   - ✅ 选择选题
   - ✅ 生成文案（如果 AI 功能已实现）
```

---

## 🔍 故障排查

### 如果遇到 CLIENT_NOT_FOUND 错误

```sql
-- 在 Supabase Dashboard → SQL Editor 执行：

-- 检查用户和客户的映射关系
SELECT 
  u.id AS user_id,
  u.email,
  u.role,
  c.id AS client_id,
  c.name AS client_name
FROM users u
LEFT JOIN clients c ON c.user_id = u.id
WHERE u.email = 'client@example.com';
```

**预期结果**：
- user_id: 有值
- client_id: 有值（不是 NULL）
- client_name: 有值

**如果 client_id 是 NULL**：
- 说明 clients 表中没有对应的记录
- 需要执行种子数据迁移

### 如果遇到 403 Forbidden（正常访问时）

```bash
# 检查 Cookie 是否正确设置
# 在浏览器开发者工具 → Application → Cookies 中查看：
# 应该有 client_session cookie
```

### 如果遇到 500 Internal Server Error

```bash
# 查看服务器日志
npm run dev

# 日志中应该显示具体的错误信息
```

---

## 📊 验证完成标准

所有以下条件都满足时，系统验证完成：

- ✅ Client 能成功登录
- ✅ 所有 8 个 Client 页面都能正常加载
- ✅ 选题列表、文案列表显示数据（不是空列表）
- ✅ 跨用户访问返回 403 Forbidden
- ✅ 未认证访问返回 401 Unauthorized
- ✅ 浏览器控制台无 JavaScript 错误
- ✅ Network 标签中所有 API 请求返回 200 或预期的错误码

---

## 🎉 如果所有测试通过

恭喜！Client API 认证和授权系统已完全修复，可以进入下一阶段开发：

**下一步可能的任务**：
1. 实现 AI 工作流集成
2. 配置 RLS 策略（可选，当前使用 SERVICE_ROLE_KEY + 应用层授权）
3. 添加更多功能（编辑选题、删除文案等）
4. 性能优化
5. 添加集成测试

---

**创建日期**：2026-05-05  
**状态**：待验证
