import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminSupabaseClient } from '../lib/supabase/admin-client';

async function updateDraftScripts() {
  const supabase = getAdminSupabaseClient();

  // 更新所有 draft 状态的脚本为 approved
  const { data, error } = await supabase
    .from('scripts')
    .update({ status: 'approved' })
    .eq('status', 'draft')
    .select('id, title, status');

  if (error) {
    console.error('更新错误:', error);
    return;
  }

  console.log(`✅ 成功更新 ${data.length} 条脚本状态为 approved:\n`);
  data.forEach((script, index) => {
    console.log(`${index + 1}. ${script.title}`);
    console.log(`   ID: ${script.id}`);
    console.log(`   新状态: ${script.status}`);
    console.log('');
  });
}

updateDraftScripts();
