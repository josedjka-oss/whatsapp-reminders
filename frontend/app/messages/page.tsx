"use client";

import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

interface MessageWithResponse {
  id: string;
  to: string;
  contactName: string | null;
  body: string;
  createdAt: string;
  twilioSid: string | null;
  hasResponse: boolean;
  responseAt: string | null;
}

export default function MessagesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Por defecto, fecha de hoy en formato YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [messages, setMessages] = useState<MessageWithResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchMessages();
    }
  }, [selectedDate]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/messages/sent-by-date?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar mensajes");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/^whatsapp:/, "").replace(/^\+/, "");
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: es });
  };

  const getResponseBadge = (hasResponse: boolean) => {
    if (hasResponse) {
      return (
        <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <span>✓</span>
          <span>Respondió</span>
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
          <span>—</span>
          <span>Sin respuesta</span>
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Mensajes Enviados" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            📨 Mensajes Enviados
          </h1>

          {/* Selector de fecha */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
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
              Mostrando mensajes enviados el: {selectedDate ? format(new Date(selectedDate), "PPP", { locale: es }) : ""}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Cargando mensajes...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button
                onClick={fetchMessages}
                className="ml-4 text-red-800 underline hover:text-red-900"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Lista de mensajes */}
          {!loading && !error && (
            <>
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No se enviaron mensajes en esta fecha</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 text-sm text-gray-600">
                    Total: {messages.length} mensaje(s) enviado(s)
                  </div>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {message.contactName || formatPhoneNumber(message.to)}
                            </h3>
                            {getResponseBadge(message.hasResponse)}
                          </div>
                          {!message.contactName && (
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
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
