export type TaskKind = "ASEO_RECEPCION" | "COCINA_RECEPCION" | "SACAR_BASURA";

export interface PlanillaCell {
  am?: string;
  pm?: string;
  lunch?: string;
}

export interface PlanillaState {
  cells: Record<string, Record<string | number, PlanillaCell>>;
  lunchOverrides?: Record<string, Record<string | number, string>>;
  aseoOverrides?: Record<string | number, string>;
  cocinaOverrides?: Record<string | number, string>;
  basuraOverrides?: Record<string | number, string>;
  trioAusentePorDia?: Record<string | number, string>;
  flagsDiaMarcadoNoLab?: Record<string, Record<string | number, boolean>>;
  crossMonthCells?: Record<string, Record<string, PlanillaCell>>;
}

export interface DayMeta {
  day: number;
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

export interface TaskAssignment {
  task: TaskKind;
  empId: string | null;
  employeeName: string | null;
  phone: string | null;
  scheduledTime: string;
  wouldSend: boolean;
  reason: string | null;
}

export interface DayTasksPreview {
  date: string;
  noLaborable: boolean;
  tasks: TaskAssignment[];
}
