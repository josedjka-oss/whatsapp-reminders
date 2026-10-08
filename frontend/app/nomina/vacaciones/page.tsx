"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type Employee = { id: string; name: string; phone: string | null; baseSalary: number };

type VacacionPreview = {
  employeeId: string;
  employeeName: string;
  phone: string | null;
  baseSalary: number;
  periodStart: string;
  periodEnd: string;
  vacationStartDate: string | null;
  daysWorked: number;
  vacationAmount: number;
  equivalentVacationDays: number;
  formula: string;
};

type LiquidacionRow = {
  id: string;
  employeeId: string;
  employeeName?: string;
  phone: string | null;
  periodStart: string;
  periodEnd: string;
  vacationStartDate: string | null;
  baseSalaryUsed: number;
  daysWorked: number;
  vacationAmount: number;
  equivalentDays: number;
  publicUrl: string;
  whatsappSentAt: string | null;
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const todayInputDate = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const DEFAULT_DAYS = 360;

export default function NominaVacacionesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [daysWorked, setDaysWorked] = useState(DEFAULT_DAYS);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState(todayInputDate());
  const [vacationStartDate, setVacationStartDate] = useState("");
  const [preview, setPreview] = useState<VacacionPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [messagePreview, setMessagePreview] = useState<{
    id: string;
    employeeName: string;
    text: string;
  } | null>(null);
  const [previewSending, setPreviewSending] = useState(false);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, liqRes] = await Promise.all([
        fetch("/api/nomina/employees"),
        fetch("/api/nomina/vacaciones/liquidaciones"),
      ]);
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(
          emps.map((e: Employee & { baseSalary: string | number }) => ({
            id: e.id,
            name: e.name,
            phone: e.phone,
            baseSalary: Number(e.baseSalary),
          }))
        );
      }
      if (liqRes.ok) {
        const data = await liqRes.json();
        setLiquidaciones(data.rows ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePreview = async () => {
    if (!employeeId) {
      alert("Selecciona un empleado.");
      return;
    }
    setPreviewLoading(true);
    try {
      const params = new URLSearchParams({
        employeeId,
        daysWorked: String(daysWorked || DEFAULT_DAYS),
      });
      if (periodEnd) params.set("periodEnd", periodEnd);
      if (periodStart) params.set("periodStart", periodStart);
      if (vacationStartDate) params.set("vacationStartDate", vacationStartDate);
      const res = await fetch(`/api/nomina/vacaciones/preview?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al calcular");
        setPreview(null);
        return;
      }
      setPreview(data);
      if (data.periodStart) setPeriodStart(data.periodStart);
      if (data.periodEnd) setPeriodEnd(data.periodEnd);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) {
      await handlePreview();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/nomina/vacaciones/liquidaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          daysWorked: daysWorked || DEFAULT_DAYS,
          periodStart: periodStart || null,
          periodEnd: periodEnd || null,
          vacationStartDate: vacationStartDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al guardar");
        return;
      }
      await load();
      setPreview(null);
      alert(`Liquidación guardada para ${data.liquidacion?.employeeName ?? "empleado"}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMessagePreview = async (row: LiquidacionRow) => {
    const res = await fetch(
      `/api/nomina/vacaciones/liquidaciones/${row.id}/message-preview`
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al generar mensaje");
      return;
    }
    setMessagePreview({
      id: row.id,
      employeeName: row.employeeName ?? "",
      text: data.message,
    });
  };

  const handleSendWhatsApp = async (id: string, employeeName: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/nomina/vacaciones/liquidaciones/${id}/send-whatsapp`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al enviar");
        return;
      }
      alert(`WhatsApp enviado a ${data.to ?? employeeName}`);
      await load();
      setMessagePreview(null);
    } finally {
      setSendingId(null);
      setPreviewSending(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar liquidación de vacaciones de ${name}?`)) return;
    const res = await fetch(`/api/nomina/vacaciones/liquidaciones/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "No se pudo eliminar");
      return;
    }
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Vacaciones" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 text-sm text-sky-950">
          <p className="font-semibold mb-1">Liquidación de vacaciones — individual</p>
          <p className="mb-2">
            <strong>Fórmula:</strong> (Salario ordinario × Días trabajados) / 720
          </p>
          <p className="text-sky-800">
            Por defecto <strong>360 días causados</strong> (un año comercial). Ejemplo: $2.000.000
            × 360 / 720 = <strong>$1.000.000</strong> (15 días de salario). Base: salario fijo de
            la ficha — <strong>sin auxilio de transporte</strong> ni horas extras (CST art. 192).
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-lg">Nueva liquidación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm md:col-span-2">
              Empleado
              <select
                className="mt-1 w-full border rounded px-2 py-1"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setPreview(null);
                }}
                aria-label="Empleado vacaciones"
              >
                <option value="">— Seleccionar —</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — salario {formatCop(e.baseSalary)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Días causados (360 = 1 año)
              <input
                type="number"
                min={1}
                max={720}
                className="mt-1 w-full border rounded px-2 py-1"
                value={daysWorked}
                onChange={(e) => {
                  setDaysWorked(Number(e.target.value) || DEFAULT_DAYS);
                  setPreview(null);
                }}
                aria-label="Días causados vacaciones"
              />
            </label>
            <label className="text-sm">
              Fin período causado
              <input
                type="date"
                className="mt-1 w-full border rounded px-2 py-1"
                value={periodEnd}
                onChange={(e) => {
                  setPeriodEnd(e.target.value);
                  setPreview(null);
                }}
                aria-label="Fin período causado"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Inicio período (opcional — se calcula solo con {DEFAULT_DAYS} días)
              <input
                type="date"
                className="mt-1 w-full border rounded px-2 py-1"
                value={periodStart}
                onChange={(e) => {
                  setPeriodStart(e.target.value);
                  setPreview(null);
                }}
                aria-label="Inicio período causado"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Inicio disfrute vacaciones (opcional)
              <input
                type="date"
                className="mt-1 w-full border rounded px-2 py-1"
                value={vacationStartDate}
                onChange={(e) => setVacationStartDate(e.target.value)}
                aria-label="Inicio disfrute vacaciones"
              />
            </label>
          </div>

          {selectedEmployee && (
            <p className="text-xs text-gray-500">
              Salario ordinario usado: {formatCop(selectedEmployee.baseSalary)} (auxilio
              transporte no incluido)
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handlePreview()}
              disabled={previewLoading}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {previewLoading ? "Calculando…" : "Calcular"}
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !employeeId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar liquidación"}
            </button>
          </div>

          {preview && (
            <div className="rounded-lg border bg-gray-50 p-4 text-sm space-y-1">
              <p>
                <strong>{preview.employeeName}</strong> — {preview.daysWorked} días causados
              </p>
              <p className="text-lg font-bold text-sky-800">
                {formatCop(preview.vacationAmount)}
              </p>
              <p className="text-gray-600">≈ {preview.equivalentVacationDays} días de salario</p>
              <p className="text-xs text-gray-500 font-mono">{preview.formula}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Liquidaciones guardadas</h2>
            <p className="text-sm text-gray-500">Un registro por empleado y período — envío WhatsApp individual</p>
          </div>
          {loading && <p className="p-4 text-gray-500">Cargando…</p>}
          {!loading && liquidaciones.length === 0 && (
            <p className="p-4 text-gray-500">Aún no hay liquidaciones.</p>
          )}
          {!loading && liquidaciones.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Empleado</th>
                    <th className="p-3 font-semibold">Período</th>
                    <th className="p-3 font-semibold">Valor</th>
                    <th className="p-3 font-semibold">WhatsApp</th>
                    <th className="p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidaciones.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-3">
                        <span className="font-medium">{row.employeeName}</span>
                        {!row.phone && (
                          <span className="block text-xs text-amber-600">Sin teléfono</span>
                        )}
                        {row.whatsappSentAt && (
                          <span className="block text-xs text-green-600">Enviado</span>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {row.periodStart} → {row.periodEnd}
                        {row.vacationStartDate && (
                          <span className="block text-gray-500">
                            Disfrute: {row.vacationStartDate}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-sky-700">
                        {formatCop(row.vacationAmount)}
                        <span className="block text-xs font-normal text-gray-500">
                          {row.daysWorked} d · ≈ {row.equivalentDays} d salario
                        </span>
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
                            onClick={() =>
                              void handleSendWhatsApp(row.id, row.employeeName ?? "")
                            }
                            disabled={!row.phone || sendingId === row.id}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {sendingId === row.id ? "Enviando…" : "Enviar"}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <a
                          href={row.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline mr-2"
                        >
                          Recibo
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row.id, row.employeeName ?? "")}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
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
          aria-labelledby="vac-message-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 id="vac-message-title" className="font-semibold text-lg">
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
                onClick={() => {
                  setPreviewSending(true);
                  void handleSendWhatsApp(messagePreview.id, messagePreview.employeeName);
                }}
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
