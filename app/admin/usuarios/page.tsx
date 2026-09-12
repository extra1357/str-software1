import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  USUARIO_ADMIN_COOKIE,
  obterUsuarioPorToken,
} from "@/lib/auth-usuario";
import UsuariosAdmin from "./usuarios-admin";

export default async function UsuariosPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(USUARIO_ADMIN_COOKIE)?.value;

  const usuarioAtual =
    await obterUsuarioPorToken(token);

  if (!usuarioAtual) {
    redirect("/login");
  }

  if (usuarioAtual.papel !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const usuariosBanco = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      ativo: true,
      ultimoLoginEm: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        ativo: "desc",
      },
      {
        nome: "asc",
      },
    ],
  });

  const usuarios = usuariosBanco.map((usuario) => ({
    ...usuario,
    ultimoLoginEm:
      usuario.ultimoLoginEm?.toISOString() ?? null,
    createdAt: usuario.createdAt.toISOString(),
    updatedAt: usuario.updatedAt.toISOString(),
  }));

  return (
    <main className="px-6 py-8">
      <UsuariosAdmin
        usuarioAtualId={usuarioAtual.id}
        usuariosIniciais={usuarios}
      />
    </main>
  );
}