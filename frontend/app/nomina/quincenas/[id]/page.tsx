"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/NavigationHeader";

type SummaryRow = {
  employeeId: string;
  name: string;
  netSalaryWithTransport: number;
  netBonus: number;
  netOvertime: number;
};

type Vale = {
  id: string;
  kind: string;
  holderName: string;
  amount: number;
  appliesTo: string;
  installmentNumber: number | null;
  installmentTotal: number | null;
  employee: { name: string };
};

type Slip = {
  id: string;
  employee: { name: string; phone: string | null };
  netTotal: number;
  publicUrl: string;
  whatsappSentAt: string | null;
};

type PeriodDetail = {
  period: {
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
  summary: {
    periodLabel: string;
    frozen: boolean;
    rows: SummaryRow[];
  };
  valesCount: number;
  prestamoInstallmentsCount: number;
  vales: Vale[];
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function NominaQuincenaWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const periodId = String(params.id);
  const [detail, setDetail] = useState<PeriodDetail | null>(null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/nomina/periods/${periodId}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Quincena no encontrada");
      setDetail(null);
      return;
    }
    setDetail(await res.json());
  }, [periodId]);

  const loadSlips = useCallback(async () => {
    const res = await fetch(`/api/nomina/periods/${periodId}/slips`);
    if (res.ok) setSlips(await res.json());
  }, [periodId]);

  useEffect(() => {
    void load();
    void loadSlips();
  }, [load, loadSlips]);

  const isClosed = detail?.period.status === "closed";

  const handleGenerate = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const res = await fetch("/api/nomina/periods/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: detail.period.year,
          month: detail.period.month,
          half: detail.period.half,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }
      await loadSlips();
      await load();
      alert(`Recibos generados: ${data.count}`);
    } finally {
      setBusy(false);
    }
  };

  const handleClose = async () => {
    if (
      !confirm(
        "¿Cerrar esta quincena? Se congelará el historial y no podrás editar vales ni recalcular."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/nomina/periods/${periodId}/close`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }
      await load();
      await loadSlips();
      alert("Quincena cerrada y guardada en el historial.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendAll = async () => {
    if (!confirm("¿Enviar WhatsApp a todos los empleados de esta quincena?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/nomina/periods/${periodId}/send-whatsapp`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error");
        return;
      }
      alert(`Enviados: ${data.sent}, fallos: ${data.failed}`);
      await loadSlips();
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
      await loadSlips();
    } finally {
      setBusy(false);
    }
  };

  const totals =
    detail?.summary.rows.reduce(
      (acc, r) => ({
        salary: acc.salary + r.netSalaryWithTransport,
        bonus: acc.bonus + r.netBonus,
      }),
      { salary: 0, bonus: 0 }
    ) ?? { salary: 0, bonus: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Quincena" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <button
          type="button"
          className="text-sm text-indigo-600"
          onClick={() => router.push("/nomina/quincenas")}
        >
          ← Volver al historial
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">{error}</div>
        )}

        {detail && (
          <>
            <div className="bg-white rounded-lg shadow p-6 flex flex-wrap justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{detail.period.periodLabel}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Pago día {detail.period.payDay} · {detail.valesCount} vales/descuentos
                  {detail.prestamoInstallmentsCount > 0
                    ? ` (${detail.prestamoInstallmentsCount} cuotas de préstamo)`
                    : ""}
                </p>
              </div>
              <span
                className={`self-start text-sm px-3 py-1 rounded-full font-medium ${
                  isClosed ? "bg-gray-200 text-gray-700" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isClosed ? "Cerrada — historial congelado" : "Abierta — editable"}
              </span>
            </div>

            {!isClosed && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm"
                  onClick={() =>
                    router.push(
                      `/nomina/vales?year=${detail.period.year}&month=${detail.period.month}&half=${detail.period.half}&periodId=${periodId}`
                    )
                  }
                >
                  + Vales / préstamos
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                  onClick={() => void handleGenerate()}
                >
                  Generar recibos
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
                  onClick={() => void handleClose()}
                >
                  Cerrar quincena
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">Resumen</h2>
                {detail.summary.frozen && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Congelado al cerrar
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3">Empleado</th>
                      <th className="text-right p-3">Salario + transporte (neto)</th>
                      <th className="text-right p-3">Bonificación (neta)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.summary.rows.map((row) => (
                      <tr key={row.employeeId} className="border-b">
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
            </div>

            {detail.vales.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold text-lg mb-3">Vales y descuentos de esta quincena</h2>
                <ul className="divide-y text-sm">
                  {detail.vales.map((v) => (
                    <li key={v.id} className="py-2 flex justify-between gap-2">
                      <span>
                        <strong>{v.employee.name}</strong> — {v.holderName}{" "}
                        <span className="text-gray-500">({v.kind})</span>
                        {v.installmentNumber != null && (
                          <span className="text-gray-500">
                            {" "}
                            cuota {v.installmentNumber}/{v.installmentTotal}
                          </span>
                        )}
                      </span>
                      <span className="font-medium">{formatCop(v.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="font-semibold text-lg">Recibos ({slips.length})</h2>
                {!isClosed && slips.length > 0 && (
                  <button
                    type="button"
                    disabled={busy}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                    onClick={() => void handleSendAll()}
                  >
                    Enviar WhatsApp a todos
                  </button>
                )}
              </div>
              {slips.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {isClosed
                    ? "No hay recibos generados para esta quincena."
                    : 'Pulsa "Generar recibos" para crear los enlaces de pago.'}
                </p>
              ) : (
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
                            <a
                              href={s.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600"
                            >
                              Recibo
                            </a>
                            {!isClosed && (
                              <button
                                type="button"
                                className="text-green-700"
                                onClick={() => void handleSendOne(s.id)}
                              >
                                WhatsApp
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
