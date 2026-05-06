/**
 * 种子数据脚本
 * 为测试 DataAgent 创建测试数据
 */

import 'dotenv/config';
import { getSupabaseClient } from '../lib/supabase/client';

async function seedTestData() {
  console.log('='.repeat(60));
  console.log('创建测试数据');
  console.log('='.repeat(60));
  console.log();

  const supabase = getSupabaseClient();

  try {
    // 1. 创建测试客户
    console.log('1. 创建测试客户...');
    const testClientId = 'test-client-001';

    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', testClientId)
      .single();

    if (!existingClient) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          id: testClientId,
          name: '张律师事务所',
          industry_id: 'legal-services',
          package_name: '标准版',
          status: 'active',
          content_progress: 0,
        });

      if (clientError) {
        console.error('  ❌ 创建客户失败:', clientError.message);
      } else {
        console.log('  ✅ 客户创建成功');
      }
    } else {
      console.log('  ℹ️  客户已存在，跳过创建');
    }

    // 2. 创建测试客户档案
    console.log('2. 创建测试客户档案...');
    const testProfileId = 'test-profile-001';

    const { data: existingProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('id', testProfileId)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          id: testProfileId,
          client_id: testClientId,
          industry_id: 'legal-services',
          client_name: '张律师',
          industry_name: '法律服务',
          niche_direction: '企业法律顾问，专注中小企业合同审查和股权设计',
          target_customer: '中小企业主、创业者',
          advantages: '10年执业经验，处理过500+企业法律事务，擅长合同法和公司法',
          customer_pain_points: '合同条款不清晰导致纠纷、股权结构不合理、不了解法律风险',
          tone_style: '专业但不失亲和力，用通俗语言解释法律问题',
          taboo_expressions: '保证胜诉、100%成功、绝对没问题',
          conversion_goal: '引导客户预约免费咨询，建立信任关系',
          internal_notes: '客户希望每周发布1-2篇内容，重点在微信公众号和知乎',
          visible_to_client: true,
        });

      if (profileError) {
        console.error('  ❌ 创建客户档案失败:', profileError.message);
      } else {
        console.log('  ✅ 客户档案创建成功');
      }
    } else {
      console.log('  ℹ️  客户档案已存在，跳过创建');
    }

    // 3. 创建测试行业模板（可选）
    console.log('3. 创建测试行业模板...');
    const testTemplateId = 'test-template-001';

    const { data: existingTemplate } = await supabase
      .from('industry_templates')
      .select('id')
      .eq('id', testTemplateId)
      .single();

    if (!existingTemplate) {
      const { error: templateError } = await supabase
        .from('industry_templates')
        .insert({
          id: testTemplateId,
          industry_id: 'legal-services',
          template_code: 'legal-standard',
          template_name: '法律服务标准模板',
          default_content_columns: [
            { name: 'title', label: '标题', required: true },
            { name: 'hook', label: '开头', required: true },
            { name: 'body', label: '正文', required: true },
            { name: 'cta', label: '行动号召', required: false },
          ],
          review_rules: [
            { type: 'length', min: 800, max: 2500 },
            { type: 'readability', minScore: 65 },
            { type: 'compliance', required: true },
          ],
          default_prompt_types: ['profile', 'topic', 'script', 'review'],
          topic_structure: [
            { section: 'hook', label: '吸引开头', required: true },
            { section: 'problem', label: '问题分析', required: true },
            { section: 'solution', label: '解决方案', required: true },
            { section: 'case', label: '案例说明', required: false },
            { section: 'cta', label: '行动号召', required: true },
          ],
          risk_rules: [
            { type: 'compliance', severity: 'high', keywords: ['保证胜诉', '100%成功'] },
            { type: 'accuracy', severity: 'medium', keywords: ['法律条文', '判例引用'] },
          ],
          active: true,
          version: '1.0.0',
        });

      if (templateError) {
        console.error('  ❌ 创建行业模板失败:', templateError.message);
      } else {
        console.log('  ✅ 行业模板创建成功');
      }
    } else {
      console.log('  ℹ️  行业模板已存在，跳过创建');
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✅ 测试数据创建完成');
    console.log('='.repeat(60));
    console.log();
    console.log('测试数据 ID:');
    console.log(`  客户 ID: ${testClientId}`);
    console.log(`  档案 ID: ${testProfileId}`);
    console.log(`  模板 ID: ${testTemplateId}`);
    console.log();
    console.log('使用以下命令测试 DataAgent:');
    console.log('  npm run test:data-agent');
    console.log();

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    process.exit(1);
  }
}

// 运行脚本
seedTestData().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
