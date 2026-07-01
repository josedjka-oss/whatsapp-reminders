"use client";

import { useState, useEffect, useCallback } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

type IntegrationTaskKind =
  | "ASEO_RECEPCION"
  | "COCINA_RECEPCION"
  | "SACAR_BASURA";

interface MessageWithResponse {
  id: string;
  to: string;
  contactName: string | null;
  body: string;
  createdAt: string;
  twilioSid: string | null;
  hasResponse: boolean;
  responseAt: string | null;
  taskKind?: IntegrationTaskKind | null;
  taskLabel?: string | null;
}

type TaskMessagesMap = Record<IntegrationTaskKind, MessageWithResponse[]>;

const TASK_ORDER: IntegrationTaskKind[] = [
  "ASEO_RECEPCION",
  "COCINA_RECEPCION",
  "SACAR_BASURA",
];

const TASK_UI: Record<
  IntegrationTaskKind,
  { emoji: string; title: string; schedule: string }
> = {
  ASEO_RECEPCION: {
    emoji: "🧹",
    title: "Aseo Recepción",
    schedule: "Lun / Mié / Vie · 9:00 a.m.",
  },
  COCINA_RECEPCION: {
    emoji: "🍳",
    title: "Aseo Cocina-Pasillo",
    schedule: "Lun / Mié / Vie · 9:00 a.m.",
  },
  SACAR_BASURA: {
    emoji: "🗑️",
    title: "Sacar Basura",
    schedule: "Lun / Mié / Vie · 6:00 p.m.",
  },
};

const emptyTaskMap = (): TaskMessagesMap => ({
  ASEO_RECEPCION: [],
  COCINA_RECEPCION: [],
  SACAR_BASURA: [],
});

export default function MessagesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [taskMessages, setTaskMessages] = useState<TaskMessagesMap>(emptyTaskMap);
  const [otherMessages, setOtherMessages] = useState<MessageWithResponse[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tasks" | "all">("tasks");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/messages/sent-by-date?date=${selectedDate}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      const fromApi = data.taskMessages as TaskMessagesMap | undefined;
      if (fromApi) {
        setTaskMessages({
          ASEO_RECEPCION: fromApi.ASEO_RECEPCION ?? [],
          COCINA_RECEPCION: fromApi.COCINA_RECEPCION ?? [],
          SACAR_BASURA: fromApi.SACAR_BASURA ?? [],
        });
      } else {
        const fallback = emptyTaskMap();
        for (const msg of (data.messages ?? []) as MessageWithResponse[]) {
          if (msg.taskKind && fallback[msg.taskKind]) {
            fallback[msg.taskKind].push(msg);
          }
        }
        setTaskMessages(fallback);
      }

      setOtherMessages(
        (data.otherMessages as MessageWithResponse[] | undefined) ??
          ((data.messages ?? []) as MessageWithResponse[]).filter(
            (m) => !m.taskKind
          )
      );
      setTaskCount(
        typeof data.taskCount === "number"
          ? data.taskCount
          : TASK_ORDER.reduce(
              (n, k) => n + (fromApi?.[k]?.length ?? 0),
              0
            )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al cargar mensajes";
      setError(message);
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      void fetchMessages();
    }
  }, [selectedDate, fetchMessages]);

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/^whatsapp:/, "").replace(/^\+/, "");
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: es });
  };

  const formatSelectedDate = (ymd: string): string => {
    const [year, month, day] = ymd.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return format(date, "PPP", { locale: es });
  };

  const getResponseBadge = (hasResponse: boolean) => {
    if (hasResponse) {
      return (
        <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <span>✓</span>
          <span>Respondió</span>
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
        <span>—</span>
        <span>Sin respuesta</span>
      </span>
    );
  };

  const renderMessageRow = (message: MessageWithResponse) => (
    <div
      key={message.id}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900">
              {message.contactName
                ? message.contactName
                : formatPhoneNumber(message.to)}
            </h3>
            {getResponseBadge(message.hasResponse)}
          </div>
          {message.contactName && (
            <p className="text-xs text-gray-400 mb-1">
              {formatPhoneNumber(message.to)}
            </p>
          )}
          <p className="text-gray-700 text-sm mb-2">{message.body}</p>
          <div className="text-xs text-gray-500">
            Enviado a las {formatDateTime(message.createdAt)}
            {message.hasResponse && message.responseAt && (
              <span className="ml-4 text-green-600">
                • Respondió a las {formatDateTime(message.responseAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const totalAll = taskCount + otherMessages.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Mensajes Enviados" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📨 Mensajes Enviados
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Tareas automáticas de aseo, cocina y basura (Firebase → Twilio)
          </p>

          <div className="mb-6">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Selecciona una fecha:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              {selectedDate ? formatSelectedDate(selectedDate) : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setViewMode("tasks")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "tasks"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Aseo / Cocina / Basura ({taskCount})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({totalAll})
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <p className="mt-2 text-gray-500">Cargando mensajes...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button
                type="button"
                onClick={() => void fetchMessages()}
                className="ml-4 text-red-800 underline hover:text-red-900"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {(viewMode === "tasks" || taskCount > 0) && (
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Tareas del día
                  </h2>
                  <div className="space-y-4">
                    {TASK_ORDER.map((kind) => {
                      const meta = TASK_UI[kind];
                      const items = taskMessages[kind] ?? [];

                      return (
                        <div
                          key={kind}
                          className="border border-teal-200 rounded-xl overflow-hidden"
                        >
                          <div className="bg-teal-50 px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
                            <div>
                              <span className="font-semibold text-teal-900">
                                {meta.emoji} {meta.title}
                              </span>
                              <p className="text-xs text-teal-700 mt-0.5">
                                {meta.schedule}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                items.length > 0
                                  ? "bg-teal-200 text-teal-900"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {items.length > 0
                                ? `${items.length} enviado(s)`
                                : "No enviado"}
                            </span>
                          </div>
                          <div className="p-4 space-y-3 bg-white">
                            {items.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-2">
                                No hay mensaje de {meta.title.toLowerCase()}{" "}
                                registrado para esta fecha.
                              </p>
                            ) : (
                              items.map((message) => renderMessageRow(message))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {viewMode === "all" && (
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Tareas Aseo / Cocina / Basura ({taskCount})
                  </h2>
                  <div className="space-y-4">
                    {TASK_ORDER.flatMap((kind) =>
                      (taskMessages[kind] ?? []).map((message) =>
                        renderMessageRow(message)
                      )
                    )}
                    {taskCount === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Sin tareas de aseo, cocina o basura este día.
                      </p>
                    )}
                  </div>
                </section>
              )}

              {viewMode === "all" && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Otros mensajes ({otherMessages.length})
                  </h2>
                  {otherMessages.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">
                      No hay otros mensajes en esta fecha.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {otherMessages.map((message) => renderMessageRow(message))}
                    </div>
                  )}
                </section>
              )}

              {viewMode === "tasks" && taskCount === 0 && totalAll === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">
                    No se enviaron tareas ni otros mensajes en esta fecha.
                  </p>
                </div>
              )}

              {viewMode === "tasks" && taskCount === 0 && totalAll > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Hay {otherMessages.length} mensaje(s) más (nómina, planilla,
                  recordatorios).{" "}
                  <button
                    type="button"
                    onClick={() => setViewMode("all")}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Ver todos
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
