import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint para /api/contacts
 * GET: Obtiene lista de contactos
 * POST: Crea un nuevo contacto
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      console.error("[CONTACTS PROXY] NEXT_PUBLIC_API_URL no configurado");
      return NextResponse.json(
        {
          error: "Configuración del servidor incompleta",
        },
        { status: 500 }
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

    console.log("[CONTACTS PROXY GET] Llamando a:", `${backendUrl}/api/contacts`);

    const response = await fetch(`${backendUrl}/api/contacts`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[CONTACTS PROXY GET] Error del backend:", response.status, errorData);
      return NextResponse.json(
        {
          error: errorData.error || `Error del servidor (${response.status})`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[CONTACTS PROXY GET] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Error procesando la solicitud",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      console.error("[CONTACTS PROXY] NEXT_PUBLIC_API_URL no configurado");
      return NextResponse.json(
        {
          error: "Configuración del servidor incompleta",
        },
        { status: 500 }
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

    console.log("[CONTACTS PROXY] Llamando a:", `${backendUrl}/api/contacts`);

    const response = await fetch(`${backendUrl}/api/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[CONTACTS PROXY] Error del backend:", response.status, errorData);
      return NextResponse.json(
        {
          error: errorData.error || `Error del servidor (${response.status})`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[CONTACTS PROXY] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Error procesando la solicitud",
      },
      { status: 500 }
    );
  }
}
