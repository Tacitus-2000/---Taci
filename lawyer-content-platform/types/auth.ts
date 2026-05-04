/**
 * 认证相关类型定义
 */

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string | null;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}
