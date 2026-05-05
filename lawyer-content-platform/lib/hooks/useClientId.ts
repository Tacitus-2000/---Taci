/**
 * useClientId Hook
 * 用于获取和管理客户 ID（从服务端 API 获取）
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * 从服务端 API 获取客户 ID
 * 因为 Cookie 设置了 httpOnly，JavaScript 无法直接读取
 */
async function fetchClientIdFromServer(): Promise<string | null> {
  try {
    const response = await fetch('/api/client/auth/me', {
      credentials: 'include', // 包含 Cookie
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.success && data.user && data.user.role === 'client') {
      return data.user.userId;
    }

    return null;
  } catch (error) {
    console.error('获取客户 ID 失败:', error);
    return null;
  }
}

/**
 * 获取客户 ID
 * 从服务端 API 获取当前登录客户的 ID
 */
export function useClientId(): string | null {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadClientId = async () => {
      const id = await fetchClientIdFromServer();
      if (mounted) {
        setClientId(id);
        setIsLoading(false);
      }
    };

    loadClientId();

    return () => {
      mounted = false;
    };
  }, []);

  return clientId;
}

/**
 * 获取客户 ID（异步版本）
 */
export async function getClientId(): Promise<string | null> {
  return fetchClientIdFromServer();
}

