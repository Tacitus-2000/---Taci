const { createClient } = require('@supabase/supabase-js');
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
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function checkRLS() {
  console.log('🔍 检查 RLS 策略状态...\n');
  
  // 查询 RLS 策略
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'clients';
    `
  });
  
  if (error) {
    console.error('❌ 查询失败，尝试直接查询表信息...');
    
    // 检查表是否启用了 RLS
    const { data: tables } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'clients');
    
    console.log('Tables info:', tables);
  } else {
    console.log('✅ RLS 策略:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkRLS().catch(console.error);
