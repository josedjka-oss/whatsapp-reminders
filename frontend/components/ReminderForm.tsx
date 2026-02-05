"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ReminderFormData {
  contactId: string;
  body: string;
  scheduleType: "once" | "daily" | "weekly" | "monthly";
  date: string;
  time: string;
  dayOfWeek?: number; // 0=domingo, 1=lunes, ..., 6=sábado
  dayOfMonth?: number;
}

type Step = "contact" | "message" | "frequency" | "dayOfWeek" | "time";

export const ReminderForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ReminderFormData>({
    contactId: "",
    body: "",
    scheduleType: "once",
    date: "",
    time: "",
    dayOfWeek: undefined,
    dayOfMonth: undefined,
  });

  // Cargar contactos al montar
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        // Si es 404, el backend probablemente no se ha desplegado aún
        if (response.status === 404) {
          console.warn("[ReminderForm] Endpoint de contactos no disponible (404). El backend puede estar desplegándose.");
          return; // Continuar sin contactos en lugar de mostrar error
        }
        throw new Error("Error al cargar contactos");
      }
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error("Error cargando contactos:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleContactSelect = (contactId: string) => {
    setFormData((prev) => ({ ...prev, contactId }));
    setCurrentStep("message");
  };

  const handleMessageNext = () => {
    if (!formData.body.trim()) {
      setError("El mensaje es requerido");
      return;
    }
    setError(null);
    setCurrentStep("frequency");
  };

  const handleFrequencyNext = (selectedScheduleType?: string) => {
    setError(null);
    // Usar el tipo seleccionado si se proporciona, sino usar el del estado
    const scheduleType = selectedScheduleType || formData.scheduleType;
    // Si es "weekly", ir al paso de seleccionar día de la semana
    if (scheduleType === "weekly") {
      setCurrentStep("dayOfWeek");
    } else {
      setCurrentStep("time");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("[ReminderForm] handleSubmit - formData completo:", JSON.stringify(formData, null, 2));
      
      // Validar que se haya seleccionado un contacto
      const selectedContact = contacts.find((c) => c.id === formData.contactId);
      if (!selectedContact) {
        setError("Debes seleccionar un contacto");
        setIsSubmitting(false);
        return;
      }

      // Validar mensaje
      if (!formData.body.trim()) {
        setError("El mensaje es requerido");
        setIsSubmitting(false);
        return;
      }

      // Preparar payload según scheduleType
      let payload: any = {
        to: selectedContact.phone,
        body: formData.body.trim(),
        timezone: "America/Bogota",
      };
      
      console.log("[ReminderForm] scheduleType antes de procesar:", formData.scheduleType);

      // Para "once": necesita fecha y hora completa
      if (formData.scheduleType === "once") {
        console.log("[ReminderForm] Procesando como 'once'");
        if (!formData.date || !formData.time) {
          setError("Fecha y hora son requeridas para envío único");
          setIsSubmitting(false);
          return;
        }

        const sendAt = new Date(`${formData.date}T${formData.time}`);
        const nowLocal = new Date();
        
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
      // Para "weekly": necesita día de la semana y hora
      else if (formData.scheduleType === "weekly") {
        console.log("[ReminderForm] Procesando como 'weekly'");
        console.log("[ReminderForm] dayOfWeek:", formData.dayOfWeek);
        console.log("[ReminderForm] time:", formData.time);
        
        if (formData.dayOfWeek === undefined || formData.dayOfWeek === null || !formData.time) {
          console.error("[ReminderForm] ERROR: Faltan datos para weekly. dayOfWeek:", formData.dayOfWeek, "time:", formData.time);
          setError("Día de la semana y hora son requeridos para envío semanal");
          setIsSubmitting(false);
          return;
        }

        const [hour, minute] = formData.time.split(":").map(Number);
        payload.scheduleType = "weekly";
        payload.dayOfWeek = formData.dayOfWeek;
        payload.hour = hour;
        payload.minute = minute;
        console.log("[ReminderForm] Payload para weekly:", JSON.stringify(payload, null, 2));
      }
      else {
        console.warn("[ReminderForm] scheduleType no reconocido:", formData.scheduleType);
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

      // Llamar al proxy de Vercel
      console.log("[ReminderForm] Enviando payload completo:", JSON.stringify(payload, null, 2));
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
        router.push("/reminders");
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
      [name]: name === "dayOfMonth" || name === "dayOfWeek" ? parseInt(value) || undefined : value,
    }));
  };

  // Obtener fecha mínima (hoy)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    .toISOString()
    .split("T")[0];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const selectedContact = contacts.find((c) => c.id === formData.contactId);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">

        {/* Indicador de pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex-1 text-center ${currentStep === "contact" ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              1. Contacto
            </div>
            <div className={`flex-1 text-center ${currentStep === "message" ? "text-green-600 font-semibold" : currentStep === "frequency" || currentStep === "time" ? "text-gray-600" : "text-gray-400"}`}>
              2. Mensaje
            </div>
            <div className={`flex-1 text-center ${currentStep === "frequency" ? "text-green-600 font-semibold" : currentStep === "time" ? "text-gray-600" : "text-gray-400"}`}>
              3. Frecuencia
            </div>
            <div className={`flex-1 text-center ${currentStep === "dayOfWeek" ? "text-green-600 font-semibold" : currentStep === "time" ? "text-gray-600" : "text-gray-400"}`}>
              {formData.scheduleType === "weekly" ? "4. Día" : "4. Hora"}
            </div>
            {formData.scheduleType === "weekly" && (
              <div className={`flex-1 text-center ${currentStep === "time" ? "text-green-600 font-semibold" : "text-gray-400"}`}>
                5. Hora
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: 
                  currentStep === "contact" ? "20%" : 
                  currentStep === "message" ? "40%" : 
                  currentStep === "frequency" ? "60%" : 
                  currentStep === "dayOfWeek" ? "80%" : 
                  "100%",
              }}
            />
          </div>
        </div>

        {/* Paso 1: Seleccionar Contacto */}
        {currentStep === "contact" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Selecciona un Contacto</h2>
            
            {loadingContacts ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-500">Cargando contactos...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No tienes contactos guardados aún.</p>
                <button
                  type="button"
                  onClick={() => router.push("/contacts/new")}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ➕ Agregar Primer Contacto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleContactSelect(contact.id)}
                    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="font-semibold text-lg text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.phone.replace("whatsapp:", "")}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Mensaje */}
        {currentStep === "message" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💬 Escribe el Mensaje
            </h2>
            {selectedContact && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <span className="text-sm text-gray-600">Para: </span>
                <span className="font-semibold text-green-800">{selectedContact.name}</span>
              </div>
            )}
            <textarea
              value={formData.body}
              onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
              rows={6}
              placeholder="Escribe el mensaje que quieres enviar..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep("contact")}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={handleMessageNext}
                className="flex-1 bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Frecuencia */}
        {currentStep === "frequency" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 ¿Con qué frecuencia?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "once", label: "Una vez", icon: "📌" },
                { value: "daily", label: "Diariamente", icon: "🔄" },
                { value: "weekly", label: "Semanalmente", icon: "📆" },
                { value: "monthly", label: "Mensual", icon: "🗓️" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const newScheduleType = option.value as any;
                    setFormData((prev) => ({ ...prev, scheduleType: newScheduleType, dayOfWeek: undefined }));
                    // Pasar el scheduleType directamente para evitar problemas de asincronía
                    handleFrequencyNext(newScheduleType);
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.scheduleType === option.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep("message")}
              className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Atrás
            </button>
          </div>
        )}

        {/* Paso 4: Día de la semana (solo para weekly) */}
        {currentStep === "dayOfWeek" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 ¿Qué día de la semana?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 0, label: "Domingo", icon: "🌅" },
                { value: 1, label: "Lunes", icon: "📅" },
                { value: 2, label: "Martes", icon: "📅" },
                { value: 3, label: "Miércoles", icon: "📅" },
                { value: 4, label: "Jueves", icon: "📅" },
                { value: 5, label: "Viernes", icon: "📅" },
                { value: 6, label: "Sábado", icon: "🎉" },
              ].map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, dayOfWeek: day.value }));
                    setCurrentStep("time");
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.dayOfWeek === day.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{day.icon}</div>
                  <div className="font-semibold text-gray-900">{day.label}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep("frequency")}
              className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Atrás
            </button>
          </div>
        )}

        {/* Paso 4/5: Hora */}
        {currentStep === "time" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">⏰ ¿Cuándo enviar?</h2>

            {/* Fecha (solo para once) */}
            {formData.scheduleType === "once" && (
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
                type="button"
                onClick={() => {
                  if (formData.scheduleType === "weekly") {
                    setCurrentStep("dayOfWeek");
                  } else {
                    setCurrentStep("frequency");
                  }
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Atrás
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creando..." : "✨ Crear Recordatorio"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
