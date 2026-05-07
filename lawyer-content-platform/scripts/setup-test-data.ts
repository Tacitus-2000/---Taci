import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTestData() {
  const testEmail = 'test@example.com';

  // 1. 获取用户 ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', testEmail)
    .single();

  if (!user) {
    console.error('❌ 未找到用户');
    return;
  }

  console.log('✅ 用户 ID:', user.id);

  // 2. 检查并创建 clients 记录
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existingClient) {
    console.log('✅ clients 记录已存在');
  } else {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: user.id,
        name: '测试律所',
        status: 'active',
        content_progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('❌ 创建 clients 记录失败:', clientError);
      return;
    }

    console.log('✅ clients 记录创建成功');
  }

  // 3. 检查并创建 client_profiles 记录
  const { data: existingProfile } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('client_id', user.id)
    .single();

  if (existingProfile) {
    console.log('✅ client_profiles 记录已存在');
    console.log('档案:', existingProfile);
  } else {
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        client_id: user.id,
        client_name: '测试律所',
        niche_direction: '劳动法、合同法、公司法',
        target_customer: 'HR和企业管理者',
        tone_style: 'professional',
        visible_to_client: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ 创建 client_profiles 记录失败:', profileError);
      return;
    }

    console.log('✅ client_profiles 记录创建成功');
    console.log('档案:', profile);
  }

  console.log('\n✅ 测试数据设置完成！');
}

setupTestData().catch(console.error);
