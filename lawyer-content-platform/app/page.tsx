import Link from "next/link";

const adminLinks = [
  { href: "/admin/dashboard", label: "后台总览", description: "查看整体运营与内容状态" },
  { href: "/admin/clients", label: "客户管理", description: "进入客户列表与详情" },
  { href: "/admin/client-profiles", label: "客户档案", description: "维护行业画像与策略" },
  { href: "/admin/agent-runs", label: "Agent 记录", description: "查看执行过程与日志" },
  { href: "/admin/prompts", label: "提示词", description: "管理模板与版本" },
];

const clientLinks = [
  { href: "/client/dashboard", label: "客户首页", description: "看见自己的任务与进度" },
  { href: "/client/profile", label: "我的档案", description: "查看服务资料与偏好" },
  { href: "/client/scripts", label: "我的文案", description: "查看已生成内容" },
  { href: "/client/generate", label: "生成文案", description: "发起新的内容生成" },
  { href: "/client/topics", label: "选题需求", description: "提交方向和灵感" },
  { href: "/client/calendar", label: "内容日历", description: "查看近期排期" },
  { href: "/client/style-reference", label: "风格参考", description: "确认表达偏好" },
  { href: "/client/feedback", label: "反馈中心", description: "提交修改意见" },
];

function CardGrid({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-[0_18px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{description}</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-700">
              {item.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              进入页面
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_45%,#fdf2f8_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-[0_18px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Lawyer Content Platform
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              更轻快的内容平台入口页
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              这里把 Admin 和 Client 的入口分开，保留清晰跳转，同时把视觉改得更明亮、轻松一点，避免过于规整和沉重。
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-sky-600">第一阶段定位</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">刑事律师服务模板</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm text-amber-600">前台原则</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">只展示客户可见内容</p>
            </div>
            <div className="rounded-3xl border border-pink-100 bg-pink-50 p-4">
              <p className="text-sm text-pink-600">后台原则</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">保留管理与配置入口</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <CardGrid title="Admin" description="后台入口" items={adminLinks} />
          <CardGrid title="Client" description="客户入口" items={clientLinks} />
        </div>
      </div>
    </main>
  );
}
