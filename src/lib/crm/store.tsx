import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { freshState, STORAGE_KEY } from "./seed";
import type { CrmState, Lead, Property, Role } from "./types";

type CrmApi = CrmState & {
  setRole: (role: Role) => void;
  saveProperty: (property: Property) => void;
  setPropertyStatus: (id: string, status: Property["status"]) => void;
  addLead: (lead: Lead) => void;
  moveLead: (id: string, stage: Lead["stage"]) => void;
  addNote: (id: string, note: string) => void;
  reset: () => void;
};

const Ctx = createContext<CrmApi | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CrmState>(freshState);
  const skipSave = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as CrmState);
    } catch {
      /* keep seed */
    }
  }, []);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo<CrmApi>(
    () => ({
      ...state,
      setRole: (role) => setState((s) => ({ ...s, role })),
      saveProperty: (property) =>
        setState((s) => {
          const exists = s.properties.some((p) => p.id === property.id);
          const properties = exists
            ? s.properties.map((p) => (p.id === property.id ? property : p))
            : [property, ...s.properties];
          return { ...s, properties };
        }),
      setPropertyStatus: (id, status) =>
        setState((s) => ({
          ...s,
          properties: s.properties.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      addLead: (lead) => setState((s) => ({ ...s, leads: [lead, ...s.leads] })),
      moveLead: (id, stage) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, stage, lastContact: new Date().toISOString() } : l,
          ),
        })),
      addNote: (id, note) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, note, lastContact: new Date().toISOString() } : l,
          ),
        })),
      reset: () => {
        const next = freshState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setState(next);
      },
    }),
    [state],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCrm() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("CrmProvider missing");
  return ctx;
}
