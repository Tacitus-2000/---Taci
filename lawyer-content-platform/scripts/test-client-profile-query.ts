import { getSupabaseClient } from '../lib/supabase/client';

async function testQuery() {
  const supabase = getSupabaseClient();
  const clientId = '4ff3cf3d-4e9f-4f8a-85f4-c79c88f6ec5b';

  console.log('测试查询 client_profiles...');
  console.log('clientId:', clientId);

  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('查询失败:', error);
  } else {
    console.log('查询成功:', data);
  }
}

testQuery().catch(console.error);
