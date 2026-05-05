-- 插入测试用户数据
-- 密码使用 bcrypt 加密（salt rounds = 10）

-- Admin 用户
-- 邮箱: admin@example.com
-- 密码: admin123
-- 密码哈希: $2b$10$1A85ZyQCfiKEgt8JNe/X7ekhV.Jazpd74UL7jHYlf0JDB9/21OcDi
INSERT INTO users (email, password_hash, role, name)
VALUES (
  'admin@example.com',
  '$2b$10$1A85ZyQCfiKEgt8JNe/X7ekhV.Jazpd74UL7jHYlf0JDB9/21OcDi',
  'admin',
  '管理员'
) ON CONFLICT (email) DO NOTHING;

-- Client 用户
-- 邮箱: client@example.com
-- 密码: client123
-- 密码哈希: $2b$10$WWwm.OacaR1Sn14j/rSDQ.ucKG6mZD2J8sHBzQiIcgiBx/3dgcg.W
INSERT INTO users (email, password_hash, role, name)
VALUES (
  'client@example.com',
  '$2b$10$WWwm.OacaR1Sn14j/rSDQ.ucKG6mZD2J8sHBzQiIcgiBx/3dgcg.W',
  'client',
  '测试客户'
) ON CONFLICT (email) DO NOTHING;

-- 添加注释
COMMENT ON TABLE users IS '测试用户已插入：admin@example.com (admin123) 和 client@example.com (client123)';
