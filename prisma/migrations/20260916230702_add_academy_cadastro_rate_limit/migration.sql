-- CreateTable
CREATE TABLE "AcademyCadastroAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "sucesso" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyCadastroAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyCadastroAttempt_email_createdAt_idx" ON "AcademyCadastroAttempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "AcademyCadastroAttempt_ip_createdAt_idx" ON "AcademyCadastroAttempt"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "AcademyCadastroAttempt_createdAt_idx" ON "AcademyCadastroAttempt"("createdAt");
