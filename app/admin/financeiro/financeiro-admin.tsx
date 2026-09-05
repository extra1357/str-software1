"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
};

type Fatura = {
  id: string;
  descricao: string;
  valor: string | number;
  status: string;
  vencimento: string;
  createdAt: string;
  cliente: Cliente;
};

function moeda(valor: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

function dataBR(valor: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(valor));
}

function dataInput(valor: string) {
  const data = new Date(valor);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function FinanceiroAdmin() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editVencimento, setEditVencimento] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarDados = useCallback(async () => {
    setErro("");

    try {
      const [resClientes, resFaturas] = await Promise.all([
        fetch("/api/admin/clientes", { cache: "no-store" }),
        fetch("/api/admin/faturas", { cache: "no-store" }),
      ]);

      if (!resClientes.ok || !resFaturas.ok) {
        throw new Error("Falha ao carregar dados financeiros.");
      }

      const dadosClientes = await resClientes.json();
      const dadosFaturas = await resFaturas.json();

      setClientes(
        (dadosClientes.clientes ?? []).filter(
          (cliente: Cliente) => cliente.ativo,
        ),
      );

      setFaturas(dadosFaturas.faturas ?? []);
    } catch (error) {
      console.error("[admin/financeiro] falha ao carregar dados:", error);
      setErro("Não foi possível carregar os dados financeiros.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  async function gerarFatura(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const response = await fetch("/api/admin/faturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          descricao,
          valor,
          vencimento,
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Falha ao gerar fatura.");
      }

      setClienteId("");
      setDescricao("");
      setValor("");
      setVencimento("");
      setSucesso("Fatura gerada com sucesso.");

      await carregarDados();
    } catch (error) {
      console.error("[admin/financeiro] falha ao gerar fatura:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a fatura.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(fatura: Fatura) {
    setErro("");
    setSucesso("");
    setEditandoId(fatura.id);
    setEditDescricao(fatura.descricao);
    setEditValor(String(fatura.valor));
    setEditVencimento(dataInput(fatura.vencimento));
  }

  function fecharEdicao() {
    setEditandoId(null);
    setEditDescricao("");
    setEditValor("");
    setEditVencimento("");
  }

  async function salvarEdicao(id: string) {
    setErro("");
    setSucesso("");
    setProcessandoId(id);

    try {
      const response = await fetch(`/api/admin/faturas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "EDITAR",
          descricao: editDescricao,
          valor: editValor,
          vencimento: editVencimento,
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Falha ao alterar fatura.");
      }

      fecharEdicao();
      setSucesso("Fatura alterada com sucesso.");
      await carregarDados();
    } catch (error) {
      console.error("[admin/financeiro] falha ao alterar fatura:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a fatura.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function cancelarFatura(fatura: Fatura) {
    const confirmou = window.confirm(
      `Cancelar a fatura "${fatura.descricao}" de ${moeda(fatura.valor)}?`,
    );

    if (!confirmou) {
      return;
    }

    setErro("");
    setSucesso("");
    setProcessandoId(fatura.id);

    try {
      const response = await fetch(`/api/admin/faturas/${fatura.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "CANCELAR",
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Falha ao cancelar fatura.");
      }

      if (editandoId === fatura.id) {
        fecharEdicao();
      }

      setSucesso("Fatura cancelada com sucesso.");
      await carregarDados();
    } catch (error) {
      console.error("[admin/financeiro] falha ao cancelar fatura:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar a fatura.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Administração
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Financeiro
        </h1>

        <p className="mt-2 text-slate-400">
          Gere e acompanhe as faturas dos clientes.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
        <h2 className="text-xl font-bold text-white">
          Gerar nova fatura
        </h2>

        <form
          onSubmit={gerarFatura}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Cliente
            </span>

            <select
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
            >
              <option value="">Selecione um cliente</option>

              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} — {cliente.email}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Descrição
            </span>

            <input
              type="text"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              required
              maxLength={200}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              placeholder="Ex.: Desenvolvimento - Parcela 1/3"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Valor
            </span>

            <input
              type="number"
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
              placeholder="0,00"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Vencimento
            </span>

            <input
              type="date"
              value={vencimento}
              onChange={(event) => setVencimento(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? "Gerando..." : "Gerar fatura"}
            </button>
          </div>
        </form>

        {erro ? (
          <p className="mt-4 text-sm font-medium text-red-400">{erro}</p>
        ) : null}

        {sucesso ? (
          <p className="mt-4 text-sm font-medium text-emerald-400">
            {sucesso}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Faturas</h2>

          <span className="text-sm text-slate-400">
            {faturas.length} registro(s)
          </span>
        </div>

        {carregando ? (
          <p className="mt-6 text-slate-400">Carregando...</p>
        ) : faturas.length === 0 ? (
          <p className="mt-6 text-slate-400">
            Nenhuma fatura cadastrada.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Descrição</th>
                  <th className="px-3 py-3">Vencimento</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {faturas.map((fatura) => {
                  const editando = editandoId === fatura.id;
                  const pendente = fatura.status === "PENDENTE";
                  const processando = processandoId === fatura.id;

                  return (
                    <tr
                      key={fatura.id}
                      className="border-b border-white/5 text-slate-200"
                    >
                      <td className="px-3 py-4">
                        <div className="font-semibold">
                          {fatura.cliente.nome}
                        </div>

                        <div className="text-xs text-slate-500">
                          {fatura.cliente.email}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {editando ? (
                          <input
                            type="text"
                            value={editDescricao}
                            onChange={(event) =>
                              setEditDescricao(event.target.value)
                            }
                            className="min-w-52 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                          />
                        ) : (
                          fatura.descricao
                        )}
                      </td>

                      <td className="px-3 py-4">
                        {editando ? (
                          <input
                            type="date"
                            value={editVencimento}
                            onChange={(event) =>
                              setEditVencimento(event.target.value)
                            }
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                          />
                        ) : (
                          dataBR(fatura.vencimento)
                        )}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {editando ? (
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editValor}
                            onChange={(event) =>
                              setEditValor(event.target.value)
                            }
                            className="w-32 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                          />
                        ) : (
                          moeda(fatura.valor)
                        )}
                      </td>

                      <td className="px-3 py-4">
                        {fatura.status}
                      </td>

                      <td className="px-3 py-4">
                        {pendente ? (
                          editando ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={processando}
                                onClick={() => void salvarEdicao(fatura.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white disabled:opacity-50"
                              >
                                Salvar
                              </button>

                              <button
                                type="button"
                                disabled={processando}
                                onClick={fecharEdicao}
                                className="rounded-lg border border-white/10 px-3 py-2 font-semibold text-slate-300 disabled:opacity-50"
                              >
                                Voltar
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={processando}
                                onClick={() => iniciarEdicao(fatura)}
                                className="rounded-lg border border-blue-500/40 px-3 py-2 font-semibold text-blue-400 disabled:opacity-50"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                disabled={processando}
                                onClick={() => void cancelarFatura(fatura)}
                                className="rounded-lg border border-red-500/40 px-3 py-2 font-semibold text-red-400 disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}