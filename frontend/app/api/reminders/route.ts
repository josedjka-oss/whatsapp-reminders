import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint para /api/reminders
 * GET: Obtiene lista de recordatorios
 * POST: Crea un nuevo recordatorio
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const scheduleType = searchParams.get("scheduleType");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      console.error("[REMINDERS PROXY] NEXT_PUBLIC_API_URL no configurado");
      return NextResponse.json(
        {
          error: "Configuración del servidor incompleta",
        },
        { status: 500 }
      );
    }

    // Construir query params
    const params = new URLSearchParams();
    if (isActive !== null) params.append("isActive", isActive);
    if (scheduleType) params.append("scheduleType", scheduleType);

    const queryString = params.toString();
    const url = `${backendUrl}/api/reminders${queryString ? `?${queryString}` : ""}`;

    // Preparar headers (solo incluir auth si ADMIN_PASSWORD está configurado)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminPassword) {
      headers["x-admin-password"] = adminPassword;
      headers["Authorization"] = `Bearer ${adminPassword}`;
    }

    console.log("[REMINDERS PROXY GET] Llamando a:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[REMINDERS PROXY GET] Error del backend:", response.status, errorData);
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
    console.error("[REMINDERS PROXY GET] Error:", error);
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
      console.error("[REMINDERS PROXY] NEXT_PUBLIC_API_URL no configurado");
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

    console.log("[REMINDERS PROXY] Llamando a:", `${backendUrl}/api/reminders`);

    const response = await fetch(`${backendUrl}/api/reminders`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[REMINDERS PROXY] Error del backend:", response.status, errorData);
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
    console.error("[REMINDERS PROXY] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Error procesando la solicitud",
      },
      { status: 500 }
    );
  }
}
