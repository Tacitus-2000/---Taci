import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminSupabaseClient } from '../lib/supabase/admin-client';

async function finalVerification() {
  const supabase = getAdminSupabaseClient();

  const { data, error } = await supabase
    .from('scripts')
    .select('id, title, body, status, created_at')
    .eq('client_id', '4ff3cf3d-4e9f-4f8a-85f4-c79c88f6ec5b')
    .order('created_at', { ascending: false })
    .limit(2);

  if (error) {
    console.error('查询错误:', error);
    return;
  }

  console.log('✅ 最终验证 - 生成的脚本记录:\n');
  data.forEach((script, index) => {
    console.log(`${index + 1}. 标题: ${script.title}`);
    console.log(`   状态: ${script.status}`);
    console.log(`   Body 长度: ${script.body?.length || 0} 字符`);
    console.log(`   创建时间: ${script.created_at}`);
    console.log(`   内容预览: ${script.body?.substring(0, 100)}...`);
    console.log('');
  });
}

finalVerification();
