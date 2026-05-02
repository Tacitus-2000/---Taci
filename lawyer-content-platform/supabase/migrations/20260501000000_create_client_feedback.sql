-- Migration: Create client_feedback table
-- Created: 2026-05-01
-- Description: 创建客户反馈表，用于收集客户对内容的反馈

-- 创建 client_feedback 表
CREATE TABLE IF NOT EXISTS client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('profile', 'topic', 'script', 'general')),
  content_id UUID NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_client_feedback_client_id ON client_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_content_type ON client_feedback(content_type);
CREATE INDEX IF NOT EXISTS idx_client_feedback_content_id ON client_feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_status ON client_feedback(status);
CREATE INDEX IF NOT EXISTS idx_client_feedback_created_at ON client_feedback(created_at DESC);

-- 创建 updated_at 触发器
CREATE OR REPLACE FUNCTION update_client_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_feedback_updated_at
  BEFORE UPDATE ON client_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_client_feedback_updated_at();

-- 添加注释
COMMENT ON TABLE client_feedback IS '客户反馈表';
COMMENT ON COLUMN client_feedback.id IS '反馈 ID';
COMMENT ON COLUMN client_feedback.client_id IS '客户 ID';
COMMENT ON COLUMN client_feedback.content_type IS '内容类型：profile, topic, script, general';
COMMENT ON COLUMN client_feedback.content_id IS '内容 ID（如果是针对特定内容的反馈）';
COMMENT ON COLUMN client_feedback.feedback_text IS '反馈内容';
COMMENT ON COLUMN client_feedback.rating IS '评分（1-5）';
COMMENT ON COLUMN client_feedback.status IS '处理状态：pending, reviewed, resolved';
COMMENT ON COLUMN client_feedback.admin_notes IS '管理员备注（客户不可见）';
COMMENT ON COLUMN client_feedback.created_at IS '创建时间';
COMMENT ON COLUMN client_feedback.updated_at IS '更新时间';
