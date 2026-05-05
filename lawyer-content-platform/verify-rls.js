const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfkzqhqxqxqxqxqx.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3pxaHF4cXhxeHF4cXgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY1NjAwMCwiZXhwIjoyMDUxMjMyMDAwfQ.fake';

const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  console.log('🔍 测试 RLS 策略...\n');
  
  // 测试 1: 查询所有 clients
  console.log('1️⃣ 查询所有 clients:');
  const { data: allClients, error: error1 } = await supabase
    .from('clients')
    .select('*');
  
  if (error1) {
    console.log('❌ 错误:', error1);
  } else {
    console.log('✅ 成功，返回', allClients?.length || 0, '条记录');
    console.log('数据:', JSON.stringify(allClients, null, 2));
  }
  
  console.log('\n2️⃣ 查询特定 user_id 的 client:');
  const { data: client, error: error2 } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade')
    .single();
  
  if (error2) {
    console.log('❌ 错误:', error2);
  } else {
    console.log('✅ 成功');
    console.log('数据:', JSON.stringify(client, null, 2));
  }
}

test();
