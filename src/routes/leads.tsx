import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ColdChip, Field, ScorePill, Shell, StageChip, agentName, inputClass } from "@/components/crm/ui";
import { STAGES, formatPrice, isCold, matchesForLead, money } from "@/lib/crm/seed";
import { useCrm } from "@/lib/crm/store";
import type { Lead, Stage } from "@/lib/crm/types";

export const Route = createFileRoute("/leads")({ component: Page });

function Page() {
  const { leads, properties, role, moveLead, addNote } = useCrm();
  const [score, setScore] = useState("todos");
  const [selected, setSelected] = useState<string | null>(leads[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  const visible = leads.filter((l) => {
    if (role === "agente" && l.agentId !== "carlos") return false;
    if (score !== "todos" && l.score !== score) return false;
    return true;
  });
  const lead = visible.find((l) => l.id === selected) ?? visible[0] ?? null;

  return (
    <Shell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Cartera</h1>
          <p className="mt-1 text-muted">Calificados antes de ocupar al asesor.</p>
        </div>
        <select className={`${inputClass} sm:w-48`} value={score} onChange={(e) => setScore(e.target.value)}>
          <option value="todos">Todos los scores</option>
          <option value="A">Solo A</option>
          <option value="B">Solo B</option>
          <option value="C">Solo C</option>
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <ul className="grid gap-2">
          {visible.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(l.id);
                  setDraft(l.note);
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left ${
                  lead?.id === l.id ? "border-primary bg-surface" : "border-line bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-ink">{l.name}</p>
                  <ScorePill score={l.score} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StageChip stage={l.stage} />
                  {isCold(l) && <ColdChip />}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {l.zone}, {l.city}
                  {role === "dueno" && <span className="ml-1.5 font-medium text-ink/70">· {agentName(l.agentId)}</span>}
                </p>
              </button>
            </li>
          ))}
          {visible.length === 0 && <p className="text-muted">No hay leads con ese filtro.</p>}
        </ul>
        {lead && <Detail lead={lead} properties={properties} draft={draft} setDraft={setDraft} moveLead={moveLead} addNote={addNote} />}
      </div>
    </Shell>
  );
}

function Detail({
  lead,
  properties,
  draft,
  setDraft,
  moveLead,
  addNote,
}: {
  lead: Lead;
  properties: ReturnType<typeof useCrm>["properties"];
  draft: string;
  setDraft: (v: string) => void;
  moveLead: (id: string, stage: Stage) => void;
  addNote: (id: string, note: string) => void;
}) {
  const matches = matchesForLead(lead, properties);
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-3xl">{lead.name}</h2>
        <ScorePill score={lead.score} />
        <StageChip stage={lead.stage} />
        {isCold(lead) && <ColdChip />}
      </div>
      <p className="mt-2 text-sm text-muted">
        {lead.operation} en {lead.zone}, {lead.city} · {money(lead.budgetMin)} a {money(lead.budgetMax)} · {lead.timeline}
      </p>
      <p className="mt-1 text-sm">Asesor: {agentName(lead.agentId)}</p>
      <Field label="Etapa">
        <select className={inputClass} value={lead.stage} onChange={(e) => moveLead(lead.id, e.target.value as Stage)}>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="mt-3">
        <Field label="Nota de seguimiento">
          <textarea className={`${inputClass} h-24 py-2`} value={draft || lead.note} onChange={(e) => setDraft(e.target.value)} />
        </Field>
        <button
          type="button"
          className="mt-2 h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg"
          onClick={() => addNote(lead.id, draft || lead.note)}
        >
          Guardar nota y marcar contacto
        </button>
      </div>
      <h3 className="mt-5 text-xl">Propiedades que encajan</h3>
      <ul className="mt-2 grid gap-2">
        {matches.map((p) => (
          <li key={p.id} className="rounded-xl bg-bg px-3 py-2 text-sm">
            <span className="font-semibold">{p.code}</span> {p.title} · {formatPrice(p.price, p.operation)}
          </li>
        ))}
        {matches.length === 0 && <li className="text-sm text-muted">Sin inventario compatible ahora.</li>}
      </ul>
      <a
        className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg"
        href={`https://wa.me/${lead.phone}?text=${encodeURIComponent(`Hola ${lead.name.split(" ")[0]}, te escribo de la inmobiliaria por tu búsqueda en ${lead.zone}.`)}`}
        target="_blank"
        rel="noreferrer"
      >
        Escribir por WhatsApp
      </a>
    </article>
  );
}
