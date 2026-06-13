"use client";

import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function NominaHomePage() {
  const router = useRouter();

  const cards = [
    {
      title: "Quincenas",
      desc: "Crear quincena a quincena, historial, vales, recibos y cierre",
      href: "/nomina/quincenas",
      emoji: "📅",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Empleados",
      desc: "Salario, bonificación, descuentos fijos y teléfono WhatsApp",
      href: "/nomina/empleados",
      emoji: "👥",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Horas extras",
      desc: "Registrar horas extra diurnas del mes y calcular valor según salario",
      href: "/nomina/horas-extras",
      emoji: "⏱️",
      color: "from-violet-500 to-violet-600",
    },
    {
      title: "Vales y préstamos",
      desc: "Vales con foto, descuentos con nombre libre o préstamos en cuotas",
      href: "/nomina/vales",
      emoji: "🧾",
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Nómina" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💼 Módulo Nómina</h1>
          <p className="text-gray-600">
            Recibos de pago con vales, descuentos y envío por WhatsApp con enlace personalizado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <button
              key={card.href}
              type="button"
              onClick={() => router.push(card.href)}
              className={`bg-gradient-to-br ${card.color} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all text-left`}
              aria-label={card.title}
            >
              <div className="text-5xl mb-4">{card.emoji}</div>
              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
              <p className="text-white/90 text-sm">{card.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 text-gray-600 text-sm space-y-2">
          <p>✅ Crea cada quincena (15 y fin de mes) por separado y ciérrala para guardar el historial.</p>
          <p>✅ Cada empleado recibe un enlace único para ver su recibo y fotos de vales.</p>
          <p>✅ Los préstamos en cuotas se descuentan automáticamente en las quincenas siguientes.</p>
        </div>
      </div>
    </div>
  );
}
