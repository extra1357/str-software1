import bcrypt from "bcryptjs";
import type { UsuarioPapel } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  USUARIO_ADMIN_COOKIE,
  verificarUsuarioSessionToken,
} from "@/lib/auth-usuario-token";

export {
  USUARIO_ADMIN_COOKIE,
  USUARIO_ADMIN_SESSION_MAX_AGE,
  criarUsuarioSessionToken,
  verificarUsuarioSessionToken,
} from "@/lib/auth-usuario-token";

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export type UsuarioAutenticado = {
  id: string;
  nome: string;
  email: string;
  papel: UsuarioPapel;
  sessionVersion: number;
};

export async function hashSenhaUsuario(
  senha: string,
): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenhaUsuario(
  senha: string,
  senhaHash: string,
): Promise<boolean> {
  return bcrypt.compare(senha, senhaHash);
}

export async function obterUsuarioPorToken(
  token: string | undefined,
): Promise<UsuarioAutenticado | null> {
  const payload = verificarUsuarioSessionToken(token);

  if (!payload) {
    return null;
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        ativo: true,
        sessionVersion: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      console.warn(
        "[auth-usuario] usuário não encontrado ou inativo",
      );

      return null;
    }

    if (usuario.sessionVersion !== payload.sessionVersion) {
      console.warn(
        "[auth-usuario] sessão invalidada por alteração de versão",
      );

      return null;
    }

    if (usuario.papel !== payload.papel) {
      console.warn(
        "[auth-usuario] sessão invalidada por alteração de papel",
      );

      return null;
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      sessionVersion: usuario.sessionVersion,
    };
  }
  catch (erro) {
    console.error(
      "[auth-usuario] falha ao validar usuário no banco:",
      erro,
    );

    return null;
  }
}

export async function obterUsuarioPorRequest(
  request: NextRequest,
): Promise<UsuarioAutenticado | null> {
  const token =
    request.cookies.get(USUARIO_ADMIN_COOKIE)?.value;

  return obterUsuarioPorToken(token);
}

export async function estaTravadoUsuarioPorRateLimit(
  email: string,
): Promise<boolean> {
  const desde = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  );

  try {
    const tentativasFalhas =
      await prisma.usuarioLoginAttempt.count({
        where: {
          email,
          sucesso: false,
          createdAt: {
            gte: desde,
          },
        },
      });

    return tentativasFalhas >= RATE_LIMIT_MAX_ATTEMPTS;
  }
  catch (erro) {
    console.error(
      "[auth-usuario] falha ao consultar rate limit:",
      erro,
    );

    return true;
  }
}

export async function registrarTentativaUsuarioLogin(
  email: string,
  sucesso: boolean,
  ip: string | null,
): Promise<void> {
  try {
    await prisma.usuarioLoginAttempt.create({
      data: {
        email,
        sucesso,
        ip,
      },
    });
  }
  catch (erro) {
    console.error(
      "[auth-usuario] falha ao registrar tentativa de login:",
      erro,
    );
  }
}