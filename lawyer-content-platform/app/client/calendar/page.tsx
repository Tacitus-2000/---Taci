'use client';

import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useCalendar } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { Calendar, Lightbulb, FileText, TrendingUp } from 'lucide-react';
import type { CalendarItem } from '@/types/client';

export default function ClientCalendarPage() {
  const clientId = useClientId();
  const { data, isLoading, error, refetch } = useCalendar(clientId);

  if (isLoading) {
    return (
      <PlatformShell badge="Client" title="内容日历" description="查看内容排期、发布时间和发布建议。">
        <CalendarSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell badge="Client" title="内容日历" description="查看内容排期、发布时间和发布建议。">
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <PlatformShell badge="Client" title="内容日历" description="查看内容排期、发布时间和发布建议。">
        <EmptyState
          title="暂无内容"
          message="还没有任何选题或文案"
          icon={<Calendar className="h-16 w-16" />}
        />
      </PlatformShell>
    );
  }

  return (
    <PlatformShell badge="Client" title="内容日历" description="查看内容排期、发布时间和发布建议。">
      <div className="space-y-6">
        {/* 导航按钮 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/style-reference" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去风格参考
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CalendarSummaryCard
            icon={<Lightbulb className="h-5 w-5 text-amber-600" />}
            label="总选题数"
            value={data.summary.total_topics}
            color="bg-amber-50"
          />
          <CalendarSummaryCard
            icon={<FileText className="h-5 w-5 text-blue-600" />}
            label="总文案数"
            value={data.summary.total_scripts}
            color="bg-blue-50"
          />
          <CalendarSummaryCard
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            label="已通过选题"
            value={data.summary.approved_topics}
            color="bg-green-50"
          />
          <CalendarSummaryCard
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            label="已发布文案"
            value={data.summary.published_scripts}
            color="bg-purple-50"
          />
        </div>

        {/* 时间线 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">内容时间线</h2>
          <div className="space-y-3">
            {data.items.map((item) => (
              <CalendarItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}

function CalendarSummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card className={`rounded-2xl border-slate-200 p-4 ${color}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function CalendarItemCard({ item }: { item: CalendarItem }) {
  const statusLabels: Record<string, string> = {
    draft: '草稿',
    approved: '已通过',
    rejected: '已拒绝',
    reviewed: '已审核',
    published: '已发布',
  };

  const typeConfig = {
    topic: { icon: <Lightbulb className="h-5 w-5" />, label: '选题', color: 'bg-amber-100 text-amber-700' },
    script: { icon: <FileText className="h-5 w-5" />, label: '文案', color: 'bg-blue-100 text-blue-700' },
  };

  const config = typeConfig[item.type];

  return (
    <Card className="rounded-2xl border-slate-200 p-4">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 rounded-full p-2 ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">{item.title}</h3>
            <Badge variant="secondary" className="flex-shrink-0">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>状态: {statusLabels[item.status] || item.status}</span>
            <span>创建于 {new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}
