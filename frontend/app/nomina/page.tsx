"use client";

import { useRouter } from "next/navigation";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function NominaHomePage() {
  const router = useRouter();

  const cards = [
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
      title: "Resumen quincena",
      desc: "Salario+transporte neto y bonificación neta por empleado",
      href: "/nomina/resumen",
      emoji: "📊",
      color: "from-sky-500 to-sky-600",
    },
    {
      title: "Vales y préstamos",
      desc: "Vales con foto o préstamos repartidos en varias quincenas",
      href: "/nomina/vales",
      emoji: "🧾",
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Quincenas y envíos",
      desc: "Generar recibos, enviar WhatsApp a todos o programar auto",
      href: "/nomina/periodos",
      emoji: "📤",
      color: "from-emerald-500 to-emerald-600",
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
          <p>✅ Pagos quincenales: día <strong>15</strong> y <strong>último día del mes</strong> (28–31).</p>
          <p>✅ Cada empleado recibe un enlace único para ver su recibo y fotos de vales.</p>
          <p>✅ El envío automático usa la hora configurada en Quincenas (por defecto 9:00 a.m. Bogotá).</p>
        </div>
      </div>
    </div>
  );
}
