'use client';

import Link from "next/link";
import { useState } from "react";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useScripts } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { ScriptPublic } from '@/types/client';

const ITEMS_PER_PAGE = 20;

export default function ClientScriptsPage() {
  const clientId = useClientId();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const { data: scripts, isLoading, error, refetch } = useScripts(clientId, {
    limit: ITEMS_PER_PAGE,
    offset,
  });

  if (isLoading) {
    return (
      <PlatformShell badge="Client" title="我的文案" description="查看已生成内容、使用建议与反馈状态。">
        <ScriptsSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell badge="Client" title="我的文案" description="查看已生成内容、使用建议与反馈状态。">
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  if (!scripts || scripts.length === 0) {
    return (
      <PlatformShell badge="Client" title="我的文案" description="查看已生成内容、使用建议与反馈状态。">
        <EmptyState
          title="暂无文案"
          message="还没有为您生成任何文案"
          icon={<FileText className="h-16 w-16" />}
        />
      </PlatformShell>
    );
  }

  const hasNextPage = scripts.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 1;

  return (
    <PlatformShell badge="Client" title="我的文案" description="查看已生成内容、使用建议与反馈状态。">
      <div className="space-y-6">
        {/* 导航按钮 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/feedback" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去反馈中心
          </Link>
        </div>

        {/* 文案列表 */}
        <div className="space-y-4">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>

        {/* 分页控件 */}
        {(hasNextPage || hasPrevPage) && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!hasPrevPage}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <span className="text-sm text-slate-600">第 {page} 页 ({offset + 1}-{offset + (scripts?.length || 0)} 条)</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </PlatformShell>
  );
}

function ScriptCard({ script }: { script: ScriptPublic }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
    reviewed: { label: '已审核', color: 'bg-blue-100 text-blue-700' },
    approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
    published: { label: '已发布', color: 'bg-purple-100 text-purple-700' },
  };

  const config = statusConfig[script.status];

  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{script.title}</h3>
            <p className="text-sm text-slate-500">
              创建于 {new Date(script.created_at).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>

        {/* 展开/折叠按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              收起详情
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              展开详情
            </>
          )}
        </button>

        {/* 展开内容 */}
        {isExpanded && (
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">文案内容</h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{script.body}</p>
            </div>
            {script.usage_advice && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">使用建议</h4>
                <p className="text-sm text-blue-700 leading-relaxed">{script.usage_advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function ScriptsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
    </div>
  );
}
