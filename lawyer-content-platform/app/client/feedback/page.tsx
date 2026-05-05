'use client';

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlatformShell } from "@/app/_components/PlatformShell";
import { useSubmitFeedback } from '@/lib/hooks/useClientData';
import { useClientId } from '@/lib/hooks/useClientId';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Star } from 'lucide-react';
import type { ClientFeedbackRequest } from '@/types/client';

const feedbackSchema = z.object({
  content_type: z.enum(['profile', 'topic', 'script', 'general']).refine((val) => val !== undefined, {
    message: '请选择反馈类型',
  }),
  content_id: z.string().optional(),
  feedback_text: z.string().min(10, '反馈内容至少需要10个字符').max(2000, '反馈内容不能超过2000个字符'),
  rating: z.number().min(1).max(5).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function ClientFeedbackPage() {
  const clientId = useClientId();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const submitFeedback = useSubmitFeedback();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!clientId) return;

    const payload: ClientFeedbackRequest = {
      client_id: clientId,
      content_type: data.content_type,
      content_id: data.content_id || null,
      feedback_text: data.feedback_text,
      rating: selectedRating || null,
    };

    try {
      await submitFeedback.mutateAsync(payload);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
      reset();
      setSelectedRating(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  return (
    <PlatformShell badge="Client" title="反馈中心" description="提交修改建议和优化意见。">
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

        {/* 成功提示 */}
        {submitSuccess && (
          <Card className="rounded-[2rem] border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-sm font-medium text-green-900">反馈提交成功！感谢您的反馈。</p>
            </div>
          </Card>
        )}

        {/* 反馈表单 */}
        <Card className="rounded-[2rem] border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">提交反馈</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 反馈类型 */}
            <div className="space-y-2">
              <Label htmlFor="content_type">反馈类型 *</Label>
              <select
                id="content_type"
                {...register('content_type')}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">请选择反馈类型</option>
                <option value="profile">档案信息</option>
                <option value="topic">选题内容</option>
                <option value="script">文案内容</option>
                <option value="general">一般反馈</option>
              </select>
              {errors.content_type && (
                <p className="text-sm text-red-600">{errors.content_type.message}</p>
              )}
            </div>

            {/* 内容ID（可选） */}
            <div className="space-y-2">
              <Label htmlFor="content_id">内容ID（可选）</Label>
              <input
                id="content_id"
                type="text"
                {...register('content_id')}
                placeholder="如果针对特定内容，请输入ID"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500">如果您的反馈针对特定的选题或文案，请填写对应的ID</p>
            </div>

            {/* 评分（可选） */}
            <div className="space-y-2">
              <Label>满意度评分（可选）</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        selectedRating && rating <= selectedRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                {selectedRating && (
                  <span className="ml-2 text-sm text-slate-600">{selectedRating} 星</span>
                )}
              </div>
            </div>

            {/* 反馈内容 */}
            <div className="space-y-2">
              <Label htmlFor="feedback_text">反馈内容 *</Label>
              <Textarea
                id="feedback_text"
                {...register('feedback_text')}
                placeholder="请详细描述您的反馈意见或建议..."
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              {errors.feedback_text && (
                <p className="text-sm text-red-600">{errors.feedback_text.message}</p>
              )}
              <p className="text-xs text-slate-500">至少10个字符，最多2000个字符</p>
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={submitFeedback.isPending}
                className="rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitFeedback.isPending ? '提交中...' : '提交反馈'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedRating(null);
                }}
                variant="outline"
                className="rounded-full"
              >
                重置
              </Button>
            </div>
          </form>
        </Card>

        {/* 提示信息 */}
        <Card className="rounded-[2rem] border-slate-200 bg-blue-50 p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">反馈提示</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>您的反馈将帮助我们更好地为您服务</li>
            <li>我们会在1-2个工作日内处理您的反馈</li>
            <li>如有紧急问题，请直接联系您的客户经理</li>
          </ul>
        </Card>
      </div>
    </PlatformShell>
  );
}
