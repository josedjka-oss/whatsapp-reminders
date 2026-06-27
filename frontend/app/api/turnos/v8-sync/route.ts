import { NextRequest, NextResponse } from "next/server";

const parseFecha = (raw: string): string | null => {
  const s = String(raw || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
};

const getBackendConfig = (): { backendUrl: string; secret: string } | NextResponse => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const secret =
    process.env.INTEGRATION_FIREBASE_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();

  if (!backendUrl) {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_API_URL no configurado en Vercel" },
      { status: 500 }
    );
  }
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Falta INTEGRATION_FIREBASE_SECRET o ADMIN_PASSWORD en Vercel.",
      },
      { status: 500 }
    );
  }

  return { backendUrl, secret };
};

/** GET — preview eventos del día (planilla-dia) */
export async function GET(request: NextRequest) {
  try {
    const cfg = getBackendConfig();
    if (cfg instanceof NextResponse) return cfg;

    const fecha =
      parseFecha(request.nextUrl.searchParams.get("fecha") || "") ||
      new Date().toISOString().slice(0, 10);

    const response = await fetch(
      `${cfg.backendUrl}/api/v8/planilla-dia?fecha=${encodeURIComponent(fecha)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${cfg.secret}` },
      }
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error V8 planilla-dia";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** POST — envía programación del día a V8 (sync-dia) */
export async function POST(request: NextRequest) {
  try {
    const cfg = getBackendConfig();
    if (cfg instanceof NextResponse) return cfg;

    const body = await request.json().catch(() => ({}));
    const fecha =
      parseFecha(String(body.fecha ?? request.nextUrl.searchParams.get("fecha") ?? "")) ||
      new Date().toISOString().slice(0, 10);

    const response = await fetch(
      `${cfg.backendUrl}/api/v8/sync-dia?fecha=${encodeURIComponent(fecha)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fecha }),
      }
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error V8 sync-dia";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
