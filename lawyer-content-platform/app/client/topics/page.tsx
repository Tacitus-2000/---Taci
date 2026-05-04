'use client';

import Link from "next/link";
import { useState } from "react";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useTopics } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TopicPublic } from '@/types/client';

const ITEMS_PER_PAGE = 20;

export default function ClientTopicsPage() {
  const clientId = useClientId();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const { data: topics, isLoading, error, refetch } = useTopics(clientId, {
    limit: ITEMS_PER_PAGE,
    offset,
  });

  if (isLoading) {
    return (
      <PlatformShell badge="Client" title="选题需求" description="查看选题列表和审核状态。">
        <TopicsSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell badge="Client" title="选题需求" description="查看选题列表和审核状态。">
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <PlatformShell badge="Client" title="选题需求" description="查看选题列表和审核状态。">
        <EmptyState
          title="暂无选题"
          message="还没有为您创建任何选题"
          icon={<Lightbulb className="h-16 w-16" />}
        />
      </PlatformShell>
    );
  }

  const hasNextPage = topics.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 1;

  return (
    <PlatformShell badge="Client" title="选题需求" description="查看选题列表和审核状态。">
      <div className="space-y-6">
        {/* 导航按钮 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/calendar" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
            去内容日历
          </Link>
        </div>

        {/* 选题列表 */}
        <div className="space-y-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
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
            <span className="text-sm text-slate-600">第 {page} 页 ({offset + 1}-{offset + (topics?.length || 0)} 条)</span>
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

function TopicCard({ topic }: { topic: TopicPublic }) {
  const statusConfig = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
    approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
    rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[topic.status];

  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{topic.title}</h3>
            <p className="text-sm text-slate-500">
              创建于 {new Date(topic.created_at).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
        {topic.direction && (
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-2">内容方向</h4>
            <p className="text-slate-700 leading-relaxed">{topic.direction}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function TopicsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
    </div>
  );
}
