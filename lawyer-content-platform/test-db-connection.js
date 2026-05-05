import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 检查数据库状态...\n');

  // 1. 检查 users 表
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', 'client@example.com');

  if (usersError) {
    console.error('❌ 查询 users 表失败:', usersError);
  } else {
    console.log('✅ Users 表:');
    console.log(JSON.stringify(users, null, 2));
  }

  // 2. 检查 clients 表
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, user_id, client_name');

  if (clientsError) {
    console.error('❌ 查询 clients 表失败:', clientsError);
  } else {
    console.log('\n✅ Clients 表:');
    console.log(JSON.stringify(clients, null, 2));
  }

  // 3. 检查数据链路
  const { data: linkData, error: linkError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      role,
      clients:clients!user_id (
        id,
        client_name,
        user_id
      )
    `)
    .eq('email', 'client@example.com');

  if (linkError) {
    console.error('❌ 查询数据链路失败:', linkError);
  } else {
    console.log('\n✅ 数据链路:');
    console.log(JSON.stringify(linkData, null, 2));
  }
}

checkDatabase().catch(console.error);
