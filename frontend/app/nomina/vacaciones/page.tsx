"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import {
  VacacionReciboContent,
  type VacacionReciboData,
} from "@/components/VacacionReciboContent";

type Employee = { id: string; name: string; phone: string | null; baseSalary: number };

type VacacionPreview = {
  employeeId: string;
  employeeName: string;
  phone: string | null;
  baseSalary: number;
  periodStart: string;
  periodEnd: string;
  vacationStartDate: string | null;
  periodLabelLong: string;
  vacationStartLabelLong: string | null;
  vacationEndDate: string | null;
  vacationEndLabelLong: string | null;
  vacationBusinessDays: number;
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
  periodLabelLong?: string;
  vacationStartLabelLong?: string | null;
  vacationEndLabelLong?: string | null;
  vacationBusinessDays?: number;
  baseSalaryUsed: number;
  daysWorked: number;
  vacationAmount: number;
  equivalentDays: number;
  publicUrl: string;
  whatsappSentAt: string | null;
  breakdown?: { formula?: string };
};

const rowToRecibo = (row: LiquidacionRow): VacacionReciboData => ({
  employeeName: row.employeeName,
  periodLabelLong: row.periodLabelLong,
  periodStart: row.periodStart,
  periodEnd: row.periodEnd,
  vacationStartLabelLong: row.vacationStartLabelLong,
  vacationEndLabelLong: row.vacationEndLabelLong,
  vacationBusinessDays: row.vacationBusinessDays,
  baseSalaryUsed: row.baseSalaryUsed,
  daysWorked: row.daysWorked,
  vacationAmount: row.vacationAmount,
  equivalentDays: row.equivalentDays,
  breakdown: row.breakdown,
});

const previewToRecibo = (p: VacacionPreview): VacacionReciboData => ({
  employeeName: p.employeeName,
  periodLabelLong: p.periodLabelLong,
  periodStart: p.periodStart,
  periodEnd: p.periodEnd,
  vacationStartLabelLong: p.vacationStartLabelLong,
  vacationEndLabelLong: p.vacationEndLabelLong,
  vacationBusinessDays: p.vacationBusinessDays,
  baseSalary: p.baseSalary,
  daysWorked: p.daysWorked,
  vacationAmount: p.vacationAmount,
  equivalentVacationDays: p.equivalentVacationDays,
  formula: p.formula,
});

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
  const [whatsappPreview, setWhatsappPreview] = useState<{
    liquidacionId: string;
    employeeName: string;
    recibo: VacacionReciboData;
    messageText: string;
  } | null>(null);
  const [previewSending, setPreviewSending] = useState(false);
  const [draftReciboPreview, setDraftReciboPreview] = useState<VacacionReciboData | null>(
    null
  );

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
    if (!vacationStartDate) {
      alert("Indica la fecha de inicio de vacaciones.");
      return;
    }
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

  const handleOpenWhatsAppPreview = async (row: LiquidacionRow) => {
    if (!row.phone) {
      alert(`${row.employeeName ?? "Empleado"} no tiene teléfono WhatsApp.`);
      return;
    }
    const res = await fetch(
      `/api/nomina/vacaciones/liquidaciones/${row.id}/message-preview`
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al generar vista previa");
      return;
    }
    setWhatsappPreview({
      liquidacionId: row.id,
      employeeName: row.employeeName ?? "",
      recibo: rowToRecibo(row),
      messageText: data.message,
    });
  };

  const handleSendWhatsAppConfirmed = async () => {
    if (!whatsappPreview) return;
    const { liquidacionId, employeeName } = whatsappPreview;
    setSendingId(liquidacionId);
    setPreviewSending(true);
    try {
      const res = await fetch(
        `/api/nomina/vacaciones/liquidaciones/${liquidacionId}/send-whatsapp`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al enviar");
        return;
      }
      alert(`WhatsApp enviado a ${data.to ?? employeeName}`);
      await load();
      setWhatsappPreview(null);
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
              Inicio de vacaciones (requerido para recibo y último día hábil)
              <input
                type="date"
                className="mt-1 w-full border rounded px-2 py-1"
                value={vacationStartDate}
                onChange={(e) => {
                  setVacationStartDate(e.target.value);
                  setPreview(null);
                }}
                aria-label="Inicio disfrute vacaciones"
                required
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
            {preview && vacationStartDate && (
              <button
                type="button"
                onClick={() => setDraftReciboPreview(previewToRecibo(preview))}
                className="px-4 py-2 border border-sky-300 text-sky-800 rounded-lg hover:bg-sky-50"
              >
                Vista previa del recibo
              </button>
            )}
          </div>

          {preview && (
            <div className="rounded-lg border bg-gray-50 p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-900">{preview.employeeName}</p>
              <p>
                <span className="text-gray-500">Período a liquidar: </span>
                <span className="capitalize">{preview.periodLabelLong}</span>
              </p>
              {preview.vacationStartLabelLong && (
                <p>
                  <span className="text-gray-500">Inicio vacaciones: </span>
                  <span className="capitalize">{preview.vacationStartLabelLong}</span>
                </p>
              )}
              {preview.vacationEndLabelLong && (
                <p>
                  <span className="text-gray-500">Último día hábil: </span>
                  <span className="capitalize">{preview.vacationEndLabelLong}</span>
                  <span className="text-gray-500">
                    {" "}
                    ({preview.vacationBusinessDays} días hábiles lun–sáb)
                  </span>
                </p>
              )}
              <p className="text-lg font-bold text-sky-800">
                {formatCop(preview.vacationAmount)}
              </p>
              <p className="text-gray-600">
                {preview.daysWorked} días causados · ≈ {preview.equivalentVacationDays} días de
                salario
              </p>
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
                        <button
                          type="button"
                          onClick={() => void handleOpenWhatsAppPreview(row)}
                          disabled={!row.phone || sendingId === row.id}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {sendingId === row.id ? "Enviando…" : "Enviar WhatsApp"}
                        </button>
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

      {draftReciboPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vac-draft-recibo-title"
        >
          <div className="bg-gray-50 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 my-4">
            <h3 id="vac-draft-recibo-title" className="font-semibold text-lg text-gray-900">
              Vista previa del recibo (sin guardar)
            </h3>
            <VacacionReciboContent recibo={draftReciboPreview} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDraftReciboPreview(null)}
                className="px-4 py-2 border rounded-lg hover:bg-white bg-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {whatsappPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vac-whatsapp-preview-title"
        >
          <div className="bg-gray-50 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 my-4">
            <h3 id="vac-whatsapp-preview-title" className="font-semibold text-lg text-gray-900">
              Revisa el recibo antes de enviar — {whatsappPreview.employeeName}
            </h3>
            <VacacionReciboContent recibo={whatsappPreview.recibo} />
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                Texto del mensaje WhatsApp
              </summary>
              <pre className="whitespace-pre-wrap mt-2 text-xs bg-white rounded-lg p-3 border text-gray-800 font-sans">
                {whatsappPreview.messageText}
              </pre>
            </details>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setWhatsappPreview(null)}
                className="px-4 py-2 border rounded-lg hover:bg-white bg-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSendWhatsAppConfirmed()}
                disabled={previewSending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {previewSending ? "Enviando…" : "Confirmar y enviar WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
