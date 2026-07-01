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

/** Detecta mensajes de integración aunque el backend no envíe taskKind */
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

export const enrichMessageTaskKind = <T extends { body: string; taskKind?: IntegrationTaskKind | null }>(
  message: T
): T & { taskKind: IntegrationTaskKind | null; taskLabel: string | null } => {
  const taskKind = message.taskKind ?? detectIntegrationTaskKind(message.body);
  return {
    ...message,
    taskKind,
    taskLabel: taskKind ? INTEGRATION_TASK_LABELS[taskKind] : null,
  };
};

export const partitionMessagesByTask = <
  T extends { body: string; taskKind?: IntegrationTaskKind | null }
>(
  messages: T[]
): {
  taskMessages: Record<IntegrationTaskKind, T[]>;
  otherMessages: T[];
  taskCount: number;
} => {
  const taskMessages: Record<IntegrationTaskKind, T[]> = {
    ASEO_RECEPCION: [],
    COCINA_RECEPCION: [],
    SACAR_BASURA: [],
  };
  const otherMessages: T[] = [];

  for (const raw of messages) {
    const enriched = enrichMessageTaskKind(raw);
    if (enriched.taskKind) {
      taskMessages[enriched.taskKind].push({ ...raw, taskKind: enriched.taskKind });
    } else {
      otherMessages.push(raw);
    }
  }

  const taskCount = INTEGRATION_TASK_ORDER.reduce(
    (n, k) => n + taskMessages[k].length,
    0
  );

  return { taskMessages, otherMessages, taskCount };
};
