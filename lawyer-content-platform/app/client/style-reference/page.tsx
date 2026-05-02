import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function ClientStyleReferencePage() {
  return (
    <PlatformShell badge="Client" title="风格参考" description="整理语气、案例和表达偏好。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/feedback" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
            去反馈中心
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 to-rose-50 p-6 shadow-sm text-slate-700">
          这里会展示风格样本和参考说明。
        </div>
      </div>
    </PlatformShell>
  );
}
