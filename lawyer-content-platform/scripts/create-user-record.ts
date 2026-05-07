import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

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

async function createUserRecord() {
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';

  // 获取 auth.users 中的用户 ID
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers.users.find(u => u.email === testEmail);

  if (!authUser) {
    console.error('❌ auth.users 中未找到测试用户');
    return;
  }

  console.log('找到 auth 用户:', authUser.id);

  // 检查 users 表中是否已有记录
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .single();

  if (existingUser) {
    console.log('✅ users 表中已有记录');
    console.log('用户:', existingUser);
    return;
  }

  // 创建密码哈希
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // 在 users 表中创建记录
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: testEmail,
      password_hash: passwordHash,
      role: 'client',
      name: '测试用户',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('❌ 创建 users 记录失败:', error);
    return;
  }

  console.log('✅ users 表记录创建成功');
  console.log('用户:', data);
}

createUserRecord().catch(console.error);
