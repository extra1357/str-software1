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

export const academyVideoProvedorSchema = z.enum(["YOUTUBE", "VIMEO"]);

const blocoVideoSchema = z.object({
  id: idBlocoSchema,
  tipo: z.literal("VIDEO"),
  url: z.string().trim().url().max(2000),
  provedor: academyVideoProvedorSchema,
  videoId: z.string().trim().min(1).max(120),
});

export const academyBlocoSchema = z.discriminatedUnion("tipo", [
  blocoParagrafoSchema,
  blocoTituloSchema,
  blocoSubtituloSchema,
  blocoListaSchema,
  blocoCodigoSchema,
  blocoVideoSchema,
]);

export const academyConteudoEstruturadoSchema = z
  .object({
    versao: z.literal(ACADEMY_CONTEUDO_VERSAO),
    blocos: z.array(academyBlocoSchema).max(500),
  })
  .superRefine((documento, contexto) => {
    documento.blocos.forEach((bloco, indice) => {
      if (bloco.tipo !== "VIDEO") {
        return;
      }

      const normalizado = normalizarAcademyVideo(bloco.url);

      if (
        !normalizado ||
        normalizado.url !== bloco.url ||
        normalizado.provedor !== bloco.provedor ||
        normalizado.videoId !== bloco.videoId
      ) {
        contexto.addIssue({
          code: "custom",
          path: ["blocos", indice],
          message:
            "Video invalido ou inconsistente com a URL informada.",
        });
      }
    });
  });

export type AcademyVideoProvedor = z.infer<
  typeof academyVideoProvedorSchema
>;

export type AcademyVideoNormalizado = {
  url: string;
  provedor: AcademyVideoProvedor;
  videoId: string;
};

export function normalizarAcademyVideo(
  valor: string,
): AcademyVideoNormalizado | null {
  const entrada = valor.trim();

  if (!entrada) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(entrada);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") {
    return null;
  }

  if (url.username || url.password || url.port) {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    const partes = url.pathname.split("/").filter(Boolean);

    if (partes.length !== 1) {
      return null;
    }

    const videoId = partes[0];

    if (!videoId || !/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
      return null;
    }

    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      provedor: "YOUTUBE",
      videoId,
    };
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    let videoId: string | null = null;

    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else {
      const partes = url.pathname.split("/").filter(Boolean);

      if (
        partes.length >= 2 &&
        ["shorts", "embed", "live"].includes(partes[0])
      ) {
        videoId = partes[1];
      }
    }

    if (!videoId || !/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
      return null;
    }

    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      provedor: "YOUTUBE",
      videoId,
    };
  }

  if (host === "vimeo.com") {
    const partes = url.pathname.split("/").filter(Boolean);

    if (
      partes.length !== 1 ||
      !/^\d{6,12}$/.test(partes[0])
    ) {
      return null;
    }

    const videoId = partes[0];

    return {
      url: `https://vimeo.com/${videoId}`,
      provedor: "VIMEO",
      videoId,
    };
  }

  if (host === "player.vimeo.com") {
    const partes = url.pathname.split("/").filter(Boolean);

    if (
      partes.length !== 2 ||
      partes[0] !== "video" ||
      !/^\d{6,12}$/.test(partes[1])
    ) {
      return null;
    }

    const videoId = partes[1];

    return {
      url: `https://vimeo.com/${videoId}`,
      provedor: "VIMEO",
      videoId,
    };
  }

  return null;
}
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

        case "VIDEO":
          return bloco.url.trim();

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