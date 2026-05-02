const adminLinks = [
  { href: "/admin/dashboard", label: "Admin Dashboard", description: "后台总览与运营入口" },
  { href: "/admin/clients", label: "客户管理", description: "客户列表与客户详情" },
  { href: "/admin/client-profiles", label: "客户档案", description: "行业画像与内容策略" },
  { href: "/admin/agent-runs", label: "Agent 运行记录", description: "内部执行日志与调试" },
  { href: "/admin/prompts", label: "提示词管理", description: "模板版本与启用状态" },
];

const clientLinks = [
  { href: "/client/dashboard", label: "Client Dashboard", description: "客户首页与待办概览" },
  { href: "/client/profile", label: "我的档案", description: "客户信息与服务偏好" },
  { href: "/client/scripts", label: "我的文案", description: "已生成内容与反馈入口" },
  { href: "/client/generate", label: "生成文案", description: "选择方向并发起生成" },
  { href: "/client/topics", label: "选题需求", description: "提交内容方向与灵感" },
  { href: "/client/calendar", label: "内容日历", description: "本周与下周发布计划" },
  { href: "/client/style-reference", label: "风格参考", description: "语气、案例与表达偏好" },
  { href: "/client/feedback", label: "反馈中心", description: "修改意见与优化建议" },
];

function Section({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200/80">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{description}</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200">{link.label}</h3>
              <span className="text-sm text-cyan-200">→</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{link.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-200/80">Lawyer Content Platform</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Admin 后台与 Client 前台的页面入口已分层整理。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              当前先完成页面壳子与导航结构：Admin 侧保留后台管理能力，Client 侧只呈现客户可见内容，避免暴露 Agent、提示词和内部审查信息。
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-400">第一阶段定位</p>
              <p className="mt-2 text-lg font-medium text-white">刑事律师服务模板</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-400">前台原则</p>
              <p className="mt-2 text-lg font-medium text-white">只展示客户可见内容</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-400">后台原则</p>
              <p className="mt-2 text-lg font-medium text-white">保留管理、审查与配置入口</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="Admin" description="后台入口" links={adminLinks} />
          <Section title="Client" description="客户入口" links={clientLinks} />
        </div>
      </div>
    </main>
  );
}
