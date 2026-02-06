"use client";

import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Dashboard" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 WhatsApp Reminders
          </h1>
          <p className="text-gray-600">
            Gestiona tus recordatorios y contactos de WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Crear Recordatorio */}
          <button
            onClick={() => router.push("/reminders/new")}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-2xl font-bold mb-2">Crear Recordatorio</h2>
            <p className="text-blue-100 text-sm">
              Programa un mensaje para enviar en una fecha y hora específica
            </p>
          </button>

          {/* Ver Recordatorios */}
          <button
            onClick={() => router.push("/reminders")}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">Ver Recordatorios</h2>
            <p className="text-purple-100 text-sm">
              Consulta, edita o elimina tus recordatorios programados
            </p>
          </button>

          {/* Mensajes Enviados */}
          <button
            onClick={() => router.push("/messages")}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="text-5xl mb-4">📨</div>
            <h2 className="text-2xl font-bold mb-2">Mensajes Enviados</h2>
            <p className="text-green-100 text-sm">
              Consulta los mensajes enviados y si tuvieron respuesta
            </p>
          </button>

          {/* Agregar Contacto */}
          <button
            onClick={() => router.push("/contacts/new")}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="text-5xl mb-4">➕</div>
            <h2 className="text-2xl font-bold mb-2">Agregar Contacto</h2>
            <p className="text-orange-100 text-sm">
              Guarda números de teléfono con nombres para usarlos fácilmente
            </p>
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Información
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Los números de teléfono se guardan automáticamente con código +57 (Colombia)</li>
            <li>✅ Los nombres se guardan en mayúsculas automáticamente</li>
            <li>✅ Puedes editar o eliminar recordatorios que aún no se han enviado</li>
            <li>✅ Los recordatorios se envían automáticamente a la hora programada</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
