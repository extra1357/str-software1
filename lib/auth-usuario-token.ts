import jwt, { JwtPayload } from "jsonwebtoken";
import type { UsuarioPapel } from "@prisma/client";

export const USUARIO_ADMIN_COOKIE =
  process.env.ADMIN_COOKIE_NAME || "admin-auth";

export const USUARIO_ADMIN_SESSION_MAX_AGE =
  60 * 60 * 24;

const PAPEIS_VALIDOS: UsuarioPapel[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "COMERCIAL",
  "FINANCEIRO",
  "SUPORTE",
  "CONTEUDO",
];

export type UsuarioSessionPayload = JwtPayload & {
  sub: string;
  tipo: "usuario-str";
  papel: UsuarioPapel;
  sessionVersion: number;
};

function obterSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.trim().length < 32) {
    console.error(
      "[auth-usuario-token] ADMIN_SESSION_SECRET ausente ou inválido",
    );

    return null;
  }

  return secret;
}

function papelValido(valor: unknown): valor is UsuarioPapel {
  return (
    typeof valor === "string" &&
    PAPEIS_VALIDOS.includes(valor as UsuarioPapel)
  );
}

export function criarUsuarioSessionToken(
  usuarioId: string,
  papel: UsuarioPapel,
  sessionVersion: number,
): string {
  const secret = obterSessionSecret();

  if (!secret) {
    throw new Error(
      "Configuração de sessão administrativa inválida.",
    );
  }

  return jwt.sign(
    {
      tipo: "usuario-str",
      papel,
      sessionVersion,
    },
    secret,
    {
      algorithm: "HS256",
      subject: usuarioId,
      expiresIn: USUARIO_ADMIN_SESSION_MAX_AGE,
    },
  );
}

export function verificarUsuarioSessionToken(
  token: string | undefined,
): UsuarioSessionPayload | null {
  if (!token) {
    return null;
  }

  const secret = obterSessionSecret();

  if (!secret) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      payload.tipo !== "usuario-str" ||
      !papelValido(payload.papel) ||
      typeof payload.sessionVersion !== "number"
    ) {
      console.warn(
        "[auth-usuario-token] payload administrativo inválido",
      );

      return null;
    }

    return payload as UsuarioSessionPayload;
  }
  catch (erro) {
    if (erro instanceof jwt.TokenExpiredError) {
      console.warn(
        "[auth-usuario-token] sessão administrativa expirada",
      );
    }
    else {
      console.warn(
        "[auth-usuario-token] sessão administrativa inválida",
      );
    }

    return null;
  }
}