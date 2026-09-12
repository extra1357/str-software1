import { adminLogin } from "../actions/admin-login";

type SearchParams = {
  error?: string;
};

export default async function LoginPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  const mensagemErro =
    error === "blocked"
      ? "Muitas tentativas. Aguarde 15 minutos."
      : error === "true"
        ? "E-mail ou senha inválidos."
        : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-6">
      <form
        action={adminLogin}
        className="bg-slate-900 p-8 rounded-xl border border-white/10 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          Acesso <span className="text-blue-500">STR</span>
        </h1>

        <p className="text-sm text-slate-400 text-center">
          Área restrita à equipe autorizada.
        </p>

        {mensagemErro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {mensagemErro}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm text-slate-400 mb-2"
          >
            E-mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@strsoftware.com.br"
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm text-slate-400 mb-2"
          >
            Senha
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
        >
          Entrar
        </button>

        <a
          href="/recuperar-senha"
          className="block text-center text-sm text-blue-400 hover:text-blue-300 transition"
        >
          Esqueci minha senha
        </a>

        <a
          href="/"
          className="block text-center text-sm text-slate-400 hover:text-white transition mt-4"
        >
          ← Voltar para o site
        </a>
      </form>
    </main>
  );
}