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

async function createClientProfile() {
  const testEmail = 'test@example.com';

  // 获取用户 ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', testEmail)
    .single();

  if (!user) {
    console.error('❌ 未找到用户');
    return;
  }

  console.log('用户 ID:', user.id);

  // 检查是否已有客户档案
  const { data: existingProfile } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    console.log('✅ 客户档案已存在');
    console.log('档案:', existingProfile);
    return;
  }

  // 创建客户档案
  const { data, error } = await supabase
    .from('client_profiles')
    .insert({
      id: user.id,
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

  if (error) {
    console.error('❌ 创建客户档案失败:', error);
    return;
  }

  console.log('✅ 客户档案创建成功');
  console.log('档案:', data);
}

createClientProfile().catch(console.error);
