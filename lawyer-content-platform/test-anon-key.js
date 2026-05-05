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

console.log('🔍 使用 ANON KEY 测试查询...\n');

const supabase = createClient(supabaseUrl, anonKey);

async function testQuery() {
  const userId = 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade';
  
  console.log('测试 user_id:', userId);
  console.log('');
  
  // 测试查询
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, user_id')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('❌ 查询失败:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    console.error('  Details:', error.details);
    console.error('  Hint:', error.hint);
  } else {
    console.log('✅ 查询成功:');
    console.log(JSON.stringify(data, null, 2));
  }
}

testQuery().catch(console.error);
