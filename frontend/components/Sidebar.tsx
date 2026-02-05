"use client";

import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const router = useRouter();

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 space-y-2">
        <button
          onClick={() => router.push("/reminders")}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          🏠 Dashboard
        </button>
        <button
          onClick={() => router.push("/reminders/new")}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          📅 Crear Recordatorio
        </button>
        <button
          onClick={() => router.push("/reminders")}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
        >
          📋 Ver Recordatorios
        </button>
        <button
          onClick={() => router.push("/contacts/new")}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          ➕ Agregar Contacto
        </button>
      </div>
    </div>
  );
};
