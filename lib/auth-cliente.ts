import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const SESSION_SECRET = process.env.SESSION_SECRET as string;
const SESSION_COOKIE_NAME = "cliente-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function gerarSessionToken(clienteId: string): string {
  if (!SESSION_SECRET) {
    console.error("[auth-cliente] SESSION_SECRET nao definido no ambiente");
    throw new Error("Configuracao de sessao ausente");
  }
  return jwt.sign({ clienteId }, SESSION_SECRET, { expiresIn: SESSION_DURATION_SECONDS });
}

export function verificarSessionToken(token: string): { clienteId: string } | null {
  if (!SESSION_SECRET) {
    console.error("[auth-cliente] SESSION_SECRET nao definido no ambiente");
    return null;
  }
  try {
    return jwt.verify(token, SESSION_SECRET) as { clienteId: string };
  } catch (erro) {
    console.warn("[auth-cliente] token de sessao invalido ou expirado:", (erro as Error).message);
    return null;
  }
}

export async function estaTravadoPorRateLimit(email: string): Promise<boolean> {
  const desde = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  try {
    const tentativasFalhas = await prisma.loginAttempt.count({
      where: { email, sucesso: false, createdAt: { gte: desde } },
    });
    return tentativasFalhas >= RATE_LIMIT_MAX_ATTEMPTS;
  } catch (erro) {
    console.error("[auth-cliente] falha ao consultar rate limit:", erro);
    return true; // falha segura: se nao consegue checar, trava por precaucao
  }
}

export async function registrarTentativaLogin(email: string, sucesso: boolean, ip: string | null): Promise<void> {
  try {
    await prisma.loginAttempt.create({ data: { email, sucesso, ip } });
  } catch (erro) {
    console.error("[auth-cliente] falha ao registrar tentativa de login:", erro);
  }
}

export const CLIENTE_SESSION_COOKIE = SESSION_COOKIE_NAME;
export const CLIENTE_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
