import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function AdminPromptsPage() {
  return (
    <PlatformShell badge="Admin" title="提示词管理" description="维护行业模板和不同 Agent 的提示词版本。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回总览
          </Link>
          <Link href="/admin/agent-runs" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去运行记录
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-amber-50 to-pink-50 p-6 shadow-sm text-slate-700">
          这里会展示 prompt_templates 的版本、启用状态和适用行业。
        </div>
      </div>
    </PlatformShell>
  );
}
