import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Kanban,
  LayoutDashboard,
  RotateCcw,
  UserPlus,
  Users,
  BookOpen,
} from "lucide-react";
import type { ReactNode } from "react";
import { AGENTS } from "@/lib/crm/seed";
import { useCrm } from "@/lib/crm/store";
import type { Score, Stage } from "@/lib/crm/types";

const NAV = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/propiedades", label: "Propiedades", icon: Building2 },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: Kanban },
  { to: "/captura", label: "Captura", icon: UserPlus },
  { to: "/guion", label: "Guion", icon: BookOpen },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole, reset } = useCrm();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="mr-2 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-fg">
              <Building2 size={18} />
            </span>
            <span className="font-display text-xl leading-none">InmoCRM</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-primary text-primary-fg" : "text-ink hover:bg-soft"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="role">
              Rol de la demo
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "dueno" | "agente")}
              className="h-11 rounded-lg border border-line bg-bg px-3 text-sm"
            >
              <option value="dueno">Ver como dueño</option>
              <option value="agente">Ver como agente</option>
            </select>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center gap-1 rounded-lg border border-line bg-surface px-3 text-sm"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:hidden">
          {NAV.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex h-11 shrink-0 items-center gap-1 rounded-lg px-3 text-sm ${
                  active ? "bg-primary text-primary-fg" : "bg-soft text-ink"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export function agentName(id: string) {
  return AGENTS.find((a) => a.id === id)?.name ?? id;
}
export function ScorePill({ score }: { score: Score }) {
  const map = {
    A: "bg-primary text-primary-fg",
    B: "bg-accent text-accent-fg",
    C: "bg-soft text-muted",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${map[score]}`}>
      Lead {score}
    </span>
  );
}

export function StageChip({ stage }: { stage: Stage }) {
  const styles: Record<Stage, { bg: string; dot: string; label: string }> = {
    nuevo: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200/70", dot: "bg-emerald-500", label: "Nuevo" },
    contactado: { bg: "bg-sky-50 text-sky-800 border-sky-200/70", dot: "bg-sky-500", label: "Contactado" },
    cita: { bg: "bg-amber-50 text-amber-800 border-amber-200/70", dot: "bg-amber-500", label: "Cita agendada" },
    visita: { bg: "bg-indigo-50 text-indigo-800 border-indigo-200/70", dot: "bg-indigo-500", label: "Visita realizada" },
    oferta: { bg: "bg-orange-50 text-orange-800 border-orange-200/70", dot: "bg-orange-500", label: "Oferta" },
    cerrado: { bg: "bg-primary/10 text-primary border-primary/30 font-semibold", dot: "bg-primary", label: "Cerrado" },
    perdido: { bg: "bg-stone-100 text-stone-600 border-stone-200", dot: "bg-stone-400", label: "Perdido" },
  };
  const conf = styles[stage] ?? { bg: "bg-soft text-muted border-line", dot: "bg-muted", label: stage };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${conf.bg}`}>
      <span className={`size-1.5 shrink-0 rounded-full ${conf.dot}`} />
      <span>{conf.label}</span>
    </span>
  );
}

export function ColdChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
      <span className="text-[11px] leading-none">❄</span> Frío (+7d)
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-primary";
