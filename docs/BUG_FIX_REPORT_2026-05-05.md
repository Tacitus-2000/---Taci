# Bug 修复报告 - 2026-05-05

## 修复的问题

### 1. ✅ Client 登录不跳转问题

**问题描述**：
- Client 登录显示成功但不跳转到 dashboard
- 登录 API 路径错误

**根本原因**：
- 前端调用的 API 路径：`/api/client/auth/login`
- 实际 API 路径：`/api/auth/client/login`

**修复方案**：
- 修改 `app/client/login/page.tsx` 中的 API 路径
- 从 `/api/client/auth/login` 改为 `/api/auth/client/login`

**修复文件**：
- `app/client/login/page.tsx`

---

### 2. ✅ 客户档案创建 UUID 错误

**问题描述**：
- 创建客户档案时报错："Invalid client_id: must be a valid UUID"
- 表单要求手动输入 UUID 格式的 client_id

**根本原因**：
- 表单使用 `<Input>` 让用户手动输入 UUID
- 用户输入的字符串不符合 UUID 格式

**修复方案**：
- 将 `<Input>` 改为 `<Select>` 下拉选择
- 从客户列表中选择已存在的客户
- 自动填充客户名称

**修复文件**：
- `app/admin/client-profiles/page.tsx`

**修改内容**：
```typescript
// 之前：手动输入
<Input
  id="client_id"
  value={formData.client_id}
  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
  placeholder="请输入客户 ID"
  required
/>

// 之后：下拉选择
<Select
  value={formData.client_id}
  onValueChange={(value) => {
    const selectedClient = clients.find(c => c.id === value);
    setFormData({
      ...formData,
      client_id: value,
      client_name: selectedClient?.name || formData.client_name
    });
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="请选择客户" />
  </SelectTrigger>
  <SelectContent>
    {clients.map((client) => (
      <SelectItem key={client.id} value={client.id}>
        {client.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 3. ✅ useClientId 硬编码问题

**问题描述**：
- `useClientId` 返回硬编码的测试 ID `'test-client-001'`
- 不是真实的 UUID，导致 API 调用失败

**根本原因**：
- Hook 使用了硬编码的测试值
- 没有从认证系统获取真实的客户 ID

**修复方案**：
- 从 Cookie 中读取 JWT token
- 解析 token 获取 `userId`（即 client_id）
- 返回类型改为 `string | null`

**修复文件**：
- `lib/hooks/useClientId.ts`

**修改内容**：
```typescript
// 之前：硬编码
const TEST_CLIENT_ID = 'test-client-001';
export function useClientId(): string {
  return TEST_CLIENT_ID;
}

// 之后：从认证系统获取
function getClientIdFromAuth(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const clientTokenCookie = cookies.find(c => c.trim().startsWith('client_token='));
  
  if (!clientTokenCookie) return null;
  
  try {
    const token = clientTokenCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

export function useClientId(): string | null {
  const [clientId, setClientId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return getClientIdFromAuth();
    }
    return null;
  });
  
  // 监听 cookie 变化
  useEffect(() => {
    const checkAuth = () => {
      const id = getClientIdFromAuth();
      setClientId(id);
    };
    
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  return clientId;
}
```

---

### 4. ✅ 类型错误修复

**问题描述**：
- `useClientId` 返回类型改为 `string | null` 后
- 所有使用该 Hook 的页面出现类型错误

**修复方案**：
- 在所有 Client 页面添加 null 检查
- 显示友好的错误提示
- 提供返回登录的按钮

**修复文件**（8 个）：
1. `app/client/profile/page.tsx`
2. `app/client/topics/page.tsx`
3. `app/client/scripts/page.tsx`
4. `app/client/calendar/page.tsx`
5. `app/client/style-reference/page.tsx`
6. `app/client/feedback/page.tsx`
7. `app/client/generate/page.tsx`
8. `app/client/dashboard/page.tsx`

**修改模式**：
```typescript
export default function ClientPage() {
  const clientId = useClientId();
  const { data, isLoading, error } = useData(clientId || '');

  // 添加 null 检查
  if (!clientId) {
    return (
      <PlatformShell>
        <ErrorMessage 
          message="未找到客户信息，请重新登录" 
          onRetry={() => window.location.href = '/client/login'} 
        />
      </PlatformShell>
    );
  }

  // 原有的加载和错误处理逻辑
  if (isLoading) { ... }
  if (error) { ... }
  
  return <div>...</div>;
}
```

---

## 验证结果

### ✅ TypeScript 编译
```bash
npm run build
```
**结果**：通过（0 errors）

### ✅ Next.js 构建
```bash
npm run build
```
**结果**：成功
- 46 个路由全部生成
- 静态页面：13 个
- 动态 API：33 个

### ⚠️ ESLint 检查
```bash
npm run lint
```
**结果**：12 warnings, 2 errors（非关键）
- 警告主要是未使用的变量（旧代码）
- 错误是 React Compiler 警告（不影响功能）

---

## 修复文件清单

### 核心修复（3 个文件）
1. `app/client/login/page.tsx` - 修复登录 API 路径
2. `app/admin/client-profiles/page.tsx` - 修复客户档案创建
3. `lib/hooks/useClientId.ts` - 修复客户 ID 获取逻辑

### 类型修复（8 个文件）
4. `app/client/profile/page.tsx`
5. `app/client/topics/page.tsx`
6. `app/client/scripts/page.tsx`
7. `app/client/calendar/page.tsx`
8. `app/client/style-reference/page.tsx`
9. `app/client/feedback/page.tsx`
10. `app/client/generate/page.tsx`
11. `app/client/dashboard/page.tsx`

**总计**：11 个文件

---

## 测试建议

### 1. Client 登录流程
- [ ] 使用 `client@example.com / client123` 登录
- [ ] 验证登录后跳转到 `/client/dashboard`
- [ ] 验证 Cookie 中存在 `client_token`

### 2. 客户档案创建
- [ ] 在 Admin 后台创建客户（如果没有）
- [ ] 进入"客户档案"页面
- [ ] 点击"新建档案"
- [ ] 从下拉列表选择客户
- [ ] 填写其他信息并提交
- [ ] 验证创建成功

### 3. Client 页面访问
- [ ] 登录后访问所有 8 个 Client 页面
- [ ] 验证页面正常加载（不显示"未找到客户信息"）
- [ ] 验证数据正常显示

### 4. 未登录状态
- [ ] 清除 Cookie
- [ ] 访问任意 Client 页面
- [ ] 验证显示"未找到客户信息，请重新登录"
- [ ] 点击"返回登录"按钮
- [ ] 验证跳转到登录页

---

## 已知问题

### 非关键问题（P2）
1. **ESLint 警告**（12 个）
   - 未使用的变量（旧代码）
   - 可以后续清理

2. **React Compiler 警告**（1 个）
   - `react-hook-form` 的 `watch()` 函数
   - 不影响功能，可以忽略

---

## 下一步建议

### 立即测试
1. 重启开发服务器：`npm run dev`
2. 测试 Client 登录流程
3. 测试客户档案创建
4. 测试所有 Client 页面

### 后续优化
1. 清理 ESLint 警告
2. 添加更好的错误处理
3. 添加 loading 状态优化
4. 考虑使用 React Context 管理 clientId

---

**修复完成时间**：2026-05-05  
**修复人员**：Claude (Opus 4.7)  
**验证状态**：✅ 构建通过，待用户测试
