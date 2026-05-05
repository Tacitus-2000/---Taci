-- ============================================
-- 种子数据迁移：测试客户和相关数据
-- ============================================
--
-- 目标：为测试环境创建完整的客户数据链路
-- 包括：clients, client_profiles, topics, scripts
--
-- 执行方式：
-- 1. 访问 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 选择项目
-- 3. 进入 SQL Editor
-- 4. 复制并执行以下 SQL
-- ============================================

BEGIN;

-- ============================================
-- Step 1: 插入测试客户（关联到已有的 client@example.com 用户）
-- ============================================

-- 获取 client@example.com 的 user_id
DO $$
DECLARE
  test_user_id UUID;
  test_industry_id UUID;
  test_client_id UUID := '8db36fa1-98de-48c4-aaa2-01e7cea8d986';
BEGIN
  -- 查找测试用户
  SELECT id INTO test_user_id
  FROM public.users
  WHERE email = 'client@example.com' AND role = 'client';

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION '测试用户 client@example.com 不存在，请先运行 20260504000013_seed_test_users.sql';
  END IF;

  -- 查找或创建测试行业（法律服务）
  SELECT id INTO test_industry_id
  FROM public.industries
  WHERE name = '法律服务'
  LIMIT 1;

  IF test_industry_id IS NULL THEN
    INSERT INTO public.industries (name, description)
    VALUES ('法律服务', '律师事务所、法律咨询等法律相关服务')
    RETURNING id INTO test_industry_id;
    RAISE NOTICE '✅ 创建测试行业：法律服务';
  END IF;

  -- 插入测试客户（如果不存在）
  INSERT INTO public.clients (
    id,
    user_id,
    name,
    industry_id,
    package_name,
    status,
    content_progress
  )
  VALUES (
    test_client_id,
    test_user_id,
    '张律师事务所',
    test_industry_id,
    '标准套餐',
    'active',
    0
  )
  ON CONFLICT (id) DO UPDATE
  SET
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    industry_id = EXCLUDED.industry_id,
    updated_at = NOW();

  RAISE NOTICE '✅ Step 1: 测试客户已创建/更新';
END $$;

-- ============================================
-- Step 2: 插入客户档案
-- ============================================

INSERT INTO public.client_profiles (
  id,
  client_id,
  industry_id,
  client_name,
  industry_name,
  niche_direction,
  target_customer,
  advantages,
  customer_pain_points,
  tone_style,
  taboo_expressions,
  conversion_goal,
  visible_to_client
)
VALUES (
  'e024acc6-3703-4f39-9181-32586c51664a',
  '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
  (SELECT id FROM public.industries WHERE name = '法律服务' LIMIT 1),
  '张律师事务所',
  '法律服务',
  '专注于企业法律顾问和合同纠纷',
  '中小企业主、创业者',
  '15年执业经验，成功案例500+，专业团队',
  '法律风险意识薄弱，合同条款不清晰，纠纷处理成本高',
  '专业、严谨、值得信赖',
  '避免使用"包赢"、"100%胜诉"等绝对化表述',
  '引导客户咨询或预约',
  true
)
ON CONFLICT (id) DO UPDATE
SET
  client_name = EXCLUDED.client_name,
  niche_direction = EXCLUDED.niche_direction,
  target_customer = EXCLUDED.target_customer,
  advantages = EXCLUDED.advantages,
  customer_pain_points = EXCLUDED.customer_pain_points,
  tone_style = EXCLUDED.tone_style,
  taboo_expressions = EXCLUDED.taboo_expressions,
  conversion_goal = EXCLUDED.conversion_goal,
  visible_to_client = EXCLUDED.visible_to_client,
  updated_at = NOW();

RAISE NOTICE '✅ Step 2: 客户档案已创建/更新';

-- ============================================
-- Step 3: 插入测试选题
-- ============================================

INSERT INTO public.topics (
  id,
  client_id,
  industry_id,
  title,
  direction,
  status,
  visible_to_client,
  internal_only
)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
    (SELECT id FROM public.industries WHERE name = '法律服务' LIMIT 1),
    '企业合同审查的5个关键要点',
    '帮助企业主了解合同审查的重要性和关键注意事项',
    'approved',
    true,
    false
  ),
  (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
    (SELECT id FROM public.industries WHERE name = '法律服务' LIMIT 1),
    '劳动合同纠纷如何维权',
    '为员工和企业主提供劳动纠纷处理指南',
    'approved',
    true,
    false
  ),
  (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
    (SELECT id FROM public.industries WHERE name = '法律服务' LIMIT 1),
    '知识产权保护实用指南',
    '帮助创业者了解商标、专利、著作权保护',
    'approved',
    true,
    false
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  direction = EXCLUDED.direction,
  status = EXCLUDED.status,
  visible_to_client = EXCLUDED.visible_to_client,
  internal_only = EXCLUDED.internal_only,
  updated_at = NOW();

RAISE NOTICE '✅ Step 3: 测试选题已创建/更新（3条）';

-- ============================================
-- Step 4: 插入测试文案
-- ============================================

INSERT INTO public.scripts (
  id,
  client_id,
  topic_id,
  title,
  body,
  usage_advice,
  status,
  visible_to_client,
  internal_only
)
VALUES
  (
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '企业合同审查的5个关键要点',
    '【开头】
你知道吗？80%的企业法律纠纷都源于合同条款不清晰。作为企业主，掌握合同审查的关键要点，能帮你规避大部分法律风险。

【正文】
1️⃣ 主体资格审查
确认对方是否具备签约资格，营业执照、授权书一个都不能少。

2️⃣ 权利义务对等
仔细审查双方的权利义务是否平衡，避免"霸王条款"。

3️⃣ 违约责任明确
违约金、赔偿范围、争议解决方式必须写清楚。

4️⃣ 付款条件清晰
付款时间、方式、条件要具体，避免模糊表述。

5️⃣ 法律适用条款
明确适用法律和管辖法院，降低纠纷成本。

【结尾】
合同审查看似简单，实则处处是坑。张律师事务所15年专注企业法律服务，已为500+企业提供合同审查和法律顾问服务。

💼 免费咨询热线：400-XXX-XXXX
📍 地址：XX市XX区XX路XX号',
    '适用场景：
- 公众号推文
- 朋友圈长图文
- 企业微信群发

发布建议：
- 配图：合同审查流程图
- 发布时间：工作日上午10点
- 互动引导：评论区回复"合同"获取审查清单',
    'published',
    true,
    false
  ),
  (
    'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    '劳动合同纠纷如何维权',
    '【开头】
遇到劳动纠纷不知道怎么办？别慌，这篇文章教你正确维权步骤。

【正文】
📌 第一步：收集证据
劳动合同、工资条、考勤记录、聊天记录...能证明劳动关系的材料都要保留。

📌 第二步：协商解决
先尝试与公司协商，很多问题可以通过沟通解决。

📌 第三步：劳动仲裁
协商不成？向劳动仲裁委员会申请仲裁，这是必经程序。

📌 第四步：诉讼维权
对仲裁结果不满意，可以在15天内向法院起诉。

⚠️ 注意时效：劳动争议仲裁时效为1年，从知道或应当知道权利被侵害之日起计算。

【结尾】
劳动维权路漫漫，专业律师来帮忙。张律师事务所劳动法团队，为你的权益保驾护航。

📞 咨询电话：400-XXX-XXXX',
    '适用场景：
- 抖音/视频号短视频脚本
- 小红书图文笔记
- 知乎回答

发布建议：
- 配图：维权流程图
- 标签：#劳动法 #维权指南 #法律咨询
- 互动：鼓励用户分享自己的经历',
    'approved',
    true,
    false
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  usage_advice = EXCLUDED.usage_advice,
  status = EXCLUDED.status,
  visible_to_client = EXCLUDED.visible_to_client,
  internal_only = EXCLUDED.internal_only,
  updated_at = NOW();

RAISE NOTICE '✅ Step 4: 测试文案已创建/更新（2条）';

-- ============================================
-- Step 5: 验证数据完整性
-- ============================================

DO $$
DECLARE
  user_count INTEGER;
  client_count INTEGER;
  profile_count INTEGER;
  topic_count INTEGER;
  script_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users WHERE email = 'client@example.com';
  SELECT COUNT(*) INTO client_count FROM public.clients WHERE id = '8db36fa1-98de-48c4-aaa2-01e7cea8d986';
  SELECT COUNT(*) INTO profile_count FROM public.client_profiles WHERE client_id = '8db36fa1-98de-48c4-aaa2-01e7cea8d986';
  SELECT COUNT(*) INTO topic_count FROM public.topics WHERE client_id = '8db36fa1-98de-48c4-aaa2-01e7cea8d986';
  SELECT COUNT(*) INTO script_count FROM public.scripts WHERE client_id = '8db36fa1-98de-48c4-aaa2-01e7cea8d986';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '数据验证结果';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Clients: %', client_count;
  RAISE NOTICE 'Client Profiles: %', profile_count;
  RAISE NOTICE 'Topics: %', topic_count;
  RAISE NOTICE 'Scripts: %', script_count;
  RAISE NOTICE '========================================';

  IF user_count = 0 THEN
    RAISE EXCEPTION '❌ 测试用户不存在';
  END IF;

  IF client_count = 0 THEN
    RAISE EXCEPTION '❌ 测试客户创建失败';
  END IF;

  RAISE NOTICE '✅ 所有测试数据已成功创建';
END $$;

COMMIT;

-- ============================================
-- 验证 SQL（可选，单独执行）
-- ============================================

-- 验证完整链路
SELECT
  u.id AS user_id,
  u.email AS user_email,
  u.role AS user_role,
  c.id AS client_id,
  c.name AS client_name,
  cp.id AS profile_id,
  cp.client_name AS profile_client_name,
  (SELECT COUNT(*) FROM public.topics WHERE client_id = c.id) AS topic_count,
  (SELECT COUNT(*) FROM public.scripts WHERE client_id = c.id) AS script_count
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
LEFT JOIN public.client_profiles cp ON cp.client_id = c.id
WHERE u.email = 'client@example.com';

-- 预期结果：
-- user_id: e1b6ca76-82cf-4001-bd5f-ba9434d6eade (或其他)
-- client_id: 8db36fa1-98de-48c4-aaa2-01e7cea8d986
-- profile_id: e024acc6-3703-4f39-9181-32586c51664a
-- topic_count: 3
-- script_count: 2
