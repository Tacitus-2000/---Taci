/**
 * Supabase Admin 客户端配置
 * 使用 SERVICE_ROLE_KEY，绕过 RLS 策略
 * 仅用于服务器端操作和测试脚本
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminSupabaseInstance: SupabaseClient | null = null;

/**
 * 获取 Supabase Admin 客户端实例（延迟初始化）
 *
 * ⚠️ 警告：此客户端使用 SERVICE_ROLE_KEY，绕过所有 RLS 策略
 * 仅在服务器端使用，切勿暴露给客户端
 *
 * 使用场景：
 * - 后端 API 路由
 * - 测试脚本
 * - 数据迁移脚本
 * - Agent 工作流执行
 */
export function getAdminSupabaseClient(): SupabaseClient {
  if (!adminSupabaseInstance) {
    // 从环境变量读取配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // 验证配置
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Supabase Admin 配置未设置，请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    adminSupabaseInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminSupabaseInstance;
}
