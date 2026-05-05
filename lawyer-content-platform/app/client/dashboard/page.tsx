'use client';

import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useClientProfile, useScripts, useTopics, useCalendar } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, FileText, Lightbulb, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';

export default function ClientDashboardPage() {
  const clientId = useClientId();

  const statusLabels: Record<string, string> = {
    draft: '草稿',
    approved: '已通过',
    rejected: '已拒绝',
    reviewed: '已审核',
    published: '已发布',
  };

  const { data: scripts, isLoading: scriptsLoading } = useScripts(clientId || '', { limit: 5 });
  const { data: topics, isLoading: topicsLoading } = useTopics(clientId || '', { limit: 5 });
  const { data: calendar, isLoading: calendarLoading } = useCalendar(clientId || '');

  const isLoading = scriptsLoading || topicsLoading || calendarLoading;

  if (!clientId) {
    return (
      <PlatformShell badge="Client" title="客户首页" description="查看内容概览、最新动态和快捷入口。">
        <Card className="rounded-[2rem] border-slate-200 p-8 text-center">
          <p className="text-slate-600">未找到客户信息，请重新登录</p>
          <Button onClick={() => window.location.href = '/client/login'} className="mt-4">
            返回登录
          </Button>
        </Card>
      </PlatformShell>
    );
  }

  if (isLoading) {
    return (
      <PlatformShell badge="Client" title="客户首页" description="查看待办事项和快速统计。">
        <DashboardSkeleton />
      </PlatformShell>
    );
  }

  return (
    <PlatformShell badge="Client" title="客户首页" description="查看待办事项和快速统计。">
      <div className="space-y-6">
        {/* 快速操作 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/profile" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors">
            我的档案
          </Link>
          <Link href="/client/generate" className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
            生成文案
          </Link>
          <Link href="/client/calendar" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-100 transition-colors">
            内容日历
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            icon={<Lightbulb className="h-5 w-5 text-amber-600" />}
            label="总选题"
            value={calendar?.summary.total_topics || 0}
            color="bg-amber-50"
            link="/client/topics"
          />
          <DashboardStatCard
            icon={<FileText className="h-5 w-5 text-blue-600" />}
            label="总文案"
            value={calendar?.summary.total_scripts || 0}
            color="bg-blue-50"
            link="/client/scripts"
          />
          <DashboardStatCard
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            label="已通过选题"
            value={calendar?.summary.approved_topics || 0}
            color="bg-green-50"
            link="/client/topics"
          />
          <DashboardStatCard
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            label="已发布文案"
            value={calendar?.summary.published_scripts || 0}
            color="bg-purple-50"
            link="/client/scripts"
          />
        </div>

        {/* 最近活动 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 最近文案 */}
          <Card className="rounded-[2rem] border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">最近文案</h2>
              </div>
              <Link href="/client/scripts" className="text-sm text-blue-600 hover:text-blue-700">
                查看全部
              </Link>
            </div>
            {scripts && scripts.length > 0 ? (
              <div className="space-y-3">
                {scripts.slice(0, 3).map((script) => (
                  <div key={script.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{script.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(script.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {statusLabels[script.status] || script.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">暂无文案</p>
            )}
          </Card>

          {/* 最近选题 */}
          <Card className="rounded-[2rem] border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-slate-900">最近选题</h2>
              </div>
              <Link href="/client/topics" className="text-sm text-amber-600 hover:text-amber-700">
                查看全部
              </Link>
            </div>
            {topics && topics.length > 0 ? (
              <div className="space-y-3">
                {topics.slice(0, 3).map((topic) => (
                  <div key={topic.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{topic.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(topic.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {statusLabels[topic.status] || topic.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">暂无选题</p>
            )}
          </Card>
        </div>

        {/* 快速入口 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={<Sparkles className="h-6 w-6 text-purple-600" />}
            title="生成新文案"
            description="使用 AI 快速生成内容"
            link="/client/generate"
            color="bg-purple-50"
          />
          <QuickActionCard
            icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
            title="提交反馈"
            description="分享您的意见和建议"
            link="/client/feedback"
            color="bg-blue-50"
          />
          <QuickActionCard
            icon={<User className="h-6 w-6 text-sky-600" />}
            title="查看档案"
            description="管理您的客户信息"
            link="/client/profile"
            color="bg-sky-50"
          />
        </div>
      </div>
    </PlatformShell>
  );
}

function DashboardStatCard({ icon, label, value, color, link }: { icon: React.ReactNode; label: string; value: number; color: string; link: string }) {
  return (
    <Link href={link}>
      <Card className={`rounded-2xl border-slate-200 p-4 ${color} hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function QuickActionCard({ icon, title, description, link, color }: { icon: React.ReactNode; title: string; description: string; link: string; color: string }) {
  return (
    <Link href={link}>
      <Card className={`rounded-2xl border-slate-200 p-6 ${color} hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-[2rem]" />
        <Skeleton className="h-64 w-full rounded-[2rem]" />
      </div>
    </div>
  );
}
