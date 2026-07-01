import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint para /api/messages/sent-by-date
 * GET: Obtiene mensajes enviados en una fecha específica con información de respuestas
 * 
 * Este endpoint actúa como proxy entre el frontend (Vercel) y el backend (Render)
 */

// Forzar renderizado dinámico (no estático) porque usamos request.url
export const dynamic = 'force-dynamic';

console.log('[MESSAGES PROXY] Route handler cargado');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      console.error("[MESSAGES PROXY] NEXT_PUBLIC_API_URL no configurado");
      return NextResponse.json(
        {
          error: "Configuración del servidor incompleta",
        },
        { status: 500 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          error: "El parámetro 'date' es requerido",
        },
        { status: 400 }
      );
    }

    // Preparar headers (solo incluir auth si ADMIN_PASSWORD está configurado)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminPassword) {
      headers["x-admin-password"] = adminPassword;
      headers["Authorization"] = `Bearer ${adminPassword}`;
    }

    console.log("[MESSAGES PROXY] Llamando a:", `${backendUrl}/api/messages/sent-by-date?date=${date}`);
    console.log("[MESSAGES PROXY] Headers:", JSON.stringify(headers));

    const response = await fetch(`${backendUrl}/api/messages/sent-by-date?date=${date}`, {
      method: "GET",
      headers,
    });

    console.log("[MESSAGES PROXY] Respuesta recibida:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[MESSAGES PROXY] Error del backend:", response.status, errorData);
      return NextResponse.json(
        {
          error: errorData.error || `Error del servidor (${response.status})`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[MESSAGES PROXY] Datos recibidos del backend:", {
      date: data.date,
      count: data.count,
      taskCount: data.taskCount,
      messagesCount: data.messages?.length || 0,
    });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[MESSAGES PROXY] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Error procesando la solicitud",
      },
      { status: 500 }
    );
  }
}
