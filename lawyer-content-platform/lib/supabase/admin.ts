/**
 * Supabase Admin 客户端配置
 * 使用 Service Role Key，拥有完整的数据库访问权限
 *
 * 警告：此客户端绕过 RLS 策略，仅用于服务端 Admin API
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * 获取 Supabase Admin 客户端实例（延迟初始化）
 *
 * 使用 Service Role Key，绕过 RLS 策略
 *
 * 使用方法：
 * ```typescript
 * import { getSupabaseAdmin } from '@/lib/supabase/admin';
 *
 * // 查询所有数据（包括 internal_notes）
 * const supabase = getSupabaseAdmin();
 * const { data, error } = await supabase
 *   .from('client_profiles')
 *   .select('*')
 *   .eq('id', profileId);
 * ```
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    // 从环境变量读取配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // 验证配置
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Supabase Admin 配置未设置，请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminInstance;
}

/**
 * 向后兼容的导出
 * @deprecated 使用 getSupabaseAdmin() 代替
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});
