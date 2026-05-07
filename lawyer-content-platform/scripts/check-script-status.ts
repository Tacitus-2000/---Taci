import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminSupabaseClient } from '../lib/supabase/admin-client';

async function checkStatus() {
  const supabase = getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('scripts')
    .select('id, title, status, visible_to_client, internal_only, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('查询错误:', error);
    return;
  }

  console.log('脚本状态检查:\n');
  data.forEach((script, index) => {
    console.log(`${index + 1}. ${script.title}`);
    console.log(`   状态: ${script.status}`);
    console.log(`   对客户可见: ${script.visible_to_client}`);
    console.log(`   仅内部: ${script.internal_only}`);
    console.log(`   创建时间: ${script.created_at}`);
    console.log('');
  });
}

checkStatus();
