'use client';

import { useState } from 'react';
import { PlatformShell } from '@/app/_components/PlatformShell';
import {
  useAdminScripts,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
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
  FileText,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Script } from '@/types/database';
import type { ScriptCreateRequest, ScriptUpdateRequest } from '@/types/admin';

const ITEMS_PER_PAGE = 20;

export default function AdminScriptsPage() {
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const { data, isLoading, error, refetch } = useAdminScripts({
    page,
    limit: ITEMS_PER_PAGE,
  });

  const createMutation = useCreateScript();
  const updateMutation = useUpdateScript(selectedScript?.id || '');
  const deleteMutation = useDeleteScript();

  if (isLoading) {
    return (
      <PlatformShell
        badge="Admin"
        title="文案管理"
        description="管理所有文案内容和发布状态。"
      >
        <ScriptsSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell
        badge="Admin"
        title="文案管理"
        description="管理所有文案内容和发布状态。"
      >
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  const scripts = data?.data || [];
  const meta = data?.meta;
  const hasNextPage = meta ? meta.page < meta.totalPages : false;
  const hasPrevPage = meta ? meta.page > 1 : false;

  const handleCreate = async (formData: ScriptCreateRequest) => {
    await createMutation.mutateAsync(formData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (formData: ScriptUpdateRequest) => {
    if (!selectedScript) return;
    await updateMutation.mutateAsync(formData);
    setIsEditDialogOpen(false);
    setSelectedScript(null);
  };

  const handleDelete = async () => {
    if (!selectedScript) return;
    await deleteMutation.mutateAsync(selectedScript.id);
    setIsDeleteDialogOpen(false);
    setSelectedScript(null);
  };

  return (
    <PlatformShell
      badge="Admin"
      title="文案管理"
      description="管理所有文案内容和发布状态。"
    >
      <div className="space-y-6">
        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            共 {meta?.total || 0} 个文案
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            新建文案
          </Button>
        </div>

        {/* 文案列表 */}
        {scripts.length === 0 ? (
          <EmptyState
            title="暂无文案"
            message="还没有创建任何文案"
            icon={<FileText className="h-16 w-16" />}
          />
        ) : (
          <div className="space-y-4">
            {scripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onEdit={() => {
                  setSelectedScript(script);
                  setIsEditDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedScript(script);
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
      <CreateScriptDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* 编辑对话框 */}
      {selectedScript && (
        <EditScriptDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          script={selectedScript}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* 删除确认对话框 */}
      {selectedScript && (
        <DeleteScriptDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          script={selectedScript}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </PlatformShell>
  );
}

function ScriptCard({
  script,
  onEdit,
  onDelete,
}: {
  script: Script;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusConfig = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-700' },
    reviewed: { label: '已审查', color: 'bg-blue-100 text-blue-700' },
    approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
    published: { label: '已发布', color: 'bg-purple-100 text-purple-700' },
  };

  const config = statusConfig[script.status];

  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-slate-900">
              {script.title}
            </h3>
            <Badge className={config.color}>{config.label}</Badge>
            {script.visible_to_client && (
              <Badge className="bg-blue-100 text-blue-700">客户可见</Badge>
            )}
            {script.internal_only && (
              <Badge className="bg-amber-100 text-amber-700">仅内部</Badge>
            )}
          </div>
          <div>
            <span className="text-sm text-slate-500">正文：</span>
            <p className="text-slate-700 mt-1 line-clamp-3">{script.body}</p>
          </div>
          {script.usage_advice && (
            <div>
              <span className="text-sm text-slate-500">使用建议：</span>
              <p className="text-slate-600 text-sm mt-1">{script.usage_advice}</p>
            </div>
          )}
          <div className="text-xs text-slate-400">
            创建于 {new Date(script.created_at).toLocaleDateString('zh-CN')}
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

function CreateScriptDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScriptCreateRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ScriptCreateRequest>({
    client_id: '',
    title: '',
    body: '',
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
          <DialogTitle>新建文案</DialogTitle>
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
            <Label htmlFor="topic_id">选题 ID（可选）</Label>
            <Input
              id="topic_id"
              value={formData.topic_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, topic_id: e.target.value || null })
              }
              placeholder="请输入选题 ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">文案标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="请输入文案标题"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">文案正文</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="请输入文案正文"
              rows={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usage_advice">使用建议</Label>
            <Textarea
              id="usage_advice"
              value={formData.usage_advice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usage_advice: e.target.value || null,
                })
              }
              placeholder="请输入使用建议"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'draft' | 'reviewed' | 'approved' | 'published',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="reviewed">已审查</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
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

function EditScriptDialog({
  open,
  onOpenChange,
  script,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: Script;
  onSubmit: (data: ScriptUpdateRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ScriptUpdateRequest>({
    title: script.title,
    body: script.body,
    usage_advice: script.usage_advice,
    status: script.status,
    visible_to_client: script.visible_to_client,
    internal_only: script.internal_only,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑文案</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">文案标题</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="请输入文案标题"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-body">文案正文</Label>
            <Textarea
              id="edit-body"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="请输入文案正文"
              rows={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-usage_advice">使用建议</Label>
            <Textarea
              id="edit-usage_advice"
              value={formData.usage_advice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usage_advice: e.target.value || null,
                })
              }
              placeholder="请输入使用建议"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as 'draft' | 'reviewed' | 'approved' | 'published',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="reviewed">已审查</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
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

function DeleteScriptDialog({
  open,
  onOpenChange,
  script,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: Script;
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
          确定要删除文案 <strong>{script.title}</strong> 吗？此操作无法撤销。
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

function ScriptsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
    </div>
  );
}
