"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  VacacionReciboContent,
  type VacacionReciboData,
} from "@/components/VacacionReciboContent";

export default function VacacionReciboPublicoPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [recibo, setRecibo] = useState<VacacionReciboData | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        <VacacionReciboContent recibo={recibo} />
        <p className="text-xs text-gray-400 mt-4 text-center px-2">
          Base legal: salario ordinario al iniciar vacaciones; no incluye auxilio de transporte ni
          horas extras (CST art. 192).
        </p>
      </div>
    </div>
  );
}
