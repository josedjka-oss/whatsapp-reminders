"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createScheduledMessage } from "@/lib/messages";
import type { MessageFormData, MessageType } from "@/types/message";

const MessageForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MessageFormData>({
    phoneNumber: "",
    message: "",
    scheduledDate: "",
    scheduledTime: "",
    type: "unique",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar número de teléfono (debe incluir código de país)
      if (!formData.phoneNumber.startsWith("+")) {
        alert("El número debe incluir el código de país (ej: +521234567890)");
        setIsSubmitting(false);
        return;
      }

      // Validar que la fecha/hora sea futura
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );
      if (scheduledDateTime <= new Date()) {
        alert("La fecha y hora deben ser futuras");
        setIsSubmitting(false);
        return;
      }

      await createScheduledMessage(formData);
      window.location.href = "/";
    } catch (error) {
      console.error("Error al crear mensaje:", error);
      alert("Error al crear el mensaje. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Número de teléfono (con código de país)
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="+521234567890"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ejemplo: +521234567890 (incluye el + y código de país)
        </p>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Escribe tu mensaje aquí..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="scheduledDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Fecha
          </label>
          <input
            type="date"
            id="scheduledDate"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="scheduledTime"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Hora
          </label>
          <input
            type="time"
            id="scheduledTime"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Tipo de mensaje
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="unique">Único (se envía una vez)</option>
          <option value="daily">Diario (se repite cada día a la misma hora)</option>
          <option value="biweekly">Cada dos semanas (se repite cada 14 días)</option>
          <option value="monthly">Mensual (se repite cada mes)</option>
        </select>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formData.type === "unique"
            ? "El mensaje se enviará solo una vez en la fecha y hora programada"
            : formData.type === "daily"
            ? "El mensaje se enviará automáticamente cada día a la misma hora"
            : formData.type === "biweekly"
            ? "El mensaje se enviará automáticamente cada 14 días a la misma hora"
            : "El mensaje se enviará automáticamente cada mes a la misma hora"}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Guardando..." : "Programar Mensaje"}
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
