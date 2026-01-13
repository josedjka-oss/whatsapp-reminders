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

    console.log("[CHAT PROXY] Configuración:", {
      hasBackendUrl: !!backendUrl,
      backendUrl: backendUrl?.substring(0, 30) + "...",
      hasAdminPassword: !!adminPassword,
    });

    if (!backendUrl) {
      console.error("[CHAT PROXY] NEXT_PUBLIC_API_URL no configurado");
      return NextResponse.json(
        {
          error: "Configuración del servidor incompleta",
          reply: "Lo siento, NEXT_PUBLIC_API_URL no está configurado. Por favor, crea un archivo .env.local con NEXT_PUBLIC_API_URL=https://whatsapp-reminders-mzex.onrender.com",
        },
        { status: 500 }
      );
    }

    // ADMIN_PASSWORD es opcional: si no existe, no se envía autenticación
    // Esto permite modo "solo personal" sin autenticación

    // Preparar headers (solo incluir auth si ADMIN_PASSWORD está configurado)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminPassword) {
      headers["x-admin-password"] = adminPassword;
      headers["Authorization"] = `Bearer ${adminPassword}`;
    }

    // Llamar al backend (con o sin autenticación según configuración)
    console.log("[CHAT PROXY] Llamando a:", `${backendUrl}/api/ai`);
    console.log("[CHAT PROXY] Headers:", Object.keys(headers));
    
    const response = await fetch(`${backendUrl}/api/ai`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[CHAT PROXY] Error del backend:", response.status, errorData);
      return NextResponse.json(
        {
          error: errorData.error || `Error del servidor (${response.status})`,
          reply: errorData.reply || errorData.message || `Lo siento, hubo un error al procesar tu solicitud (${response.status}).`,
          actions: errorData.actions,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[CHAT PROXY] Error:", error);
    console.error("[CHAT PROXY] Stack:", error.stack);
    return NextResponse.json(
      {
        error: "Error procesando la solicitud",
        reply: `Lo siento, hubo un error inesperado: ${error.message || "Error desconocido"}. Por favor, verifica la configuración del servidor.`,
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
