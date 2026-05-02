import Link from "next/link";
import { PlatformShell } from "@/app/_components/PlatformShell";

const clients = ["张律师事务所", "京城刑辩团队", "合规咨询中心"];

export default function AdminClientsPage() {
  return (
    <PlatformShell badge="Admin" title="客户管理" description="管理客户资料、行业归属与服务状态。">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard" className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            返回总览
          </Link>
          <Link href="/admin/client-profiles" className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            去客户档案
          </Link>
          <Link href="/admin/agent-runs" className="rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
            查看运行记录
          </Link>
        </div>
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              {client}
            </div>
          ))}
        </div>
      </div>
    </PlatformShell>
  );
}
