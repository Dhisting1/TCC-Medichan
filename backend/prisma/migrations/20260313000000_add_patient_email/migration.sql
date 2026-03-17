-- AlterTable: adiciona email do paciente para notificações (RF06)
ALTER TABLE "Prescription" ADD COLUMN "patientEmail" TEXT;
