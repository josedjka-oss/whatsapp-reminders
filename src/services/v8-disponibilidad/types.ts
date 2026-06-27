export type MessengerEmpId = "harold_paipa" | "diego_lozano" | "dilan_toro";

export interface PlanillaCell {
  am?: string;
  pm?: string;
  lunch?: string;
}

export interface PlanillaState {
  cells: Record<string, Record<string | number, PlanillaCell>>;
  lunchOverrides?: Record<string, Record<string | number, string>>;
  trioAusentePorDia?: Record<string | number, string>;
  flagsDiaMarcadoNoLab?: Record<string, Record<string | number, boolean>>;
  crossMonthCells?: Record<string, Record<string, PlanillaCell>>;
}

export interface DayMeta {
  day: number | null;
  ymd: string;
  dow: number;
  noLaborable: boolean;
  festivo: boolean;
  esSabado: boolean;
  inMonth: boolean;
}

export interface MonthMeta {
  year: number;
  month: number;
  lastDay: number;
  days: DayMeta[];
}

export interface V8DisponibilidadEvento {
  id: string;
  mensajero: number;
  disponible: boolean;
  fechaHora: string;
  motivo: string;
}

export interface V8DisponibilidadPayload {
  fecha: string;
  origen: "app-whatsapp";
  zonaHoraria: "America/Bogota";
  eventos: V8DisponibilidadEvento[];
}

export interface V8DisponibilidadResponse {
  ok: boolean;
  fecha?: string;
  eventosRecibidos?: number;
  eventosGuardados?: number;
  mensajeros?: Record<string, number>;
  error?: string;
}
