"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface ReminderFormData {
  to: string;
  body: string;
  scheduleType: "once" | "daily" | "weekly" | "biweekly" | "monthly";
  date: string;
  time: string;
  dayOfMonth?: number;
}

export const ReminderForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ReminderFormData>({
    to: "",
    body: "",
    scheduleType: "once",
    date: "",
    time: "",
    dayOfMonth: undefined,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar número de teléfono
      if (!formData.to.trim()) {
        setError("El número de teléfono es requerido");
        setIsSubmitting(false);
        return;
      }

      // Formatear número (agregar whatsapp: si no lo tiene)
      let phoneNumber = formData.to.trim();
      if (!phoneNumber.startsWith("whatsapp:")) {
        if (!phoneNumber.startsWith("+")) {
          phoneNumber = `+${phoneNumber}`;
        }
        phoneNumber = `whatsapp:${phoneNumber}`;
      }

      // Validar mensaje
      if (!formData.body.trim()) {
        setError("El mensaje es requerido");
        setIsSubmitting(false);
        return;
      }

      // Preparar payload según scheduleType
      let payload: any = {
        to: phoneNumber,
        body: formData.body.trim(),
        timezone: "America/Bogota",
      };

      // Para "once": necesita fecha y hora completa
      if (formData.scheduleType === "once") {
        if (!formData.date || !formData.time) {
          setError("Fecha y hora son requeridas para envío único");
          setIsSubmitting(false);
          return;
        }

        // Crear fecha en zona horaria local (Bogotá)
        // El input date devuelve fecha en formato YYYY-MM-DD (zona local)
        // El input time devuelve hora en formato HH:MM (zona local)
        const sendAt = new Date(`${formData.date}T${formData.time}`);
        const nowLocal = new Date();
        
        // Comparar en la misma zona horaria (ambas son locales)
        if (sendAt <= nowLocal) {
          setError("La fecha y hora deben ser futuras");
          setIsSubmitting(false);
          return;
        }

        payload.scheduleType = "once";
        payload.sendAt = sendAt.toISOString();
      }
      // Para "daily": necesita solo hora
      else if (formData.scheduleType === "daily") {
        if (!formData.time) {
          setError("La hora es requerida para envío diario");
          setIsSubmitting(false);
          return;
        }

        const [hour, minute] = formData.time.split(":").map(Number);
        payload.scheduleType = "daily";
        payload.hour = hour;
        payload.minute = minute;
      }
      // Para "weekly": usar "once" con fecha calculada (7 días desde la fecha base)
      else if (formData.scheduleType === "weekly") {
        if (!formData.date || !formData.time) {
          setError("Fecha y hora son requeridas");
          setIsSubmitting(false);
          return;
        }

        const baseDate = new Date(`${formData.date}T${formData.time}`);
        const sendAt = new Date(baseDate);
        sendAt.setDate(sendAt.getDate() + 7); // 7 días desde la fecha base

        const nowLocal = new Date();
        if (sendAt <= nowLocal) {
          setError("La fecha calculada debe ser futura");
          setIsSubmitting(false);
          return;
        }

        payload.scheduleType = "once";
        payload.sendAt = sendAt.toISOString();
      }
      // Para "biweekly" (cada dos días): usar "once" con fecha calculada (2 días desde hoy)
      else if (formData.scheduleType === "biweekly") {
        if (!formData.time) {
          setError("La hora es requerida");
          setIsSubmitting(false);
          return;
        }

        // Calcular fecha: 2 días desde hoy a la hora especificada
        const todayLocal = new Date();
        const [hour, minute] = formData.time.split(":").map(Number);
        const sendAt = new Date(todayLocal);
        sendAt.setDate(sendAt.getDate() + 2); // 2 días desde hoy
        sendAt.setHours(hour, minute, 0, 0);

        const nowLocal = new Date();
        if (sendAt <= nowLocal) {
          setError("La fecha calculada debe ser futura");
          setIsSubmitting(false);
          return;
        }

        payload.scheduleType = "once";
        payload.sendAt = sendAt.toISOString();
      }
      // Para "monthly": necesita día del mes y hora
      else if (formData.scheduleType === "monthly") {
        if (!formData.dayOfMonth || !formData.time) {
          setError("Día del mes y hora son requeridos para envío mensual");
          setIsSubmitting(false);
          return;
        }

        const [hour, minute] = formData.time.split(":").map(Number);
        payload.scheduleType = "monthly";
        payload.dayOfMonth = formData.dayOfMonth;
        payload.hour = hour;
        payload.minute = minute;
      }

      // Llamar al proxy de Vercel (que maneja la autenticación)
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/chat");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al crear el recordatorio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dayOfMonth" ? parseInt(value) || undefined : value,
    }));
  };

  // Obtener fecha mínima (hoy) en zona horaria local (Bogotá)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    .toISOString()
    .split("T")[0];
  // Obtener hora actual en zona horaria local
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Recordatorio Manual</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número de teléfono */}
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <input
              type="text"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="+573001234567 o whatsapp:+573001234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Incluye el código de país (ej: +57 para Colombia)
            </p>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={4}
              placeholder="Escribe el mensaje que quieres enviar..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Tipo de frecuencia */}
          <div>
            <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia
            </label>
            <select
              id="scheduleType"
              name="scheduleType"
              value={formData.scheduleType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="once">Una vez</option>
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente (cada semana)</option>
              <option value="biweekly">Cada dos días</option>
              <option value="monthly">Mensual (cada mes)</option>
            </select>
          </div>

          {/* Fecha (para once, weekly, biweekly) */}
          {(formData.scheduleType === "once" ||
            formData.scheduleType === "weekly" ||
            formData.scheduleType === "biweekly") && (
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Día del mes (para monthly) */}
          {formData.scheduleType === "monthly" && (
            <div>
              <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-2">
                Día del mes (1-31)
              </label>
              <input
                type="number"
                id="dayOfMonth"
                name="dayOfMonth"
                value={formData.dayOfMonth || ""}
                onChange={handleChange}
                min={1}
                max={31}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Hora */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Hora
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              defaultValue={currentTime}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ Recordatorio creado exitosamente. Redirigiendo...
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creando..." : "Crear Recordatorio"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
