import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/crm/ui";

export const Route = createFileRoute("/guion")({ component: Page });

const STEPS = [
  {
    t: "El gancho",
    d: "Su equipo pierde tiempo respondiendo “¿precio?” a gente que no va a comprar. Esto califica antes de pasar el chat al asesor.",
    to: "/captura" as const,
    cta: "Abrir captura",
  },
  {
    t: "Calificar en vivo",
    d: "Llena el formulario como comprador en Altamira, presupuesto alto y plazo de este mes. Cae como Lead A asignado a Carlos, no como un mensaje suelto en Instagram.",
    to: "/captura" as const,
    cta: "Calificar un lead",
  },
  {
    t: "La cartera no está en un teléfono",
    d: "Muestra el tablero. Si el asesor se va, el historial se queda en la oficina: etapa, nota y último contacto.",
    to: "/pipeline" as const,
    cta: "Abrir pipeline",
  },
  {
    t: "Matching",
    d: "Abre el apartamento CCS-1042 en Altamira. El sistema ya sabe qué clientes buscaban esa zona y ese rango. Una propiedad nueva avisa a la cartera dormida.",
    to: "/propiedades" as const,
    cta: "Ver inventario",
  },
  {
    t: "El dueño manda",
    d: "Cambia a “Ver como dueño”. Visitas por asesor, embudo y quién lleva más de una semana en silencio. José Romero y Andrés Molina son el ejemplo.",
    to: "/" as const,
    cta: "Volver al panel",
  },
  {
    t: "La oferta",
    d: "Setup del portal y el CRM, una tarde de capacitación, y una mensualidad por mantenimiento, soporte y el reporte de leads. No hables de bases de datos. Habla de una venta extra al mes.",
    to: "/" as const,
    cta: "Cerrar la demo",
  },
];

function Page() {
  return (
    <Shell>
      <p className="text-sm font-medium text-accent">8 minutos</p>
      <h1 className="mt-1 text-4xl">Cómo mostrar esto</h1>
      <p className="mt-2 max-w-xl text-pretty text-muted">
        Recórrelo en este orden. Si algo se desordena, usa Reiniciar arriba a la derecha.
      </p>
      <ol className="mt-6 grid gap-3">
        {STEPS.map((step, i) => (
          <li key={step.t} className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-lg text-primary-fg">
              {i + 1}
            </span>
            <div>
              <h2 className="text-2xl">{step.t}</h2>
              <p className="mt-1 text-pretty text-sm text-muted">{step.d}</p>
            </div>
            <Link to={step.to} className="inline-flex h-11 items-center justify-center rounded-lg bg-soft px-3 text-sm font-semibold">
              {step.cta}
            </Link>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
