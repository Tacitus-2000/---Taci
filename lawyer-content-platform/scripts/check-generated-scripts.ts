import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminSupabaseClient } from '../lib/supabase/admin-client';

async function checkScripts() {
  const supabase = getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('查询错误:', error);
    return;
  }

  console.log('最近的脚本记录:');
  if (data && data.length > 0) {
    data.forEach((script, index) => {
      console.log(`\n--- 脚本 ${index + 1} ---`);
      console.log('ID:', script.id);
      console.log('Client ID:', script.client_id);
      console.log('标题:', script.title || '无标题');
      console.log('创建时间:', script.created_at);
      console.log('内容长度:', script.content?.length || 0, '字符');
    });
  } else {
    console.log('没有找到任何脚本记录');
  }
  
  console.log(`\n总共找到 ${data?.length || 0} 条记录`);
}

checkScripts();
