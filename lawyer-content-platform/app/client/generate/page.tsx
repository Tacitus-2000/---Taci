import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

export default function ClientGeneratePage() {
  return (
    <PlatformShell badge="Client" title="生成文案" description="选择方向并发起生成。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/client/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回首页
          </Link>
          <Link href="/client/topics" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去选题需求
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
          这里会是提交生成请求的入口。
        </div>
      </div>
    </PlatformShell>
  );
}
