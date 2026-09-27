import {
  academyConteudoEstruturadoSchema,
  type AcademyConteudoEstruturado,
} from "@/lib/academy-conteudo";

type Props = {
  conteudoEstruturado: unknown;
  conteudoLegado?: string | null;
};

export function AcademyConteudoRenderer({
  conteudoEstruturado,
  conteudoLegado,
}: Props) {
  const validacao = academyConteudoEstruturadoSchema.safeParse(
    conteudoEstruturado,
  );

  if (!validacao.success) {
    if (!conteudoLegado?.trim()) {
      return (
        <p className="text-sm leading-7 text-zinc-500">
          Esta aula ainda não possui conteúdo disponível.
        </p>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-base leading-8 text-zinc-700">
        {conteudoLegado}
      </div>
    );
  }

  return <Blocos documento={validacao.data} />;
}

function Blocos({
  documento,
}: {
  documento: AcademyConteudoEstruturado;
}) {
  if (documento.blocos.length === 0) {
    return (
      <p className="text-sm leading-7 text-zinc-500">
        Esta aula ainda não possui conteúdo disponível.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {documento.blocos.map((bloco) => {
        switch (bloco.tipo) {
          case "PARAGRAFO":
            return (
              <p
                key={bloco.id}
                className="whitespace-pre-wrap text-base leading-8 text-zinc-700"
              >
                {bloco.texto}
              </p>
            );

          case "TITULO":
            return (
              <h2
                key={bloco.id}
                className="pt-3 text-2xl font-semibold tracking-tight text-zinc-950"
              >
                {bloco.texto}
              </h2>
            );

          case "SUBTITULO":
            return (
              <h3
                key={bloco.id}
                className="pt-2 text-xl font-semibold tracking-tight text-zinc-900"
              >
                {bloco.texto}
              </h3>
            );

          case "LISTA":
            return (
              <ul
                key={bloco.id}
                className="list-disc space-y-2 pl-6 text-base leading-7 text-zinc-700"
              >
                {bloco.itens
                  .filter((item) => item.trim())
                  .map((item, indice) => (
                    <li key={`${bloco.id}-${indice}`}>
                      {item}
                    </li>
                  ))}
              </ul>
            );

          case "CODIGO":
            return (
              <div key={bloco.id}>
                {bloco.linguagem && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {bloco.linguagem}
                  </p>
                )}

                <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
                  <code>{bloco.codigo}</code>
                </pre>
              </div>
            );

          case "VIDEO": {
            const src =
              bloco.provedor === "YOUTUBE"
                ? `https://www.youtube-nocookie.com/embed/${bloco.videoId}`
                : `https://player.vimeo.com/video/${bloco.videoId}`;

            return (
              <div
                key={bloco.id}
                className="overflow-hidden rounded-2xl border border-black/10 bg-black"
              >
                <div className="aspect-video">
                  <iframe
                    src={src}
                    title="Vídeo da aula"
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }

          default: {
            const nunca: never = bloco;
            return nunca;
          }
        }
      })}
    </div>
  );
}