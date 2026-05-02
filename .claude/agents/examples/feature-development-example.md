# 功能开发完整示例

本示例展示如何使用 Agent Team 开发一个完整的功能：用户评论系统。

## 第一步：需求分析（Project Manager）

**用户输入**:
```
@project-manager 我需要为律师案例添加评论功能，用户可以对案例发表评论和回复
```

**PM 输出**:
```markdown
## 需求分析
用户需要一个评论系统，允许：
- 对律师案例发表评论
- 回复其他用户的评论
- 查看评论列表
- 编辑和删除自己的评论

## 任务分解

### 1. 数据库设计 - 优先级: 高
- 描述: 设计 comments 表结构
- 验收标准: 
  - 支持评论和回复的层级关系
  - 包含用户信息和时间戳
  - 支持软删除
- 预计工时: 1小时

### 2. 评论组件开发 - 优先级: 高
- 描述: 创建评论列表和评论表单组件
- 验收标准:
  - 显示评论列表（支持分页）
  - 评论表单（支持 Markdown）
  - 回复功能
  - 编辑/删除功能
- 预计工时: 4小时

### 3. API 接口开发 - 优先级: 高
- 描述: 实现评论相关的 API
- 验收标准:
  - POST /api/comments - 创建评论
  - GET /api/comments - 获取评论列表
  - PUT /api/comments/:id - 更新评论
  - DELETE /api/comments/:id - 删除评论
- 预计工时: 3小时

### 4. 权限控制 - 优先级: 中
- 描述: 实现评论权限验证
- 验收标准:
  - 只有登录用户可以评论
  - 只能编辑/删除自己的评论
  - 管理员可以删除任何评论
- 预计工时: 2小时

## 技术方案
- **数据库**: Supabase PostgreSQL
- **前端**: React 19 + TypeScript
- **状态管理**: React Query (用于评论数据缓存)
- **编辑器**: 简单的 textarea（后续可升级为 Markdown 编辑器）

## 风险评估
- 风险1: 评论嵌套层级过深影响性能
  - 应对策略: 限制回复层级为 2 层
- 风险2: 垃圾评论和恶意内容
  - 应对策略: 实现内容审核和举报功能（后续迭代）

## 下一步行动
请 @developer 开始实现任务1：数据库设计
```

## 第二步：数据库设计（Developer）

**用户输入**:
```
@developer 请实现任务1：设计并创建 comments 表
```

**Developer 输出**:
```markdown
## 实现概述
创建了 comments 表，支持评论和回复的层级结构。

## 技术方案
使用 Supabase 的 PostgreSQL，采用自引用外键实现评论回复关系。

## 文件变更
- `supabase/migrations/20260430_create_comments.sql` - 创建评论表

## SQL 代码
```sql
-- 创建评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- 索引
  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- 创建索引
CREATE INDEX idx_comments_case_id ON comments(case_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- RLS 策略
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看未删除的评论
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (deleted_at IS NULL);

-- 登录用户可以创建评论
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的评论
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以软删除自己的评论
CREATE POLICY "Users can delete own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);
```

## 测试情况
- [x] 表结构创建成功
- [x] 索引创建成功
- [x] RLS 策略配置正确
- [x] 外键约束工作正常

## 注意事项
- 使用软删除（deleted_at）而非物理删除
- parent_id 为 NULL 表示顶级评论
- 限制评论内容不能为空

## 下一步
建议继续实现任务2：评论组件开发
```

## 第三步：代码审查（Reviewer）

**用户输入**:
```
@reviewer 请审查数据库设计
```

**Reviewer 输出**:
```markdown
## 审查概述
- **审查范围**: comments 表设计和 RLS 策略
- **审查时间**: 2026-04-30
- **审查结论**: ⚠️ 需修改

## 代码质量评分
- 数据库设计: ⭐⭐⭐⭐☆ (4/5)
- 安全性: ⭐⭐⭐⭐☆ (4/5)
- 性能: ⭐⭐⭐⭐⭐ (5/5)
- 可维护性: ⭐⭐⭐⭐☆ (4/5)

## 发现的问题

### 🟡 一般问题 (建议修复)

1. **缺少更新时间戳触发器**
   - **问题**: updated_at 字段不会自动更新
   - **建议**: 添加触发器自动更新 updated_at
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   CREATE TRIGGER update_comments_updated_at
     BEFORE UPDATE ON comments
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();
   ```

2. **缺少评论层级限制**
   - **问题**: 没有限制回复的嵌套深度
   - **建议**: 添加检查约束或应用层验证，限制最多 2 层嵌套

### 🔵 优化建议 (可选)

1. **添加评论统计**
   - **建议**: 可以在 cases 表添加 comments_count 字段，使用触发器维护
   - **好处**: 提升评论数量查询性能

2. **考虑添加点赞功能**
   - **建议**: 如果未来需要点赞功能，可以预留 likes_count 字段
   - **好处**: 避免后续表结构变更

## 优点
- 使用 UUID 作为主键，安全性好
- 索引设计合理，覆盖常用查询
- RLS 策略完善，权限控制清晰
- 使用软删除，数据可恢复

## 改进建议
1. 添加 updated_at 自动更新触发器
2. 在应用层限制评论嵌套深度
3. 考虑添加评论内容长度限制

## 下一步行动
- [x] Developer 添加 updated_at 触发器
- [x] Developer 在 API 层添加嵌套深度验证
- [ ] 继续开发评论组件
```

## 第四步：改进代码（Developer）

**用户输入**:
```
@developer 请根据 Reviewer 的建议改进数据库设计
```

**Developer 输出**:
```markdown
## 改进概述
根据审查意见，添加了 updated_at 触发器和内容长度限制。

## 文件变更
- `supabase/migrations/20260430_create_comments.sql` - 更新

## 改进内容

### 1. 添加 updated_at 触发器
```sql
-- 自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用到 comments 表
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. 添加内容长度限制
```sql
-- 限制评论长度在 1-2000 字符之间
ALTER TABLE comments
ADD CONSTRAINT content_length_check 
CHECK (length(trim(content)) BETWEEN 1 AND 2000);
```

### 3. 添加嵌套深度验证函数
```sql
-- 检查评论嵌套深度的函数
CREATE OR REPLACE FUNCTION check_comment_depth()
RETURNS TRIGGER AS $$
DECLARE
  depth INT := 0;
  current_parent_id UUID;
BEGIN
  -- 如果是顶级评论，直接返回
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- 计算嵌套深度
  current_parent_id := NEW.parent_id;
  WHILE current_parent_id IS NOT NULL AND depth < 3 LOOP
    depth := depth + 1;
    SELECT parent_id INTO current_parent_id
    FROM comments
    WHERE id = current_parent_id;
  END LOOP;
  
  -- 限制最多 2 层嵌套
  IF depth >= 2 THEN
    RAISE EXCEPTION '评论嵌套深度不能超过 2 层';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器
CREATE TRIGGER check_comment_depth_trigger
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_depth();
```

## 测试情况
- [x] updated_at 自动更新正常
- [x] 内容长度限制生效
- [x] 嵌套深度限制正常工作
- [x] 所有约束测试通过

## 改进说明
- updated_at 现在会在每次更新时自动更新
- 评论内容限制在 1-2000 字符
- 数据库层面限制评论最多 2 层嵌套
- 所有改进都向后兼容

## 下一步
数据库设计已完成，可以继续开发评论组件。
```

## 第五步：验收（Project Manager）

**用户输入**:
```
@project-manager 请验收数据库设计任务
```

**PM 输出**:
```markdown
## 验收结果
✅ **任务1：数据库设计 - 已通过验收**

## 验收检查
- [x] 表结构设计合理
- [x] 索引配置完善
- [x] RLS 策略正确
- [x] 包含所有必要约束
- [x] 代码审查问题已修复
- [x] 测试通过

## 亮点
1. 使用软删除保护数据
2. RLS 策略完善，安全性高
3. 索引设计合理，性能优化到位
4. 自动更新时间戳，减少人为错误
5. 数据库层面限制嵌套深度，防止滥用

## 改进建议（后续迭代）
1. 考虑添加评论点赞功能
2. 实现评论举报和审核机制
3. 添加评论统计字段优化查询

## 下一步任务
**任务2：评论组件开发**
- 优先级: 高
- 负责人: @developer
- 预计工时: 4小时
- 依赖: 任务1 已完成 ✅

请 @developer 开始实现评论组件。
```

## 总结

这个示例展示了完整的 Agent Team 协作流程：

1. **PM 分析需求** - 将用户需求转化为具体任务
2. **Developer 实现** - 编写代码完成功能
3. **Reviewer 审查** - 发现问题并提供建议
4. **Developer 改进** - 根据反馈优化代码
5. **PM 验收** - 确认任务完成并规划下一步

这种协作模式确保了：
- ✅ 需求理解准确
- ✅ 代码质量高
- ✅ 问题及时发现
- ✅ 持续改进优化
- ✅ 项目进度可控
