'use client';

import { useState } from 'react';
import { PlatformShell } from '@/app/_components/PlatformShell';
import {
  useAdminTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
} from '@/lib/hooks/useAdminData';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Lightbulb,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Topic } from '@/types/database';
import type { TopicCreateRequest, TopicUpdateRequest } from '@/types/admin';

const ITEMS_PER_PAGE = 20;

export default function AdminTopicsPage() {
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const { data, isLoading, error, refetch } = useAdminTopics({
    page,
    limit: ITEMS_PER_PAGE,
  });

  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic(selectedTopic?.id || '');
  const deleteMutation = useDeleteTopic();

  if (isLoading) {
    return (
      <PlatformShell
        badge="Admin"
        title="选题管理"
        description="管理所有选题内容和审核状态。"
      >
        <TopicsSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell
        badge="Admin"
        title="选题管理"
        description="管理所有选题内容和审核状态。"
      >
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  const topics = data?.data || [];
  const meta = data?.meta;
  const hasNextPage = meta ? meta.page < meta.totalPages : false;
  const hasPrevPage = meta ? meta.page > 1 : false;

  const handleCreate = async (formData: TopicCreateRequest) => {
    await createMutation.mutateAsync(formData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (formData: TopicUpdateRequest) => {
    if (!selectedTopic) return;
    await updateMutation.mutateAsync(formData);
    setIsEditDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleDelete = async () => {
    if (!selectedTopic) return;
    await deleteMutation.mutateAsync(selectedTopic.id);
    setIsDeleteDialogOpen(false);
    setSelectedTopic(null);
  };

  return (
    <PlatformShell
      badge="Admin"
      title="选题管理"
      description="管理所有选题内容和审核状态。"
    >
      <div className="space-y-6">
        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            共 {meta?.total || 0} 个选题
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            新建选题
          </Button>
        </div>

        {/* 选题列表 */}
        {topics.length === 0 ? (
          <EmptyState
            title="暂无选题"
            message="还没有创建任何选题"
            icon={<Lightbulb className="h-16 w-16" />}
          />
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onEdit={() => {
                  setSelectedTopic(topic);
                  setIsEditDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedTopic(topic);
                  setIsDeleteDialogOpen(true);
                }}
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

      {/* 创建对话框 */}
      <CreateTopicDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* 编辑对话框 */}
      {selectedTopic && (
        <EditTopicDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          topic={selectedTopic}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* 删除确认对话框 */}
      {selectedTopic && (
        <DeleteTopicDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          topic={selectedTopic}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </PlatformShell>
  );
}

function TopicCard({
  topic,
  onEdit,
  onDelete,
}: {
  topic: Topic;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusConfig = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
    approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
    rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[topic.status];

  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-slate-900">
              {topic.title}
            </h3>
            <Badge className={config.color}>{config.label}</Badge>
            {topic.visible_to_client && (
              <Badge className="bg-blue-100 text-blue-700">客户可见</Badge>
            )}
            {topic.internal_only && (
              <Badge className="bg-amber-100 text-amber-700">仅内部</Badge>
            )}
          </div>
          {topic.direction && (
            <div>
              <span className="text-sm text-slate-500">内容方向：</span>
              <p className="text-slate-700 mt-1">{topic.direction}</p>
            </div>
          )}
          <div className="text-xs text-slate-400">
            创建于 {new Date(topic.created_at).toLocaleDateString('zh-CN')}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CreateTopicDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TopicCreateRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<TopicCreateRequest>({
    client_id: '',
    title: '',
    status: 'draft',
    visible_to_client: true,
    internal_only: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建选题</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">客户 ID</Label>
            <Input
              id="client_id"
              value={formData.client_id}
              onChange={(e) =>
                setFormData({ ...formData, client_id: e.target.value })
              }
              placeholder="请输入客户 ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">选题标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="请输入选题标题"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direction">内容方向</Label>
            <Textarea
              id="direction"
              value={formData.direction || ''}
              onChange={(e) =>
                setFormData({ ...formData, direction: e.target.value || null })
              }
              placeholder="请描述内容方向"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'draft' | 'approved' | 'rejected',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="visible_to_client">客户可见</Label>
            <Switch
              id="visible_to_client"
              checked={formData.visible_to_client}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, visible_to_client: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="internal_only">仅内部</Label>
            <Switch
              id="internal_only"
              checked={formData.internal_only}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, internal_only: checked })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTopicDialog({
  open,
  onOpenChange,
  topic,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic;
  onSubmit: (data: TopicUpdateRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<TopicUpdateRequest>({
    title: topic.title,
    direction: topic.direction,
    status: topic.status,
    visible_to_client: topic.visible_to_client,
    internal_only: topic.internal_only,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑选题</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">选题标题</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="请输入选题标题"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-direction">内容方向</Label>
            <Textarea
              id="edit-direction"
              value={formData.direction || ''}
              onChange={(e) =>
                setFormData({ ...formData, direction: e.target.value || null })
              }
              placeholder="请描述内容方向"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'draft' | 'approved' | 'rejected',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-visible_to_client">客户可见</Label>
            <Switch
              id="edit-visible_to_client"
              checked={formData.visible_to_client}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, visible_to_client: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-internal_only">仅内部</Label>
            <Switch
              id="edit-internal_only"
              checked={formData.internal_only}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, internal_only: checked })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTopicDialog({
  open,
  onOpenChange,
  topic,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">
          确定要删除选题 <strong>{topic.title}</strong> 吗？此操作无法撤销。
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '删除中...' : '删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TopicsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-32 w-full rounded-[2rem]" />
    </div>
  );
}
