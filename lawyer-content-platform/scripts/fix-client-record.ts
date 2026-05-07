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

async function fixClientRecord() {
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

  // 更新 clients 记录，添加 user_id 字段
  const { data, error } = await supabase
    .from('clients')
    .update({ user_id: user.id })
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('❌ 更新 clients 记录失败:', error);
    return;
  }

  console.log('✅ clients 记录已更新，添加了 user_id');
  console.log('记录:', data);
}

fixClientRecord().catch(console.error);
