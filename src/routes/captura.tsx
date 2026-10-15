import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { Field, inputClass } from "@/components/crm/ui";
import { CITIES, ZONES, scoreLead } from "@/lib/crm/seed";
import { useCrm } from "@/lib/crm/store";
import type { Operation } from "@/lib/crm/types";

export const Route = createFileRoute("/captura")({ component: Page });

const TIMELINES = ["Este mes", "1 a 3 meses", "3 a 6 meses", "Más de 6 meses", "Solo estoy viendo"];

const RANGES: Record<string, [number, number]> = {
  "Hasta 40.000": [15000, 40000],
  "40.000 a 80.000": [40000, 80000],
  "80.000 a 150.000": [80000, 150000],
  "Más de 150.000": [150000, 400000],
  "Alquiler hasta 800": [400, 800],
  "Alquiler 800 a 2.000": [800, 2000],
};

const COUNTRY_CODES = [
  { code: "+58", flag: "🇻🇪", name: "Venezuela", placeholder: "(412) 123-4567" },
  { code: "+1", flag: "🇺🇸", name: "Estados Unidos", placeholder: "(305) 555-0199" },
  { code: "+57", flag: "🇨🇴", name: "Colombia", placeholder: "(300) 123-4567" },
  { code: "+34", flag: "🇪🇸", name: "España", placeholder: "612 345 678" },
  { code: "+507", flag: "🇵🇦", name: "Panamá", placeholder: "6123-4567" },
  { code: "+52", flag: "🇲🇽", name: "México", placeholder: "(55) 1234-5678" },
  { code: "+56", flag: "🇨🇱", name: "Chile", placeholder: "9 1234 5678" },
] as const;

function formatPhone(val: string, country: string): string {
  const digits = val.replace(/\D/g, "");
  if (country === "+58") {
    // Formato venezolano (412) 123-4567
    const trimmed = digits.startsWith("0") ? digits.slice(1) : digits;
    if (trimmed.length <= 3) return trimmed ? `(${trimmed}` : "";
    if (trimmed.length <= 6) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6, 10)}`;
  }
  if (country === "+1") {
    if (digits.length <= 3) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  return val;
}

function Page() {
  const { properties, addLead } = useCrm();
  const navigate = useNavigate();
  const [name, setName] = useState("Valentina Rojas");
  const [countryCode, setCountryCode] = useState("+58");
  const [phone, setPhone] = useState("(412) 123-4567");
  const [operation, setOperation] = useState<Operation>("venta");
  const [city, setCity] = useState("Caracas");
  const [zone, setZone] = useState("Altamira");
  const [range, setRange] = useState("80.000 a 150.000");
  const [timeline, setTimeline] = useState("Este mes");
  const [done, setDone] = useState<string | null>(null);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 font-display text-xl">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-fg">
              <Building2 size={18} />
            </span>
            Agencia demo
          </span>
          <Link to="/" className="text-sm font-medium text-primary">
            Ir al CRM
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <p className="text-sm font-medium text-accent">Formulario público</p>
        <h1 className="mt-1 text-4xl">Cuéntanos qué buscas</h1>
        <p className="mt-2 text-pretty text-muted">
          Cuatro preguntas antes de pasar con un asesor. Así no se muestra un inmueble a quien no tiene el presupuesto.
        </p>
        <form
          className="mt-6 grid gap-3 rounded-2xl border border-line bg-surface p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const [budgetMin, budgetMax] = RANGES[range];
            const score = scoreLead({ operation, budgetMax, timeline, zone, properties });
            const id = `l-${Date.now()}`;
            const cleanDigits = phone.replace(/\D/g, "");
            const normalizedPhone = countryCode.replace(/\D/g, "") + (countryCode === "+58" && cleanDigits.startsWith("0") ? cleanDigits.slice(1) : cleanDigits);
            addLead({
              id,
              name,
              phone: normalizedPhone,
              operation,
              city,
              zone,
              budgetMin,
              budgetMax,
              timeline,
              score,
              stage: "nuevo",
              agentId: "carlos",
              note: "Entró por el formulario web.",
              lastContact: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            });
            setDone(`${name} (${countryCode} ${phone}) quedó como Lead ${score} y se asignó a Carlos Peña.`);
          }}
        >
          <Field label="Nombre">
            <input className={inputClass} value={name} required onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="WhatsApp (con selector de país)">
            <div className="flex gap-2">
              <select
                className={`${inputClass} w-36 shrink-0 font-medium`}
                value={countryCode}
                onChange={(e) => {
                  const nextCode = e.target.value;
                  setCountryCode(nextCode);
                  setPhone(formatPhone(phone, nextCode));
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                className={inputClass}
                value={phone}
                placeholder={selectedCountry.placeholder}
                required
                onChange={(e) => setPhone(formatPhone(e.target.value, countryCode))}
              />
            </div>
            <p className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted">
              <span>
                Formato internacional:{" "}
                <strong className="text-ink">
                  {countryCode} {phone || selectedCountry.placeholder}
                </strong>
              </span>
              <span className="font-semibold text-primary">✓ Conexión lista para n8n y WhatsApp</span>
            </p>
          </Field>
          <Field label="¿Comprar o alquilar?">
            <select className={inputClass} value={operation} onChange={(e) => setOperation(e.target.value as Operation)}>
              <option value="venta">Comprar</option>
              <option value="alquiler">Alquilar</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad">
              <select
                className={inputClass}
                value={city}
                onChange={(e) => {
                  const next = e.target.value;
                  setCity(next);
                  setZone(ZONES[next][0]);
                }}
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Zona">
              <select className={inputClass} value={zone} onChange={(e) => setZone(e.target.value)}>
                {ZONES[city].map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Presupuesto estimado">
            <select className={inputClass} value={range} onChange={(e) => setRange(e.target.value)}>
              {Object.keys(RANGES).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="¿En cuánto tiempo?">
            <select className={inputClass} value={timeline} onChange={(e) => setTimeline(e.target.value)}>
              {TIMELINES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <button type="submit" className="h-12 rounded-lg bg-accent font-semibold text-accent-fg">
            Enviar y calificar
          </button>
          {done && (
            <div className="rounded-xl bg-bg p-3 text-sm">
              <p>{done}</p>
              <button type="button" className="mt-2 font-semibold text-primary" onClick={() => navigate({ to: "/pipeline" })}>
                Verlo en el pipeline
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
