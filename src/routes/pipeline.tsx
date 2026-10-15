import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical, ShieldCheck, UserCheck } from "lucide-react";
import { ColdChip, ScorePill, Shell, agentName } from "@/components/crm/ui";
import { STAGES, isCold } from "@/lib/crm/seed";
import { useCrm } from "@/lib/crm/store";
import type { Stage } from "@/lib/crm/types";

export const Route = createFileRoute("/pipeline")({ component: Page });

function Page() {
  const { leads, role, moveLead } = useCrm();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  const visible = role === "agente" ? leads.filter((l) => l.agentId === "carlos") : leads;

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, stageId: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>, stageId: Stage) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, stageId: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (id) {
      moveLead(id, stageId);
    }
    setDraggingId(null);
    setDragOverStage(null);
  };

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Pipeline</h1>
          <p className="mt-1 max-w-xl text-pretty text-muted">
            Del primer mensaje a la firma. Arrastra las tarjetas entre etapas y el panel general se actualiza en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-muted shadow-xs">
          {role === "dueno" ? (
            <>
              <ShieldCheck className="size-4 text-primary" />
              <span>
                <strong>Modo Directora:</strong> Consolidado general ({visible.length} leads en oficina)
              </span>
            </>
          ) : (
            <>
              <UserCheck className="size-4 text-accent" />
              <span>
                <strong>Modo Asesor:</strong> Solo cartera de Carlos Peña ({visible.length} leads)
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = visible.filter((l) => l.stage === stage.id);
          const isOver = dragOverStage === stage.id;
          return (
            <section
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-72 shrink-0 rounded-2xl p-3 transition-colors duration-150 ${
                isOver ? "bg-primary/10 ring-2 ring-primary ring-inset" : "bg-soft"
              }`}
            >
              <header className="mb-2.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-ink">{stage.label}</h2>
                  <span
                    className={`grid size-5.5 place-items-center rounded-full text-xs font-bold tabular-nums ${
                      cards.length > 0 ? "bg-surface text-ink shadow-xs" : "bg-transparent text-muted"
                    }`}
                  >
                    {cards.length}
                  </span>
                </div>
              </header>

              <ul className="grid gap-2 min-h-24">
                {cards.map((lead) => {
                  const isBeingDragged = draggingId === lead.id;
                  return (
                    <li
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverStage(null);
                      }}
                      className={`group cursor-grab rounded-xl border border-line bg-surface p-3 shadow-xs transition-all duration-150 active:cursor-grabbing hover:border-primary/50 hover:shadow-md ${
                        isBeingDragged ? "scale-[0.98] opacity-40 ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="size-4 text-muted/40 transition-colors group-hover:text-muted" />
                          <p className="font-semibold text-ink leading-tight">{lead.name}</p>
                        </div>
                        <ScorePill score={lead.score} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1 pl-5.5">
                        <span className="text-xs text-muted">
                          {lead.zone}
                          {role === "dueno" && <span className="ml-1 text-ink/75">· {agentName(lead.agentId)}</span>}
                        </span>
                        {isCold(lead) && <ColdChip />}
                      </div>

                      <div className="mt-2.5 border-t border-line/60 pt-2 pl-5.5">
                        <div className="flex items-center justify-between gap-1 text-[11px] text-muted">
                          <span className="hidden sm:inline">Mover etapa:</span>
                          <select
                            className="h-8 rounded-md border border-line bg-bg px-2 text-xs text-ink focus:border-primary focus:outline-none"
                            value={lead.stage}
                            onChange={(e) => moveLead(lead.id, e.target.value as Stage)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {cards.length === 0 && (
                  <li
                    className={`grid h-24 place-items-center rounded-xl border-2 border-dashed text-xs text-muted/70 transition-colors ${
                      isOver ? "border-primary bg-primary/5 text-primary" : "border-line/70"
                    }`}
                  >
                    Arrastra aquí
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
