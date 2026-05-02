/**
 * Supabase 客户端配置
 * 提供类型安全的 Supabase 实例
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端实例（延迟初始化）
 *
 * 使用方法：
 * ```typescript
 * import { getSupabaseClient } from '@/lib/supabase/client';
 *
 * // 查询数据
 * const supabase = getSupabaseClient();
 * const { data, error } = await supabase
 *   .from('workflows')
 *   .select('*')
 *   .eq('id', workflowId);
 * ```
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    // 从环境变量读取配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // 验证配置
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase 配置未设置，请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // API Routes 不需要持久化会话
      },
    });
  }

  return supabaseInstance;
}

/**
 * 向后兼容的导出
 * @deprecated 使用 getSupabaseClient() 代替
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

/**
 * 数据库表类型定义
 * 根据实际数据库 schema 更新这些类型
 */
export interface Database {
  public: {
    Tables: {
      workflows: {
        Row: {
          id: string;
          lawyer_info: Record<string, unknown>;
          status: 'pending' | 'running' | 'completed' | 'failed';
          current_step: string;
          positioning_result: Record<string, unknown> | null;
          topic_result: Record<string, unknown> | null;
          content_result: Record<string, unknown> | null;
          review_result: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          lawyer_info: Record<string, unknown>;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          current_step?: string;
          positioning_result?: Record<string, unknown> | null;
          topic_result?: Record<string, unknown> | null;
          content_result?: Record<string, unknown> | null;
          review_result?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lawyer_info?: Record<string, unknown>;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          current_step?: string;
          positioning_result?: Record<string, unknown> | null;
          topic_result?: Record<string, unknown> | null;
          content_result?: Record<string, unknown> | null;
          review_result?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

/**
 * 类型安全的 Supabase 客户端
 */
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;
