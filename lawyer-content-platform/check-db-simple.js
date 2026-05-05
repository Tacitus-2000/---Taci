const { createClient } = require('@supabase/supabase-js');

// 从 .env.local 读取环境变量
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 检查数据库状态...\n');

  // 1. 检查 users 表
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', 'client@example.com');

  console.log('✅ Users 表:');
  console.log(JSON.stringify(users, null, 2));

  // 2. 检查 clients 表（查询所有列）
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .limit(5);

  if (clientsError) {
    console.error('\n❌ 查询 clients 表失败:', clientsError.message);
  } else {
    console.log('\n✅ Clients 表:');
    console.log(JSON.stringify(clients, null, 2));
  }
}

checkDatabase().catch(console.error);
