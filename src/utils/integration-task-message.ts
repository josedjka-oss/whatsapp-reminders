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

/** Detecta mensajes generados por POST /api/integration/firebase/whatsapp */
export const detectIntegrationTaskKind = (
  body: string
): IntegrationTaskKind | null => {
  const normalized = body.trim();

  if (
    normalized.startsWith(`${INTEGRATION_TASK_LABELS.ASEO_RECEPCION} —`) ||
    normalized.startsWith(`${INTEGRATION_TASK_LABELS.ASEO_RECEPCION} -`)
  ) {
    return "ASEO_RECEPCION";
  }

  if (
    normalized.startsWith(`${INTEGRATION_TASK_LABELS.COCINA_RECEPCION} —`) ||
    normalized.startsWith(`${INTEGRATION_TASK_LABELS.COCINA_RECEPCION} -`)
  ) {
    return "COCINA_RECEPCION";
  }

  if (
    normalized.startsWith(`${INTEGRATION_TASK_LABELS.SACAR_BASURA} —`) ||
    normalized.startsWith(`${INTEGRATION_TASK_LABELS.SACAR_BASURA} -`)
  ) {
    return "SACAR_BASURA";
  }

  return null;
};
