/**
 * useClientId Hook
 * 用于获取和管理客户 ID（硬编码用于测试）
 */

'use client';

import { useState, useEffect } from 'react';

// 硬编码的测试客户 ID
const TEST_CLIENT_ID = 'test-client-001';

/**
 * 获取客户 ID
 * 当前使用硬编码的测试 ID，后续可以从 URL、Context 或认证系统获取
 */
export function useClientId(): string {
  const [clientId] = useState<string>(TEST_CLIENT_ID);

  useEffect(() => {
    // 可以在这里添加从 URL 或其他来源获取 clientId 的逻辑
    // 例如：const params = useSearchParams();
    // const id = params.get('client_id');
  }, []);

  return clientId;
}

/**
 * 获取客户 ID（同步版本）
 */
export function getClientId(): string {
  return TEST_CLIENT_ID;
}
