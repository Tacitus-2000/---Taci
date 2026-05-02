import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function ClientCalendarPage() {
  return (
    <PlatformShell badge="Client" title="内容日历" description="查看内容排期、发布时间和发布建议。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/style-reference" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去风格参考
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
          这里会展示客户内容日历。
        </div>
      </div>
    </PlatformShell>
  );
}
