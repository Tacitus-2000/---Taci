const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 读取环境变量
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 使用真实环境变量测试 RLS 策略...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('');

const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  // 测试 1: 查询所有 clients（不使用 .single()）
  console.log('1️⃣ 查询所有 clients:');
  const { data: allClients, error: error1 } = await supabase
    .from('clients')
    .select('id, name, user_id');
  
  if (error1) {
    console.log('❌ 错误:', error1.message);
  } else {
    console.log('✅ 成功，返回', allClients?.length || 0, '条记录');
    if (allClients && allClients.length > 0) {
      console.log('数据:', JSON.stringify(allClients, null, 2));
    }
  }
  
  // 测试 2: 查询特定 user_id 的 client（不使用 .single()）
  console.log('\n2️⃣ 查询特定 user_id 的 client:');
  const { data: clients, error: error2 } = await supabase
    .from('clients')
    .select('id, name, user_id')
    .eq('user_id', 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade');
  
  if (error2) {
    console.log('❌ 错误:', error2.message);
  } else {
    console.log('✅ 成功，返回', clients?.length || 0, '条记录');
    if (clients && clients.length > 0) {
      console.log('数据:', JSON.stringify(clients, null, 2));
    }
  }
}

test().catch(console.error);
