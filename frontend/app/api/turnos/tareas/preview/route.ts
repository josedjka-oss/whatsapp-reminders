import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!backendUrl) {
      return NextResponse.json(
        { ok: false, error: "NEXT_PUBLIC_API_URL no configurado" },
        { status: 500 }
      );
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { ok: false, error: "date debe ser yyyy-MM-dd" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${backendUrl}/api/turnos/tareas/preview?date=${date}`,
      { cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: data.error || `Render ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error en proxy";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
