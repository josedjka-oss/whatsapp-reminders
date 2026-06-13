"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ValeLine = {
  holderName: string;
  amount: number;
  appliesTo: string;
  photoUrl: string;
};

type Recibo = {
  employeeName: string;
  grossSalary: number;
  grossTransport: number;
  grossBonus: number;
  grossOvertime: number;
  salaryDiscounts: number;
  bonusDiscounts: number;
  netSalary: number;
  netTransport: number;
  netBonus: number;
  netOvertime: number;
  netTotal: number;
  breakdown: {
    periodLabel?: string;
    bonusFrequency?: string;
    recurringDeductions?: { label: string; amount: number; appliesTo: string }[];
    vales?: ValeLine[];
    overtime?: {
      daytimeHours: number;
      monthlyHoursBase?: number;
      hourlyRate: number;
      overtimeUnitRate: number;
      totalMonthOvertimePay: number;
    };
  };
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export default function ReciboPublicoPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/nomina/public/recibo/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Recibo no encontrado");
        return res.json();
      })
      .then(setRecibo)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!recibo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <p className="text-gray-600">Cargando recibo…</p>
      </div>
    );
  }

  const vales = recibo.breakdown?.vales ?? [];
  const deductions = recibo.breakdown?.recurringDeductions ?? [];
  const ot = recibo.breakdown?.overtime;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-700 text-white px-6 py-8 text-center">
          <p className="text-sm opacity-90">Recibo de nómina</p>
          <h1 className="text-2xl font-bold mt-1">{recibo.employeeName}</h1>
          <p className="text-indigo-100 mt-2">{recibo.breakdown?.periodLabel ?? ""}</p>
          {recibo.breakdown?.bonusFrequency === "MENSUAL" && (
            <p className="text-xs text-indigo-200 mt-1">Bonificación: pago mensual</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h2 className="font-semibold text-gray-800 mb-2">Ingresos (esta quincena)</h2>
            <Row label="Salario" value={formatCop(recibo.grossSalary)} />
            <Row label="Auxilio de transporte" value={formatCop(recibo.grossTransport)} />
            <Row label="Bonificación" value={formatCop(recibo.grossBonus)} />
            {recibo.grossOvertime > 0 && (
              <>
                <Row
                  label={`Horas extra diurnas (${ot?.daytimeHours ?? 0} h)`}
                  value={formatCop(recibo.grossOvertime)}
                />
                {ot && (
                  <p className="text-xs text-gray-500 pl-1">
                    Base {ot.monthlyHoursBase ?? 240} h/mes · {formatCop(ot.overtimeUnitRate)} / hora
                    extra · total mes {formatCop(ot.totalMonthOvertimePay)}
                  </p>
                )}
              </>
            )}
          </section>

          {(deductions.length > 0 || vales.length > 0) && (
            <section>
              <h2 className="font-semibold text-gray-800 mb-2">Descuentos</h2>
              {deductions.map((d, i) => (
                <Row
                  key={`d-${i}`}
                  label={`${d.label} (${d.appliesTo === "BONUS" ? "bonificación" : "salario"})`}
                  value={`− ${formatCop(d.amount)}`}
                  muted
                />
              ))}
              {vales.map((v, i) => (
                <Row
                  key={`v-${i}`}
                  label={`Vale: ${v.holderName}`}
                  value={`− ${formatCop(v.amount)}`}
                  muted
                />
              ))}
              <Row label="Total desc. salario" value={`− ${formatCop(recibo.salaryDiscounts)}`} />
              <Row label="Total desc. bonificación" value={`− ${formatCop(recibo.bonusDiscounts)}`} />
            </section>
          )}

          <section className="border-t pt-4">
            <Row label="Neto salario" value={formatCop(recibo.netSalary)} />
            <Row label="Neto transporte" value={formatCop(recibo.netTransport)} />
            <Row label="Neto bonificación" value={formatCop(recibo.netBonus)} />
            {recibo.netOvertime > 0 && (
              <Row label="Neto horas extras" value={formatCop(recibo.netOvertime)} />
            )}
            <div className="flex justify-between text-lg font-bold text-indigo-800 mt-3 pt-3 border-t">
              <span>Total a pagar</span>
              <span>{formatCop(recibo.netTotal)}</span>
            </div>
          </section>

          {vales.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-800 mb-3">Fotos de vales</h2>
              <div className="grid grid-cols-1 gap-4">
                {vales.map((v, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">
                      {v.holderName} — {formatCop(v.amount)}
                    </p>
                    <a href={v.photoUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={v.photoUrl}
                        alt={`Vale ${v.holderName}`}
                        className="w-full rounded max-h-64 object-contain bg-gray-50"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

const Row = ({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div className={`flex justify-between py-1 text-sm ${muted ? "text-gray-600" : "text-gray-800"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
