"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type Period = {
  id: string;
  year: number;
  month: number;
  half: number;
  payDay: number;
  status: string;
  _count: { slips: number };
};

type Slip = {
  id: string;
  employee: { name: string; phone: string | null };
  netTotal: number;
  publicUrl: string;
  whatsappSentAt: string | null;
};

type Config = {
  hour: number;
  minute: number;
  autoSendEnabled: boolean;
};

export default function NominaPeriodosPage() {
  const now = new Date();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [half, setHalf] = useState(now.getDate() <= 15 ? 1 : 2);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [busy, setBusy] = useState(false);

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

  const loadSlips = async (periodId: string) => {
    setSelectedPeriodId(periodId);
    const res = await fetch(`/api/nomina/periods/${periodId}/slips`);
    if (res.ok) setSlips(await res.json());
  };

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/nomina/periods/generate", {
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
      if (data.period?.id) await loadSlips(data.period.id);
      alert(`Recibos generados: ${data.count}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedPeriodId) return;
    setBusy(true);
    try {
      await fetch(`/api/nomina/periods/${selectedPeriodId}/regenerate`, { method: "POST" });
      await loadSlips(selectedPeriodId);
      alert("Recibos recalculados");
    } finally {
      setBusy(false);
    }
  };

  const handleSendAll = async () => {
    if (!selectedPeriodId) return;
    if (!confirm("¿Enviar WhatsApp a todos los empleados de esta quincena?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/nomina/periods/${selectedPeriodId}/send-whatsapp`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }
      alert(`Enviados: ${data.sent}, fallos: ${data.failed}`);
      await loadSlips(selectedPeriodId);
    } finally {
      setBusy(false);
    }
  };

  const handleSendOne = async (slipId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/nomina/slips/${slipId}/send-whatsapp`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }
      alert("WhatsApp enviado");
      if (selectedPeriodId) await loadSlips(selectedPeriodId);
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

  const formatCop = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Quincenas" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
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
              <button type="button" className="px-3 py-2 bg-gray-800 text-white rounded" onClick={() => void handleSaveConfig()}>
                Guardar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">Generar recibos</h2>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className="border rounded px-2 py-1" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            <input type="number" min={1} max={12} className="border rounded px-2 py-1" value={month} onChange={(e) => setMonth(Number(e.target.value))} />
            <select className="border rounded px-2 py-1" value={half} onChange={(e) => setHalf(Number(e.target.value))}>
              <option value={1}>Quincena 1 (15)</option>
              <option value={2}>Quincena 2 (fin mes)</option>
            </select>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGenerate()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
          >
            Generar recibos de la quincena
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Periodos guardados</h2>
          <ul className="space-y-2">
            {periods.map((p) => (
              <li key={p.id} className="flex justify-between items-center border-b py-2">
                <span>
                  {p.year}-{String(p.month).padStart(2, "0")} · Q{p.half} (día {p.payDay}) — {p._count.slips} recibos
                </span>
                <button type="button" className="text-indigo-600 text-sm" onClick={() => void loadSlips(p.id)}>
                  Ver
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selectedPeriodId && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => void handleRegenerate()}>
                Recalcular
              </button>
              <button type="button" disabled={busy} className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => void handleSendAll()}>
                Enviar WhatsApp a todos
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Empleado</th>
                    <th>Neto</th>
                    <th>Enviado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-2">{s.employee.name}</td>
                      <td>{formatCop(s.netTotal)}</td>
                      <td>{s.whatsappSentAt ? "Sí" : "No"}</td>
                      <td className="space-x-2">
                        <a href={s.publicUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                          Recibo
                        </a>
                        <button type="button" className="text-green-700" onClick={() => void handleSendOne(s.id)}>
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
