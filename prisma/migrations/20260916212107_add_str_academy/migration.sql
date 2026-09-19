-- CreateEnum
CREATE TYPE "AcademyNivel" AS ENUM ('APRENDIZ', 'JUNIOR', 'OPERACIONAL');

-- CreateEnum
CREATE TYPE "AcademyMatriculaStatus" AS ENUM ('ATIVA', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "AcademyAluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "emailVerificadoEm" TIMESTAMP(3),
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyAluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyTrilha" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "nivel" "AcademyNivel" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyTrilha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyModulo" (
    "id" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyAula" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyAula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyMatricula" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "trilhaId" TEXT NOT NULL,
    "status" "AcademyMatriculaStatus" NOT NULL DEFAULT 'ATIVA',
    "matriculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "AcademyMatricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyProgressoAula" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyProgressoAula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyLoginAttempt" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT,
    "email" TEXT NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyPasswordResetToken" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyEmailVerificationToken" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyEmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyAluno_email_key" ON "AcademyAluno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyTrilha_slug_key" ON "AcademyTrilha"("slug");

-- CreateIndex
CREATE INDEX "AcademyModulo_trilhaId_idx" ON "AcademyModulo"("trilhaId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyModulo_trilhaId_ordem_key" ON "AcademyModulo"("trilhaId", "ordem");

-- CreateIndex
CREATE INDEX "AcademyAula_moduloId_idx" ON "AcademyAula"("moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyAula_moduloId_slug_key" ON "AcademyAula"("moduloId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyAula_moduloId_ordem_key" ON "AcademyAula"("moduloId", "ordem");

-- CreateIndex
CREATE INDEX "AcademyMatricula_alunoId_idx" ON "AcademyMatricula"("alunoId");

-- CreateIndex
CREATE INDEX "AcademyMatricula_trilhaId_idx" ON "AcademyMatricula"("trilhaId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyMatricula_alunoId_trilhaId_key" ON "AcademyMatricula"("alunoId", "trilhaId");

-- CreateIndex
CREATE INDEX "AcademyProgressoAula_alunoId_idx" ON "AcademyProgressoAula"("alunoId");

-- CreateIndex
CREATE INDEX "AcademyProgressoAula_aulaId_idx" ON "AcademyProgressoAula"("aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyProgressoAula_alunoId_aulaId_key" ON "AcademyProgressoAula"("alunoId", "aulaId");

-- CreateIndex
CREATE INDEX "AcademyLoginAttempt_email_createdAt_idx" ON "AcademyLoginAttempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "AcademyLoginAttempt_alunoId_idx" ON "AcademyLoginAttempt"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyPasswordResetToken_tokenHash_key" ON "AcademyPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AcademyPasswordResetToken_alunoId_idx" ON "AcademyPasswordResetToken"("alunoId");

-- CreateIndex
CREATE INDEX "AcademyPasswordResetToken_expiresAt_idx" ON "AcademyPasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyEmailVerificationToken_tokenHash_key" ON "AcademyEmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AcademyEmailVerificationToken_alunoId_idx" ON "AcademyEmailVerificationToken"("alunoId");

-- CreateIndex
CREATE INDEX "AcademyEmailVerificationToken_expiresAt_idx" ON "AcademyEmailVerificationToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "AcademyModulo" ADD CONSTRAINT "AcademyModulo_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "AcademyTrilha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyAula" ADD CONSTRAINT "AcademyAula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "AcademyModulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyMatricula" ADD CONSTRAINT "AcademyMatricula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "AcademyAluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyMatricula" ADD CONSTRAINT "AcademyMatricula_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "AcademyTrilha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyProgressoAula" ADD CONSTRAINT "AcademyProgressoAula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "AcademyAluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyProgressoAula" ADD CONSTRAINT "AcademyProgressoAula_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "AcademyAula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyLoginAttempt" ADD CONSTRAINT "AcademyLoginAttempt_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "AcademyAluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyPasswordResetToken" ADD CONSTRAINT "AcademyPasswordResetToken_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "AcademyAluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEmailVerificationToken" ADD CONSTRAINT "AcademyEmailVerificationToken_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "AcademyAluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

