'use client';

import { useEffect, useState } from 'react';

export default function TestCookiePage() {
  const [result, setResult] = useState<{
    status?: number;
    data?: unknown;
    cookies?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function test() {
      try {
        console.log('[TEST] 开始测试 /api/auth/me');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        console.log('[TEST] 响应状态:', response.status);
        const data = await response.json();
        console.log('[TEST] 响应数据:', data);

        setResult({
          status: response.status,
          data: data,
          cookies: document.cookie,
        });
      } catch (error) {
        console.error('[TEST] 错误:', error);
        setResult({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }

    test();
  }, []);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie 测试页面</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
