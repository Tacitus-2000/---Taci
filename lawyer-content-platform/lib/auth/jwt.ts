/**
 * JWT Token 生成、验证和刷新
 */

import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/types/auth';
import { JWT_SECRET, JWT_EXPIRATION } from './constants';

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * 生成 JWT Token
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret);

  return token;
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'client',
    };
  } catch (error) {
    console.error('Token 验证失败:', error);
    return null;
  }
}

/**
 * 刷新 Token（生成新的 Token）
 */
export async function refreshToken(oldToken: string): Promise<string | null> {
  const payload = await verifyToken(oldToken);

  if (!payload) {
    return null;
  }

  return generateToken(payload);
}
