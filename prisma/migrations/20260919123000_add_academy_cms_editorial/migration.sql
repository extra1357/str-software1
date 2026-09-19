-- CreateEnum
CREATE TYPE "AcademyAcessoTrilha" AS ENUM ('PUBLICA', 'ALUNOS', 'INTERNA');

-- CreateEnum
CREATE TYPE "AcademyStatusEditorial" AS ENUM ('RASCUNHO', 'PUBLICADA', 'ARQUIVADA');

-- AlterTable
ALTER TABLE "AcademyAula" ADD COLUMN     "conteudoEstruturado" JSONB,
ADD COLUMN     "resumo" TEXT,
ADD COLUMN     "statusEditorial" "AcademyStatusEditorial" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "AcademyModulo" ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "statusEditorial" "AcademyStatusEditorial" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "AcademyTrilha" ADD COLUMN     "acesso" "AcademyAcessoTrilha" NOT NULL DEFAULT 'ALUNOS',
ADD COLUMN     "statusEditorial" "AcademyStatusEditorial" NOT NULL DEFAULT 'RASCUNHO';

