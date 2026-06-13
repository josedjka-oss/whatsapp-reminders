"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type Employee = { id: string; name: string };
type Vale = {
  id: string;
  kind: string;
  holderName: string;
  amount: string | number;
  appliesTo: string;
  photoUrl: string | null;
  year: number;
  month: number;
  half: number;
  prestamoGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  totalPrestamoAmount: string | number | null;
  employee: Employee;
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default function NominaValesPage() {
  const now = new Date();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vales, setVales] = useState<Vale[]>([]);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [half, setHalf] = useState(now.getDate() <= 15 ? 1 : 2);
  const [entryKind, setEntryKind] = useState<"VALE" | "PRESTAMO">("VALE");
  const [form, setForm] = useState({
    employeeId: "",
    holderName: "",
    amount: "",
    totalAmount: "",
    quincenas: "1",
    appliesTo: "SALARY",
    notes: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [empRes, valeRes] = await Promise.all([
      fetch("/api/nomina/employees"),
      fetch(`/api/nomina/vales?year=${year}&month=${month}&half=${half}`),
    ]);
    if (empRes.ok) setEmployees(await empRes.json());
    if (valeRes.ok) setVales(await valeRes.json());
  }, [year, month, half]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePhoto = (file: File | null) => {
    if (!file) {
      setPhotoPreview(null);
      setPhotoBase64(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setPhotoPreview(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.holderName) {
      alert("Selecciona empleado y nombre");
      return;
    }
    if (entryKind === "VALE") {
      if (!form.amount || !photoBase64) {
        alert("Vale: valor y foto son obligatorios");
        return;
      }
    } else if (!form.totalAmount || Number(form.quincenas) < 1) {
      alert("Préstamo: valor total y número de quincenas");
      return;
    }

    const body: Record<string, unknown> = {
      employeeId: form.employeeId,
      holderName: form.holderName,
      appliesTo: form.appliesTo,
      year,
      month,
      half,
      kind: entryKind,
      notes: form.notes || undefined,
    };

    if (entryKind === "VALE") {
      body.amount = Number(form.amount);
      body.photoBase64 = photoBase64;
    } else {
      body.totalAmount = Number(form.totalAmount);
      body.installmentCount = Number(form.quincenas);
      if (photoBase64) body.photoBase64 = photoBase64;
    }

    const res = await fetch("/api/nomina/vales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error");
      return;
    }

    setForm({
      employeeId: "",
      holderName: "",
      amount: "",
      totalAmount: "",
      quincenas: "1",
      appliesTo: "SALARY",
      notes: "",
    });
    setPhotoPreview(null);
    setPhotoBase64(null);
    void load();
    if (entryKind === "PRESTAMO") {
      alert(`Préstamo creado en ${data.installments?.length ?? 0} quincenas`);
    }
  };

  const handleDelete = async (v: Vale) => {
    if (v.kind === "PRESTAMO" && v.prestamoGroupId && v.installmentTotal && v.installmentTotal > 1) {
      const deleteAll = confirm(
        `¿Eliminar TODO el préstamo (${v.installmentTotal} cuotas)?\nOK = todas · Cancelar = solo esta cuota`
      );
      if (deleteAll) {
        await fetch(`/api/nomina/vales/group/${v.prestamoGroupId}`, { method: "DELETE" });
        void load();
        return;
      }
    }
    if (!confirm("¿Eliminar registro?")) return;
    await fetch(`/api/nomina/vales/${v.id}`, { method: "DELETE" });
    void load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Vales y préstamos" />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-3 gap-3">
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
            Quincena (filtro listado)
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={half}
              onChange={(e) => setHalf(Number(e.target.value))}
            >
              <option value={1}>1 (día 15)</option>
              <option value={2}>2 (fin de mes)</option>
            </select>
          </label>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryKind("VALE")}
              className={`px-4 py-2 rounded-lg text-sm ${
                entryKind === "VALE" ? "bg-amber-600 text-white" : "bg-gray-100"
              }`}
            >
              Vale (una quincena)
            </button>
            <button
              type="button"
              onClick={() => setEntryKind("PRESTAMO")}
              className={`px-4 py-2 rounded-lg text-sm ${
                entryKind === "PRESTAMO" ? "bg-amber-600 text-white" : "bg-gray-100"
              }`}
            >
              Préstamo (varias quincenas)
            </button>
          </div>

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          >
            <option value="">Empleado</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Nombre / concepto"
            value={form.holderName}
            onChange={(e) => setForm({ ...form, holderName: e.target.value })}
          />

          {entryKind === "VALE" ? (
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Valor del vale (esta quincena)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                className="border rounded-lg px-3 py-2"
                placeholder="Valor total del préstamo"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              />
              <input
                type="number"
                min={1}
                max={36}
                className="border rounded-lg px-3 py-2"
                placeholder="Cuotas (quincenas)"
                value={form.quincenas}
                onChange={(e) => setForm({ ...form, quincenas: e.target.value })}
              />
            </div>
          )}

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.appliesTo}
            onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
          >
            <option value="SALARY">Descontar del salario (+ transporte)</option>
            <option value="BONUS">Descontar de bonificación</option>
          </select>

          <p className="text-xs text-gray-500">
            Quincena de inicio: {year}-{String(month).padStart(2, "0")} Q{half}
            {entryKind === "PRESTAMO" && Number(form.quincenas) > 1
              ? ` → se reparte en ${form.quincenas} quincenas consecutivas`
              : ""}
          </p>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="w-full text-sm"
            onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            aria-label="Foto opcional u obligatoria según tipo"
          />
          {entryKind === "VALE" && (
            <p className="text-xs text-amber-700">Foto obligatoria para vales</p>
          )}
          {photoPreview && (
            <img src={photoPreview} alt="Vista previa" className="max-h-48 rounded border" />
          )}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            {entryKind === "PRESTAMO" ? "Guardar préstamo" : "Guardar vale"}
          </button>
        </div>

        <div className="space-y-4">
          {vales.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4"
            >
              {v.photoUrl ? (
                <img
                  src={v.photoUrl}
                  alt={v.holderName}
                  className="w-full md:w-40 h-40 object-cover rounded"
                />
              ) : (
                <div className="w-full md:w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                  Préstamo
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold">{v.employee.name}</p>
                <p className="text-sm text-gray-600">
                  {v.kind === "PRESTAMO" ? "Préstamo" : "Vale"}: {v.holderName}
                </p>
                {v.installmentNumber && v.installmentTotal && (
                  <p className="text-xs text-indigo-700">
                    Cuota {v.installmentNumber}/{v.installmentTotal}
                    {v.totalPrestamoAmount
                      ? ` · Total préstamo ${formatCop(Number(v.totalPrestamoAmount))}`
                      : ""}
                  </p>
                )}
                <p className="text-sm">
                  {formatCop(Number(v.amount))} —{" "}
                  {v.appliesTo === "BONUS" ? "bonificación" : "salario"}
                </p>
                <button
                  type="button"
                  className="text-red-600 text-sm mt-2"
                  onClick={() => void handleDelete(v)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {vales.length === 0 && (
            <p className="text-gray-500">No hay vales ni cuotas de préstamo en esta quincena.</p>
          )}
        </div>
      </div>
    </div>
  );
}
