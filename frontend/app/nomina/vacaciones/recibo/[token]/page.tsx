"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type VacacionRecibo = {
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  vacationStartDate: string | null;
  baseSalaryUsed: number;
  daysWorked: number;
  vacationAmount: number;
  equivalentDays: number;
  breakdown?: { formula?: string };
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function VacacionReciboPublicoPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [recibo, setRecibo] = useState<VacacionRecibo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/nomina/public/vacaciones/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Liquidación no encontrada");
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
        <p className="text-gray-600">Cargando…</p>
      </div>
    );
  }

  const formula = recibo.breakdown?.formula ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-sky-600 text-white px-6 py-4">
          <h1 className="text-xl font-bold">Liquidación de vacaciones</h1>
          <p className="text-sky-100 text-sm mt-1">{recibo.employeeName}</p>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div>
            <p className="text-gray-500">Período causado</p>
            <p className="font-medium">
              {recibo.periodStart} → {recibo.periodEnd}
            </p>
          </div>
          {recibo.vacationStartDate && (
            <div>
              <p className="text-gray-500">Inicio disfrute</p>
              <p className="font-medium">{recibo.vacationStartDate}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Salario ordinario (sin transporte)</p>
            <p className="font-medium">{formatCop(recibo.baseSalaryUsed)}</p>
          </div>
          <div>
            <p className="text-gray-500">Días trabajados (360/año)</p>
            <p className="font-medium">{recibo.daysWorked}</p>
          </div>
          <div className="border-t pt-4">
            <p className="text-gray-500">Valor vacaciones</p>
            <p className="text-2xl font-bold text-sky-700">{formatCop(recibo.vacationAmount)}</p>
            <p className="text-gray-600 mt-1">≈ {recibo.equivalentDays} días de salario</p>
          </div>
          {formula && (
            <p className="text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">{formula}</p>
          )}
          <p className="text-xs text-gray-400">
            Base legal: salario ordinario devengado al iniciar vacaciones; no incluye auxilio de
            transporte ni horas extras (CST art. 192).
          </p>
        </div>
      </div>
    </div>
  );
}
