import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function ClientProfilePage() {
  return (
    <PlatformShell badge="Client" title="我的档案" description="查看客户信息、行业方向和服务偏好。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/scripts" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去我的文案
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
          这里会展示 client_profiles 中可对客户开放的字段。
        </div>
      </div>
    </PlatformShell>
  );
}
