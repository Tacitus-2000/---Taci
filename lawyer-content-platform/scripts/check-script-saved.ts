/**
 * 验证脚本是否成功保存到数据库
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(__dirname, '../.env.local') });

async function checkScriptSaved() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 查询最近保存的脚本...\n');

  // 查询最近的脚本记录
  const { data: scripts, error } = await supabase
    .from('scripts')
    .select('id, client_id, title, created_at, status, visible_to_client')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ 查询失败:', error.message);
    return;
  }

  if (!scripts || scripts.length === 0) {
    console.log('⚠️  数据库中没有脚本记录');
    return;
  }

  console.log(`✅ 找到 ${scripts.length} 条脚本记录:\n`);

  for (const script of scripts) {
    console.log(`📝 脚本 ID: ${script.id}`);
    console.log(`   标题: ${script.title}`);
    console.log(`   客户 ID: ${script.client_id}`);
    console.log(`   状态: ${script.status}`);
    console.log(`   可见性: ${script.visible_to_client ? '客户可见' : '客户不可见'}`);
    console.log(`   创建时间: ${script.created_at}`);
    console.log('');
  }

  // 查询最新脚本的完整内容
  const latestScript = scripts[0];
  const { data: fullScript, error: fullError } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', latestScript.id)
    .single();

  if (fullError) {
    console.error('❌ 查询完整内容失败:', fullError.message);
    return;
  }

  console.log('📄 最新脚本的完整内容:\n');
  console.log(`标题: ${fullScript.title}`);
  console.log(`正文长度: ${fullScript.body?.length || 0} 字符`);
  console.log(`正文预览:\n${fullScript.body?.substring(0, 200)}...\n`);
}

checkScriptSaved().catch(console.error);
