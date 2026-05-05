'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useGenerateScript, useTopics } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import type { GenerateScriptRequest } from '@/types/client';

const generateSchema = z.object({
  topic_id: z.string().optional(),
  custom_direction: z.string().optional(),
}).refine(
  (data) => {
    // 如果选择了选题，验证通过
    if (data.topic_id) return true;
    // 否则检查自定义方向
    return data.custom_direction && data.custom_direction.length >= 10;
  },
  {
    message: '请输入至少10个字符的自定义方向',
    path: ['custom_direction'],
  }
);

type GenerateFormData = z.infer<typeof generateSchema>;

export default function ClientGeneratePage() {
  const clientId = useClientId();
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const { data: topics, isLoading: topicsLoading } = useTopics(clientId || '', { status: 'approved', limit: 100 });
  const generateScript = useGenerateScript();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
  });

  const selectedTopicId = watch('topic_id');

  useEffect(() => {
    if (generateScript.isSuccess) {
      setGenerationSuccess(true);
      const timer = setTimeout(() => {
        setGenerationSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [generateScript.isSuccess]);

  const onSubmit = async (data: GenerateFormData) => {
    if (!clientId) return;

    const payload: GenerateScriptRequest = {
      client_id: clientId,
      topic_id: data.topic_id || null,
      custom_direction: data.custom_direction || null,
    };

    try {
      await generateScript.mutateAsync(payload);
      reset();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <PlatformShell badge="Client" title="生成文案" description="选择方向并发起生成。">
      <div className="space-y-6">
        {/* 导航按钮 */}
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/topics" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去选题需求
          </Link>
        </div>

        {/* 成功提示 */}
        {generationSuccess && (
          <Card className="rounded-[2rem] border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                文案生成成功！请前往&ldquo;我的文案&rdquo;查看
              </p>
            </div>
          </Card>
        )}

        {/* 生成表单 */}
        <Card className="rounded-[2rem] border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-900">AI 文案生成</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 选题选择 */}
            <div className="space-y-2">
              <Label htmlFor="topic_id">选择已通过的选题（可选）</Label>
              {topicsLoading ? (
                <Skeleton className="h-10 w-full rounded-xl" />
              ) : (
                <select
                  id="topic_id"
                  {...register('topic_id')}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">不选择（使用自定义方向）</option>
                  {topics && topics.length > 0 ? (
                    topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>暂无已通过的选题</option>
                  )}
                </select>
              )}
              <p className="text-xs text-slate-500">
                选择一个已通过的选题，AI 将基于该选题生成文案
              </p>
            </div>

            {/* 自定义方向 */}
            <div className="space-y-2">
              <Label htmlFor="custom_direction">
                自定义内容方向 {!selectedTopicId && '(必填)'}
              </Label>
              <Textarea
                id="custom_direction"
                {...register('custom_direction')}
                placeholder="如果不选择选题，请在此输入您想要的内容方向、主题或关键信息..."
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
              />
              {errors.custom_direction && (
                <p className="text-sm text-red-600">{errors.custom_direction.message}</p>
              )}
              <p className="text-xs text-slate-500">
                {selectedTopicId
                  ? '可选：补充额外的方向说明或要求'
                  : '必填：至少10个字符，描述您想要生成的文案方向'}
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={generateScript.isPending}
                className="rounded-full bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {generateScript.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    生成文案
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => reset()}
                variant="outline"
                className="rounded-full"
                disabled={generateScript.isPending}
              >
                重置
              </Button>
            </div>
          </form>
        </Card>

        {/* 提示信息 */}
        <Card className="rounded-[2rem] border-slate-200 bg-purple-50 p-6">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">生成提示</h3>
          <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
            <li>AI 将根据您的档案信息和风格偏好生成文案</li>
            <li>生成过程可能需要30秒到2分钟</li>
            <li>生成完成后，文案将出现在&ldquo;我的文案&rdquo;页面</li>
            <li>您可以对生成的文案提供反馈以优化效果</li>
          </ul>
        </Card>
      </div>
    </PlatformShell>
  );
}
