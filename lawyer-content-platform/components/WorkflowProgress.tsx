/**
 * WorkflowProgress 组件
 * 显示 AI 工作流的实时执行进度
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface WorkflowStep {
  id: string;
  agent_name: string;
  role: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkflowProgressData {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: {
    percentage: number;
    completed_steps: number;
    total_steps: number;
    current_step: {
      agent_name: string;
      status: string;
    } | null;
  };
  steps: WorkflowStep[];
  error_message: string | null;
}

interface WorkflowProgressProps {
  agentRunId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  data_collection: '📊 数据采集',
  profile_generation: '🎯 内容定位',
  topic_generation: '💡 选题生成',
  script_generation: '✍️ 文案生成',
  readability_review: '📖 可读性审查',
  risk_review: '⚖️ 风险审查',
  rewrite: '🔄 文案重写',
};

export function WorkflowProgress({ agentRunId, onComplete, onError }: WorkflowProgressProps) {
  const [data, setData] = useState<WorkflowProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/client/agent-runs/${agentRunId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const result = await response.json();
        setData(result.data);

        // 如果工作流完成或失败，停止轮询
        if (result.data.status === 'completed') {
          setIsPolling(false);
          onComplete?.();
        } else if (result.data.status === 'failed') {
          setIsPolling(false);
          onError?.(result.data.error_message || '工作流执行失败');
        }
      } catch (error) {
        console.error('Failed to fetch workflow progress:', error);
        setIsPolling(false);
        onError?.('无法获取工作流进度');
      }
    };

    // 立即执行一次
    fetchProgress();

    // 如果还在轮询，每 2 秒更新一次
    if (isPolling) {
      intervalId = setInterval(fetchProgress, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [agentRunId, isPolling, onComplete, onError]);

  if (!data) {
    return (
      <Card className="rounded-[2rem] border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          <p className="text-sm text-slate-600">正在加载工作流状态...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="space-y-6">
        {/* 总体进度 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">AI 生成进度</h3>
            <span className="text-sm font-medium text-purple-600">
              {data.progress.percentage}%
            </span>
          </div>
          <Progress value={data.progress.percentage} className="h-2" />
          <p className="text-sm text-slate-600">
            已完成 {data.progress.completed_steps} / {data.progress.total_steps} 步骤
          </p>
        </div>

        {/* 当前步骤 */}
        {data.progress.current_step && data.status === 'running' && (
          <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                {STEP_LABELS[data.progress.current_step.agent_name] || data.progress.current_step.agent_name}
              </p>
              <p className="text-xs text-purple-700">正在执行中...</p>
            </div>
          </div>
        )}

        {/* 步骤列表 */}
        <div className="space-y-2">
          {data.steps.map((step, index) => (
            <StepItem key={step.id} step={step} index={index} />
          ))}
        </div>

        {/* 错误信息 */}
        {data.error_message && (
          <div className="rounded-xl bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">执行失败</p>
                <p className="text-sm text-red-700 mt-1">{data.error_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* 完成提示 */}
        {data.status === 'completed' && (
          <div className="rounded-xl bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                文案生成完成！请前往"我的文案"查看
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function StepItem({ step, index }: { step: WorkflowStep; index: number }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      animate: false,
    },
    running: {
      icon: Loader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      animate: true,
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      animate: false,
    },
    failed: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      animate: false,
    },
  };

  const config = statusConfig[step.status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 rounded-lg p-3 ${config.bgColor}`}>
      <Icon className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">
          {STEP_LABELS[step.agent_name] || step.agent_name}
        </p>
        {step.error_message && (
          <p className="text-xs text-red-600 mt-1">{step.error_message}</p>
        )}
      </div>
      <span className="text-xs text-slate-500">
        步骤 {index + 1}
      </span>
    </div>
  );
}
