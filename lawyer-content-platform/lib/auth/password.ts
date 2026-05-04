/**
 * 密码加密和验证工具
 */

import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from './constants';

/**
 * 加密密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
