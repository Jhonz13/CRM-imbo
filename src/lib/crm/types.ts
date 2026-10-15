export type Operation = "venta" | "alquiler";
export type PropertyType = "apartamento" | "casa" | "local" | "terreno";
export type PropertyStatus = "disponible" | "reservado" | "vendido" | "alquilado";
export type Score = "A" | "B" | "C";
export type Stage =
  | "nuevo"
  | "contactado"
  | "cita"
  | "visita"
  | "oferta"
  | "cerrado"
  | "perdido";
export type Role = "dueno" | "agente";

export type Property = {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  operation: Operation;
  city: string;
  zone: string;
  price: number;
  rooms: number;
  baths: number;
  parking: number;
  area: number;
  status: PropertyStatus;
  description: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  operation: Operation;
  zone: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  score: Score;
  stage: Stage;
  agentId: string;
  note: string;
  lastContact: string;
  createdAt: string;
};

export type Agent = { id: string; name: string; role: string };

export type CrmState = {
  role: Role;
  properties: Property[];
  leads: Lead[];
};
