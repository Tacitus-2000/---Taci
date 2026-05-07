import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminSupabaseClient } from '../lib/supabase/admin-client';

async function checkScriptDetails() {
  const supabase = getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('查询错误:', error);
    return;
  }

  console.log('最新脚本详情:');
  console.log('ID:', data.id);
  console.log('标题:', data.title);
  console.log('Body 字段:', data.body);
  console.log('Body 类型:', typeof data.body);
  console.log('Body 长度:', data.body?.length || 0);
  console.log('Content 字段:', data.content);
  console.log('Content 类型:', typeof data.content);
  console.log('Content 长度:', data.content?.length || 0);
  console.log('\n所有字段:');
  console.log(Object.keys(data));
}

checkScriptDetails();
