/**
 * 认证系统常量
 */

// JWT 配置
// 延迟检查环境变量，避免构建时失败
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 环境变量未设置，请在 .env.local 中配置');
  }
  return secret;
}

// 导出常量供类型检查使用（构建时使用占位符）
export const JWT_SECRET = process.env.JWT_SECRET || '__BUILD_TIME_PLACEHOLDER__';
export const JWT_EXPIRATION = '7d'; // 7 天

// Cookie 配置
export const ADMIN_TOKEN_COOKIE = 'admin_token';
export const CLIENT_TOKEN_COOKIE = 'client_token';

// Cookie 选项
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 天（秒）
  path: '/',
};

// 密码加密配置
export const BCRYPT_SALT_ROUNDS = 10;

// 路由配置
export const ADMIN_LOGIN_PATH = '/admin/login';
export const CLIENT_LOGIN_PATH = '/client/login';
export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
export const CLIENT_DASHBOARD_PATH = '/client/dashboard';

// 公开路由（不需要认证）
export const PUBLIC_ROUTES = [
  '/admin/login',
  '/client/login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
  '/api/admin/auth/me',  // Admin 用户信息
  '/api/client/auth/login',
  '/api/client/auth/logout',
  '/api/client/auth/me',  // Client 用户信息
  '/api/auth/register',
  '/api/auth/reset-password',
  '/api/auth/reset-password/confirm',
  '/api/health',
  '/api/workflow/start',
  '/api/workflow/status',
  '/api/workflow/result',
  // Admin API 路由（暂时开放，后续添加认证）
  '/api/admin/clients',
  '/api/admin/client-profiles',
  '/api/admin/topics',
  '/api/admin/scripts',
  '/api/admin/reviews',
  '/api/admin/agent-runs',
  '/api/admin/prompts',
  // Client API 路由（暂时开放，后续添加认证）
  '/api/client/profile',
  '/api/client/scripts',
  '/api/client/topics',
  '/api/client/calendar',
  '/api/client/style-reference',
  '/api/client/feedback',
  '/api/client/generate',
];

// Admin 路由前缀
export const ADMIN_ROUTES = ['/admin'];

// Client 路由前缀
export const CLIENT_ROUTES = ['/client'];
