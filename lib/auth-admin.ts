import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME =
  process.env.ADMIN_COOKIE_NAME || "admin-auth";

const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 24;

type AdminSessionPayload = JwtPayload & {
  sub: "admin";
  role: "ADMIN";
};

function obterAdminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.trim().length < 32) {
    console.error(
      "[auth-admin] ADMIN_SESSION_SECRET ausente ou com menos de 32 caracteres"
    );

    return null;
  }

  return secret;
}

export function criarAdminSessionToken(): string {
  const secret = obterAdminSessionSecret();

  if (!secret) {
    throw new Error(
      "Configuracao de sessao administrativa invalida."
    );
  }

  return jwt.sign(
    {
      role: "ADMIN",
    },
    secret,
    {
      algorithm: "HS256",
      subject: "admin",
      expiresIn: ADMIN_SESSION_DURATION_SECONDS,
    }
  );
}

export function verificarAdminSessionToken(
  token: string | undefined
): boolean {
  if (!token) {
    return false;
  }

  const secret = obterAdminSessionSecret();

  if (!secret) {
    return false;
  }

  try {
    const payload = jwt.verify(
      token,
      secret,
      {
        algorithms: ["HS256"],
      }
    ) as AdminSessionPayload;

    return (
      payload.sub === "admin" &&
      payload.role === "ADMIN"
    );
  } catch (erro) {
    if (erro instanceof jwt.TokenExpiredError) {
      console.warn(
        "[auth-admin] sessao administrativa expirada"
      );
    } else {
      console.warn(
        "[auth-admin] sessao administrativa invalida"
      );
    }

    return false;
  }
}

export function isAdminCookieAutenticado(
  valorCookie: string | undefined
): boolean {
  return verificarAdminSessionToken(valorCookie);
}

export function isAdminAutenticado(
  request: NextRequest
): boolean {
  return verificarAdminSessionToken(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
}

export function respostaNaoAutorizado(): NextResponse {
  console.warn(
    "[auth-admin] tentativa de acesso sem sessao administrativa valida"
  );

  return NextResponse.json(
    { erro: "Nao autorizado." },
    { status: 401 }
  );
}