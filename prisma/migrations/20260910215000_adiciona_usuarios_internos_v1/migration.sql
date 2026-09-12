-- CreateEnum
CREATE TYPE "UsuarioPapel" AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'COMERCIAL',
  'FINANCEIRO',
  'SUPORTE',
  'CONTEUDO'
);

-- CreateTable
CREATE TABLE "Usuario" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "papel" "UsuarioPapel" NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "sessionVersion" INTEGER NOT NULL DEFAULT 0,
  "ultimoLoginEm" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPasswordResetToken" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UsuarioPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioLoginAttempt" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "sucesso" BOOLEAN NOT NULL,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UsuarioLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_papel_idx" ON "Usuario"("papel");

-- CreateIndex
CREATE INDEX "Usuario_ativo_idx" ON "Usuario"("ativo");

-- CreateIndex
CREATE INDEX "Usuario_createdAt_idx" ON "Usuario"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPasswordResetToken_tokenHash_key"
ON "UsuarioPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "UsuarioPasswordResetToken_usuarioId_idx"
ON "UsuarioPasswordResetToken"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioPasswordResetToken_expiresAt_idx"
ON "UsuarioPasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "UsuarioLoginAttempt_email_createdAt_idx"
ON "UsuarioLoginAttempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "UsuarioLoginAttempt_createdAt_idx"
ON "UsuarioLoginAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "UsuarioPasswordResetToken"
ADD CONSTRAINT "UsuarioPasswordResetToken_usuarioId_fkey"
FOREIGN KEY ("usuarioId")
REFERENCES "Usuario"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;