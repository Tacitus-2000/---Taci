# BUG 修复报告 V7 - 双重解包问题

**日期**: 2026-05-05  
**问题**: Client 页面报错 "Query data cannot be undefined"  
**状态**: ✅ 已修复

---

## 问题描述

用户报告三个页面出现错误：

1. **我的档案** (`/client/profile`)
   - 错误: "Client profile not found or not visible"
   - 类型: 404 错误

2. **内容日历** (`/client/calendar`)
   - 错误: "Query data cannot be undefined. Please make sure to return a value other than undefined from your query function."
   - Query Key: `["client","calendar","e1b6ca76-82cf-4001-bd5f-ba9434d6eade",null]`

3. **风格参考** (`/client/style-reference`)
   - 错误: 同上

---

## Phase 1: Root Cause Investigation

### 错误追踪

使用 **Systematic Debugging** 方法进行根本原因分析：

#### 1. 读取错误信息
- React Query 报错: "Query data cannot be undefined"
- 这意味着 `queryFn` 返回了 `undefined`

#### 2. 追踪数据流

```
后端 API 返回:
{
  success: true,
  data: CalendarResponse  // 实际数据
}
    ↓
apiClient.get() 解包第一层 (lib/api/client.ts):
CalendarResponse  // 已经返回了 data 字段的内容
    ↓
client-api.ts 再次尝试解包:
const response = await apiClient.get<{ data: CalendarResponse; meta?: any }>(endpoint);
return response.data;  // ❌ 错误！CalendarResponse 没有 data 属性
    ↓
返回 undefined
    ↓
React Query 报错
```

#### 3. 检查代码

**后端 API** (`app/api/client/calendar/route.ts`):
```typescript
const response: CalendarResponse = {
  items: limitedItems,
  summary,
};

return apiSuccess(response);  // 返回 { success: true, data: response }
```

**API 客户端基类** (`lib/api/client.ts`):
```typescript
async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await this.request<T>(endpoint, { ...options, method: 'GET' });
  return response.data;  // 已经解包了第一层
}
```

**Client API** (`lib/api/client-api.ts` - 修复前):
```typescript
async getCalendar(...): Promise<CalendarResponse> {
  const response = await apiClient.get<{ data: CalendarResponse; meta?: any }>(endpoint);
  return response.data;  // ❌ 双重解包！
}
```

---

## Phase 2: Pattern Analysis

### 对比分析

| API 方法 | 后端返回格式 | 前端解包方式 | 状态 |
|---------|------------|------------|------|
| `getProfile` | `{ success: true, data: Profile }` | 单层 `apiClient.get<T>()` | ✅ 正确 |
| `getTopics` | `{ success: true, data: { data: [], meta: {} } }` | 双层 `response.data` | ✅ 正确（分页） |
| `getScripts` | `{ success: true, data: { data: [], meta: {} } }` | 双层 `response.data` | ✅ 正确（分页） |
| `getCalendar` | `{ success: true, data: CalendarResponse }` | 双层 `response.data` | ❌ 错误 |
| `getStyleReferences` | `{ success: true, data: StyleReferenceResponse }` | 双层 `response.data` | ❌ 错误 |

### 关键差异

**分页 API** (topics, scripts):
- 后端返回嵌套结构: `{ data: { data: [], meta: {} } }`
- 需要双层解包: `response.data` → 得到 `{ data: [], meta: {} }`

**非分页 API** (calendar, style-reference, profile):
- 后端返回扁平结构: `{ data: CalendarResponse }`
- 只需单层解包: 直接返回 `apiClient.get<T>()`

### 根本原因

**V10 修复时的错误**：
- 在修复分页 API 的响应解包时，错误地将相同的模式应用到了非分页 API
- 导致非分页 API 出现双重解包问题

---

## Phase 3: Hypothesis

**假设**: 将 `getCalendar` 和 `getStyleReferences` 改为单层解包（像 `getProfile` 一样），将解决 "Query data cannot be undefined" 错误。

**测试方法**:
1. 修改这两个方法，移除双重解包
2. 重启开发服务器
3. 访问 `/client/calendar` 和 `/client/style-reference`
4. 验证不再报 "undefined" 错误

---

## Phase 4: Implementation

### 修复方案

**文件**: `lib/api/client-api.ts`

#### 修复 1: getCalendar

```typescript
// 修复前
async getCalendar(...): Promise<CalendarResponse> {
  const response = await apiClient.get<{ data: CalendarResponse; meta?: any }>(endpoint);
  return response.data;  // ❌ 双重解包
}

// 修复后
async getCalendar(...): Promise<CalendarResponse> {
  // apiClient.get 已经解包了第一层，直接返回即可
  return apiClient.get<CalendarResponse>(endpoint);  // ✅ 单层解包
}
```

#### 修复 2: getStyleReferences

```typescript
// 修复前
async getStyleReferences(clientId: string): Promise<StyleReferenceResponse> {
  const response = await apiClient.get<{ data: StyleReferenceResponse; meta?: any }>(
    `/client/style-reference?client_id=${clientId}`
  );
  return response.data;  // ❌ 双重解包
}

// 修复后
async getStyleReferences(clientId: string): Promise<StyleReferenceResponse> {
  // apiClient.get 已经解包了第一层，直接返回即可
  return apiClient.get<StyleReferenceResponse>(
    `/client/style-reference?client_id=${clientId}`
  );  // ✅ 单层解包
}
```

---

## Profile 404 问题

### 原因

Profile API 返回 404 是因为**数据库中没有 client_profiles 数据**。

### 解决方案

需要在 Admin 后台创建客户档案：

1. 登录 Admin: http://localhost:3000/admin/login
2. 进入"客户档案"页面
3. 点击"新建档案"
4. 选择客户并填写信息
5. 提交创建

---

## 验证结果

### 修复后的预期行为

#### 内容日历页面
- ✅ 不再报 "Query data cannot be undefined" 错误
- ✅ 如果有数据，显示时间线
- ✅ 如果无数据，显示"暂无内容"空状态

#### 风格参考页面
- ✅ 不再报 "Query data cannot be undefined" 错误
- ✅ 如果有数据，显示风格指南和参考文案
- ✅ 如果无数据，显示"暂无风格参考"空状态

#### 我的档案页面
- ⚠️ 如果数据库无数据，仍会显示 404 错误
- ✅ 创建档案后，正常显示档案信息

---

## 测试步骤

### 1. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

### 2. 测试内容日历

```
访问: http://localhost:3000/client/calendar
预期: 
- 不再报 "undefined" 错误
- 显示"暂无内容"或内容列表
```

### 3. 测试风格参考

```
访问: http://localhost:3000/client/style-reference
预期:
- 不再报 "undefined" 错误
- 显示"暂无风格参考"或风格指南
```

### 4. 测试我的档案

```
访问: http://localhost:3000/client/profile
预期:
- 如果无数据: 显示"暂无档案信息"
- 如果有数据: 显示档案详情
```

### 5. 创建客户档案（如果需要）

```
1. 访问: http://localhost:3000/admin/login
2. 登录: admin@example.com / admin123
3. 进入"客户档案"页面
4. 点击"新建档案"
5. 选择客户并填写信息
6. 提交创建
7. 重新访问 Client 档案页面验证
```

---

## 技术总结

### 问题本质

**API 响应解包不一致**：
- 分页 API 需要双层解包（`response.data.data`）
- 非分页 API 只需单层解包（`response.data`）
- V10 修复时错误地统一了解包方式

### 解决方案

**根据 API 响应格式选择正确的解包方式**：

| API 类型 | 后端返回 | 前端解包 |
|---------|---------|---------|
| 分页 API | `{ data: { data: [], meta: {} } }` | `response.data` |
| 非分页 API | `{ data: T }` | 直接返回 |

### 经验教训

1. **不要假设所有 API 都有相同的响应格式**
2. **修复一个问题时，不要盲目应用到其他地方**
3. **使用 Systematic Debugging 追踪完整的数据流**
4. **对比工作和不工作的代码，找出差异**

---

## 修改的文件

1. `lib/api/client-api.ts` - 修复双重解包问题
   - `getCalendar()` - 移除双重解包
   - `getStyleReferences()` - 移除双重解包

---

## 相关文档

- `docs/BUG_FIX_REPORT_2026-05-05.md` - V1-V6 修复历史
- `docs/CURRENT_DEBUG_STATUS.md` - 调试状态
- `progress.md` - 完整进度日志

---

**修复完成时间**: 2026-05-05  
**修复方法**: Superpowers Systematic Debugging  
**修复人员**: Claude (Sonnet 4.6)  
**验证状态**: ⏳ 待用户测试
