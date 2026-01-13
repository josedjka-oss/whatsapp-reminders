"use client";

import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";

interface Reminder {
  id: string;
  to: string;
  body: string;
  scheduleType: "once" | "daily" | "monthly";
  sendAt: string | null;
  hour: number | null;
  minute: number | null;
  dayOfMonth: number | null;
  timezone: string;
  isActive: boolean;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RemindersListProps {
  reminders: Reminder[];
  type: "past" | "scheduled";
}

export const RemindersList = ({ reminders, type }: RemindersListProps) => {
  const formatReminderDate = (reminder: Reminder): string => {
    if (reminder.scheduleType === "once" && reminder.sendAt) {
      const date = new Date(reminder.sendAt);
      return format(date, "PPP 'a las' HH:mm", { locale: es });
    } else if (reminder.scheduleType === "daily") {
      const hour = reminder.hour !== null ? String(reminder.hour).padStart(2, "0") : "00";
      const minute = reminder.minute !== null ? String(reminder.minute).padStart(2, "0") : "00";
      return `Diariamente a las ${hour}:${minute}`;
    } else if (reminder.scheduleType === "monthly") {
      const day = reminder.dayOfMonth || 1;
      const hour = reminder.hour !== null ? String(reminder.hour).padStart(2, "0") : "00";
      const minute = reminder.minute !== null ? String(reminder.minute).padStart(2, "0") : "00";
      return `Día ${day} de cada mes a las ${hour}:${minute}`;
    }
    return "Sin fecha";
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remover whatsapp: prefix si existe
    return phone.replace(/^whatsapp:/, "").replace(/^\+/, "");
  };

  const getStatusBadge = (reminder: Reminder) => {
    if (!reminder.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
          Inactivo
        </span>
      );
    }

    if (reminder.scheduleType === "once" && reminder.sendAt) {
      const sendDate = new Date(reminder.sendAt);
      const now = new Date();
      if (sendDate < now) {
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Completado
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Programado
          </span>
        );
      }
    }

    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        Activo
      </span>
    );
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay recordatorios {type === "past" ? "pasados" : "programados"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {formatPhoneNumber(reminder.to)}
                </h3>
                {getStatusBadge(reminder)}
              </div>
              <p className="text-gray-700 text-sm mb-2">{reminder.body}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="font-medium">Tipo:</span>
                <span className="capitalize">
                  {reminder.scheduleType === "once"
                    ? "Una vez"
                    : reminder.scheduleType === "daily"
                    ? "Diario"
                    : "Mensual"}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Fecha:</span>
                <span>{formatReminderDate(reminder)}</span>
              </span>
            </div>
            <div className="text-gray-400">
              {reminder.lastRunAt
                ? `Último envío: ${formatDistanceToNow(new Date(reminder.lastRunAt), {
                    addSuffix: true,
                    locale: es,
                  })}`
                : "Nunca enviado"}
            </div>
          </div>

          {reminder.createdAt && (
            <div className="mt-2 text-xs text-gray-400">
              Creado: {format(new Date(reminder.createdAt), "PPP 'a las' HH:mm", { locale: es })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
