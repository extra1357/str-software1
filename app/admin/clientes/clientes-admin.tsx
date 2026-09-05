"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipoPessoa: string | null;
  documento: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  nomeContato: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  observacoes: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormularioCliente = {
  nome: string;
  email: string;
  telefone: string;
  tipoPessoa: string;
  documento: string;
  razaoSocial: string;
  nomeFantasia: string;
  nomeContato: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes: string;
  ativo: boolean;
};

const formularioVazio: FormularioCliente = {
  nome: "",
  email: "",
  telefone: "",
  tipoPessoa: "",
  documento: "",
  razaoSocial: "",
  nomeFantasia: "",
  nomeContato: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  observacoes: "",
  ativo: true,
};

function clienteParaFormulario(cliente: Cliente): FormularioCliente {
  return {
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone ?? "",
    tipoPessoa: cliente.tipoPessoa ?? "",
    documento: cliente.documento ?? "",
    razaoSocial: cliente.razaoSocial ?? "",
    nomeFantasia: cliente.nomeFantasia ?? "",
    nomeContato: cliente.nomeContato ?? "",
    cep: cliente.cep ?? "",
    logradouro: cliente.logradouro ?? "",
    numero: cliente.numero ?? "",
    complemento: cliente.complemento ?? "",
    bairro: cliente.bairro ?? "",
    cidade: cliente.cidade ?? "",
    uf: cliente.uf ?? "",
    observacoes: cliente.observacoes ?? "",
    ativo: cliente.ativo,
  };
}

export function ClientesAdmin() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioCliente>(formularioVazio);
  const [novo, setNovo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [senhaTemporaria, setSenhaTemporaria] = useState("");

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/admin/clientes", {
        method: "GET",
        cache: "no-store",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Falha ao carregar clientes.");
      }

      setClientes(dados.clientes);
    } catch (erroCarregamento) {
      console.error(
        "[admin/clientes] falha ao carregar clientes:",
        erroCarregamento,
      );

      setErro(
        erroCarregamento instanceof Error
          ? erroCarregamento.message
          : "Falha ao carregar clientes.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarClientes();
  }, [carregarClientes]);

  function alterarCampo(
    campo: keyof FormularioCliente,
    valor: string | boolean,
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function iniciarNovoCliente() {
    setNovo(true);
    setClienteSelecionado(null);
    setFormulario({ ...formularioVazio });
    setErro("");
    setSucesso("");
    setSenhaTemporaria("");
  }

  function selecionarCliente(cliente: Cliente) {
    setNovo(false);
    setClienteSelecionado(cliente.id);
    setFormulario(clienteParaFormulario(cliente));
    setErro("");
    setSucesso("");
    setSenhaTemporaria("");
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setSalvando(true);
    setErro("");
    setSucesso("");
    setSenhaTemporaria("");

    try {
      const url = novo
        ? "/api/admin/clientes"
        : `/api/admin/clientes/${clienteSelecionado}`;

      const resposta = await fetch(url, {
        method: novo ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Falha ao salvar cliente.");
      }

      if (novo) {
        setSenhaTemporaria(dados.senhaTemporaria ?? "");
        setSucesso("Cliente criado com sucesso.");
        setNovo(false);
        setClienteSelecionado(dados.cliente.id);
        setFormulario(clienteParaFormulario(dados.cliente));
      } else {
        setSucesso("Cliente atualizado com sucesso.");
        setFormulario(clienteParaFormulario(dados.cliente));
      }

      await carregarClientes();
    } catch (erroSalvamento) {
      console.error(
        "[admin/clientes] falha ao salvar cliente:",
        erroSalvamento,
      );

      setErro(
        erroSalvamento instanceof Error
          ? erroSalvamento.message
          : "Falha ao salvar cliente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 h-fit">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black">Clientes</h2>
            <p className="text-sm text-slate-400 mt-1">
              {clientes.length} cadastrado(s)
            </p>
          </div>

          <button
            type="button"
            onClick={iniciarNovoCliente}
            className="rounded-xl bg-white text-slate-950 px-3 py-2 text-sm font-bold hover:bg-slate-200"
          >
            + Novo
          </button>
        </div>

        {carregando ? (
          <p className="text-sm text-slate-400">Carregando clientes...</p>
        ) : clientes.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nenhum cliente cadastrado.
          </p>
        ) : (
          <div className="space-y-2">
            {clientes.map((cliente) => {
              const selecionado = clienteSelecionado === cliente.id;

              return (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => selecionarCliente(cliente)}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    selecionado
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-black/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{cliente.nome}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">
                        {cliente.email}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-black tracking-wide ${
                        cliente.ativo
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      {cliente.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  {cliente.nomeFantasia && (
                    <p className="text-xs text-slate-500 truncate mt-2">
                      {cliente.nomeFantasia}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        {!novo && !clienteSelecionado ? (
          <div className="min-h-[420px] flex items-center justify-center text-center">
            <div>
              <h2 className="text-2xl font-black">Ficha do cliente</h2>
              <p className="text-slate-400 mt-2 max-w-md">
                Selecione um cliente à esquerda ou crie um novo cadastro.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={salvar} className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  {novo ? "Novo cliente" : "Ficha do cliente"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {novo
                    ? "Cadastre os dados principais do novo cliente."
                    : "Consulte e atualize os dados administrativos."}
                </p>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="rounded-xl bg-white text-slate-950 px-5 py-2.5 font-bold hover:bg-slate-200 disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>

            {erro && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {sucesso}
              </div>
            )}

            {senhaTemporaria && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-bold text-amber-300">
                  Senha temporária
                </p>
                <p className="font-mono mt-2 break-all">
                  {senhaTemporaria}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Esta senha é exibida após a criação do cliente. O fluxo de
                  convite e definição inicial de senha será evoluído
                  separadamente.
                </p>
              </div>
            )}

            <fieldset className="space-y-4">
              <legend className="text-lg font-black mb-4">
                Identificação
              </legend>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo
                  label="Nome"
                  value={formulario.nome}
                  required
                  onChange={(valor) => alterarCampo("nome", valor)}
                />

                <label className="block">
                  <span className="text-sm font-semibold">Tipo de pessoa</span>
                  <select
                    value={formulario.tipoPessoa}
                    onChange={(evento) =>
                      alterarCampo("tipoPessoa", evento.target.value)
                    }
                    className={classeCampo}
                  >
                    <option value="">Não informado</option>
                    <option value="PF">Pessoa física</option>
                    <option value="PJ">Pessoa jurídica</option>
                  </select>
                </label>

                <Campo
                  label="CPF / CNPJ"
                  value={formulario.documento}
                  onChange={(valor) => alterarCampo("documento", valor)}
                />

                <Campo
                  label="Razão social"
                  value={formulario.razaoSocial}
                  onChange={(valor) => alterarCampo("razaoSocial", valor)}
                />

                <Campo
                  label="Nome fantasia"
                  value={formulario.nomeFantasia}
                  onChange={(valor) => alterarCampo("nomeFantasia", valor)}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-black mb-4">
                Contato
              </legend>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo
                  label="Nome do contato"
                  value={formulario.nomeContato}
                  onChange={(valor) => alterarCampo("nomeContato", valor)}
                />

                <Campo
                  label="E-mail"
                  type="email"
                  required
                  value={formulario.email}
                  onChange={(valor) => alterarCampo("email", valor)}
                />

                <Campo
                  label="Telefone"
                  type="tel"
                  value={formulario.telefone}
                  onChange={(valor) => alterarCampo("telefone", valor)}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-black mb-4">
                Endereço
              </legend>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo
                  label="CEP"
                  value={formulario.cep}
                  onChange={(valor) => alterarCampo("cep", valor)}
                />

                <Campo
                  label="Logradouro"
                  value={formulario.logradouro}
                  onChange={(valor) => alterarCampo("logradouro", valor)}
                />

                <Campo
                  label="Número"
                  value={formulario.numero}
                  onChange={(valor) => alterarCampo("numero", valor)}
                />

                <Campo
                  label="Complemento"
                  value={formulario.complemento}
                  onChange={(valor) => alterarCampo("complemento", valor)}
                />

                <Campo
                  label="Bairro"
                  value={formulario.bairro}
                  onChange={(valor) => alterarCampo("bairro", valor)}
                />

                <Campo
                  label="Cidade"
                  value={formulario.cidade}
                  onChange={(valor) => alterarCampo("cidade", valor)}
                />

                <Campo
                  label="UF"
                  maxLength={2}
                  value={formulario.uf}
                  onChange={(valor) =>
                    alterarCampo("uf", valor.toUpperCase())
                  }
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-black mb-4">
                Controle
              </legend>

              <label className="block">
                <span className="text-sm font-semibold">Observações</span>
                <textarea
                  value={formulario.observacoes}
                  onChange={(evento) =>
                    alterarCampo("observacoes", evento.target.value)
                  }
                  rows={5}
                  className={classeCampo}
                />
              </label>

              {!novo && (
                <label className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                  <input
                    type="checkbox"
                    checked={formulario.ativo}
                    onChange={(evento) =>
                      alterarCampo("ativo", evento.target.checked)
                    }
                    className="h-4 w-4"
                  />

                  <span>
                    <span className="font-bold block">Cliente ativo</span>
                    <span className="text-sm text-slate-400">
                      Clientes inativos permanecem registrados no histórico.
                    </span>
                  </span>
                </label>
              )}
            </fieldset>
          </form>
        )}
      </section>
    </div>
  );
}

const classeCampo =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-white/30";

function Campo({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(evento) => onChange(evento.target.value)}
        className={classeCampo}
      />
    </label>
  );
}