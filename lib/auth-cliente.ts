import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const SESSION_SECRET = process.env.SESSION_SECRET as string;
const SESSION_COOKIE_NAME = "cliente-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

type ClienteSessionPayload = {
  clienteId: string;
  sessionVersion: number;
};

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function gerarSessionToken(clienteId: string, sessionVersion: number): string {
  if (!SESSION_SECRET) {
    console.error("[auth-cliente] SESSION_SECRET nao definido no ambiente");
    throw new Error("Configuracao de sessao ausente");
  }

  return jwt.sign(
    { clienteId, sessionVersion },
    SESSION_SECRET,
    { expiresIn: SESSION_DURATION_SECONDS },
  );
}

export async function verificarSessionToken(token: string): Promise<ClienteSessionPayload | null> {
  if (!SESSION_SECRET) {
    console.error("[auth-cliente] SESSION_SECRET nao definido no ambiente");
    return null;
  }

  let payload: ClienteSessionPayload;

  try {
    const verificado = jwt.verify(token, SESSION_SECRET);

    if (
      typeof verificado === "string" ||
      typeof verificado.clienteId !== "string" ||
      typeof verificado.sessionVersion !== "number"
    ) {
      console.warn("[auth-cliente] payload de sessao invalido");
      return null;
    }

    payload = {
      clienteId: verificado.clienteId,
      sessionVersion: verificado.sessionVersion,
    };
  } catch (erro) {
    console.warn(
      "[auth-cliente] token de sessao invalido ou expirado:",
      (erro as Error).message,
    );
    return null;
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: payload.clienteId },
      select: {
        ativo: true,
        sessionVersion: true,
      },
    });

    if (!cliente || !cliente.ativo) {
      console.warn("[auth-cliente] cliente da sessao nao encontrado ou inativo");
      return null;
    }

    if (cliente.sessionVersion !== payload.sessionVersion) {
      console.warn("[auth-cliente] sessao invalidada por alteracao de versao");
      return null;
    }

    return payload;
  } catch (erro) {
    console.error("[auth-cliente] falha ao validar sessao no banco:", erro);
    return null;
  }
}

export async function estaTravadoPorRateLimit(email: string): Promise<boolean> {
  const desde = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  try {
    const tentativasFalhas = await prisma.loginAttempt.count({
      where: {
        email,
        sucesso: false,
        createdAt: { gte: desde },
      },
    });

    return tentativasFalhas >= RATE_LIMIT_MAX_ATTEMPTS;
  } catch (erro) {
    console.error("[auth-cliente] falha ao consultar rate limit:", erro);
    return true;
  }
}

export async function registrarTentativaLogin(
  email: string,
  sucesso: boolean,
  ip: string | null,
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: { email, sucesso, ip },
    });
  } catch (erro) {
    console.error("[auth-cliente] falha ao registrar tentativa de login:", erro);
  }
}

export const CLIENTE_SESSION_COOKIE = SESSION_COOKIE_NAME;
export const CLIENTE_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
