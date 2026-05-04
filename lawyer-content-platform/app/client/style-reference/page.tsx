'use client';

import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useStyleReferences } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { FileText, Lightbulb } from 'lucide-react';

export default function ClientStyleReferencePage() {
  const clientId = useClientId();
  const { data, isLoading, error, refetch } = useStyleReferences(clientId);

  if (isLoading) {
    return (
      <PlatformShell badge="Client" title="风格参考" description="查看风格参考文案和写作指南。">
        <StyleReferenceSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell badge="Client" title="风格参考" description="查看风格参考文案和写作指南。">
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  if (!data || (data.references.length === 0 && !data.profile.tone_style && !data.profile.taboo_expressions)) {
    return (
      <PlatformShell badge="Client" title="风格参考" description="查看风格参考文案和写作指南。">
        <EmptyState
          title="暂无风格参考"
          message="还没有为您设置风格参考文案和指南"
          icon={<FileText className="h-16 w-16" />}
        />
      </PlatformShell>
    );
  }

  return (
    <PlatformShell badge="Client" title="风格参考" description="查看风格参考文案和写作指南。">
      <div className="space-y-6">
        {/* 导航按钮 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/generate" className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            生成文案
          </Link>
        </div>

        {/* 风格指南卡片 */}
        {(data.profile.tone_style || data.profile.taboo_expressions) && (
          <Card className="rounded-[2rem] border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">风格指南</h2>
            </div>
            <div className="space-y-4">
              {data.profile.tone_style && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">语气风格</h3>
                  <p className="text-slate-700 leading-relaxed">{data.profile.tone_style}</p>
                </div>
              )}
              {data.profile.taboo_expressions && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">禁忌表达</h3>
                  <p className="text-slate-700 leading-relaxed">{data.profile.taboo_expressions}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 参考文案列表 */}
        {data.references.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">参考文案</h2>
            {data.references.map((reference) => (
              <StyleReferenceCard key={reference.id} reference={reference} />
            ))}
          </div>
        )}
      </div>
    </PlatformShell>
  );
}

function StyleReferenceCard({ reference }: { reference: { id: string; title: string; body: string; usage_advice: string | null; created_at: string } }) {
  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{reference.title}</h3>
          <p className="text-sm text-slate-500">
            创建于 {new Date(reference.created_at).toLocaleDateString('zh-CN')}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-2">文案内容</h4>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{reference.body}</p>
        </div>
        {reference.usage_advice && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">使用建议</h4>
            <p className="text-sm text-blue-700 leading-relaxed">{reference.usage_advice}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function StyleReferenceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <Skeleton className="h-64 w-full rounded-[2rem]" />
      <Skeleton className="h-64 w-full rounded-[2rem]" />
    </div>
  );
}
