import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint para /api/chat
 * Recibe {text} del browser y llama al backend con autenticación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error: "El campo 'text' es requerido y debe ser un string",
          reply: "Por favor, proporciona un texto válido para procesar.",
        },
        { status: 400 }
      );
    }

    // Obtener URL del backend y password desde variables de entorno
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      console.error("[CHAT PROXY] NEXT_PUBLIC_API_URL no configurado");
      return NextResponse.json(
        {
          error: "Configuración del servidor incompleta",
          reply: "Lo siento, el servicio no está configurado correctamente.",
        },
        { status: 500 }
      );
    }

    if (!adminPassword) {
      console.error("[CHAT PROXY] ADMIN_PASSWORD no configurado");
      return NextResponse.json(
        {
          error: "Configuración de seguridad incompleta",
          reply: "Lo siento, el servicio no está configurado correctamente.",
        },
        { status: 500 }
      );
    }

    // Llamar al backend con autenticación
    const response = await fetch(`${backendUrl}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword, // Usar header personalizado
        // También enviar Authorization Bearer por compatibilidad
        Authorization: `Bearer ${adminPassword}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || "Error del servidor",
          reply: errorData.reply || "Lo siento, hubo un error al procesar tu solicitud.",
          actions: errorData.actions,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[CHAT PROXY] Error:", error);
    return NextResponse.json(
      {
        error: "Error procesando la solicitud",
        reply: "Lo siento, hubo un error inesperado. Por favor, intenta de nuevo.",
        actions: [
          {
            type: "error",
            summary: error.message || "Error desconocido",
          },
        ],
      },
      { status: 500 }
    );
  }
}
