import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Field, Shell, inputClass } from "@/components/crm/ui";
import { CITIES, ZONES, formatPrice, leadsForProperty, money } from "@/lib/crm/seed";
import { useCrm } from "@/lib/crm/store";
import type { Operation, Property, PropertyStatus, PropertyType } from "@/lib/crm/types";

export const Route = createFileRoute("/propiedades")({ component: Page });

const TYPES: PropertyType[] = ["apartamento", "casa", "local", "terreno"];
const STATUSES: PropertyStatus[] = ["disponible", "reservado", "vendido", "alquilado"];

function blank(): Property {
  return {
    id: `p-${Date.now()}`,
    code: "CCS-0000",
    title: "",
    type: "apartamento",
    operation: "venta",
    city: "Caracas",
    zone: "Altamira",
    price: 80000,
    rooms: 2,
    baths: 2,
    parking: 1,
    area: 90,
    status: "disponible",
    description: "",
  };
}

function Page() {
  const { properties, leads, saveProperty, setPropertyStatus } = useCrm();
  const [city, setCity] = useState("todas");
  const [operation, setOperation] = useState("todas");
  const [type, setType] = useState("todas");
  const [status, setStatus] = useState("todas");
  const [editing, setEditing] = useState<Property | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      properties.filter((p) => {
        if (city !== "todas" && p.city !== city) return false;
        if (operation !== "todas" && p.operation !== operation) return false;
        if (type !== "todas" && p.type !== type) return false;
        if (status !== "todas" && p.status !== status) return false;
        return true;
      }),
    [properties, city, operation, type, status],
  );

  const open = properties.find((p) => p.id === openId) ?? null;

  return (
    <Shell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Inventario</h1>
          <p className="mt-1 text-muted">Lo que está reservado o vendido deja de ofrecerse en el acto.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(blank())}
          className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg"
        >
          Nueva propiedad
        </button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="todas">Todas las ciudades</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className={inputClass} value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="todas">Venta y alquiler</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="todas">Todos los tipos</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todas">Cualquier estado</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent">{p.code}</p>
                <h2 className="text-2xl">{p.title}</h2>
                <p className="text-sm text-muted">
                  {p.zone}, {p.city} · {p.type} · {p.operation}
                </p>
              </div>
              <p className="font-display text-2xl tabular-nums">{formatPrice(p.price, p.operation)}</p>
            </div>
            <p className="mt-2 text-sm text-muted">
              {p.rooms} hab · {p.baths} baños · {p.parking} puestos · {p.area} m²
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                className="h-11 rounded-lg border border-line bg-bg px-3 text-sm"
                value={p.status}
                onChange={(e) => setPropertyStatus(p.id, e.target.value as PropertyStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="button" className="h-11 rounded-lg bg-soft px-3 text-sm font-medium" onClick={() => setOpenId(p.id)}>
                Ficha y matches
              </button>
              <a
                className="inline-flex h-11 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg"
                href={`https://wa.me/?text=${encodeURIComponent(`Hola, te escribo por ${p.code} — ${p.title} en ${p.zone}. Precio ${formatPrice(p.price, p.operation)}.`)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-6 text-muted">Ninguna propiedad con esos filtros.</p>}

      {open && (
        <Panel title={open.title} onClose={() => setOpenId(null)}>
          <p className="text-sm text-muted">
            {open.code} · {open.description}
          </p>
          <h3 className="mt-4 text-xl">Leads a avisar</h3>
          <MatchList
            items={leadsForProperty(open, leads).map((l) => `${l.name} · Lead ${l.score} · hasta ${formatPrice(l.budgetMax, l.operation)}`)}
            empty="Ningún lead activo encaja con zona y presupuesto."
          />
        </Panel>
      )}

      {editing && (
        <Panel title="Propiedad" onClose={() => setEditing(null)}>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveProperty(editing);
              setEditing(null);
            }}
          >
            <Field label="Título">
              <input className={inputClass} value={editing.title} required onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Código">
                <input className={inputClass} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
              </Field>
              <Field label="Precio USD">
                <input className={inputClass} type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Operación">
                <select className={inputClass} value={editing.operation} onChange={(e) => setEditing({ ...editing, operation: e.target.value as Operation })}>
                  <option value="venta">venta</option>
                  <option value="alquiler">alquiler</option>
                </select>
              </Field>
              <Field label="Tipo">
                <select className={inputClass} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as PropertyType })}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ciudad">
                <select
                  className={inputClass}
                  value={editing.city}
                  onChange={(e) => {
                    const city = e.target.value;
                    setEditing({ ...editing, city, zone: ZONES[city][0] });
                  }}
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Zona">
                <select className={inputClass} value={editing.zone} onChange={(e) => setEditing({ ...editing, zone: e.target.value })}>
                  {ZONES[editing.city].map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Descripción">
              <textarea className={`${inputClass} h-24 py-2`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <button type="submit" className="h-11 rounded-lg bg-primary font-semibold text-primary-fg">
              Guardar en el inventario
            </button>
          </form>
        </Panel>
      )}
    </Shell>
  );
}

function MatchList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="mt-2 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-2 grid gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-lg bg-bg px-3 py-2 text-sm">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 grid items-end bg-ink/40 p-0 sm:items-center sm:p-6">
      <div className="max-h-[90vh] overflow-auto rounded-t-2xl bg-surface p-5 sm:mx-auto sm:w-full sm:max-w-lg sm:rounded-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-2xl">{title}</h2>
          <button type="button" onClick={onClose} className="h-11 rounded-lg px-3 text-sm">
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
