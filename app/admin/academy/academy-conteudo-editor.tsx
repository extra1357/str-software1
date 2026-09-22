"use client";

import type {
  AcademyBloco,
  AcademyConteudoEstruturado,
} from "@/lib/academy-conteudo";

import { normalizarAcademyVideo } from "@/lib/academy-conteudo";



type Props = {
  valor: AcademyConteudoEstruturado;
  onChange: (valor: AcademyConteudoEstruturado) => void;
  disabled?: boolean;
};

type TipoBloco = AcademyBloco["tipo"];

function gerarIdBloco() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `bloco-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function criarBloco(tipo: TipoBloco): AcademyBloco {
  const id = gerarIdBloco();

  switch (tipo) {
    case "PARAGRAFO":
      return {
        id,
        tipo,
        texto: "",
      };

    case "TITULO":
      return {
        id,
        tipo,
        texto: "",
      };

    case "SUBTITULO":
      return {
        id,
        tipo,
        texto: "",
      };

    case "LISTA":
      return {
        id,
        tipo,
        itens: [""],
      };

    case "CODIGO":
      return {
        id,
        tipo,
        codigo: "",
        linguagem: null,
      };

    case "VIDEO":
      return {
        id,
        tipo,
        url: "",
        provedor: "YOUTUBE",
        videoId: "",
      };
  }
}

function nomeTipo(tipo: TipoBloco) {
  switch (tipo) {
    case "PARAGRAFO":
      return "Paragrafo";
    case "TITULO":
      return "Titulo";
    case "SUBTITULO":
      return "Subtitulo";
    case "LISTA":
      return "Lista";
    case "CODIGO":
      return "Codigo";
    case "VIDEO":
      return "Video";
  }
}

export default function AcademyConteudoEditor({
  valor,
  onChange,
  disabled = false,
}: Props) {
  function atualizarBlocos(blocos: AcademyBloco[]) {
    onChange({
      ...valor,
      blocos,
    });
  }

  function adicionarBloco(tipo: TipoBloco) {
    atualizarBlocos([
      ...valor.blocos,
      criarBloco(tipo),
    ]);
  }

  function atualizarBloco(
    indice: number,
    bloco: AcademyBloco,
  ) {
    atualizarBlocos(
      valor.blocos.map((atual, posicao) =>
        posicao === indice ? bloco : atual,
      ),
    );
  }

  function removerBloco(indice: number) {
    atualizarBlocos(
      valor.blocos.filter(
        (_, posicao) => posicao !== indice,
      ),
    );
  }

  function moverBloco(
    indice: number,
    direcao: -1 | 1,
  ) {
    const destino = indice + direcao;

    if (
      destino < 0 ||
      destino >= valor.blocos.length
    ) {
      return;
    }

    const blocos = [...valor.blocos];

    [blocos[indice], blocos[destino]] = [
      blocos[destino],
      blocos[indice],
    ];

    atualizarBlocos(blocos);
  }

  function atualizarItemLista(
    indiceBloco: number,
    indiceItem: number,
    texto: string,
  ) {
    const bloco = valor.blocos[indiceBloco];

    if (bloco.tipo !== "LISTA") {
      return;
    }

    const itens = bloco.itens.map(
      (item, posicao) =>
        posicao === indiceItem ? texto : item,
    );

    atualizarBloco(indiceBloco, {
      ...bloco,
      itens,
    });
  }

  function adicionarItemLista(indiceBloco: number) {
    const bloco = valor.blocos[indiceBloco];

    if (bloco.tipo !== "LISTA") {
      return;
    }

    atualizarBloco(indiceBloco, {
      ...bloco,
      itens: [...bloco.itens, ""],
    });
  }

  function removerItemLista(
    indiceBloco: number,
    indiceItem: number,
  ) {
    const bloco = valor.blocos[indiceBloco];

    if (bloco.tipo !== "LISTA") {
      return;
    }

    atualizarBloco(indiceBloco, {
      ...bloco,
      itens: bloco.itens.filter(
        (_, posicao) => posicao !== indiceItem,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Editor visual
            </h4>

            <p className="mt-1 text-xs text-slate-400">
              Monte a aula adicionando blocos de conteudo.
            </p>
          </div>

          <span className="text-xs text-slate-500">
            {valor.blocos.length} bloco(s)
          </span>
        </div>
      </div>

      {valor.blocos.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-5 text-sm text-slate-400">
          Nenhum bloco adicionado. Escolha um tipo abaixo
          para iniciar o conteudo da aula.
        </div>
      )}

      <div className="space-y-4">
        {valor.blocos.map((bloco, indice) => (
          <div
            key={bloco.id}
            className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                {nomeTipo(bloco.tipo)}
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled || indice === 0}
                  onClick={() =>
                    moverBloco(indice, -1)
                  }
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Subir
                </button>

                <button
                  type="button"
                  disabled={
                    disabled ||
                    indice === valor.blocos.length - 1
                  }
                  onClick={() =>
                    moverBloco(indice, 1)
                  }
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Descer
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removerBloco(indice)}
                  className="rounded-md border border-red-900 px-2 py-1 text-xs text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remover
                </button>
              </div>
            </div>

            {bloco.tipo === "PARAGRAFO" && (
              <textarea
                value={bloco.texto}
                disabled={disabled}
                maxLength={20000}
                rows={5}
                onChange={(evento) =>
                  atualizarBloco(indice, {
                    ...bloco,
                    texto: evento.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                placeholder="Digite o paragrafo..."
              />
            )}

            {bloco.tipo === "TITULO" && (
              <input
                value={bloco.texto}
                disabled={disabled}
                maxLength={500}
                onChange={(evento) =>
                  atualizarBloco(indice, {
                    ...bloco,
                    texto: evento.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-lg font-semibold text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                placeholder="Titulo da secao"
              />
            )}

            {bloco.tipo === "SUBTITULO" && (
              <input
                value={bloco.texto}
                disabled={disabled}
                maxLength={500}
                onChange={(evento) =>
                  atualizarBloco(indice, {
                    ...bloco,
                    texto: evento.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-semibold text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                placeholder="Subtitulo"
              />
            )}

            {bloco.tipo === "LISTA" && (
              <div className="space-y-3">
                {bloco.itens.map((item, indiceItem) => (
                  <div
                    key={`${bloco.id}-${indiceItem}`}
                    className="flex gap-2"
                  >
                    <span className="pt-2 text-slate-500">
                      ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢
                    </span>

                    <input
                      value={item}
                      disabled={disabled}
                      maxLength={2000}
                      onChange={(evento) =>
                        atualizarItemLista(
                          indice,
                          indiceItem,
                          evento.target.value,
                        )
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                      placeholder="Item da lista"
                    />

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        removerItemLista(
                          indice,
                          indiceItem,
                        )
                      }
                      className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-300 disabled:opacity-40"
                    >
                      Remover
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    adicionarItemLista(indice)
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  + Item
                </button>
              </div>
            )}

            {bloco.tipo === "CODIGO" && (
              <div className="space-y-3">
                <input
                  value={bloco.linguagem ?? ""}
                  disabled={disabled}
                  maxLength={50}
                  onChange={(evento) =>
                    atualizarBloco(indice, {
                      ...bloco,
                      linguagem:
                        evento.target.value.trim() ||
                        null,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                  placeholder="Linguagem: javascript, typescript, python..."
                />

                <textarea
                  value={bloco.codigo}
                  disabled={disabled}
                  maxLength={50000}
                  rows={10}
                  spellCheck={false}
                  onChange={(evento) =>
                    atualizarBloco(indice, {
                      ...bloco,
                      codigo: evento.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                  placeholder="Digite ou cole o codigo..."
                />
              </div>
            )}
            {bloco.tipo === "VIDEO" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">
                    URL do video
                  </span>

                  <input
                    type="url"
                    value={bloco.url}
                    disabled={disabled}
                    maxLength={2000}
                    placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                    onChange={(evento) => {
                      const novaUrl = evento.target.value;
                      const normalizado =
                        normalizarAcademyVideo(novaUrl);

                      atualizarBloco(indice, {
                        ...bloco,
                        url: novaUrl,
                        provedor:
                          normalizado?.provedor ??
                          "YOUTUBE",
                        videoId:
                          normalizado?.videoId ?? "",
                      });
                    }}
                    onBlur={() => {
                      const normalizado =
                        normalizarAcademyVideo(bloco.url);

                      if (!normalizado) {
                        return;
                      }

                      atualizarBloco(indice, {
                        ...bloco,
                        ...normalizado,
                      });
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </label>

                {bloco.url.trim() === "" && (
                  <p className="text-xs text-slate-400">
                    Cole uma URL HTTPS do YouTube ou Vimeo.
                  </p>
                )}

                {bloco.url.trim() !== "" &&
                  !normalizarAcademyVideo(bloco.url) && (
                    <p className="text-xs text-amber-400">
                      URL invalida. Use um link HTTPS valido do YouTube ou Vimeo.
                    </p>
                  )}

                {normalizarAcademyVideo(bloco.url) && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-emerald-900 bg-emerald-950/30 px-3 py-2">
                      <p className="text-sm font-medium text-emerald-300">
                        ✓ Video do{" "}
                        {bloco.provedor === "YOUTUBE" ? "YouTube" : "Vimeo"}{" "}
                        reconhecido
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        O video esta pronto para fazer parte da aula.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-black">
                      <div className="aspect-video">
                        <iframe
                          src={
                            bloco.provedor === "YOUTUBE"
                              ? `https://www.youtube-nocookie.com/embed/${bloco.videoId}`
                              : `https://player.vimeo.com/video/${bloco.videoId}`
                          }
                          title={`Pre-visualizacao do video: ${
                            bloco.provedor === "YOUTUBE"
                              ? "YouTube"
                              : "Vimeo"
                          }`}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Confira a pre-visualizacao antes de salvar a aula.
                    </p>
                  </div>
                )}
              </div>
            )}
         </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Adicionar bloco
        </p>

        <div className="flex flex-wrap gap-2">
          {(
            [
              "PARAGRAFO",
              "TITULO",
              "SUBTITULO",
              "LISTA",
              "CODIGO",
              "VIDEO",
            ] as TipoBloco[]
          ).map((tipo) => (
            <button
              key={tipo}
              type="button"
              disabled={disabled}
              onClick={() => adicionarBloco(tipo)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-emerald-700 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + {nomeTipo(tipo)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}