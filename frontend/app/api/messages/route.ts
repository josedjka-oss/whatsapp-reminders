import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint base para /api/messages
 * Este archivo es necesario para que Next.js reconozca la ruta /api/messages
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Use /api/messages/sent-by-date para obtener mensajes por fecha",
    },
    { status: 200 }
  );
}
