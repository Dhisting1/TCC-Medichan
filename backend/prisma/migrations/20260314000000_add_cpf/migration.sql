-- AlterTable: adiciona CPF único para pacientes
ALTER TABLE "User" ADD COLUMN "cpf" TEXT UNIQUE;
