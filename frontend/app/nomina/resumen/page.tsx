"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type SummaryRow = {
  employeeId: string;
  name: string;
  grossSalary: number;
  grossTransport: number;
  grossBonus: number;
  salaryDiscounts: number;
  bonusDiscounts: number;
  netSalaryWithTransport: number;
  netBonus: number;
  netOvertime: number;
};

type SummaryResponse = {
  periodLabel: string;
  rows: SummaryRow[];
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function NominaResumenPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [half, setHalf] = useState(now.getDate() <= 15 ? 1 : 2);
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/nomina/summary?year=${year}&month=${month}&half=${half}`
      );
      if (!res.ok) throw new Error("Error cargando resumen");
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [year, month, half]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = data?.rows.reduce(
    (acc, r) => ({
      salary: acc.salary + r.netSalaryWithTransport,
      bonus: acc.bonus + r.netBonus,
    }),
    { salary: 0, bonus: 0 }
  ) ?? { salary: 0, bonus: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Resumen" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900">
          <p className="font-semibold mb-1">Qué muestra este panel</p>
          <p>
            <strong>Salario neto</strong> = salario quincenal + auxilio transporte quincenal −
            descuentos al salario (vales, préstamos, fijos).
          </p>
          <p>
            <strong>Bonificación neta</strong> = bonificación de la quincena − descuentos a
            bonificación.
          </p>
          <p className="text-xs mt-2 text-indigo-700">
            Las horas extras no están incluidas en estas dos columnas (van aparte en el recibo).
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
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
          <label className="text-sm">
            Quincena
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={half}
              onChange={(e) => setHalf(Number(e.target.value))}
            >
              <option value={1}>1 (día 15)</option>
              <option value={2}>2 (fin de mes)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg h-10"
          >
            Actualizar
          </button>
        </div>

        {loading && <p className="text-gray-500">Calculando…</p>}

        {data && (
          <>
            <h2 className="text-lg font-semibold text-gray-800">{data.periodLabel}</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold">Empleado</th>
                    <th className="text-right p-3 font-semibold">
                      Salario + transporte (neto)
                    </th>
                    <th className="text-right p-3 font-semibold">Bonificación (neta)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.employeeId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{row.name}</td>
                      <td className="p-3 text-right">{formatCop(row.netSalaryWithTransport)}</td>
                      <td className="p-3 text-right">{formatCop(row.netBonus)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-semibold">
                  <tr>
                    <td className="p-3">Total</td>
                    <td className="p-3 text-right">{formatCop(totals.salary)}</td>
                    <td className="p-3 text-right">{formatCop(totals.bonus)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
