"use client";

import type { KeyboardEvent } from "react";

type ValeLine = {
  holderName: string;
  amount: number;
  appliesTo: string;
  photoUrl?: string | null;
  kind?: string;
};

export type SlipPreviewData = {
  id: string;
  employeeId: string;
  publicUrl: string;
  employee: { name: string; phone: string | null };
  grossSalary: number;
  grossTransport: number;
  grossBonus: number;
  grossOvertime: number;
  salaryDiscounts: number;
  bonusDiscounts: number;
  netSalary: number;
  netTransport: number;
  netBonus: number;
  netOvertime: number;
  netTotal: number;
  breakdown: {
    periodLabel?: string;
    recurringDeductions?: { label: string; amount: number; appliesTo: string }[];
    vales?: ValeLine[];
    overtime?: {
      daytimeHours: number;
      overtimeUnitRate: number;
    };
  };
  whatsappSentAt: string | null;
};

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

type NominaSlipPreviewModalProps = {
  slip: SlipPreviewData | null;
  open: boolean;
  onClose: () => void;
  onSendWhatsApp?: () => void;
  sending?: boolean;
  notice?: string | null;
  canSend?: boolean;
};

export const NominaSlipPreviewModal = ({
  slip,
  open,
  onClose,
  onSendWhatsApp,
  sending = false,
  notice = null,
  canSend = true,
}: NominaSlipPreviewModalProps) => {
  if (!open || !slip) return null;

  const vales = slip.breakdown?.vales ?? [];
  const deductions = slip.breakdown?.recurringDeductions ?? [];
  const ot = slip.breakdown?.overtime;
  const wasSent = Boolean(slip.whatsappSentAt);

  const handleBackdropKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-preview-title"
      onClick={onClose}
      onKeyDown={handleBackdropKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-indigo-700 text-white px-6 py-5 text-center sticky top-0">
          <p className="text-sm opacity-90">Vista previa del recibo</p>
          <h2 id="slip-preview-title" className="text-xl font-bold mt-1">
            {slip.employee.name}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            {slip.breakdown?.periodLabel ?? ""}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {notice && (
            <div
              className={`text-sm rounded-lg px-3 py-2 ${
                wasSent
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {notice}
            </div>
          )}

          {!slip.employee.phone && canSend && (
            <div className="text-sm rounded-lg px-3 py-2 bg-red-50 text-red-800 border border-red-200">
              Este empleado no tiene teléfono WhatsApp configurado. Agrega el número en Empleados.
            </div>
          )}

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Ingresos (esta quincena)</h3>
            <PreviewRow label="Salario" value={formatCop(slip.grossSalary)} />
            <PreviewRow label="Auxilio transporte" value={formatCop(slip.grossTransport)} />
            <PreviewRow label="Bonificación" value={formatCop(slip.grossBonus)} />
            {slip.grossOvertime > 0 && (
              <PreviewRow
                label={`Horas extra (${ot?.daytimeHours ?? 0} h)`}
                value={formatCop(slip.grossOvertime)}
              />
            )}
          </section>

          {(deductions.length > 0 || vales.length > 0) && (
            <section>
              <h3 className="font-semibold text-gray-800 mb-2">Descuentos</h3>
              {deductions.map((d, i) => (
                <PreviewRow
                  key={`d-${i}`}
                  label={d.label}
                  value={`− ${formatCop(d.amount)}`}
                  muted
                />
              ))}
              {vales.map((v, i) => (
                <PreviewRow
                  key={`v-${i}`}
                  label={`${v.kind === "PRESTAMO" ? "Préstamo" : "Vale"}: ${v.holderName}`}
                  value={`− ${formatCop(v.amount)}`}
                  muted
                />
              ))}
            </section>
          )}

          <section className="border-t pt-4">
            <PreviewRow label="Neto salario + transporte" value={formatCop(slip.netSalary + slip.netTransport)} />
            <PreviewRow label="Neto bonificación" value={formatCop(slip.netBonus)} />
            {slip.netOvertime > 0 && (
              <PreviewRow label="Neto horas extras" value={formatCop(slip.netOvertime)} />
            )}
            <div className="flex justify-between text-lg font-bold text-indigo-800 mt-3 pt-3 border-t">
              <span>Total a pagar</span>
              <span>{formatCop(slip.netTotal)}</span>
            </div>
          </section>

          {vales.some((v) => v.photoUrl) && (
            <section>
              <h3 className="font-semibold text-gray-800 mb-2">Fotos de vales</h3>
              <div className="grid grid-cols-1 gap-3">
                {vales
                  .filter((v) => v.photoUrl)
                  .map((v, i) => (
                    <div key={i} className="border rounded-lg p-2">
                      <p className="text-xs text-gray-600 mb-1">{v.holderName}</p>
                      <img
                        src={v.photoUrl!}
                        alt={`Vale ${v.holderName}`}
                        className="w-full max-h-40 object-contain rounded bg-gray-50"
                      />
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-2">
          <a
            href={slip.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-3 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium"
          >
            Abrir recibo completo
          </a>
          {canSend && onSendWhatsApp && (
            <button
              type="button"
              disabled={sending || !slip.employee.phone}
              onClick={onSendWhatsApp}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {sending ? "Enviando…" : wasSent ? "Reenviar WhatsApp" : "Enviar WhatsApp"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const PreviewRow = ({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div
    className={`flex justify-between py-1 text-sm ${muted ? "text-gray-600" : "text-gray-800"}`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
