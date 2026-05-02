const metrics = [
  { label: "本周生成", value: "128" },
  { label: "待审内容", value: "14" },
  { label: "活跃客户", value: "36" },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">后台总览</h1>
          <p className="mt-2 text-slate-300">查看客户运营、生成进度与审查状态。</p>
        </header>
        <section className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-cyan-200">{metric.value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
