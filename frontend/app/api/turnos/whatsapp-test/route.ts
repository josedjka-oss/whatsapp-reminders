import { NextRequest, NextResponse } from "next/server";

type TaskKind = "ASEO_RECEPCION" | "COCINA_RECEPCION" | "SACAR_BASURA";

const VALID_TASKS = new Set<TaskKind>([
  "ASEO_RECEPCION",
  "COCINA_RECEPCION",
  "SACAR_BASURA",
]);

/**
 * Proxy seguro: la planilla envía phone + task + date; Vercel añade el secreto y llama a Render.
 * POST /api/turnos/whatsapp-test
 * Body: { phone: "+57..." | "whatsapp:+57...", task, date: "yyyy-MM-dd" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = String(body.phone ?? body.to ?? "").trim();
    const task = String(body.task ?? body.tipo ?? "").trim() as TaskKind;
    const date = String(body.date ?? body.fecha ?? "").trim();

    if (!rawPhone) {
      return NextResponse.json({ ok: false, error: "phone requerido" }, { status: 400 });
    }
    if (!VALID_TASKS.has(task)) {
      return NextResponse.json(
        { ok: false, error: "task inválida (ASEO_RECEPCION | COCINA_RECEPCION | SACAR_BASURA)" },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "date debe ser yyyy-MM-dd" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    const secret =
      process.env.INTEGRATION_FIREBASE_SECRET?.trim()
      || process.env.ADMIN_PASSWORD?.trim();

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
            "Falta INTEGRATION_FIREBASE_SECRET o ADMIN_PASSWORD en Vercel (Settings → Environment Variables). Copia el mismo valor que en Render.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/integration/firebase/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ phone: rawPhone, task, date }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: data.error || `Render respondió ${response.status}`, render: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, task, phone: rawPhone, date, render: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error enviando prueba WhatsApp";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
