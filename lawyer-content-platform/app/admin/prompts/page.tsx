'use client';

import { useState } from 'react';
import { PlatformShell } from '@/app/_components/PlatformShell';
import {
  usePrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
} from '@/lib/hooks/useAdminData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { PromptTemplate, PromptTemplateAgentType } from '@/types/database';
import type { PromptCreateRequest, PromptUpdateRequest } from '@/types/admin';

const AGENT_TYPE_LABELS: Record<PromptTemplateAgentType, string> = {
  supervisor: '监督 Agent',
  data: '数据采集 Agent',
  profile: '档案生成 Agent',
  topic: '选题生成 Agent',
  script: '文案生成 Agent',
  readability_review: '可读性审查 Agent',
  risk_review: '风险审查 Agent',
  rewrite: '重写 Agent',
};

export default function AdminPromptsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [selectedAgentType, setSelectedAgentType] = useState<PromptTemplateAgentType>('topic');

  // 表单状态
  const [formData, setFormData] = useState<PromptCreateRequest>({
    agent_type: 'topic',
    template_name: '',
    system_prompt: '',
    user_prompt_template: '',
    description: '',
    version: '1.0.0',
    active: true,
  });

  const { data, isLoading, error, refetch } = usePrompts();
  const createMutation = useCreatePrompt();
  const updateMutation = useUpdatePrompt(selectedPrompt?.id || '');
  const deleteMutation = useDeletePrompt();

  if (isLoading) {
    return (
      <PlatformShell
        badge="Admin"
        title="提示词管理"
        description="管理各个 Agent 的提示词模板。"
      >
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PlatformShell>
    );
  }

  if (error) {
    return (
      <PlatformShell
        badge="Admin"
        title="提示词管理"
        description="管理各个 Agent 的提示词模板。"
      >
        <ErrorMessage message={error.message} onRetry={() => refetch()} />
      </PlatformShell>
    );
  }

  const prompts = data?.data || [];

  // 按 Agent 类型分组
  const promptsByType = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.agent_type]) {
      acc[prompt.agent_type] = [];
    }
    acc[prompt.agent_type].push(prompt);
    return acc;
  }, {} as Record<PromptTemplateAgentType, PromptTemplate[]>);

  const currentPrompts = promptsByType[selectedAgentType] || [];

  // 创建提示词
  const handleCreate = async () => {
    await createMutation.mutateAsync(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // 更新提示词
  const handleUpdate = async () => {
    if (!selectedPrompt) return;
    await updateMutation.mutateAsync(formData);
    setIsEditDialogOpen(false);
    setSelectedPrompt(null);
    resetForm();
  };

  // 删除提示词
  const handleDelete = async () => {
    if (!selectedPrompt) return;
    await deleteMutation.mutateAsync(selectedPrompt.id);
    setIsDeleteDialogOpen(false);
    setSelectedPrompt(null);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      agent_type: 'topic',
      template_name: '',
      system_prompt: '',
      user_prompt_template: '',
      description: '',
      version: '1.0.0',
      active: true,
    });
  };

  // 打开编辑对话框
  const openEditDialog = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setFormData({
      agent_type: prompt.agent_type,
      template_name: prompt.template_name,
      system_prompt: prompt.system_prompt || '',
      user_prompt_template: prompt.user_prompt_template || '',
      description: prompt.description || '',
      version: prompt.version,
      active: prompt.active,
    });
    setIsEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setIsDeleteDialogOpen(true);
  };

  return (
    <PlatformShell
      badge="Admin"
      title="提示词管理"
      description="管理各个 Agent 的提示词模板，优化内容生成质量。"
    >
      <div className="space-y-6">
        {/* 操作栏 */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Select
              value={selectedAgentType}
              onValueChange={(value) => setSelectedAgentType(value as PromptTemplateAgentType)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGENT_TYPE_LABELS).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建提示词
          </Button>
        </div>

        {/* 提示词列表 */}
        <div className="space-y-4">
          {currentPrompts.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">暂无提示词模板</p>
              <p className="text-sm text-gray-500 mt-2">
                点击"创建提示词"按钮添加新的提示词模板
              </p>
            </Card>
          ) : (
            currentPrompts.map((prompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{prompt.template_name}</h3>
                      <Badge variant={prompt.active ? 'default' : 'secondary'}>
                        {prompt.active ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            激活
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            未激活
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">v{prompt.version}</Badge>
                    </div>
                    {prompt.description && (
                      <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {prompt.system_prompt && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">系统提示词</p>
                          <p className="text-gray-600 line-clamp-2">{prompt.system_prompt}</p>
                        </div>
                      )}
                      {prompt.user_prompt_template && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">用户提示词模板</p>
                          <p className="text-gray-600 line-clamp-2">{prompt.user_prompt_template}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      创建时间: {new Date(prompt.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(prompt)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 创建对话框 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建提示词模板</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Agent 类型</Label>
                <Select
                  value={formData.agent_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, agent_type: value as PromptTemplateAgentType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGENT_TYPE_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>模板名称</Label>
                <Input
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  placeholder="例如: 选题生成提示词 v2.0"
                />
              </div>
              <div>
                <Label>描述</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述此提示词的用途和特点"
                />
              </div>
              <div>
                <Label>系统提示词</Label>
                <Textarea
                  value={formData.system_prompt || ''}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="定义 Agent 的角色、行为和约束..."
                  rows={6}
                />
              </div>
              <div>
                <Label>用户提示词模板</Label>
                <Textarea
                  value={formData.user_prompt_template || ''}
                  onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
                  placeholder="包含变量占位符的提示词模板，例如: {{clientProfile}}..."
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>版本号</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label>状态</Label>
                  <Select
                    value={formData.active ? 'true' : 'false'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, active: value === 'true' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">激活</SelectItem>
                      <SelectItem value="false">未激活</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? '创建中...' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑提示词模板</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Agent 类型</Label>
                <Select
                  value={formData.agent_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, agent_type: value as PromptTemplateAgentType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGENT_TYPE_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>模板名称</Label>
                <Input
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                />
              </div>
              <div>
                <Label>描述</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>系统提示词</Label>
                <Textarea
                  value={formData.system_prompt || ''}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  rows={6}
                />
              </div>
              <div>
                <Label>用户提示词模板</Label>
                <Textarea
                  value={formData.user_prompt_template || ''}
                  onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>版本号</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div>
                  <Label>状态</Label>
                  <Select
                    value={formData.active ? 'true' : 'false'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, active: value === 'true' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">激活</SelectItem>
                      <SelectItem value="false">未激活</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
            </DialogHeader>
            <p>确定要删除提示词模板"{selectedPrompt?.template_name}"吗？此操作无法撤销。</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '删除中...' : '删除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PlatformShell>
  );
}
