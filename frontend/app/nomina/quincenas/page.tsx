"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/NavigationHeader";

type Period = {
  id: string;
  year: number;
  month: number;
  half: number;
  payDay: number;
  status: string;
  closedAt: string | null;
  periodLabel: string;
  _count: { slips: number };
};

type Config = {
  hour: number;
  minute: number;
  autoSendEnabled: boolean;
};

export default function NominaQuincenasPage() {
  const router = useRouter();
  const now = new Date();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [half, setHalf] = useState(now.getDate() <= 15 ? 1 : 2);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const load = useCallback(async () => {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/nomina/periods"),
      fetch("/api/nomina/config"),
    ]);
    if (pRes.ok) setPeriods(await pRes.json());
    if (cRes.ok) setConfig(await cRes.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/nomina/periods/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, half }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }
      await load();
      if (data.period?.id) {
        router.push(`/nomina/quincenas/${data.period.id}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    const res = await fetch("/api/nomina/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      alert("Error guardando config");
      return;
    }
    alert("Configuración guardada");
  };

  const filtered = periods.filter((p) => {
    if (filter === "open") return p.status === "open";
    if (filter === "closed") return p.status === "closed";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Quincenas" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-emerald-900">
          <p className="font-semibold mb-1">Flujo quincena por quincena</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Crea la quincena (15 o fin de mes).</li>
            <li>Registra vales, préstamos y revisa el resumen en esa quincena.</li>
            <li>Genera recibos y envía WhatsApp.</li>
            <li>Cierra la quincena para guardar el historial congelado.</li>
          </ol>
          <p className="text-xs mt-2 text-emerald-700">
            Las cuotas de préstamos aparecen automáticamente en cada quincena al crearlas.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-lg">Crear quincena</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
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
                <option value={1}>1 — día 15</option>
                <option value={2}>2 — fin de mes</option>
              </select>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleCreate()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 h-10"
            >
              Crear / abrir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="font-semibold text-lg">Historial de quincenas</h2>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "open" | "closed")}
              aria-label="Filtrar quincenas"
            >
              <option value="all">Todas</option>
              <option value="open">Abiertas</option>
              <option value="closed">Cerradas</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay quincenas todavía. Crea la primera arriba.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((p) => (
                <li key={p.id} className="py-3 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{p.periodLabel}</p>
                    <p className="text-xs text-gray-500">
                      Pago día {p.payDay} · {p._count.slips} recibos
                      {p.closedAt
                        ? ` · Cerrada ${new Date(p.closedAt).toLocaleDateString("es-CO")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.status === "closed"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {p.status === "closed" ? "Cerrada" : "Abierta"}
                    </span>
                    <button
                      type="button"
                      className="text-indigo-600 text-sm font-medium"
                      onClick={() => router.push(`/nomina/quincenas/${p.id}`)}
                    >
                      Abrir →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {config && (
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h2 className="font-semibold">Envío automático (día 15 y último del mes)</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <label className="text-sm">
                Hora
                <input
                  type="number"
                  min={0}
                  max={23}
                  className="block mt-1 border rounded px-2 py-1 w-20"
                  value={config.hour}
                  onChange={(e) => setConfig({ ...config, hour: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm">
                Minuto
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="block mt-1 border rounded px-2 py-1 w-20"
                  value={config.minute}
                  onChange={(e) => setConfig({ ...config, minute: Number(e.target.value) })}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.autoSendEnabled}
                  onChange={(e) => setConfig({ ...config, autoSendEnabled: e.target.checked })}
                />
                Activo
              </label>
              <button
                type="button"
                className="px-3 py-2 bg-gray-800 text-white rounded"
                onClick={() => void handleSaveConfig()}
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
