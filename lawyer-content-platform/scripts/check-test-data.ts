import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTestData() {
  console.log('检查测试数据...\n');

  // 1. 检查 auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('查询 auth.users 失败:', authError);
  } else {
    const testUser = authUser.users.find(u => u.email === 'test@example.com');
    console.log('Auth User:', testUser ? {
      id: testUser.id,
      email: testUser.email,
    } : '未找到');
  }

  // 2. 检查 users 表
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'test@example.com')
    .single();

  if (usersError) {
    console.error('\nusers 表查询失败:', usersError);
  } else {
    console.log('\nusers 表记录:', usersData);
  }

  // 3. 检查 clients 表
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', usersData?.id);

  if (clientsError) {
    console.error('\nclients 表查询失败:', clientsError);
  } else {
    console.log('\nclients 表记录:', clientsData);
  }

  // 4. 检查 client_profiles 表
  if (clientsData && clientsData.length > 0) {
    const clientId = clientsData[0].id;
    const { data: profilesData, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', clientId);

    if (profilesError) {
      console.error('\nclient_profiles 表查询失败:', profilesError);
    } else {
      console.log('\nclient_profiles 表记录 (client_id =', clientId, '):', profilesData);
    }
  }

  // 5. 尝试用 user_id 查询 client_profiles（看看是否误用了 user_id）
  if (usersData) {
    const { data: profilesByUserId, error: profilesByUserIdError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', usersData.id);

    if (profilesByUserIdError) {
      console.error('\n用 user_id 查询 client_profiles 失败:', profilesByUserIdError);
    } else {
      console.log('\n用 user_id 查询 client_profiles 结果:', profilesByUserId);
    }
  }
}

checkTestData().catch(console.error);
