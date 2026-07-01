import type { TaskKind } from "./types";

export const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

export const AM_NORMAL = "9";
export const AM_SABADO = "930";

/** Mismo orden que recepcion-aseo.js */
export const ASEO_RECEPCION_IDS = [
  "harold_paipa",
  "diego_lozano",
  "dilan_toro",
  "santiago_guarnizo",
  "brandon",
  "cristian_uribe",
  "jhon_lozano",
  "jesus_perez",
] as const;

export const COCINA_RECEPCION_IDS = [...ASEO_RECEPCION_IDS];

/** Lun=1, Mié=3, Vie=5 — sacada-basura.js */
export const BASURA_DOWS = [1, 3, 5] as const;

export const BASURA_SACADA_IDS = [
  "harold_paipa",
  "diego_lozano",
  "dilan_toro",
  "santiago_guarnizo",
  "cristian_uribe",
  "jhon_lozano",
  "jesus_perez",
  "brayan_ramirez",
  "brandon",
] as const;

export const EMPLOYEE_NAMES: Record<string, string> = {
  harold_paipa: "HAROLD PAIPA",
  diego_lozano: "DIEGO LOZANO",
  dilan_toro: "DILAN TORO",
  santiago_guarnizo: "SANTIAGO GUARNIZO",
  brandon: "BRANDON",
  cristian_uribe: "CRISTIAN URIBE",
  jhon_lozano: "JHON LOZANO",
  jesus_perez: "JESÚS PÉREZ",
  brayan_ramirez: "BRAYAN RAMÍREZ",
  miguel_fonseca: "MIGUEL FONSECA",
  juan_giron: "JUAN GIRÓN",
  jhonny_rodriguez: "JHONNY RODRÍGUEZ",
  brayan_yate: "BRAYAN YATE",
  mauricio_bautista: "MAURICIO BAUTISTA",
  david_sanchez: "DAVID SÁNCHEZ",
  jonathan_sanchez: "JONATHAN SÁNCHEZ",
};

export const TASK_ORDER: TaskKind[] = [
  "ASEO_RECEPCION",
  "COCINA_RECEPCION",
  "SACAR_BASURA",
];

export const TASK_LABELS: Record<TaskKind, string> = {
  ASEO_RECEPCION: "Aseo Recepción",
  COCINA_RECEPCION: "Aseo Cocina-Pasillo",
  SACAR_BASURA: "Sacar Basura",
};

export const TASK_SCHEDULE_LABEL: Record<TaskKind, string> = {
  ASEO_RECEPCION: "Lun–Sáb 9:00 (sáb 9:30) · no festivos",
  COCINA_RECEPCION: "Lun–Sáb 9:00 (sáb 9:30) · no festivos",
  SACAR_BASURA: "Lun/Mié/Vie 18:00 · no festivos",
};

export const PHONES_COLLECTION = "empleadosTelefonos";
