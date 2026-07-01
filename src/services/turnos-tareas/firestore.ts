import { getFirestore } from "firebase-admin/firestore";
import { initFirestore } from "../v8-disponibilidad/firestore-planilla";
import { PLANILLA_COLLECTION } from "../v8-disponibilidad/constants";
import { PHONES_COLLECTION } from "./constants";
import type { PlanillaState } from "./types";

export const loadPlanillaMonthFull = async (
  monthKey: string
): Promise<PlanillaState | null> => {
  if (!initFirestore()) return null;

  try {
    const doc = await getFirestore()
      .collection(PLANILLA_COLLECTION)
      .doc(monthKey)
      .get();

    if (!doc.exists) {
      console.warn(`[TURNOS-TAREAS] Planilla ${monthKey} no encontrada`);
      return null;
    }

    const data = doc.data() as Record<string, unknown>;
    return {
      cells: (data.cells as PlanillaState["cells"]) || {},
      lunchOverrides: (data.lunchOverrides as PlanillaState["lunchOverrides"]) || {},
      aseoOverrides: (data.aseoOverrides as PlanillaState["aseoOverrides"]) || {},
      cocinaOverrides: (data.cocinaOverrides as PlanillaState["cocinaOverrides"]) || {},
      basuraOverrides: (data.basuraOverrides as PlanillaState["basuraOverrides"]) || {},
      trioAusentePorDia: (data.trioAusentePorDia as PlanillaState["trioAusentePorDia"]) || {},
      flagsDiaMarcadoNoLab:
        (data.flagsDiaMarcadoNoLab as PlanillaState["flagsDiaMarcadoNoLab"]) || {},
      crossMonthCells: (data.crossMonthCells as PlanillaState["crossMonthCells"]) || {},
    };
  } catch (error) {
    console.error(`[TURNOS-TAREAS] Error leyendo planilla ${monthKey}:`, error);
    return null;
  }
};

export const loadEmployeePhone = async (empId: string): Promise<string | null> => {
  if (!initFirestore()) return null;

  try {
    const doc = await getFirestore()
      .collection(PHONES_COLLECTION)
      .doc(empId)
      .get();
    if (!doc.exists) return null;
    const phone = String(doc.data()?.phone ?? "").trim();
    return phone || null;
  } catch (error) {
    console.error(`[TURNOS-TAREAS] Error leyendo teléfono ${empId}:`, error);
    return null;
  }
};
