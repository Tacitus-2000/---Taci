'use client';

import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useClientProfile } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';

export default function ClientProfilePage() {
  const clientId = useClientId();
  const { data: profile, isLoading, error, refetch } = useClientProfile(clientId || '');

  // 未登录状态
  if (!clientId) {
    return (
      <PlatformShell badge="Client" title="我的档案" description="查看客户信息、行业方向和服务偏好。">
        <ErrorMessage message="未找到客户信息，请重新登录" onRetry={() => window.location.href = '/client/login'} />
      </PlatformShell>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <PlatformShell badge="Client" title="我的档案" description="查看客户信息、行业方向和服务偏好。">
        <ProfileSkeleton />
      </PlatformShell>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PlatformShell badge="Client" title="我的档案" description="查看客户信息、行业方向和服务偏好。">
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  // 空状态
  if (!profile) {
    return (
      <PlatformShell badge="Client" title="我的档案" description="查看客户信息、行业方向和服务偏好。">
        <EmptyState
          title="暂无档案信息"
          message="请联系管理员完善您的客户档案"
        />
      </PlatformShell>
    );
  }

  // 正常渲染
  return (
    <PlatformShell badge="Client" title="我的档案" description="查看客户信息、行业方向和服务偏好。">
      <div className="space-y-6">
        {/* 导航按钮 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/scripts" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去我的文案
          </Link>
        </div>

        {/* 基本信息卡片 */}
        <Card className="rounded-[2rem] border-slate-200 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">客户名称</h3>
              <p className="text-lg font-semibold text-slate-900">{profile.client_name}</p>
            </div>
            {profile.industry_name && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">所属行业</h3>
                <Badge variant="secondary" className="text-sm">
                  {profile.industry_name}
                </Badge>
              </div>
            )}
          </div>
        </Card>

        {/* 业务定位卡片 */}
        <Card className="rounded-[2rem] border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">业务定位</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">细分方向</h3>
              <p className="text-slate-700">{profile.niche_direction || '暂未设置'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">目标客户</h3>
              <p className="text-slate-700">{profile.target_customer || '暂未设置'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">核心优势</h3>
              <p className="text-slate-700">{profile.advantages || '暂未设置'}</p>
            </div>
          </div>
        </Card>

        {/* 内容策略卡片 */}
        <Card className="rounded-[2rem] border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">内容策略</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">客户痛点</h3>
              <p className="text-slate-700">{profile.customer_pain_points || '暂未设置'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">语气风格</h3>
              <p className="text-slate-700">{profile.tone_style || '暂未设置'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">禁忌表达</h3>
              <p className="text-slate-700">{profile.taboo_expressions || '暂未设置'}</p>
            </div>
          </div>
        </Card>

        {/* 转化目标卡片 */}
        <Card className="rounded-[2rem] border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">转化目标</h2>
          <p className="text-slate-700">{profile.conversion_goal || '暂未设置'}</p>
        </Card>
      </div>
    </PlatformShell>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
    </div>
  );
}
