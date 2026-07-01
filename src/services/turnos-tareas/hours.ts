import { AM_NORMAL, AM_SABADO } from "./constants";
import type { PlanillaCell } from "./types";

export const normAm = (cell: PlanillaCell | null | undefined): string => {
  const v = String(cell?.am ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");
  if (v === "0" || v === "00") return "0";
  if (v === "930" || v === "9:30" || v === "09:30" || v === "9.5") return AM_SABADO;
  if (v === "09" || v === "9") return "9";
  if (v === "010" || v === "10") return "10";
  return String(cell?.am ?? "").trim();
};

export const normPm = (cell: PlanillaCell | null | undefined): string => {
  const v = String(cell?.pm ?? "").trim();
  if (v === "05" || v === "5") return "5";
  if (v === "06" || v === "6") return "6";
  return v;
};

export const isEntradaAseoElegible = (amVal: string | undefined, esSabado: boolean): boolean => {
  const am = normAm({ am: amVal });
  return esSabado ? am === AM_SABADO : am === AM_NORMAL;
};

export const puedeSacarBasura = (pmVal: string | undefined): boolean =>
  normPm({ pm: pmVal }) !== "5";
