import { z } from "zod";

export const ACADEMY_CONTEUDO_VERSAO = 1 as const;

const idBlocoSchema = z.string().trim().min(1).max(120);

const blocoParagrafoSchema = z.object({
  id: idBlocoSchema,
  tipo: z.literal("PARAGRAFO"),
  texto: z.string().max(20000),
});

const blocoTituloSchema = z.object({
  id: idBlocoSchema,
  tipo: z.literal("TITULO"),
  texto: z.string().max(500),
});

const blocoSubtituloSchema = z.object({
  id: idBlocoSchema,
  tipo: z.literal("SUBTITULO"),
  texto: z.string().max(500),
});

const blocoListaSchema = z.object({
  id: idBlocoSchema,
  tipo: z.literal("LISTA"),
  itens: z.array(z.string().max(2000)).max(100),
});

const blocoCodigoSchema = z.object({
  id: idBlocoSchema,
  tipo: z.literal("CODIGO"),
  codigo: z.string().max(50000),
  linguagem: z.string().trim().max(50).nullable().default(null),
});

export const academyBlocoSchema = z.discriminatedUnion("tipo", [
  blocoParagrafoSchema,
  blocoTituloSchema,
  blocoSubtituloSchema,
  blocoListaSchema,
  blocoCodigoSchema,
]);

export const academyConteudoEstruturadoSchema = z.object({
  versao: z.literal(ACADEMY_CONTEUDO_VERSAO),
  blocos: z.array(academyBlocoSchema).max(500),
});

export type AcademyBloco = z.infer<typeof academyBlocoSchema>;

export type AcademyConteudoEstruturado = z.infer<
  typeof academyConteudoEstruturadoSchema
>;

export function criarConteudoEstruturadoVazio(): AcademyConteudoEstruturado {
  return {
    versao: ACADEMY_CONTEUDO_VERSAO,
    blocos: [],
  };
}

export function conteudoEstruturadoParaTexto(
  documento: AcademyConteudoEstruturado,
): string {
  return documento.blocos
    .map((bloco) => {
      switch (bloco.tipo) {
        case "PARAGRAFO":
        case "TITULO":
        case "SUBTITULO":
          return bloco.texto.trim();

        case "LISTA":
          return bloco.itens
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => `- ${item}`)
            .join("\n");

        case "CODIGO":
          return bloco.codigo.trim();

        default: {
          const nunca: never = bloco;
          return nunca;
        }
      }
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}