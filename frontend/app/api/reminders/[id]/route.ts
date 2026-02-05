import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminPassword) {
      headers["x-admin-password"] = adminPassword;
      headers["Authorization"] = `Bearer ${adminPassword}`;
    }

    const response = await fetch(`${backendUrl}/api/reminders/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || `Error del servidor (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (adminPassword) {
      headers["x-admin-password"] = adminPassword;
      headers["Authorization"] = `Bearer ${adminPassword}`;
    }

    const response = await fetch(`${backendUrl}/api/reminders/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || `Error del servidor (${response.status})` },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}
