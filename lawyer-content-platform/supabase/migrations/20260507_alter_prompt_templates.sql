-- 扩展 prompt_templates 表以支持系统提示词和用户提示词分离
-- 迁移时间: 2026-05-07

-- 添加新字段
ALTER TABLE prompt_templates
ADD COLUMN IF NOT EXISTS system_prompt TEXT,
ADD COLUMN IF NOT EXISTS user_prompt_template TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system';

-- 迁移现有数据：将 template_body 复制到 user_prompt_template
UPDATE prompt_templates
SET user_prompt_template = template_body
WHERE user_prompt_template IS NULL;

-- 添加注释
COMMENT ON COLUMN prompt_templates.system_prompt IS '系统提示词，定义 Agent 的角色和行为';
COMMENT ON COLUMN prompt_templates.user_prompt_template IS '用户提示词模板，包含变量占位符';
COMMENT ON COLUMN prompt_templates.description IS '提示词描述，说明用途和使用场景';
COMMENT ON COLUMN prompt_templates.created_by IS '创建者，system 或 admin';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompt_templates_agent_type ON prompt_templates(agent_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(active);
