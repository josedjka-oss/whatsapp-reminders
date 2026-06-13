"use client";

export type ReciboDiscountLine = {
  id?: string;
  label: string;
  amount: number;
  source?: string;
  photoUrl?: string | null;
};

export type ReciboPhoto = {
  label: string;
  amount: number;
  photoUrl: string;
  kind?: string;
};

export type ReciboDisplayData = {
  employeeName: string;
  periodLabel?: string;
  bonusFrequency?: string;
  grossOvertime?: number;
  netOvertime?: number;
  netTotal: number;
  salarySection?: {
    grossSalary: number;
    grossTransport: number;
    grossTotal: number;
    discountLines: ReciboDiscountLine[];
    totalDiscounts: number;
    net: number;
  };
  bonusSection?: {
    grossBonus: number;
    discountLines: ReciboDiscountLine[];
    totalDiscounts: number;
    net: number;
  };
  photoAttachments?: ReciboPhoto[];
  overtime?: {
    daytimeHours: number;
    overtimeUnitRate?: number;
    monthlyHoursBase?: number;
    totalMonthOvertimePay?: number;
  };
  grossSalary?: number;
  grossTransport?: number;
  grossBonus?: number;
  salaryDiscounts?: number;
  bonusDiscounts?: number;
  netSalaryWithTransport?: number;
  netBonus?: number;
  breakdown?: {
    periodLabel?: string;
    bonusFrequency?: string;
    salarySection?: ReciboDisplayData["salarySection"];
    bonusSection?: ReciboDisplayData["bonusSection"];
    photoAttachments?: ReciboPhoto[];
    recurringDeductions?: { label: string; amount: number; appliesTo: string }[];
    vales?: {
      holderName: string;
      amount: number;
      appliesTo: string;
      photoUrl?: string | null;
      kind?: string;
    }[];
    overtime?: ReciboDisplayData["overtime"];
    grossSalaryTransportRounded?: number;
    grossSalaryTransportRaw?: number;
  };
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const buildLegacySections = (recibo: ReciboDisplayData) => {
  const b = recibo.breakdown;
  if (b?.salarySection && b?.bonusSection) {
    return {
      periodLabel: b.periodLabel ?? recibo.periodLabel,
      bonusFrequency: b.bonusFrequency ?? recibo.bonusFrequency,
      salarySection: b.salarySection,
      bonusSection: b.bonusSection,
      photoAttachments: b.photoAttachments ?? recibo.photoAttachments ?? [],
      overtime: b.overtime ?? recibo.overtime,
      netTotal: recibo.netTotal,
      grossOvertime: recibo.grossOvertime ?? 0,
      netOvertime: recibo.netOvertime ?? 0,
    };
  }

  const grossSalary = recibo.grossSalary ?? 0;
  const grossTransport = recibo.grossTransport ?? 0;
  const grossBonus = recibo.grossBonus ?? 0;
  const rawTotal = grossSalary + grossTransport;
  const grossTotal =
    b?.grossSalaryTransportRounded ?? Math.round(rawTotal / 1000) * 1000;

  const salaryLines: ReciboDiscountLine[] = [];
  const bonusLines: ReciboDiscountLine[] = [];

  for (const d of b?.recurringDeductions ?? []) {
    const line = { label: d.label, amount: d.amount };
    if (d.appliesTo === "BONUS") bonusLines.push(line);
    else salaryLines.push(line);
  }
  for (const v of b?.vales ?? []) {
    const line = {
      label: v.holderName,
      amount: v.amount,
      photoUrl: v.photoUrl,
    };
    if (v.appliesTo === "BONUS") bonusLines.push(line);
    else salaryLines.push(line);
  }

  const salaryDiscounts =
    recibo.salaryDiscounts ?? salaryLines.reduce((a, l) => a + l.amount, 0);
  const bonusDiscounts =
    recibo.bonusDiscounts ?? bonusLines.reduce((a, l) => a + l.amount, 0);

  const photos: ReciboPhoto[] =
    b?.photoAttachments ??
    (b?.vales ?? [])
      .filter((v) => v.photoUrl)
      .map((v) => ({
        label: v.holderName,
        amount: v.amount,
        photoUrl: v.photoUrl!,
        kind: v.kind,
      }));

  return {
    periodLabel: b?.periodLabel ?? recibo.periodLabel,
    bonusFrequency: b?.bonusFrequency ?? recibo.bonusFrequency,
    salarySection: {
      grossSalary,
      grossTransport,
      grossTotal,
      discountLines: salaryLines,
      totalDiscounts: salaryDiscounts,
      net: recibo.netSalaryWithTransport ?? Math.max(0, grossTotal - salaryDiscounts),
    },
    bonusSection: {
      grossBonus,
      discountLines: bonusLines,
      totalDiscounts: bonusDiscounts,
      net: recibo.netBonus ?? Math.max(0, grossBonus - bonusDiscounts),
    },
    photoAttachments: photos,
    overtime: b?.overtime ?? recibo.overtime,
    netTotal: recibo.netTotal,
    grossOvertime: recibo.grossOvertime ?? 0,
    netOvertime: recibo.netOvertime ?? 0,
  };
};

type NominaReciboDisplayProps = {
  recibo: ReciboDisplayData;
  compact?: boolean;
};

export const NominaReciboDisplay = ({ recibo, compact = false }: NominaReciboDisplayProps) => {
  const data = buildLegacySections(recibo);
  const { salarySection, bonusSection, photoAttachments, overtime } = data;

  return (
    <div className={compact ? "space-y-4" : "p-6 space-y-5"}>
      {!compact && (
        <div className="bg-indigo-700 text-white px-6 py-6 text-center rounded-t-2xl -mx-6 -mt-6 mb-2">
          <p className="text-sm opacity-90">Recibo de nómina</p>
          <h1 className="text-xl font-bold mt-1">{recibo.employeeName}</h1>
          {data.periodLabel && (
            <p className="text-indigo-100 text-sm mt-1">{data.periodLabel}</p>
          )}
          {data.bonusFrequency === "MENSUAL" && (
            <p className="text-xs text-indigo-200 mt-1">Bonificación: pago mensual</p>
          )}
        </div>
      )}

      <section>
        <Row label="Salario" value={formatCop(salarySection.grossSalary)} />
        <Row label="Auxilio de transporte" value={formatCop(salarySection.grossTransport)} />
        <Row label="Total" value={formatCop(salarySection.grossTotal)} bold />
      </section>

      {salarySection.discountLines.length > 0 && (
        <section>
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">Descuentos de salario</h3>
          {salarySection.discountLines.map((line, i) => (
            <Row
              key={line.id ?? `s-${i}`}
              label={line.label}
              value={`− ${formatCop(line.amount)}`}
              muted
            />
          ))}
          <Row
            label="Total descuentos salario"
            value={`− ${formatCop(salarySection.totalDiscounts)}`}
            bold
          />
        </section>
      )}

      <section className="border-t pt-3">
        <Row label="Total salario" value={formatCop(salarySection.net)} bold highlight />
      </section>

      <section className="border-t pt-3">
        <Row label="Total bonificación" value={formatCop(bonusSection.grossBonus)} bold />
        {bonusSection.discountLines.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-800 mb-2 mt-3 text-sm">
              Descuentos de bonificación
            </h3>
            {bonusSection.discountLines.map((line, i) => (
              <Row
                key={line.id ?? `b-${i}`}
                label={line.label}
                value={`− ${formatCop(line.amount)}`}
                muted
              />
            ))}
            <Row
              label="Total descuentos bonificación"
              value={`− ${formatCop(bonusSection.totalDiscounts)}`}
              bold
            />
          </>
        )}
        <Row
          label="Total bonificación neta"
          value={formatCop(bonusSection.net)}
          bold
          highlight
        />
      </section>

      {(data.grossOvertime ?? 0) > 0 && (
        <section className="border-t pt-3">
          <Row
            label={`Horas extra (${overtime?.daytimeHours ?? 0} h)`}
            value={formatCop(data.netOvertime ?? data.grossOvertime ?? 0)}
          />
        </section>
      )}

      <section className="border-t pt-4">
        <div className="flex justify-between text-lg font-bold text-indigo-800">
          <span>Total a pagar</span>
          <span>{formatCop(data.netTotal)}</span>
        </div>
      </section>

      {photoAttachments.length > 0 && (
        <section className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Fotos</h3>
          <div className="grid grid-cols-1 gap-3">
            {photoAttachments.map((p, i) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-2">
                  {p.label} — {formatCop(p.amount)}
                </p>
                <a href={p.photoUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={p.photoUrl}
                    alt={p.label}
                    className="w-full rounded max-h-56 object-contain bg-gray-50"
                  />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const Row = ({
  label,
  value,
  muted = false,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) => (
  <div
    className={`flex justify-between py-1 text-sm ${
      highlight
        ? "text-indigo-900 font-semibold text-base"
        : bold
          ? "font-semibold text-gray-900"
          : muted
            ? "text-gray-600"
            : "text-gray-800"
    }`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
