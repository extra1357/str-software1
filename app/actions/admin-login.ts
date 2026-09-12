"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  USUARIO_ADMIN_COOKIE,
  USUARIO_ADMIN_SESSION_MAX_AGE,
  criarUsuarioSessionToken,
  estaTravadoUsuarioPorRateLimit,
  registrarTentativaUsuarioLogin,
  verificarSenhaUsuario,
} from "@/lib/auth-usuario";

export async function adminLogin(formData: FormData) {
  const emailRecebido = formData.get("email");
  const senhaRecebida = formData.get("password");

  const email =
    typeof emailRecebido === "string"
      ? emailRecebido.trim().toLowerCase()
      : "";

  const senha =
    typeof senhaRecebida === "string"
      ? senhaRecebida
      : "";

  if (
    !email ||
    email.length > 254 ||
    !senha ||
    senha.length > 128
  ) {
    redirect("/login?error=true");
  }

  const bloqueado =
    await estaTravadoUsuarioPorRateLimit(email);

  if (bloqueado) {
    console.warn(
      "[admin-login] tentativa limitada por rate limit",
    );

    redirect("/login?error=blocked");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      senhaHash: true,
      papel: true,
      ativo: true,
      sessionVersion: true,
    },
  });

  const senhaValida =
    usuario && usuario.ativo
      ? await verificarSenhaUsuario(
          senha,
          usuario.senhaHash,
        )
      : false;

  if (!usuario || !usuario.ativo || !senhaValida) {
    await registrarTentativaUsuarioLogin(
      email,
      false,
      null,
    );

    console.warn(
      "[admin-login] tentativa administrativa inválida",
    );

    redirect("/login?error=true");
  }

  await registrarTentativaUsuarioLogin(
    email,
    true,
    null,
  );

  const token = criarUsuarioSessionToken(
    usuario.id,
    usuario.papel,
    usuario.sessionVersion,
  );

  await prisma.usuario.update({
    where: {
      id: usuario.id,
    },
    data: {
      ultimoLoginEm: new Date(),
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(
    USUARIO_ADMIN_COOKIE,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: USUARIO_ADMIN_SESSION_MAX_AGE,
    },
  );

  console.info(
    `[admin-login] sessão criada para usuário ${usuario.id}`,
  );

  redirect("/admin");
}