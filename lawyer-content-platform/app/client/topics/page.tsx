import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function ClientTopicsPage() {
  return (
    <PlatformShell badge="Client" title="选题需求" description="提交内容方向与灵感。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/calendar" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
            去内容日历
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm text-slate-700">
          这里会承接客户的内容需求与选题建议。
        </div>
      </div>
    </PlatformShell>
  );
}
