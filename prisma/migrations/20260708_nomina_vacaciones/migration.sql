-- Liquidación individual de vacaciones por empleado
CREATE TABLE "NominaVacacionLiquidacion" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "vacationStartDate" DATE,
    "baseSalaryUsed" DECIMAL(12,2) NOT NULL,
    "daysWorked" INTEGER NOT NULL,
    "vacationAmount" DECIMAL(12,2) NOT NULL,
    "equivalentDays" DECIMAL(8,2) NOT NULL,
    "breakdown" JSONB NOT NULL,
    "notes" TEXT,
    "whatsappSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NominaVacacionLiquidacion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NominaVacacionLiquidacion_accessToken_key" ON "NominaVacacionLiquidacion"("accessToken");
CREATE INDEX "NominaVacacionLiquidacion_employeeId_idx" ON "NominaVacacionLiquidacion"("employeeId");
CREATE INDEX "NominaVacacionLiquidacion_accessToken_idx" ON "NominaVacacionLiquidacion"("accessToken");
CREATE INDEX "NominaVacacionLiquidacion_createdAt_idx" ON "NominaVacacionLiquidacion"("createdAt");

ALTER TABLE "NominaVacacionLiquidacion" ADD CONSTRAINT "NominaVacacionLiquidacion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "NominaEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
