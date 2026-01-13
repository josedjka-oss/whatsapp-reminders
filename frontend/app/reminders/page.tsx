"use client";

import { useState, useEffect } from "react";
import { RemindersList } from "@/components/RemindersList";

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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scheduled" | "past">("scheduled");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/reminders");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setReminders(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar recordatorios");
      console.error("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar recordatorios según el tab activo
  const getFilteredReminders = (): Reminder[] => {
    const now = new Date();

    if (activeTab === "past") {
      // Recordatorios pasados: inactivos o con sendAt en el pasado
      return reminders.filter((r) => {
        if (!r.isActive) return true;
        if (r.scheduleType === "once" && r.sendAt) {
          return new Date(r.sendAt) < now;
        }
        return false;
      });
    } else {
      // Recordatorios programados: activos y con fecha futura o recurrentes
      return reminders.filter((r) => {
        if (!r.isActive) return false;
        if (r.scheduleType === "once" && r.sendAt) {
          return new Date(r.sendAt) >= now;
        }
        // daily y monthly siempre son programados si están activos
        return r.scheduleType === "daily" || r.scheduleType === "monthly";
      });
    }
  };

  const filteredReminders = getFilteredReminders();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recordatorios</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "scheduled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📅 Programados ({reminders.filter((r) => {
              const now = new Date();
              return (
                r.isActive &&
                ((r.scheduleType === "once" && r.sendAt && new Date(r.sendAt) >= now) ||
                  r.scheduleType === "daily" ||
                  r.scheduleType === "monthly")
              );
            }).length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "past"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📜 Pasados ({reminders.filter((r) => {
              const now = new Date();
              return (
                !r.isActive ||
                (r.scheduleType === "once" && r.sendAt && new Date(r.sendAt) < now)
              );
            }).length})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Cargando recordatorios...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button
              onClick={fetchReminders}
              className="ml-4 text-red-800 underline hover:text-red-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de recordatorios */}
        {!loading && !error && (
          <RemindersList reminders={filteredReminders} type={activeTab} />
        )}
      </div>
    </div>
  );
}
