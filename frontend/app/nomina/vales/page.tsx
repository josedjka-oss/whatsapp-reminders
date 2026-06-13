"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type Employee = { id: string; name: string };
type Vale = {
  id: string;
  holderName: string;
  amount: string | number;
  appliesTo: string;
  photoUrl: string;
  year: number;
  month: number;
  half: number;
  employee: Employee;
};

export default function NominaValesPage() {
  const now = new Date();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vales, setVales] = useState<Vale[]>([]);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [half, setHalf] = useState(now.getDate() <= 15 ? 1 : 2);
  const [form, setForm] = useState({
    employeeId: "",
    holderName: "",
    amount: "",
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
    if (!form.employeeId || !form.holderName || !form.amount || !photoBase64) {
      alert("Completa empleado, nombre del vale, valor y foto");
      return;
    }
    const res = await fetch("/api/nomina/vales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        year,
        month,
        half,
        photoBase64,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error");
      return;
    }
    setForm({ employeeId: "", holderName: "", amount: "", appliesTo: "SALARY", notes: "" });
    setPhotoPreview(null);
    setPhotoBase64(null);
    void load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar vale?")) return;
    await fetch(`/api/nomina/vales/${id}`, { method: "DELETE" });
    void load();
  };

  const formatCop = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Vales" />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-3 gap-3">
          <label className="text-sm">
            Año
            <input type="number" className="mt-1 w-full border rounded px-2 py-1" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            Mes
            <input type="number" min={1} max={12} className="mt-1 w-full border rounded px-2 py-1" value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            Quincena
            <select className="mt-1 w-full border rounded px-2 py-1" value={half} onChange={(e) => setHalf(Number(e.target.value))}>
              <option value={1}>1 (pago día 15)</option>
              <option value={2}>2 (fin de mes)</option>
            </select>
          </label>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Nuevo vale</h2>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          >
            <option value="">Empleado</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Nombre a quien corresponde el vale"
            value={form.holderName}
            onChange={(e) => setForm({ ...form, holderName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Valor del vale"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              className="border rounded-lg px-3 py-2"
              value={form.appliesTo}
              onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
            >
              <option value="SALARY">Descontar del salario</option>
              <option value="BONUS">Descontar de bonificación</option>
            </select>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="w-full text-sm"
            onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            aria-label="Foto del vale"
          />
          {photoPreview && (
            <img src={photoPreview} alt="Vista previa vale" className="max-h-48 rounded border" />
          )}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Guardar vale
          </button>
        </div>

        <div className="space-y-4">
          {vales.map((v) => (
            <div key={v.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
              <img src={v.photoUrl} alt={`Vale ${v.holderName}`} className="w-full md:w-40 h-40 object-cover rounded" />
              <div className="flex-1">
                <p className="font-bold">{v.employee.name}</p>
                <p className="text-sm text-gray-600">Vale: {v.holderName}</p>
                <p className="text-sm">{formatCop(Number(v.amount))} — {v.appliesTo === "BONUS" ? "bonificación" : "salario"}</p>
                <button type="button" className="text-red-600 text-sm mt-2" onClick={() => void handleDelete(v.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {vales.length === 0 && <p className="text-gray-500">No hay vales en esta quincena.</p>}
        </div>
      </div>
    </div>
  );
}
