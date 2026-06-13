"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

type Deduction = {
  id: string;
  label: string;
  amount: string | number;
  appliesTo: string;
};

type Employee = {
  id: string;
  name: string;
  phone: string | null;
  baseSalary: string | number;
  transportAllowance: string | number;
  baseBonus: string | number;
  bonusFrequency: string;
  isActive: boolean;
  deductions: Deduction[];
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const bonusLabel = (freq: string) =>
  freq === "MENSUAL" ? "Mensual (solo fin de mes)" : "Quincenal (15 y fin de mes)";

export default function NominaEmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    baseSalary: "",
    transportAllowance: "",
    baseBonus: "",
    bonusFrequency: "QUINCENAL",
  });
  const [deductionForm, setDeductionForm] = useState<
    Record<string, { label: string; amount: string; appliesTo: string }>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nomina/employees");
      if (!res.ok) throw new Error("No se pudieron cargar empleados");
      setEmployees(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const res = await fetch("/api/nomina/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone || undefined,
        baseSalary: Number(form.baseSalary) || 0,
        transportAllowance: Number(form.transportAllowance) || 0,
        baseBonus: Number(form.baseBonus) || 0,
        bonusFrequency: form.bonusFrequency,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error al crear");
      return;
    }
    setForm({
      name: "",
      phone: "",
      baseSalary: "",
      transportAllowance: "",
      baseBonus: "",
      bonusFrequency: "QUINCENAL",
    });
    void load();
  };

  const handleSyncContacts = async () => {
    const res = await fetch("/api/nomina/employees/sync-contacts", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error");
      return;
    }
    alert(`Importados: ${data.created} nuevos, ${data.updated} actualizados`);
    void load();
  };

  const handleUpdateEmployee = async (emp: Employee, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/nomina/employees/${emp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error");
      return;
    }
    void load();
  };

  const handleAddDeduction = async (employeeId: string) => {
    const df = deductionForm[employeeId];
    if (!df?.label || !df.amount) return;
    const res = await fetch(`/api/nomina/employees/${employeeId}/deductions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: df.label,
        amount: Number(df.amount),
        appliesTo: df.appliesTo || "SALARY",
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error");
      return;
    }
    setDeductionForm((prev) => ({
      ...prev,
      [employeeId]: { label: "", amount: "", appliesTo: "SALARY" },
    }));
    void load();
  };

  const handleDeleteDeduction = async (id: string) => {
    if (!confirm("¿Eliminar descuento?")) return;
    await fetch(`/api/nomina/deductions/${id}`, { method: "DELETE" });
    void load();
  };

  const previewHalf = (emp: Employee, half: 1 | 2) => {
    const salary = Number(emp.baseSalary) / 2;
    const transport = Number(emp.transportAllowance) / 2;
    const bonus =
      emp.bonusFrequency === "MENSUAL"
        ? half === 2
          ? Number(emp.baseBonus)
          : 0
        : Number(emp.baseBonus) / 2;
    return { salary, transport, bonus, total: salary + transport + bonus };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina — Empleados" />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSyncContacts()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Importar nombres desde Contactos
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Nuevo empleado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Teléfono WhatsApp (302...)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Salario mensual"
              type="number"
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Auxilio de transporte mensual"
              type="number"
              value={form.transportAllowance}
              onChange={(e) => setForm({ ...form, transportAllowance: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Bonificación mensual"
              type="number"
              value={form.baseBonus}
              onChange={(e) => setForm({ ...form, baseBonus: e.target.value })}
            />
            <select
              className="border rounded-lg px-3 py-2"
              value={form.bonusFrequency}
              onChange={(e) => setForm({ ...form, bonusFrequency: e.target.value })}
              aria-label="Frecuencia de bonificación"
            >
              <option value="QUINCENAL">Bonificación quincenal (15 y fin de mes)</option>
              <option value="MENSUAL">Bonificación mensual (solo fin de mes)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => void handleCreate()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Guardar empleado
          </button>
        </div>

        {loading && <p className="text-gray-500">Cargando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {employees.map((emp) => {
          const q1 = previewHalf(emp, 1);
          const q2 = previewHalf(emp, 2);
          return (
            <div key={emp.id} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex flex-wrap justify-between gap-2 items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{emp.name}</h3>
                  <p className="text-sm text-gray-500">{emp.phone || "Sin teléfono"}</p>
                  <p className="text-xs text-indigo-700 mt-1">{bonusLabel(emp.bonusFrequency)}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={emp.isActive}
                    onChange={(e) =>
                      void handleUpdateEmployee(emp, { isActive: e.target.checked })
                    }
                  />
                  Activo
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                  Salario mensual
                  <input
                    type="number"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    defaultValue={Number(emp.baseSalary)}
                    onBlur={(e) =>
                      void handleUpdateEmployee(emp, { baseSalary: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="text-sm">
                  Auxilio transporte mensual
                  <input
                    type="number"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    defaultValue={Number(emp.transportAllowance)}
                    onBlur={(e) =>
                      void handleUpdateEmployee(emp, {
                        transportAllowance: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Bonificación mensual
                  <input
                    type="number"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    defaultValue={Number(emp.baseBonus)}
                    onBlur={(e) =>
                      void handleUpdateEmployee(emp, { baseBonus: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="text-sm">
                  Pago de bonificación
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={emp.bonusFrequency}
                    onChange={(e) =>
                      void handleUpdateEmployee(emp, { bonusFrequency: e.target.value })
                    }
                  >
                    <option value="QUINCENAL">Quincenal</option>
                    <option value="MENSUAL">Mensual (solo 30/31)</option>
                  </select>
                </label>
                <label className="text-sm md:col-span-2">
                  Teléfono WhatsApp
                  <input
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    defaultValue={emp.phone ?? ""}
                    onBlur={(e) => void handleUpdateEmployee(emp, { phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-50 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-gray-700">Quincena 1 (día 15)</p>
                  <p>Salario: {formatCop(q1.salary)}</p>
                  <p>Transporte: {formatCop(q1.transport)}</p>
                  <p>Bonificación: {formatCop(q1.bonus)}</p>
                  <p className="font-medium">Subtotal: {formatCop(q1.total)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Quincena 2 (fin de mes)</p>
                  <p>Salario: {formatCop(q2.salary)}</p>
                  <p>Transporte: {formatCop(q2.transport)}</p>
                  <p>Bonificación: {formatCop(q2.bonus)}</p>
                  <p className="font-medium">Subtotal: {formatCop(q2.total)} + horas extra del mes</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Descuentos fijos por quincena</h4>
                <ul className="space-y-1 text-sm mb-3">
                  {emp.deductions.map((d) => (
                    <li key={d.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                      <span>
                        {d.label} — {formatCop(Number(d.amount))} (
                        {d.appliesTo === "BONUS" ? "bonificación" : "salario"})
                      </span>
                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => void handleDeleteDeduction(d.id)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="border rounded px-2 py-1 text-sm flex-1 min-w-[120px]"
                    placeholder="Concepto descuento"
                    value={deductionForm[emp.id]?.label ?? ""}
                    onChange={(e) =>
                      setDeductionForm((p) => ({
                        ...p,
                        [emp.id]: {
                          ...(p[emp.id] ?? { amount: "", appliesTo: "SALARY" }),
                          label: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1 text-sm w-28"
                    placeholder="Valor"
                    type="number"
                    value={deductionForm[emp.id]?.amount ?? ""}
                    onChange={(e) =>
                      setDeductionForm((p) => ({
                        ...p,
                        [emp.id]: {
                          ...(p[emp.id] ?? { label: "", appliesTo: "SALARY" }),
                          amount: e.target.value,
                        },
                      }))
                    }
                  />
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={deductionForm[emp.id]?.appliesTo ?? "SALARY"}
                    onChange={(e) =>
                      setDeductionForm((p) => ({
                        ...p,
                        [emp.id]: {
                          ...(p[emp.id] ?? { label: "", amount: "" }),
                          appliesTo: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="SALARY">Del salario</option>
                    <option value="BONUS">De bonificación</option>
                  </select>
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
                    onClick={() => void handleAddDeduction(emp.id)}
                  >
                    + Descuento
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
