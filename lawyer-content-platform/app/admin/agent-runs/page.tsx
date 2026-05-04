'use client';

import { useState } from 'react';
import { PlatformShell } from '@/app/_components/PlatformShell';
import { useAgentRuns, useAgentRun } from '@/lib/hooks/useAdminData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { AgentRun, AgentRunStep } from '@/types/database';

const ITEMS_PER_PAGE = 20;

export default function AdminAgentRunsPage() {
  const [page, setPage] = useState(1);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAgentRuns({
    page,
    limit: ITEMS_PER_PAGE,
  });

  const {
    data: selectedRun,
    isLoading: isLoadingRun,
    error: runError,
  } = useAgentRun(selectedRunId || '');

  if (isLoading) {
    return (
      <PlatformShell
        badge="Admin"
        title="Agent 运行记录"
        description="查看工作流执行历史、输入输出与错误信息。"
      >
        <AgentRunsSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell
        badge="Admin"
        title="Agent 运行记录"
        description="查看工作流执行历史、输入输出与错误信息。"
      >
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  const runs = data?.data || [];
  const meta = data?.meta;
  const hasNextPage = meta ? meta.page < meta.totalPages : false;
  const hasPrevPage = meta ? meta.page > 1 : false;

  return (
    <PlatformShell
      badge="Admin"
      title="Agent 运行记录"
      description="查看工作流执行历史、输入输出与错误信息。"
    >
      <div className="space-y-6">
        {/* 统计信息 */}
        <div className="text-sm text-slate-600">
          共 {meta?.total || 0} 条运行记录
        </div>

        {/* 运行记录列表 */}
        {runs.length === 0 ? (
          <EmptyState
            title="暂无运行记录"
            message="还没有任何 Agent 运行记录"
            icon={<Activity className="h-16 w-16" />}
          />
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <AgentRunCard
                key={run.id}
                run={run}
                onViewDetails={() => setSelectedRunId(run.id)}
              />
            ))}
          </div>
        )}

        {/* 分页控件 */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevPage}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <span className="text-sm text-slate-600">
              第 {meta.page} / {meta.totalPages} 页
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 详情对话框 */}
      {selectedRunId && (
        <AgentRunDetailsDialog
          open={!!selectedRunId}
          onOpenChange={(open) => !open && setSelectedRunId(null)}
          run={selectedRun}
          isLoading={isLoadingRun}
          error={runError}
        />
      )}
    </PlatformShell>
  );
}

function AgentRunCard({
  run,
  onViewDetails,
}: {
  run: AgentRun;
  onViewDetails: () => void;
}) {
  const statusConfig = {
    pending: {
      label: '等待中',
      color: 'bg-slate-100 text-slate-700',
      icon: Clock,
    },
    running: {
      label: '运行中',
      color: 'bg-blue-100 text-blue-700',
      icon: Activity,
    },
    completed: {
      label: '已完成',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
    failed: {
      label: '失败',
      color: 'bg-red-100 text-red-700',
      icon: XCircle,
    },
  };

  const config = statusConfig[run.status];
  const StatusIcon = config.icon;

  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-slate-900">
              {run.task_type || '未知任务'}
            </h3>
            <Badge className={config.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">运行 ID：</span>
              <span className="text-slate-700 font-mono text-xs">
                {run.id.slice(0, 8)}...
              </span>
            </div>
            {run.client_id && (
              <div>
                <span className="text-slate-500">客户 ID：</span>
                <span className="text-slate-700 font-mono text-xs">
                  {run.client_id.slice(0, 8)}...
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-500">创建时间：</span>
              <span className="text-slate-700">
                {new Date(run.created_at).toLocaleString('zh-CN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500">更新时间：</span>
              <span className="text-slate-700">
                {new Date(run.updated_at).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
          {run.error_message && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-700">{run.error_message}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function AgentRunDetailsDialog({
  open,
  onOpenChange,
  run,
  isLoading,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run?: AgentRun & { steps?: AgentRunStep[] };
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>运行详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !run) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>运行详情</DialogTitle>
          </DialogHeader>
          <ErrorMessage
            message={error?.message || '无法加载运行详情'}
            onRetry={() => {}}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>运行详情</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">基本信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">任务类型：</span>
                <span className="text-slate-700">{run.task_type || '未知'}</span>
              </div>
              <div>
                <span className="text-slate-500">状态：</span>
                <span className="text-slate-700">{run.status}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">运行 ID：</span>
                <span className="text-slate-700 font-mono text-xs">
                  {run.id}
                </span>
              </div>
            </div>
          </div>

          {/* 输入摘要 */}
          {run.input_summary && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">输入摘要</h4>
              <div className="bg-slate-50 p-4 rounded-lg text-sm">
                {run.input_summary}
              </div>
            </div>
          )}

          {/* 输出摘要 */}
          {run.output_summary && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">输出摘要</h4>
              <div className="bg-slate-50 p-4 rounded-lg text-sm">
                {run.output_summary}
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {run.error_message && (
            <div className="space-y-3">
              <h4 className="font-semibold text-red-900">错误信息</h4>
              <div className="bg-red-50 p-4 rounded-lg text-sm text-red-700">
                {run.error_message}
              </div>
            </div>
          )}

          {/* 执行步骤 */}
          {run.steps && run.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">
                执行步骤 ({run.steps.length})
              </h4>
              <div className="space-y-3">
                {run.steps.map((step, index) => (
                  <StepCard key={step.id} step={step} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepCard({ step, index }: { step: AgentRunStep; index: number }) {
  const statusConfig = {
    pending: { label: '等待中', color: 'bg-slate-100 text-slate-700' },
    running: { label: '运行中', color: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    failed: { label: '失败', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[step.status];

  return (
    <Card className="p-4 bg-slate-50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              步骤 {index + 1}
            </span>
            <span className="text-sm font-medium text-slate-900">
              {step.agent_name}
            </span>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
        {step.output_payload && (
          <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
            {JSON.stringify(step.output_payload, null, 2)}
          </pre>
        )}
        {step.error_message && (
          <div className="text-xs text-red-700 bg-red-50 p-2 rounded">
            {step.error_message}
          </div>
        )}
        <div className="text-xs text-slate-400">
          {new Date(step.created_at).toLocaleString('zh-CN')}
        </div>
      </div>
    </Card>
  );
}

function AgentRunsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
    </div>
  );
}
