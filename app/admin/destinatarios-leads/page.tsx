import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  USUARIO_ADMIN_COOKIE,
  obterUsuarioPorToken,
} from "@/lib/auth-usuario";
import { prisma } from "@/lib/prisma";
import DestinatariosLeadsAdmin from "./destinatarios-leads-admin";

export default async function DestinatariosLeadsPage() {
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

  const destinatariosBanco =
    await prisma.leadEmailRecipient.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
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

  const destinatarios = destinatariosBanco.map(
    (destinatario) => ({
      ...destinatario,
      createdAt: destinatario.createdAt.toISOString(),
      updatedAt: destinatario.updatedAt.toISOString(),
    }),
  );

  return (
    <main className="px-6 py-8">
      <DestinatariosLeadsAdmin
        destinatariosIniciais={destinatarios}
      />
    </main>
  );
}