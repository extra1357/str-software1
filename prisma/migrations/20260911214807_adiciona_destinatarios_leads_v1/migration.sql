-- CreateTable
CREATE TABLE "LeadEmailRecipient" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadEmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadEmailRecipient_email_key" ON "LeadEmailRecipient"("email");

-- CreateIndex
CREATE INDEX "LeadEmailRecipient_ativo_idx" ON "LeadEmailRecipient"("ativo");

-- CreateIndex
CREATE INDEX "LeadEmailRecipient_createdAt_idx" ON "LeadEmailRecipient"("createdAt");
