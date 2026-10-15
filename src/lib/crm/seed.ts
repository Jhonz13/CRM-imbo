import type { CrmState, Lead, Operation, Property, Score } from "./types";

export const DEMO_NOW = Date.parse("2026-10-13T18:00:00Z");
export const STORAGE_KEY = "inmocrm-demo-v2";

export const AGENTS = [
  { id: "dueno", name: "Laura Mendoza", role: "Directora" },
  { id: "carlos", name: "Carlos Peña", role: "Asesor" },
  { id: "andrea", name: "Andrea Luz", role: "Asesora" },
] as const;

export const CITIES = ["Caracas", "Valencia", "Maracay", "Lechería", "Barquisimeto"];
export const ZONES: Record<string, string[]> = {
  Caracas: ["Altamira", "Las Mercedes", "Chacao", "La Trinidad", "El Hatillo"],
  Valencia: ["El Trigal", "Guaparo", "Prebo", "Naguanagua"],
  Maracay: ["Las Delicias", "El Castaño", "San Jacinto"],
  Lechería: ["El Morro", "Centro", "Dunes"],
  Barquisimeto: ["El Pedregal", "Fundalara", "Nueva Segovia"],
};

export const STAGES = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "cita", label: "Cita agendada" },
  { id: "visita", label: "Visita realizada" },
  { id: "oferta", label: "Oferta" },
  { id: "cerrado", label: "Cerrado" },
  { id: "perdido", label: "Perdido" },
] as const;

const day = (offset: number) => new Date(DEMO_NOW + offset * 86400000).toISOString();

export function money(n: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPrice(n: number, operation?: Operation | string) {
  const formatted = money(n);
  return operation === "alquiler" ? `${formatted} / mes` : formatted;
}

export function scoreLead(input: {
  operation: "venta" | "alquiler";
  budgetMax: number;
  timeline: string;
  zone: string;
  properties: Property[];
}): Score {
  const hasStock = input.properties.some(
    (p) =>
      p.status === "disponible" &&
      p.operation === input.operation &&
      p.zone === input.zone &&
      p.price <= input.budgetMax * 1.08 &&
      p.price >= input.budgetMax * 0.45,
  );
  const soon = input.timeline === "Este mes" || input.timeline === "1 a 3 meses";
  const browsing = input.timeline === "Solo estoy viendo";
  if (browsing || input.budgetMax < 15000) return "C";
  if (soon && hasStock && input.budgetMax >= 40000) return "A";
  if (soon || hasStock) return "B";
  return "C";
}

export function matchesForLead(lead: Lead, properties: Property[]) {
  return properties.filter(
    (p) =>
      p.status === "disponible" &&
      p.operation === lead.operation &&
      (p.zone === lead.zone || p.city === lead.city) &&
      p.price >= lead.budgetMin * 0.85 &&
      p.price <= lead.budgetMax * 1.1,
  );
}

export function leadsForProperty(property: Property, leads: Lead[]) {
  return leads.filter(
    (l) =>
      l.stage !== "perdido" &&
      l.stage !== "cerrado" &&
      l.operation === property.operation &&
      (l.zone === property.zone || l.city === property.city) &&
      property.price >= l.budgetMin * 0.85 &&
      property.price <= l.budgetMax * 1.1,
  );
}

export function isCold(lead: Lead) {
  return DEMO_NOW - Date.parse(lead.lastContact) > 7 * 86400000 && lead.stage !== "cerrado" && lead.stage !== "perdido";
}

function p(
  partial: Omit<Property, "id"> & { id?: string },
): Property {
  return { id: partial.id ?? partial.code, ...partial };
}

export function freshState(): CrmState {
  const properties: Property[] = [
    p({
      code: "CCS-1042",
      title: "Apartamento luminoso en Altamira",
      type: "apartamento",
      operation: "venta",
      city: "Caracas",
      zone: "Altamira",
      price: 85000,
      rooms: 3,
      baths: 2,
      parking: 2,
      area: 128,
      status: "disponible",
      description: "Piso 8, vista al Ávila, cocina abierta y puesto de maletero.",
    }),
    p({
      code: "CCS-0988",
      title: "Casa con jardín en El Hatillo",
      type: "casa",
      operation: "venta",
      city: "Caracas",
      zone: "El Hatillo",
      price: 210000,
      rooms: 4,
      baths: 3,
      parking: 3,
      area: 320,
      status: "disponible",
      description: "Townhouse remodelada, terraza y cuarto de servicio.",
    }),
    p({
      code: "CCS-1104",
      title: "Local en Las Mercedes",
      type: "local",
      operation: "alquiler",
      city: "Caracas",
      zone: "Las Mercedes",
      price: 1800,
      rooms: 0,
      baths: 2,
      parking: 1,
      area: 72,
      status: "reservado",
      description: "Planta baja sobre calle comercial, ideal gastronomía.",
    }),
    p({
      code: "VAL-221",
      title: "Apartamento en El Trigal",
      type: "apartamento",
      operation: "venta",
      city: "Valencia",
      zone: "El Trigal",
      price: 48000,
      rooms: 2,
      baths: 2,
      parking: 1,
      area: 86,
      status: "disponible",
      description: "Piso intermedio, vigilado, a dos cuadras del centro comercial.",
    }),
    p({
      code: "VAL-240",
      title: "Casa en Guaparo",
      type: "casa",
      operation: "alquiler",
      city: "Valencia",
      zone: "Guaparo",
      price: 900,
      rooms: 3,
      baths: 2,
      parking: 2,
      area: 180,
      status: "disponible",
      description: "Residencial cerrado, patio trasero y habitación principal en planta baja.",
    }),
    p({
      code: "LEC-077",
      title: "Apartamento frente al mar en El Morro",
      type: "apartamento",
      operation: "venta",
      city: "Lechería",
      zone: "El Morro",
      price: 165000,
      rooms: 3,
      baths: 3,
      parking: 2,
      area: 150,
      status: "disponible",
      description: "Balcón corrido, amenidades de playa y un puesto techado.",
    }),
    p({
      code: "MAR-015",
      title: "Terreno en Las Delicias",
      type: "terreno",
      operation: "venta",
      city: "Maracay",
      zone: "Las Delicias",
      price: 35000,
      rooms: 0,
      baths: 0,
      parking: 0,
      area: 420,
      status: "disponible",
      description: "Esquina, uso residencial, servicios en el frente.",
    }),
    p({
      code: "CCS-0870",
      title: "Apartamento en La Trinidad",
      type: "apartamento",
      operation: "alquiler",
      city: "Caracas",
      zone: "La Trinidad",
      price: 750,
      rooms: 2,
      baths: 2,
      parking: 1,
      area: 90,
      status: "alquilado",
      description: "Amoblado, edificio con planta eléctrica.",
    }),
  ];

  const leads: Lead[] = [
    {
      id: "l1",
      name: "Ricardo Alvarado",
      phone: "584141112233",
      operation: "venta",
      city: "Caracas",
      zone: "Altamira",
      budgetMin: 70000,
      budgetMax: 95000,
      timeline: "Este mes",
      score: "A",
      stage: "cita",
      agentId: "carlos",
      note: "Quiere ver el CCS-1042 el jueves. Tiene los dólares listos.",
      lastContact: day(-1),
      createdAt: day(-12),
    },
    {
      id: "l2",
      name: "Sofía Herrera",
      phone: "584249998877",
      operation: "venta",
      city: "Caracas",
      zone: "El Hatillo",
      budgetMin: 180000,
      budgetMax: 240000,
      timeline: "1 a 3 meses",
      score: "A",
      stage: "visita",
      agentId: "andrea",
      note: "Visitó la casa. Pide comparar con otra en La Lagunita.",
      lastContact: day(-3),
      createdAt: day(-40),
    },
    {
      id: "l3",
      name: "Miguel Torres",
      phone: "584126660011",
      operation: "venta",
      city: "Valencia",
      zone: "El Trigal",
      budgetMin: 40000,
      budgetMax: 55000,
      timeline: "1 a 3 meses",
      score: "A",
      stage: "nuevo",
      agentId: "carlos",
      note: "",
      lastContact: day(0),
      createdAt: day(0),
    },
    {
      id: "l4",
      name: "Daniela Cruz",
      phone: "584163334455",
      operation: "alquiler",
      city: "Valencia",
      zone: "Guaparo",
      budgetMin: 600,
      budgetMax: 1000,
      timeline: "Este mes",
      score: "B",
      stage: "contactado",
      agentId: "andrea",
      note: "Pide mascota permitida. Aún no confirma documentos.",
      lastContact: day(-2),
      createdAt: day(-6),
    },
    {
      id: "l5",
      name: "José Romero",
      phone: "584145556677",
      operation: "venta",
      city: "Caracas",
      zone: "Las Mercedes",
      budgetMin: 20000,
      budgetMax: 35000,
      timeline: "Solo estoy viendo",
      score: "C",
      stage: "nuevo",
      agentId: "carlos",
      note: "Preguntó precio por Instagram y no respondió el presupuesto.",
      lastContact: day(-18),
      createdAt: day(-18),
    },
    {
      id: "l6",
      name: "Carmen Díaz",
      phone: "584147778899",
      operation: "venta",
      city: "Lechería",
      zone: "El Morro",
      budgetMin: 140000,
      budgetMax: 180000,
      timeline: "3 a 6 meses",
      score: "B",
      stage: "oferta",
      agentId: "andrea",
      note: "Oferta verbal de 158.000. Esperando respuesta del propietario.",
      lastContact: day(-4),
      createdAt: day(-70),
    },
    {
      id: "l7",
      name: "Andrés Molina",
      phone: "584129991010",
      operation: "venta",
      city: "Maracay",
      zone: "Las Delicias",
      budgetMin: 25000,
      budgetMax: 40000,
      timeline: "1 a 3 meses",
      score: "B",
      stage: "contactado",
      agentId: "carlos",
      note: "Interesado en terreno para construir. No se le escribió esta quincena.",
      lastContact: day(-16),
      createdAt: day(-50),
    },
    {
      id: "l8",
      name: "Paola Méndez",
      phone: "584161212121",
      operation: "alquiler",
      city: "Caracas",
      zone: "La Trinidad",
      budgetMin: 500,
      budgetMax: 800,
      timeline: "Este mes",
      score: "A",
      stage: "cerrado",
      agentId: "andrea",
      note: "Firmó el CCS-0870.",
      lastContact: day(-8),
      createdAt: day(-21),
    },
    {
      id: "l9",
      name: "Gabriel Navarro",
      phone: "584143339900",
      operation: "venta",
      city: "Caracas",
      zone: "Chacao",
      budgetMin: 50000,
      budgetMax: 70000,
      timeline: "Más de 6 meses",
      score: "C",
      stage: "perdido",
      agentId: "carlos",
      note: "Desistió temporalmente por falta de crédito bancario. Guardado para seguimiento.",
      lastContact: day(-25),
      createdAt: day(-60),
    },
  ];

  return { role: "dueno", properties, leads };
}
