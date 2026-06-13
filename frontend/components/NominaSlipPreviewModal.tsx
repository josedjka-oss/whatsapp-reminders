"use client";

import type { KeyboardEvent } from "react";
import {
  NominaReciboDisplay,
  type ReciboDisplayData,
} from "@/components/NominaReciboDisplay";

export type SlipPreviewData = ReciboDisplayData & {
  id: string;
  employeeId: string;
  publicUrl: string;
  employee: { name: string; phone: string | null };
  whatsappSentAt: string | null;
};

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

  const wasSent = Boolean(slip.whatsappSentAt);

  const handleBackdropKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  const recibo: ReciboDisplayData = {
    ...slip,
    employeeName: slip.employee.name,
    breakdown: slip.breakdown ?? {
      salarySection: slip.salarySection,
      bonusSection: slip.bonusSection,
      photoAttachments: slip.photoAttachments,
      periodLabel: slip.periodLabel,
    },
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
        <div className="px-6 pt-4">
          <p id="slip-preview-title" className="text-sm font-medium text-gray-500 text-center">
            Vista previa del recibo
          </p>
        </div>

        {notice && (
          <div
            className={`mx-6 mt-3 text-sm rounded-lg px-3 py-2 ${
              wasSent
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-amber-50 text-amber-900 border border-amber-200"
            }`}
          >
            {notice}
          </div>
        )}

        {!slip.employee.phone && canSend && (
          <div className="mx-6 mt-3 text-sm rounded-lg px-3 py-2 bg-red-50 text-red-800 border border-red-200">
            Este empleado no tiene teléfono WhatsApp configurado.
          </div>
        )}

        <NominaReciboDisplay recibo={recibo} compact />

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
