import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function AdminAgentRunsPage() {
  return (
    <PlatformShell badge="Admin" title="Agent 运行记录" description="查看工作流执行历史、输入输出与错误信息。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回总览
          </Link>
          <Link href="/admin/prompts" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
            去提示词管理
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
          这里会显示每次 agent_runs 与 agent_run_steps 的记录。
        </div>
      </div>
    </PlatformShell>
  );
}
