import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 使用 service role key 创建管理员客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';

  console.log('创建测试用户...');
  console.log('邮箱:', testEmail);
  console.log('密码:', testPassword);

  // 检查用户是否已存在
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('查询用户失败:', listError);
    return;
  }

  const existingUser = existingUsers.users.find(u => u.email === testEmail);

  if (existingUser) {
    console.log('✅ 测试用户已存在');
    console.log('用户 ID:', existingUser.id);
    console.log('邮箱:', existingUser.email);
    console.log('创建时间:', existingUser.created_at);
    return;
  }

  // 创建新用户
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true, // 自动确认邮箱
    user_metadata: {
      name: '测试用户'
    }
  });

  if (error) {
    console.error('❌ 创建用户失败:', error);
    return;
  }

  console.log('✅ 测试用户创建成功');
  console.log('用户 ID:', data.user.id);
  console.log('邮箱:', data.user.email);

  // 创建对应的 client_profiles 记录
  const { error: profileError } = await supabase
    .from('client_profiles')
    .insert({
      id: data.user.id,
      name: '测试律所',
      expertise: ['劳动法', '合同法'],
      target_audience: 'HR和企业管理者',
      tone: 'professional',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('⚠️ 创建客户档案失败:', profileError);
  } else {
    console.log('✅ 客户档案创建成功');
  }
}

createTestUser().catch(console.error);
