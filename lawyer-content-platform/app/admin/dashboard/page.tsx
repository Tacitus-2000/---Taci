import { PlatformShell } from "@/app/_components/PlatformShell";

const metrics = [
  { label: "本周生成", value: "128" },
  { label: "待审内容", value: "14" },
  { label: "活跃客户", value: "36" },
];

export default function AdminDashboardPage() {
  return (
    <PlatformShell
      badge="Admin"
      title="后台总览"
      description="查看客户运营、生成进度与审查状态。"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 to-amber-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">今日提醒</p>
          <p className="mt-3 max-w-2xl text-slate-700">
            重点关注待审内容与新客户档案，优先推进高价值客户的内容生成与反馈闭环。
          </p>
        </div>
      </div>
    </PlatformShell>
  );
}
