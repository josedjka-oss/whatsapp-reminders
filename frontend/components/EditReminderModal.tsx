"use client";

import { useState, FormEvent, useEffect } from "react";

interface Reminder {
  id: string;
  to: string;
  body: string;
  scheduleType: "once" | "daily" | "weekly" | "monthly";
  sendAt: string | null;
  hour: number | null;
  minute: number | null;
  dayOfMonth: number | null;
}

interface EditReminderModalProps {
  reminder: Reminder;
  onClose: () => void;
  onSave: () => void;
}

export const EditReminderModal = ({ reminder, onClose, onSave }: EditReminderModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    body: reminder.body,
    scheduleType: reminder.scheduleType,
    date: reminder.sendAt ? new Date(reminder.sendAt).toISOString().split("T")[0] : "",
    time: reminder.hour !== null && reminder.minute !== null
      ? `${String(reminder.hour).padStart(2, "0")}:${String(reminder.minute).padStart(2, "0")}`
      : "",
    dayOfMonth: reminder.dayOfMonth || undefined,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let payload: any = {
        body: formData.body.trim(),
        scheduleType: formData.scheduleType,
      };

      if (formData.scheduleType === "once") {
        if (!formData.date || !formData.time) {
          setError("Fecha y hora son requeridas");
          setIsSubmitting(false);
          return;
        }
        const sendAt = new Date(`${formData.date}T${formData.time}`);
        payload.sendAt = sendAt.toISOString();
      } else if (formData.scheduleType === "daily") {
        const [hour, minute] = formData.time.split(":").map(Number);
        payload.hour = hour;
        payload.minute = minute;
      } else if (formData.scheduleType === "monthly") {
        const [hour, minute] = formData.time.split(":").map(Number);
        payload.dayOfMonth = formData.dayOfMonth;
        payload.hour = hour;
        payload.minute = minute;
      }

      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al actualizar");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar recordatorio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    .toISOString()
    .split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Editar Recordatorio</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
            <select
              value={formData.scheduleType}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduleType: e.target.value as any }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="once">Una vez</option>
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          {(formData.scheduleType === "once" || formData.scheduleType === "weekly") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          )}

          {formData.scheduleType === "monthly" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Día del mes</label>
              <input
                type="number"
                value={formData.dayOfMonth || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, dayOfMonth: parseInt(e.target.value) || undefined }))}
                min={1}
                max={31}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
