export type QuincenaRef = { year: number; month: number; half: 1 | 2 };

export const advanceQuincena = (
  year: number,
  month: number,
  half: 1 | 2
): QuincenaRef => {
  if (half === 1) {
    return { year, month, half: 2 };
  }
  if (month === 12) {
    return { year: year + 1, month: 1, half: 1 };
  }
  return { year, month: month + 1, half: 1 };
};

export const generateQuincenaSequence = (
  startYear: number,
  startMonth: number,
  startHalf: 1 | 2,
  count: number
): QuincenaRef[] => {
  const sequence: QuincenaRef[] = [];
  let y = startYear;
  let m = startMonth;
  let h = startHalf;

  for (let i = 0; i < count; i++) {
    sequence.push({ year: y, month: m, half: h });
    const next = advanceQuincena(y, m, h);
    y = next.year;
    m = next.month;
    h = next.half;
  }

  return sequence;
};

/** Reparte total en N cuotas; el residuo va en la última cuota. */
export const splitPrestamoInstallments = (
  totalAmount: number,
  installments: number
): number[] => {
  if (installments <= 0) return [];
  const base = Math.floor(totalAmount / installments);
  const amounts = Array.from({ length: installments }, () => base);
  const remainder = totalAmount - base * installments;
  if (remainder > 0 && amounts.length > 0) {
    amounts[amounts.length - 1] += remainder;
  }
  return amounts;
};

export const formatQuincenaLabel = (year: number, month: number, half: number): string =>
  `${year}-${String(month).padStart(2, "0")} Q${half}`;
