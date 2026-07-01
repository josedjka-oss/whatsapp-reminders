export type IntegrationTaskKind =
  | "ASEO_RECEPCION"
  | "COCINA_RECEPCION"
  | "SACAR_BASURA";

export const INTEGRATION_TASK_LABELS: Record<IntegrationTaskKind, string> = {
  ASEO_RECEPCION: "Aseo Recepción",
  COCINA_RECEPCION: "Aseo Cocina-Pasillo",
  SACAR_BASURA: "Sacar Basura",
};

export const INTEGRATION_TASK_ORDER: IntegrationTaskKind[] = [
  "ASEO_RECEPCION",
  "COCINA_RECEPCION",
  "SACAR_BASURA",
];

const normalizeBody = (body: string): string =>
  body
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Detecta mensajes generados por POST /api/integration/firebase/whatsapp */
export const detectIntegrationTaskKind = (
  body: string
): IntegrationTaskKind | null => {
  const n = normalizeBody(body);

  if (/^aseo recepcion\s*[-–—]/.test(n) || n.startsWith("aseo recepcion")) {
    return "ASEO_RECEPCION";
  }

  if (
    /^aseo cocina[- ]pasillo\s*[-–—]/.test(n) ||
    n.startsWith("aseo cocina-pasillo") ||
    n.startsWith("aseo cocina pasillo")
  ) {
    return "COCINA_RECEPCION";
  }

  if (/^sacar basura\s*[-–—]/.test(n) || n.startsWith("sacar basura")) {
    return "SACAR_BASURA";
  }

  return null;
};
