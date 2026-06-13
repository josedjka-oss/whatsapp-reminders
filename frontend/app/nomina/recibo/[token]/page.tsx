"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  NominaReciboDisplay,
  type ReciboDisplayData,
} from "@/components/NominaReciboDisplay";

export default function ReciboPublicoPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [recibo, setRecibo] = useState<ReciboDisplayData | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <NominaReciboDisplay recibo={recibo} />
      </div>
    </div>
  );
}
