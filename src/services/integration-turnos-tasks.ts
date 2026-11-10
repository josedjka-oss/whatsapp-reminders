import { prisma } from "../db";
import { EMPLOYEE_NAMES } from "./turnos-tareas/constants";
import { loadEmployeePhone } from "./turnos-tareas/firestore";

export type IntegrationTaskKind =
  | "ASEO_RECEPCION"
  | "COCINA_RECEPCION"
  | "SACAR_BASURA"
  | "ASEO_BANO";

/** Mensajeros v11 (4) — pueden recibir ASEO_BANO y COCINA_RECEPCION; no ASEO_RECEPCION. */
export const MESSENGER_EMP_IDS = [
  "harold_paipa",
  "cristian_forero",
  "dilan_toro",
  "david_santiago",
] as const;

export const INTEGRATION_TASK_LABELS: Record<IntegrationTaskKind, string> = {
  ASEO_RECEPCION: "Aseo Recepción",
  COCINA_RECEPCION: "Aseo Cocina-Pasillo",
  SACAR_BASURA: "Sacar Basura",
  ASEO_BANO: "Aseo Baño",
};

const normalizeNameKey = (raw: string): string =>
  raw
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const empIdToDisplayKey = (empId: string): string =>
  normalizeNameKey(empId.replace(/_/g, " "));

export const isMessengerEmpId = (empId: string): boolean => {
  const key = empId.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (MESSENGER_EMP_IDS as readonly string[]).includes(key);
};

/**
 * Recepción: mensajeros excluidos. Baño y cocina: permitidos (v11 asigna a mensajeros).
 */
export const isMessengerAllowedForTask = (
  task: IntegrationTaskKind,
  empId: string
): boolean => {
  if (!isMessengerEmpId(empId)) return true;
  if (task === "ASEO_RECEPCION") return false;
  return true;
};

export const messengerBlockReason = (task: IntegrationTaskKind): string =>
  `Los mensajeros no reciben WhatsApp de ${INTEGRATION_TASK_LABELS[task]} por este canal.`;

export const normalizeIntegrationTaskKind = (
  raw: unknown
): IntegrationTaskKind | null => {
  const s = String(raw ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[\s.-]+/g, "_");

  if (
    s === "ASEO_BANO" ||
    s === "BANO" ||
    s === "ASEO_BANOS" ||
    s === "ASEO_BANIO"
  ) {
    return "ASEO_BANO";
  }
  if (s === "ASEO_RECEPCION" || s === "ASEO" || s === "RECEPCION") {
    return "ASEO_RECEPCION";
  }
  if (
    s === "COCINA_RECEPCION" ||
    s === "COCINA" ||
    s === "COCINA_PASILLO" ||
    s === "ASEO_COCINA_PASILLO"
  ) {
    return "COCINA_RECEPCION";
  }
  if (s === "SACAR_BASURA" || s === "BASURA") {
    return "SACAR_BASURA";
  }

  return null;
};

export const resolveCanonicalEmpId = (raw: string): string =>
  raw.trim().toLowerCase().replace(/[\s-]+/g, "_");

const firstNameFromDisplay = (displayName: string): string => {
  const word = displayName.trim().split(/\s+/)[0] || displayName;
  if (!word) return displayName;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const buildAseoBanoReminderText = (displayName: string): string => {
  const nombre = firstNameFromDisplay(displayName);
  return [
    `Hola ${nombre} 👋`,
    "Hoy te toca el Aseo Baño 🚽🧼",
    "Por favor realízalo al inicio de tu turno y confirma cuando quede listo. ¡Gracias!",
  ].join("\n");
};

const findNominaEmployeeByEmpId = async (empId: string) => {
  const key = empIdToDisplayKey(empId);
  const employees = await prisma.nominaEmployee.findMany({
    where: { isActive: true },
    select: { name: true, phone: true },
  });
  return (
    employees.find((e) => normalizeNameKey(e.name) === key) ??
    employees.find((e) => normalizeNameKey(e.name).startsWith(`${key.split(" ")[0]} `))
  );
};

export const resolveIntegrationEmployee = async (
  rawEmpId: string
): Promise<{
  empId: string;
  displayName: string;
  phone: string | null;
  phoneSource: "firebase" | "nomina" | null;
}> => {
  const empId = resolveCanonicalEmpId(rawEmpId);
  const fromMap = EMPLOYEE_NAMES[empId];

  let displayName = fromMap || empIdToDisplayKey(empId);
  let phone: string | null = await loadEmployeePhone(empId);
  let phoneSource: "firebase" | "nomina" | null = phone ? "firebase" : null;

  if (!phone) {
    const nomina = await findNominaEmployeeByEmpId(empId);
    if (nomina?.phone) {
      phone = nomina.phone;
      phoneSource = "nomina";
      if (nomina.name) displayName = nomina.name;
    }
  } else if (!fromMap) {
    const nomina = await findNominaEmployeeByEmpId(empId);
    if (nomina?.name) displayName = nomina.name;
  }

  return { empId, displayName, phone, phoneSource };
};
