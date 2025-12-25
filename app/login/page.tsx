// ============================================
// ARQUIVO 2: app/login/page.tsx
// ============================================
import { adminLogin } from "../actions/admin-login";

type SearchParams = {
  error?: string;
};

export default async function LoginPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const hasError = searchParams?.error === "true";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white px-6">
      <form
        action={adminLogin}
        className="bg-slate-900 p-8 rounded-xl border border-white/10 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          Login <span className="text-blue-500">Admin</span>
        </h1>

        {/* Mensagem de Erro */}
        {hasError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            ❌ Credenciais inválidas
          </div>
        )}

        {/* Campo Usuário */}
        <div>
          <label htmlFor="user" className="block text-sm text-slate-400 mb-2">
            Usuário
          </label>
          <input
            id="user"
            name="user"
            type="text"
            placeholder="admin"
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 
                     focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        {/* Campo Senha */}
        <div>
          <label htmlFor="password" className="block text-sm text-slate-400 mb-2">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 rounded bg-slate-800 border border-white/10 
                     focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 
                   text-white font-bold transition-colors"
        >
          Entrar
        </button>

        {/* Link Voltar */}
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