import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Shell, agentName } from "@/components/crm/ui";
import { AGENTS, STAGES, isCold } from "@/lib/crm/seed";
import { useCrm } from "@/lib/crm/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { leads, properties, role } = useCrm();
  const visible = role === "agente" ? leads.filter((l) => l.agentId === "carlos") : leads;
  const open = visible.filter((l) => l.stage !== "cerrado" && l.stage !== "perdido");
  const cold = open.filter(isCold);
  const weekVisits = visible.filter((l) => l.stage === "cita" || l.stage === "visita");
  const gradeA = visible.filter((l) => l.score === "A" && l.stage === "nuevo").length;
  const available = properties.filter((p) => p.status === "disponible").length;

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-accent">Demo para inmobiliarias</p>
          <h1 className="mt-1 text-4xl text-ink">
            {role === "dueno" ? "Panel de la directora" : "Bandeja de Carlos Peña"}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-muted">
            {role === "dueno"
              ? "Laura ve el embudo de toda la oficina. Los contactos no viven en el teléfono de un asesor."
              : "Carlos solo ve su cartera. Los curiosos ya llegaron etiquetados."}
          </p>
        </div>
        <Link
          to="/captura"
          className="group relative inline-flex h-12 items-center gap-2.5 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/25 ring-2 ring-accent/30 ring-offset-2 ring-offset-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 active:translate-y-0 active:scale-[0.98]"
        >
          <Sparkles className="size-4.5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span>Simular un lead nuevo</span>
          <span className="rounded-full bg-accent-fg/20 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase">
            En vivo
          </span>
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Disponibles" value={String(available)} hint="en inventario" />
        <Stat label="Leads A nuevos" value={String(gradeA)} hint="listos para citar" />
        <Stat label="Citas y visitas" value={String(weekVisits.length)} hint="en curso" />
        <Stat label="Sin contacto" value={String(cold.length)} hint="más de 7 días" warn={cold.length > 0} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-surface p-4 lg:col-span-3">
          <h2 className="text-2xl">Embudo</h2>
          <ul className="mt-4 grid gap-2">
            {STAGES.map((stage) => {
              const n = visible.filter((l) => l.stage === stage.id).length;
              const width = visible.length ? Math.max(8, (n / visible.length) * 100) : 0;
              return (
                <li key={stage.id} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-sm">
                  <span>{stage.label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-soft">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                  </span>
                  <span className="tabular-nums text-right font-semibold">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 lg:col-span-2">
          <h2 className="text-2xl">Por asesor</h2>
          <ul className="mt-4 grid gap-3">
            {AGENTS.filter((a) => a.id !== "dueno").map((agent) => {
              const mine = leads.filter((l) => l.agentId === agent.id);
              const visits = mine.filter((l) => l.stage === "cita" || l.stage === "visita").length;
              return (
                <li key={agent.id} className="flex items-center justify-between rounded-xl bg-bg px-3 py-3">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted">{agent.role}</p>
                  </div>
                  <p className="text-right text-sm">
                    <span className="block font-display text-2xl tabular-nums">{visits}</span>
                    visitas activas
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-2xl">Leads que se están enfriando</h2>
        {cold.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nadie lleva más de una semana sin contacto.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {cold.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted">
                    {lead.zone} · {agentName(lead.agentId)} · Lead {lead.score}
                  </p>
                </div>
                <Link to="/leads" className="text-sm font-semibold text-primary">
                  Abrir cartera
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}

function Stat({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  warn?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-4 ${warn ? "border-accent bg-surface" : "border-line bg-surface"}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-4xl tabular-nums">{value}</p>
      <p className="text-sm text-muted">{hint}</p>
    </article>
  );
}
