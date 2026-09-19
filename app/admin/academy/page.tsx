
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  USUARIO_ADMIN_COOKIE,
  obterUsuarioPorToken,
} from "@/lib/auth-usuario";
import { exigirPapelUsuario } from "@/lib/auth-rbac";
import { PAPEIS_ACADEMY_ADMIN } from "@/lib/rbac-politicas";


export default async function AcademyAdminPage() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(USUARIO_ADMIN_COOKIE)?.value;

  const usuario =
    await obterUsuarioPorToken(token);

  if (!usuario) {
    console.warn(
      "[RBAC][ACADEMY] acesso sem sessao moderna de Usuario",
    );

    redirect("/login");
  }

  if (!exigirPapelUsuario(usuario, PAPEIS_ACADEMY_ADMIN)) {
    redirect("/admin");
  }

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
            STR Academy
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
            Gestao academica
          </h2>

          <p className="mt-3 max-w-3xl text-slate-400">
            Area administrativa da STR Academy para gerenciamento
            de trilhas, modulos, aulas e conteudo educacional.
          </p>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">
              Sessao autorizada
            </p>

            <p className="mt-1 font-semibold text-white">
              {usuario.nome}
            </p>

            <p className="text-sm text-slate-500">
              Papel: {usuario.papel}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
