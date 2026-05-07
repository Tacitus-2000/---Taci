import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminSupabaseClient } from '../lib/supabase/admin-client';

async function verifySchema() {
  const supabase = getAdminSupabaseClient();

  // 查询最新的3条脚本记录
  const { data, error } = await supabase
    .from('scripts')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('查询错误:', error);
    return;
  }

  console.log('✅ 最新生成的脚本记录:\n');
  data.forEach((script, index) => {
    console.log(`${index + 1}. 标题: ${script.title}`);
    console.log(`   ID: ${script.id}`);
    console.log(`   Body 长度: ${script.body?.length || 0} 字符`);
    console.log(`   创建时间: ${script.created_at}`);
    console.log(`   内容预览: ${script.body?.substring(0, 100)}...`);
    console.log('');
  });
}

verifySchema();
