-- CreateTable
CREATE TABLE "TicketMensagem" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "autorTipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketMensagem_ticketId_idx" ON "TicketMensagem"("ticketId");

-- CreateIndex
CREATE INDEX "TicketMensagem_createdAt_idx" ON "TicketMensagem"("createdAt");

-- AddForeignKey
ALTER TABLE "TicketMensagem" ADD CONSTRAINT "TicketMensagem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
