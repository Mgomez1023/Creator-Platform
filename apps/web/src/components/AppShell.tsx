import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function navClassName(isActive: boolean): string {
  return isActive
    ? "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
    : "rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40";
}

export default function AppShell({ title, subtitle, children }: AppShellProps): JSX.Element {
  return (
    <div className="min-h-screen pb-12">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-8 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-ink">
          <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-accent to-sky" />
          Creator Intel
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={({ isActive }) => navClassName(isActive)} end>
            Dashboard
          </NavLink>
          <NavLink to="/new" className={({ isActive }) => navClassName(isActive)}>
            New Analysis
          </NavLink>
        </nav>
      </header>

      <main className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur">
          <h1 className="text-3xl font-bold text-ink">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-ink/70">{subtitle}</p> : null}
          <section className="mt-6">{children}</section>
        </div>
      </main>
    </div>
  );
}
