import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  isAdminCookieAutenticado,
} from "@/lib/auth-admin";
import { obterUsuarioPorToken } from "@/lib/auth-usuario";
import AdminNav from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const adminCookie =
    cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  const usuario = await obterUsuarioPorToken(adminCookie);
  const sessaoLegadaValida =
    isAdminCookieAutenticado(adminCookie);

  if (!usuario && !sessaoLegadaValida) {
    console.warn(
      "[ADMIN][LAYOUT] Acesso administrativo sem sessão válida.",
    );

    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <header className="space-y-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Painel{" "}
              <span className="text-blue-500">
                Administrativo
              </span>
            </h1>

            <p className="text-slate-400 mt-2">
              Gestão operacional da STR Software.
            </p>

            {usuario && (
              <p className="text-sm text-slate-500 mt-1">
                {usuario.nome} · {usuario.papel}
              </p>
            )}
          </div>

          <AdminNav papel={usuario?.papel} />
        </header>
      </div>

      {children}
    </div>
  );
}