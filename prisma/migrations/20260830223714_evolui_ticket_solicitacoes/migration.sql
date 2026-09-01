/*
  Warnings:

  - A unique constraint covering the columns `[protocolo]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `protocolo` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "encerradoEm" TIMESTAMP(3),
ADD COLUMN     "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "protocolo" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'SUPORTE';

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_protocolo_key" ON "Ticket"("protocolo");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");
