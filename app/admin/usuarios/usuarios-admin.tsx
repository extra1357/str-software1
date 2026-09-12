"use client";

import { FormEvent, useState } from "react";

type Papel =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "COMERCIAL"
  | "FINANCEIRO"
  | "SUPORTE"
  | "CONTEUDO";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  ultimoLoginEm: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  usuarioAtualId: string;
  usuariosIniciais: Usuario[];
};

const PAPEIS: Array<{
  valor: Papel;
  rotulo: string;
}> = [
  {
    valor: "SUPER_ADMIN",
    rotulo: "Super administrador",
  },
  {
    valor: "ADMIN",
    rotulo: "Administrador",
  },
  {
    valor: "COMERCIAL",
    rotulo: "Comercial",
  },
  {
    valor: "FINANCEIRO",
    rotulo: "Financeiro",
  },
  {
    valor: "SUPORTE",
    rotulo: "Suporte",
  },
  {
    valor: "CONTEUDO",
    rotulo: "Conteúdo",
  },
];

function ordenarUsuarios(usuarios: Usuario[]) {
  return [...usuarios].sort((a, b) => {
    if (a.ativo !== b.ativo) {
      return a.ativo ? -1 : 1;
    }

    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

export default function UsuariosAdmin({
  usuarioAtualId,
  usuariosIniciais,
}: Props) {
  const [usuarios, setUsuarios] = useState(
    ordenarUsuarios(usuariosIniciais),
  );

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] =
    useState<Papel>("COMERCIAL");

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function criarUsuario(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      const response = await fetch(
        "/api/admin/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
            senha,
            papel,
          }),
        },
      );

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.erro ||
            "Não foi possível criar o usuário.",
        );
      }

      setUsuarios((atuais) =>
        ordenarUsuarios([
          ...atuais,
          resultado.usuario,
        ]),
      );

      setNome("");
      setEmail("");
      setSenha("");
      setPapel("COMERCIAL");
      setMensagem("Usuário criado com sucesso.");
    }
    catch (erroCriacao) {
      setErro(
        erroCriacao instanceof Error
          ? erroCriacao.message
          : "Não foi possível criar o usuário.",
      );
    }
    finally {
      setSalvando(false);
    }
  }

  function atualizarUsuario(usuario: Usuario) {
    setUsuarios((atuais) =>
      ordenarUsuarios(
        atuais.map((item) =>
          item.id === usuario.id
            ? usuario
            : item,
        ),
      ),
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black">
          Usuários da equipe
        </h2>

        <p className="text-slate-400 mt-1">
          Controle de acesso, funções e contas internas da STR.
        </p>
      </div>

      {mensagem && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {erro}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h3 className="text-lg font-bold">
          Criar novo usuário
        </h3>

        <form
          onSubmit={criarUsuario}
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Campo
            label="Nome completo"
            value={nome}
            onChange={setNome}
            type="text"
            autoComplete="name"
          />

          <Campo
            label="E-mail"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
          />

          <Campo
            label="Senha inicial"
            value={senha}
            onChange={setSenha}
            type="password"
            autoComplete="new-password"
            minimo={12}
          />

          <label className="space-y-2">
            <span className="text-sm text-slate-400">
              Papel
            </span>

            <select
              value={papel}
              onChange={(event) =>
                setPapel(event.target.value as Papel)
              }
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {PAPEIS.map((item) => (
                <option
                  key={item.valor}
                  value={item.valor}
                >
                  {item.rotulo}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? "Criando..."
                : "Criar usuário"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Equipe cadastrada
          </h3>

          <span className="text-sm text-slate-500">
            {usuarios.length} usuário(s)
          </span>
        </div>

        {usuarios.map((usuario) => (
          <UsuarioCard
            key={usuario.id}
            usuario={usuario}
            usuarioAtual={
              usuario.id === usuarioAtualId
            }
            aoAtualizar={atualizarUsuario}
          />
        ))}
      </section>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type,
  autoComplete,
  minimo,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type: "text" | "email" | "password";
  autoComplete: string;
  minimo?: number;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        autoComplete={autoComplete}
        minLength={minimo}
        required
        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
      />
    </label>
  );
}

function UsuarioCard({
  usuario,
  usuarioAtual,
  aoAtualizar,
}: {
  usuario: Usuario;
  usuarioAtual: boolean;
  aoAtualizar: (usuario: Usuario) => void;
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [papel, setPapel] =
    useState<Papel>(usuario.papel);
  const [processando, setProcessando] =
    useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function enviarAlteracao(
    dados: Record<string, unknown>,
  ) {
    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      const response = await fetch(
        `/api/admin/usuarios/${usuario.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        },
      );

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.erro ||
            "Não foi possível atualizar o usuário.",
        );
      }

      aoAtualizar(resultado.usuario);
      setNome(resultado.usuario.nome);
      setEmail(resultado.usuario.email);
      setPapel(resultado.usuario.papel);
      setMensagem("Alteração salva.");
    }
    catch (erroAtualizacao) {
      setErro(
        erroAtualizacao instanceof Error
          ? erroAtualizacao.message
          : "Não foi possível atualizar o usuário.",
      );
    }
    finally {
      setProcessando(false);
    }
  }

  return (
    <article
      className={
        "rounded-2xl border p-6 " +
        (usuario.ativo
          ? "border-white/10 bg-slate-900/50"
          : "border-red-500/20 bg-red-950/10")
      }
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          <Campo
            label="Nome"
            value={nome}
            onChange={setNome}
            type="text"
            autoComplete="off"
          />

          <Campo
            label="E-mail"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="off"
          />

          <label className="space-y-2">
            <span className="text-sm text-slate-400">
              Papel
            </span>

            <select
              value={papel}
              disabled={usuarioAtual}
              onChange={(event) =>
                setPapel(event.target.value as Papel)
              }
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
            >
              {PAPEIS.map((item) => (
                <option
                  key={item.valor}
                  value={item.valor}
                >
                  {item.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={processando}
            onClick={() =>
              enviarAlteracao({
                nome,
                email,
                papel,
              })
            }
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Salvar
          </button>

          <button
            type="button"
            disabled={processando || usuarioAtual}
            onClick={() =>
              enviarAlteracao({
                ativo: !usuario.ativo,
              })
            }
            className={
              "rounded-lg border px-4 py-3 text-sm font-bold disabled:opacity-50 " +
              (usuario.ativo
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400")
            }
          >
            {usuario.ativo
              ? "Bloquear"
              : "Reativar"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span
          className={
            usuario.ativo
              ? "text-emerald-400"
              : "text-red-400"
          }
        >
          {usuario.ativo ? "Ativo" : "Bloqueado"}
        </span>

        {usuarioAtual && (
          <span className="text-blue-400">
            Sua conta
          </span>
        )}

        <span className="text-slate-500">
          Último acesso:{" "}
          {usuario.ultimoLoginEm
            ? new Date(
                usuario.ultimoLoginEm,
              ).toLocaleString("pt-BR")
            : "Nunca acessou"}
        </span>
      </div>

      {mensagem && (
        <p className="mt-3 text-sm text-emerald-400">
          {mensagem}
        </p>
      )}

      {erro && (
        <p className="mt-3 text-sm text-red-400">
          {erro}
        </p>
      )}
    </article>
  );
}