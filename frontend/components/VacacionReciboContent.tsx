"use client";

export type VacacionReciboData = {
  employeeName?: string;
  periodLabelLong?: string;
  vacationStartLabelLong?: string | null;
  vacationEndLabelLong?: string | null;
  vacationBusinessDays?: number;
  periodStart?: string;
  periodEnd?: string;
  baseSalaryUsed?: number;
  baseSalary?: number;
  daysWorked?: number;
  vacationAmount: number;
  equivalentDays?: number;
  equivalentVacationDays?: number;
  breakdown?: { formula?: string };
  formula?: string;
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

type VacacionReciboContentProps = {
  recibo: VacacionReciboData;
  compact?: boolean;
};

export const VacacionReciboContent = ({
  recibo,
  compact = false,
}: VacacionReciboContentProps) => {
  const salary = recibo.baseSalaryUsed ?? recibo.baseSalary ?? 0;
  const equivalent = recibo.equivalentDays ?? recibo.equivalentVacationDays ?? 0;
  const periodLabel =
    recibo.periodLabelLong ??
    (recibo.periodStart && recibo.periodEnd
      ? `${recibo.periodStart} al ${recibo.periodEnd}`
      : "—");
  const formula = recibo.breakdown?.formula ?? recibo.formula ?? "";

  return (
    <div
      className={
        compact
          ? "space-y-3 text-sm"
          : "bg-white rounded-xl border overflow-hidden shadow-sm"
      }
    >
      {!compact && (
        <div className="bg-sky-600 text-white px-4 py-3">
          <h2 className="font-bold text-lg">Liquidación de vacaciones</h2>
        </div>
      )}
      <div className={compact ? "space-y-3" : "p-4 space-y-3 text-sm"}>
        <div>
          <p className="text-gray-500 text-xs">Empleado</p>
          <p className="font-semibold text-gray-900">{recibo.employeeName ?? "—"}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Período a liquidar</p>
          <p className="font-medium capitalize">{periodLabel}</p>
        </div>
        {recibo.vacationStartLabelLong && (
          <div>
            <p className="text-gray-500 text-xs">Inicio de vacaciones</p>
            <p className="font-medium capitalize">{recibo.vacationStartLabelLong}</p>
          </div>
        )}
        {recibo.vacationEndLabelLong && (
          <div>
            <p className="text-gray-500 text-xs">Último día hábil de vacaciones</p>
            <p className="font-medium capitalize">{recibo.vacationEndLabelLong}</p>
            {recibo.vacationBusinessDays != null && (
              <p className="text-xs text-gray-500 mt-0.5">
                {recibo.vacationBusinessDays} días hábiles (lun–sáb; sin domingos ni festivos)
              </p>
            )}
          </div>
        )}
        {salary > 0 && (
          <div>
            <p className="text-gray-500 text-xs">Salario ordinario (sin transporte)</p>
            <p className="font-medium">{formatCop(salary)}</p>
          </div>
        )}
        <div className="border-t pt-3">
          <p className="text-gray-500 text-xs">Valor vacaciones</p>
          <p className="text-xl font-bold text-sky-700">{formatCop(recibo.vacationAmount)}</p>
          {(recibo.daysWorked != null || equivalent > 0) && (
            <p className="text-gray-600 text-xs mt-1">
              {recibo.daysWorked != null ? `${recibo.daysWorked} días causados` : ""}
              {equivalent > 0 ? ` · ≈ ${equivalent} días de salario` : ""}
            </p>
          )}
        </div>
        {formula && (
          <p className="text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">{formula}</p>
        )}
      </div>
    </div>
  );
};
