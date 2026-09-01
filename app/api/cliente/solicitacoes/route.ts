import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CLIENTE_SESSION_COOKIE,
  verificarSessionToken,
} from "@/lib/auth-cliente";
import { randomUUID } from "crypto";

const TIPOS_VALIDOS = new Set([
  "SUPORTE",
  "MANUTENCAO",
  "PROBLEMA",
  "ORCAMENTO",
  "ALTERACAO",
  "FINANCEIRO",
  "DOCUMENTO",
  "DUVIDA",
]);

const PRIORIDADES_VALIDAS = new Set([
  "BAIXA",
  "NORMAL",
  "ALTA",
]);

function gerarProtocolo(): string {
  const ano = new Date().getUTCFullYear();
  const sufixo = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `STR-${ano}-${sufixo}`;
}

async function obterClienteAutenticado(request: NextRequest) {
  const token = request.cookies.get(CLIENTE_SESSION_COOKIE)?.value;

  if (!token) {
    console.warn("[cliente/solicitacoes] requisicao sem cookie de sessao");
    return null;
  }

  const sessao = await verificarSessionToken(token);

  if (!sessao) {
    console.warn("[cliente/solicitacoes] token de sessao invalido ou expirado");
    return null;
  }

  return sessao.clienteId;
}

export async function GET(request: NextRequest) {
  const clienteId = await obterClienteAutenticado(request);

  if (!clienteId) {
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  try {
    const solicitacoes = await prisma.ticket.findMany({
      where: { clienteId },
      select: {
        id: true,
        protocolo: true,
        tipo: true,
        titulo: true,
        descricao: true,
        prioridade: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        encerradoEm: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ solicitacoes });
  } catch (erro) {
    console.error("[cliente/solicitacoes] falha ao listar solicitacoes:", erro);
    return NextResponse.json({ erro: "Falha ao listar solicitacoes." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const clienteId = await obterClienteAutenticado(request);

  if (!clienteId) {
    return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  let tipo: string;
  let titulo: string;
  let descricao: string;
  let prioridade: string;

  try {
    const body = await request.json();

    tipo = typeof body.tipo === "string" ? body.tipo.trim().toUpperCase() : "";
    titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
    descricao = typeof body.descricao === "string" ? body.descricao.trim() : "";
    prioridade = typeof body.prioridade === "string" ? body.prioridade.trim().toUpperCase() : "NORMAL";
  } catch (erro) {
    console.warn("[cliente/solicitacoes] corpo da requisicao invalido", erro);
    return NextResponse.json({ erro: "Requisicao invalida." }, { status: 400 });
  }

  if (!TIPOS_VALIDOS.has(tipo)) {
    return NextResponse.json({ erro: "Tipo de solicitacao invalido." }, { status: 400 });
  }

  if (!PRIORIDADES_VALIDAS.has(prioridade)) {
    return NextResponse.json({ erro: "Prioridade invalida." }, { status: 400 });
  }

  if (!titulo || titulo.length > 150) {
    return NextResponse.json({ erro: "Titulo deve ter entre 1 e 150 caracteres." }, { status: 400 });
  }

  if (!descricao || descricao.length > 5000) {
    return NextResponse.json({ erro: "Descricao deve ter entre 1 e 5000 caracteres." }, { status: 400 });
  }

  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const protocolo = gerarProtocolo();

    try {
      const solicitacao = await prisma.ticket.create({
        data: {
          clienteId,
          protocolo,
          tipo,
          titulo,
          descricao,
          prioridade,
        },
        select: {
          id: true,
          protocolo: true,
          tipo: true,
          titulo: true,
          descricao: true,
          prioridade: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          encerradoEm: true,
        },
      });

      return NextResponse.json({ solicitacao }, { status: 201 });
    } catch (erro: unknown) {
      const codigoPrisma = (erro as { code?: string })?.code;

      if (codigoPrisma === "P2002" && tentativa < 3) {
        console.warn(`[cliente/solicitacoes] colisao de protocolo na tentativa ${tentativa}`);
        continue;
      }

      console.error("[cliente/solicitacoes] falha ao criar solicitacao:", erro);
      return NextResponse.json({ erro: "Falha ao criar solicitacao." }, { status: 500 });
    }
  }

  console.error("[cliente/solicitacoes] nao foi possivel gerar protocolo unico apos 3 tentativas");
  return NextResponse.json({ erro: "Falha ao gerar protocolo da solicitacao." }, { status: 500 });
}
