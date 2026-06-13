"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type Employee = {
  id: string;
  name: string;
  baseSalary: string | number;
  monthlyHoursBase?: number;
};

type OvertimeRow = {
  id: string;
  employeeId: string;
  year: number;
  month: number;
  daytimeHours: number;
  calculatedPay: number;
  employee: Employee;
};

type CalcPreview = {
  hourlyRate: number;
  overtimeUnitRate: number;
  totalOvertimePay: number;
  monthlyHoursBase: number;
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export default function NominaHorasExtrasPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rows, setRows] = useState<OvertimeRow[]>([]);
  const [hoursDraft, setHoursDraft] = useState<Record<string, string>>({});
  const [calcPreview, setCalcPreview] = useState<CalcPreview | null>(null);
  const [calcSalary, setCalcSalary] = useState("");
  const [calcHours, setCalcHours] = useState("");
  const [calcHoursBase, setCalcHoursBase] = useState("240");

  const load = useCallback(async () => {
    const [empRes, otRes] = await Promise.all([
      fetch("/api/nomina/employees"),
      fetch(`/api/nomina/overtime?year=${year}&month=${month}`),
    ]);
    if (empRes.ok) setEmployees(await empRes.json());
    if (otRes.ok) setRows(await otRes.json());
  }, [year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveHours = async (employeeId: string) => {
    const raw = hoursDraft[employeeId];
    const daytimeHours = Number(raw ?? 0);
    const res = await fetch("/api/nomina/overtime", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, year, month, daytimeHours }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error");
      return;
    }
    void load();
  };

  const handlePreviewCalc = async () => {
    const salary = Number(calcSalary);
    const hours = Number(calcHours);
    if (!salary) return;
    const res = await fetch(
      `/api/nomina/calculate-overtime?salary=${salary}&hours=${hours}&hoursBase=${calcHoursBase}`
    );
    if (res.ok) setCalcPreview(await res.json());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Horas extras" />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900">
          <p className="font-semibold mb-1">Fórmula (hora extra diurna Colombia)</p>
          <p>Hora ordinaria = salario mensual ÷ base horas (240, 220, 200…)</p>
          <p>Hora extra diurna = hora ordinaria × 1.25</p>
          <p className="mt-2">Las horas extras del mes se pagan en la <strong>2da quincena</strong> (fin de mes).</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="font-semibold">Calculadora rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Salario mensual"
              value={calcSalary}
              onChange={(e) => setCalcSalary(e.target.value)}
            />
            <input
              type="number"
              min={1}
              className="border rounded-lg px-3 py-2"
              placeholder="Base horas/mes"
              value={calcHoursBase}
              onChange={(e) => setCalcHoursBase(e.target.value)}
              aria-label="Base horas mensuales"
            />
            <input
              type="number"
              step="0.5"
              className="border rounded-lg px-3 py-2"
              placeholder="Horas extra diurnas"
              value={calcHours}
              onChange={(e) => setCalcHours(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void handlePreviewCalc()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Calcular
            </button>
          </div>
          {calcPreview && (
            <div className="text-sm bg-gray-50 rounded p-3 space-y-1">
              <p>Base: {calcPreview.monthlyHoursBase} horas/mes</p>
              <p>Hora ordinaria: {formatCop(calcPreview.hourlyRate)}</p>
              <p>Hora extra diurna: {formatCop(calcPreview.overtimeUnitRate)}</p>
              <p className="font-bold text-lg">Total horas extras: {formatCop(calcPreview.totalOvertimePay)}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-2 gap-3">
          <label className="text-sm">
            Año
            <input
              type="number"
              className="mt-1 w-full border rounded px-2 py-1"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            Mes
            <input
              type="number"
              min={1}
              max={12}
              className="mt-1 w-full border rounded px-2 py-1"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {employees.map((emp) => {
            const existing = rows.find((r) => r.employeeId === emp.id);
            const base = emp.monthlyHoursBase ?? 240;
            const hourly = Number(emp.baseSalary) / base;
            return (
              <div key={emp.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">{emp.name}</p>
                  <p className="text-xs text-gray-500">
                    Salario {formatCop(Number(emp.baseSalary))} · Base {base} h · Hora{" "}
                    {formatCop(hourly)}
                  </p>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  className="border rounded px-3 py-2 w-32"
                  placeholder="Horas"
                  defaultValue={existing?.daytimeHours ?? ""}
                  onChange={(e) =>
                    setHoursDraft((p) => ({ ...p, [emp.id]: e.target.value }))
                  }
                  aria-label={`Horas extra ${emp.name}`}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm"
                  onClick={() => void handleSaveHours(emp.id)}
                >
                  Guardar
                </button>
                {existing && (
                  <p className="text-sm font-medium text-emerald-800 md:w-36 text-right">
                    {formatCop(existing.calculatedPay)}
                  </p>
                )}
              </div>
            );
          })}
          {employees.length === 0 && (
            <p className="p-4 text-gray-500">Primero agrega empleados en la sección Empleados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
