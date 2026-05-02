import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function AdminClientProfilesPage() {
  return (
    <PlatformShell badge="Admin" title="客户档案" description="维护行业画像、表达风格与内容策略。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回总览
          </Link>
          <Link href="/admin/clients" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去客户管理
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-sm">
          客户档案列表将展示每个客户的定位、风格与风险偏好。
        </div>
      </div>
    </PlatformShell>
  );
}
