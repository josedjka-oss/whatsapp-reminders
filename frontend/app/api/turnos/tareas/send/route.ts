import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type TaskKind = "ASEO_RECEPCION" | "COCINA_RECEPCION" | "SACAR_BASURA";

const VALID_TASKS = new Set<TaskKind>([
  "ASEO_RECEPCION",
  "COCINA_RECEPCION",
  "SACAR_BASURA",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = String(body.date ?? body.fecha ?? "").trim();
    const task = String(body.task ?? body.tipo ?? "").trim() as TaskKind;
    const force = Boolean(body.force);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    const secret =
      process.env.INTEGRATION_FIREBASE_SECRET?.trim() ||
      process.env.ADMIN_PASSWORD?.trim();

    if (!backendUrl) {
      return NextResponse.json(
        { ok: false, error: "NEXT_PUBLIC_API_URL no configurado" },
        { status: 500 }
      );
    }
    if (!secret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Falta INTEGRATION_FIREBASE_SECRET o ADMIN_PASSWORD en Vercel",
        },
        { status: 500 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { ok: false, error: "date debe ser yyyy-MM-dd" },
        { status: 400 }
      );
    }
    if (!VALID_TASKS.has(task)) {
      return NextResponse.json(
        {
          ok: false,
          error: "task inválida (ASEO_RECEPCION | COCINA_RECEPCION | SACAR_BASURA)",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${backendUrl}/api/turnos/tareas/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ date, task, force }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok && !data.skipped) {
      return NextResponse.json(
        { ok: false, error: data.error || data.reason || `Render ${response.status}`, render: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error en proxy";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
