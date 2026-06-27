"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type PrimaRow = {
  employeeId: string;
  employeeName: string;
  phone: string | null;
  isActive: boolean;
  hireDate: string | null;
  effectiveStart: string;
  effectiveEnd: string;
  daysWorked: number;
  monthlySalary: number;
  primaAmount: number;
  formula: string;
};

type PrimaPreview = {
  year: number;
  semester: number;
  semesterLabel: string;
  formula: string;
  totalPrima: number;
  rows: PrimaRow[];
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function NominaPrimaPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [preview, setPreview] = useState<PrimaPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [hireDraft, setHireDraft] = useState<Record<string, string>>({});
  const [savingHireId, setSavingHireId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [messagePreview, setMessagePreview] = useState<{
    employeeName: string;
    text: string;
    employeeId: string;
  } | null>(null);
  const [previewSending, setPreviewSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const prevRes = await fetch(
        `/api/nomina/prima/preview?year=${year}&semester=${semester}`
      );
      if (prevRes.ok) {
        const data: PrimaPreview = await prevRes.json();
        setPreview(data);
        const draft: Record<string, string> = {};
        for (const row of data.rows) {
          draft[row.employeeId] = row.hireDate ?? "";
        }
        setHireDraft(draft);
      }
    } finally {
      setLoading(false);
    }
  }, [year, semester]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveHireDate = async (employeeId: string, employeeName: string) => {
    const value = hireDraft[employeeId] ?? "";
    setSavingHireId(employeeId);
    try {
      const res = await fetch(`/api/nomina/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hireDate: value || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Error guardando ingreso de ${employeeName}`);
        return;
      }
      await load();
    } finally {
      setSavingHireId(null);
    }
  };

  const handleOpenMessagePreview = async (row: PrimaRow) => {
    const params = new URLSearchParams({
      employeeId: row.employeeId,
      year: String(year),
      semester: String(semester),
    });
    const res = await fetch(`/api/nomina/prima/message-preview?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al generar mensaje");
      return;
    }
    setMessagePreview({
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      text: data.message,
    });
  };

  const handleSendFromPreview = async () => {
    if (!messagePreview) return;
    setPreviewSending(true);
    try {
      const res = await fetch("/api/nomina/prima/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: messagePreview.employeeId,
          year,
          semester,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al enviar WhatsApp");
        return;
      }
      alert(`WhatsApp enviado a ${data.to ?? messagePreview.employeeName}`);
      setMessagePreview(null);
    } finally {
      setPreviewSending(false);
    }
  };

  const handleSendOne = async (row: PrimaRow) => {
    if (!row.phone) {
      alert(`${row.employeeName} no tiene teléfono WhatsApp. Configúralo en Empleados.`);
      return;
    }
    setSendingId(row.employeeId);
    try {
      const res = await fetch("/api/nomina/prima/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: row.employeeId,
          year,
          semester,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al enviar");
        return;
      }
      alert(`WhatsApp enviado a ${data.to ?? row.employeeName}`);
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAll = async () => {
    if (
      !confirm(
        "¿Enviar liquidación de prima por WhatsApp a todos los empleados activos con teléfono?"
      )
    ) {
      return;
    }
    setSendingAll(true);
    try {
      const res = await fetch("/api/nomina/prima/send-whatsapp-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, semester }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al enviar");
        return;
      }
      alert(`Enviados: ${data.sent}, fallos: ${data.failed}`);
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Prima" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 text-sm text-rose-950">
          <p className="font-semibold mb-1">Prima de servicios — envío manual</p>
          <p className="mb-2">
            <strong>Fórmula:</strong> ((Salario + auxilio transporte) × Días trabajados) / 360
          </p>
          <p className="text-rose-800">
            Meses de <strong>30 días</strong> · semestre completo = <strong>180 días</strong>.
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-rose-800">
            <li>Registra la fecha de ingreso de cada empleado.</li>
            <li>Revisa la liquidación calculada.</li>
            <li>Envía WhatsApp manualmente (uno a uno o a todos).</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-lg">Período de liquidación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <label className="text-sm">
              Año
              <input
                type="number"
                className="mt-1 w-full border rounded px-2 py-1"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Año prima"
              />
            </label>
            <label className="text-sm">
              Semestre
              <select
                className="mt-1 w-full border rounded px-2 py-1"
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) === 2 ? 2 : 1)}
                aria-label="Semestre prima"
              >
                <option value={1}>1 — Enero a junio</option>
                <option value={2}>2 — Julio a diciembre</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void load()}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Fechas de ingreso</h2>
            <p className="text-sm text-gray-500 mt-1">
              Desde qué fecha se cuentan los días del semestre. Sin fecha = semestre completo (180 días).
            </p>
          </div>
          {loading && <p className="p-4 text-gray-500">Cargando…</p>}
          {!loading && preview && preview.rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Empleado</th>
                    <th className="p-3 font-semibold">Fecha ingreso</th>
                    <th className="p-3 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={`hire-${row.employeeId}`} className="border-t">
                      <td className="p-3 font-medium">{row.employeeName}</td>
                      <td className="p-3">
                        <input
                          type="date"
                          className="border rounded px-2 py-1"
                          value={hireDraft[row.employeeId] ?? ""}
                          onChange={(e) =>
                            setHireDraft((prev) => ({
                              ...prev,
                              [row.employeeId]: e.target.value,
                            }))
                          }
                          aria-label={`Fecha ingreso ${row.employeeName}`}
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() =>
                            void handleSaveHireDate(row.employeeId, row.employeeName)
                          }
                          disabled={savingHireId === row.employeeId}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {savingHireId === row.employeeId ? "Guardando…" : "Guardar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex flex-wrap justify-between gap-2 items-center">
            <div>
              <h2 className="font-semibold text-lg">Liquidación y envío WhatsApp</h2>
              {preview && (
                <p className="text-sm text-gray-500">{preview.semesterLabel}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {preview && (
                <p className="text-sm text-gray-600">
                  Total:{" "}
                  <strong className="text-rose-700">{formatCop(preview.totalPrima)}</strong>
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleSendAll()}
                disabled={sendingAll || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {sendingAll ? "Enviando…" : "Enviar WhatsApp a todos"}
              </button>
            </div>
          </div>
          {loading && <p className="p-4 text-gray-500">Cargando…</p>}
          {!loading && preview && preview.rows.length === 0 && (
            <p className="p-4 text-gray-500">No hay empleados activos.</p>
          )}
          {!loading && preview && preview.rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Empleado</th>
                    <th className="p-3 font-semibold">Salario + transporte</th>
                    <th className="p-3 font-semibold">Días</th>
                    <th className="p-3 font-semibold">Prima</th>
                    <th className="p-3 font-semibold">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.employeeId} className="border-t">
                      <td className="p-3">
                        <span className="font-medium">{row.employeeName}</span>
                        {!row.phone && (
                          <span className="block text-xs text-amber-600">Sin teléfono</span>
                        )}
                        {!row.hireDate && (
                          <span className="block text-xs text-gray-500">180 días (sin ingreso)</span>
                        )}
                      </td>
                      <td className="p-3">{formatCop(row.monthlySalary)}</td>
                      <td className="p-3">
                        <span className="font-medium">{row.daysWorked}</span>
                        <span className="block text-xs text-gray-500">
                          {row.effectiveStart} → {row.effectiveEnd}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-rose-700">
                        {formatCop(row.primaAmount)}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleOpenMessagePreview(row)}
                            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                          >
                            Ver mensaje
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSendOne(row)}
                            disabled={!row.phone || sendingId === row.employeeId}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {sendingId === row.employeeId ? "Enviando…" : "Enviar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {messagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prima-message-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 id="prima-message-title" className="font-semibold text-lg">
              Mensaje — {messagePreview.employeeName}
            </h3>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded-lg p-4 border text-gray-800 font-sans">
              {messagePreview.text}
            </pre>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setMessagePreview(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => void handleSendFromPreview()}
                disabled={previewSending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {previewSending ? "Enviando…" : "Enviar WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
