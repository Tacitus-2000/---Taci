import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

const items = ["待确认需求 3 条", "本周内容 2 篇", "最近反馈 1 条"];

export default function ClientDashboardPage() {
  return (
    <PlatformShell badge="Client" title="客户首页" description="这里只展示客户可见的内容和待办。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/profile" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            我的档案
          </Link>
          <Link href="/client/generate" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            生成文案
          </Link>
          <Link href="/client/calendar" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
            内容日历
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    </PlatformShell>
  );
}
