import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = (): string | null =>
  process.env.NEXT_PUBLIC_API_URL?.trim() || null;

const buildAdminHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    headers["x-admin-password"] = adminPassword;
    headers["Authorization"] = `Bearer ${adminPassword}`;
  }
  return headers;
};

const proxyNomina = async (
  request: NextRequest,
  pathSegments: string[] | undefined,
  method: string
): Promise<NextResponse> => {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL no configurado" },
      { status: 500 }
    );
  }

  const subPath = pathSegments?.join("/") ?? "";
  const url = new URL(request.url);
  const target = `${backendUrl}/api/nomina/${subPath}${url.search}`;

  const isPublic = subPath.startsWith("public/");

  const init: RequestInit = {
    method,
    headers: isPublic ? { "Content-Type": "application/json" } : buildAdminHeaders(),
  };

  if (method !== "GET" && method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }

  const response = await fetch(target, init);
  const text = await response.text();

  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: response.status });
  } catch {
    return new NextResponse(text, { status: response.status });
  }
};

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyNomina(request, path, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyNomina(request, path, "POST");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyNomina(request, path, "PATCH");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyNomina(request, path, "DELETE");
}
