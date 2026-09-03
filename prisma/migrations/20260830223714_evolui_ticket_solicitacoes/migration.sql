/*
  Migration preparada para bancos que ja possuam registros em Ticket.

  Estrategia:
  1. adiciona protocolo permitindo NULL;
  2. preenche registros legados com protocolo unico baseado no id;
  3. torna protocolo obrigatorio;
  4. cria restricao de unicidade.

  Novos tickets continuam recebendo protocolo pela aplicacao.
*/

-- AlterTable
ALTER TABLE "Ticket"
ADD COLUMN "encerradoEm" TIMESTAMP(3),
ADD COLUMN "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "protocolo" TEXT,
ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'SUPORTE';

-- Backfill de tickets existentes
UPDATE "Ticket"
SET "protocolo" = 'STR-LEGADO-' || "id"
WHERE "protocolo" IS NULL;

-- Protocolo passa a ser obrigatorio
ALTER TABLE "Ticket"
ALTER COLUMN "protocolo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_protocolo_key"
ON "Ticket"("protocolo");

-- CreateIndex
CREATE INDEX "Ticket_status_idx"
ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx"
ON "Ticket"("createdAt");
