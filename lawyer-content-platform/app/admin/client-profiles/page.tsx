'use client';

import { useState } from 'react';
import { PlatformShell } from '@/app/_components/PlatformShell';
import {
  useClientProfiles,
  useCreateClientProfile,
  useUpdateClientProfile,
  useDeleteClientProfile,
  useClients,
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
import type { ClientProfile } from '@/types/database';
import type {
  ClientProfileCreateRequest,
  ClientProfileUpdateRequest,
} from '@/types/admin';

const ITEMS_PER_PAGE = 20;

export default function AdminClientProfilesPage() {
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(
    null
  );

  const { data, isLoading, error, refetch } = useClientProfiles({
    page,
    limit: ITEMS_PER_PAGE,
  });

  const createMutation = useCreateClientProfile();
  const updateMutation = useUpdateClientProfile(selectedProfile?.id || '');
  const deleteMutation = useDeleteClientProfile();

  if (isLoading) {
    return (
      <PlatformShell
        badge="Admin"
        title="客户档案"
        description="维护行业画像、表达风格与内容策略。"
      >
        <ProfilesSkeleton />
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell
        badge="Admin"
        title="客户档案"
        description="维护行业画像、表达风格与内容策略。"
      >
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  const profiles = data?.data || [];
  const meta = data?.meta;
  const hasNextPage = meta ? meta.page < meta.totalPages : false;
  const hasPrevPage = meta ? meta.page > 1 : false;

  const handleCreate = async (formData: ClientProfileCreateRequest) => {
    await createMutation.mutateAsync(formData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (formData: ClientProfileUpdateRequest) => {
    if (!selectedProfile) return;
    await updateMutation.mutateAsync(formData);
    setIsEditDialogOpen(false);
    setSelectedProfile(null);
  };

  const handleDelete = async () => {
    if (!selectedProfile) return;
    await deleteMutation.mutateAsync(selectedProfile.id);
    setIsDeleteDialogOpen(false);
    setSelectedProfile(null);
  };

  return (
    <PlatformShell
      badge="Admin"
      title="客户档案"
      description="维护行业画像、表达风格与内容策略。"
    >
      <div className="space-y-6">
        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            共 {meta?.total || 0} 个档案
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            新建档案
          </Button>
        </div>

        {/* 档案列表 */}
        {profiles.length === 0 ? (
          <EmptyState
            title="暂无档案"
            message="还没有创建任何客户档案"
            icon={<FileText className="h-16 w-16" />}
          />
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onEdit={() => {
                  setSelectedProfile(profile);
                  setIsEditDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedProfile(profile);
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
      <CreateProfileDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* 编辑对话框 */}
      {selectedProfile && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={selectedProfile}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* 删除确认对话框 */}
      {selectedProfile && (
        <DeleteProfileDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          profile={selectedProfile}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </PlatformShell>
  );
}

function ProfileCard({
  profile,
  onEdit,
  onDelete,
}: {
  profile: ClientProfile;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="rounded-[2rem] border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              {profile.client_name}
            </h3>
            {profile.visible_to_client && (
              <Badge className="bg-blue-100 text-blue-700">客户可见</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {profile.industry_name && (
              <div>
                <span className="text-slate-500">行业：</span>
                <span className="text-slate-700">{profile.industry_name}</span>
              </div>
            )}
            {profile.niche_direction && (
              <div>
                <span className="text-slate-500">细分方向：</span>
                <span className="text-slate-700">{profile.niche_direction}</span>
              </div>
            )}
            {profile.target_customer && (
              <div className="col-span-2">
                <span className="text-slate-500">目标客户：</span>
                <span className="text-slate-700">{profile.target_customer}</span>
              </div>
            )}
            {profile.tone_style && (
              <div className="col-span-2">
                <span className="text-slate-500">语气风格：</span>
                <span className="text-slate-700">{profile.tone_style}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-400">
            创建于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
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

function CreateProfileDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientProfileCreateRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ClientProfileCreateRequest>({
    client_id: '',
    client_name: '',
    visible_to_client: true,
  });

  // 获取客户列表用于选择
  const { data: clientsData } = useClients({ page: 1, limit: 100 });
  const clients = clientsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建客户档案</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">选择客户</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => {
                const selectedClient = clients.find(c => c.id === value);
                setFormData({
                  ...formData,
                  client_id: value,
                  client_name: selectedClient?.name || formData.client_name
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择客户" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">客户名称</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
              placeholder="请输入客户名称"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry_name">行业名称</Label>
            <Input
              id="industry_name"
              value={formData.industry_name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  industry_name: e.target.value || null,
                })
              }
              placeholder="请输入行业名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche_direction">细分方向</Label>
            <Input
              id="niche_direction"
              value={formData.niche_direction || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  niche_direction: e.target.value || null,
                })
              }
              placeholder="请输入细分方向"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_customer">目标客户</Label>
            <Textarea
              id="target_customer"
              value={formData.target_customer || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_customer: e.target.value || null,
                })
              }
              placeholder="请描述目标客户"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone_style">语气风格</Label>
            <Textarea
              id="tone_style"
              value={formData.tone_style || ''}
              onChange={(e) =>
                setFormData({ ...formData, tone_style: e.target.value || null })
              }
              placeholder="请描述语气风格"
              rows={2}
            />
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

function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ClientProfile;
  onSubmit: (data: ClientProfileUpdateRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ClientProfileUpdateRequest>({
    client_name: profile.client_name,
    industry_name: profile.industry_name,
    niche_direction: profile.niche_direction,
    target_customer: profile.target_customer,
    tone_style: profile.tone_style,
    visible_to_client: profile.visible_to_client,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑客户档案</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-client_name">客户名称</Label>
            <Input
              id="edit-client_name"
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
              placeholder="请输入客户名称"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-industry_name">行业名称</Label>
            <Input
              id="edit-industry_name"
              value={formData.industry_name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  industry_name: e.target.value || null,
                })
              }
              placeholder="请输入行业名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-niche_direction">细分方向</Label>
            <Input
              id="edit-niche_direction"
              value={formData.niche_direction || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  niche_direction: e.target.value || null,
                })
              }
              placeholder="请输入细分方向"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-target_customer">目标客户</Label>
            <Textarea
              id="edit-target_customer"
              value={formData.target_customer || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_customer: e.target.value || null,
                })
              }
              placeholder="请描述目标客户"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tone_style">语气风格</Label>
            <Textarea
              id="edit-tone_style"
              value={formData.tone_style || ''}
              onChange={(e) =>
                setFormData({ ...formData, tone_style: e.target.value || null })
              }
              placeholder="请描述语气风格"
              rows={2}
            />
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

function DeleteProfileDialog({
  open,
  onOpenChange,
  profile,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ClientProfile;
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
          确定要删除客户档案 <strong>{profile.client_name}</strong>{' '}
          吗？此操作无法撤销。
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

function ProfilesSkeleton() {
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
