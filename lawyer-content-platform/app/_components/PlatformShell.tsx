import Link from "next/link";
import type { ReactNode } from "react";

const adminLinks = [
  { href: "/admin/dashboard", label: "后台总览" },
  { href: "/admin/clients", label: "客户管理" },
  { href: "/admin/client-profiles", label: "客户档案" },
  { href: "/admin/agent-runs", label: "Agent 记录" },
  { href: "/admin/prompts", label: "提示词" },
];

const clientLinks = [
  { href: "/client/dashboard", label: "客户首页" },
  { href: "/client/profile", label: "我的档案" },
  { href: "/client/scripts", label: "我的文案" },
  { href: "/client/generate", label: "生成文案" },
  { href: "/client/topics", label: "选题需求" },
  { href: "/client/calendar", label: "内容日历" },
  { href: "/client/style-reference", label: "风格参考" },
  { href: "/client/feedback", label: "反馈中心" },
];

export function PlatformShell({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const isAdmin = badge === "Admin";
  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_45%,#fdf2f8_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_18px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                {badge}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700 hover:shadow-md"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_18px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
            {children}
          </div>
          <aside className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_18px_80px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              快速跳转
            </p>
            <div className="mt-4 space-y-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:text-sky-700"
                >
                  <span>{link.label}</span>
                  <span className="text-sky-500">→</span>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
