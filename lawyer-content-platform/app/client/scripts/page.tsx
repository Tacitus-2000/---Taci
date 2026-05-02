import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function ClientScriptsPage() {
  return (
    <PlatformShell badge="Client" title="我的文案" description="查看已生成内容、使用建议与反馈状态。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/feedback" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去反馈中心
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-pink-50 p-6 shadow-sm text-slate-700">
          这里会列出当前客户可见的 scripts 数据。
        </div>
      </div>
    </PlatformShell>
  );
}
