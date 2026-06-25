"use client";

import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function TurnosHomePage() {
  const router = useRouter();

  const cards = [
    {
      title: "Planilla editable",
      desc: "Programación mensual de turnos, almuerzos y tareas. Sincroniza con Firebase (programacionAlmuerzos).",
      href: "/turnos/planilla.html",
      emoji: "📋",
      color: "from-teal-600 to-teal-700",
    },
    {
      title: "Consulta (solo lectura)",
      desc: "Ver la planilla del mes sin poder editar. Ideal para consulta en piso.",
      href: "/turnos/consulta.html",
      emoji: "👁️",
      color: "from-slate-600 to-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Turnos" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗓️ Módulo Turnos</h1>
          <p className="text-gray-600">
            Planilla de turnos Caja Centro — mismo motor y datos Firestore que la app original
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className={`block bg-gradient-to-br ${card.color} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="text-5xl mb-4">{card.emoji}</div>
              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
              <p className="text-white/90 text-sm">{card.desc}</p>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-sm text-gray-600 space-y-2">
          <p>
            <strong>Firestore:</strong> colección <code className="bg-gray-100 px-1 rounded">programacionAlmuerzos</code>{" "}
            (proyecto cajacentro-v6).
          </p>
          <p>
            <strong>Planilla editable:</strong> pide clave de administrador al abrir (igual que en Caja Centro).
          </p>
          <p>
            <strong>Motor:</strong> scheduler, almuerzos, duplas, mensajeros, validador — carpeta{" "}
            <code className="bg-gray-100 px-1 rounded">/turnos/js/engine/</code>.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-indigo-600 mt-2"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
