-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "leituraMinutos" INTEGER,
    "imagemCapa" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "regioes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servicos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonical" TEXT,
    "ctaTexto" TEXT,
    "ctaUrl" TEXT,
    "publicadoEm" TIMESTAMP(3),
    "agendadoPara" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publicadoEm_idx" ON "Post"("status", "publicadoEm");

-- CreateIndex
CREATE INDEX "Post_categoria_idx" ON "Post"("categoria");

-- CreateIndex
CREATE INDEX "Post_destaque_idx" ON "Post"("destaque");
