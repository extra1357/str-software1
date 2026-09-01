import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CLIENTE_SESSION_COOKIE,
  verificarSessionToken,
} from "@/lib/auth-cliente";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function obterClienteAutenticado(request: NextRequest) {
  const token = request.cookies.get(CLIENTE_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const sessao = await verificarSessionToken(token);

  if (!sessao) {
    return null;
  }

  const cliente = await prisma.cliente.findFirst({
    where: {
      id: sessao.clienteId,
      ativo: true,
    },
    select: {
      id: true,
    },
  });

  return cliente;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cliente = await obterClienteAutenticado(request);

    if (!cliente) {
      console.warn(
        "[cliente/solicitacoes/mensagens] GET sem cliente autenticado e ativo"
      );

      return NextResponse.json(
        { erro: "Nao autorizado." },
        { status: 401 }
      );
    }

    const { id: ticketId } = await context.params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        clienteId: cliente.id,
      },
      select: {
        id: true,
        protocolo: true,
        mensagens: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            autorTipo: true,
            mensagem: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ticket) {
      console.warn(
        `[cliente/solicitacoes/mensagens] ticket inexistente ou sem acesso: ${ticketId}`
      );

      return NextResponse.json(
        { erro: "Solicitacao nao encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      protocolo: ticket.protocolo,
      mensagens: ticket.mensagens,
    });
  } catch (erro) {
    console.error(
      "[cliente/solicitacoes/mensagens] erro ao listar mensagens",
      erro
    );

    return NextResponse.json(
      { erro: "Erro ao carregar mensagens." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cliente = await obterClienteAutenticado(request);

    if (!cliente) {
      console.warn(
        "[cliente/solicitacoes/mensagens] POST sem cliente autenticado e ativo"
      );

      return NextResponse.json(
        { erro: "Nao autorizado." },
        { status: 401 }
      );
    }

    const { id: ticketId } = await context.params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        clienteId: cliente.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!ticket) {
      console.warn(
        `[cliente/solicitacoes/mensagens] tentativa de escrever em ticket sem acesso: ${ticketId}`
      );

      return NextResponse.json(
        { erro: "Solicitacao nao encontrada." },
        { status: 404 }
      );
    }

    if (ticket.status === "ENCERRADO") {
      return NextResponse.json(
        {
          erro: "Solicitacoes encerradas nao aceitam novas mensagens.",
        },
        { status: 409 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { erro: "Corpo da requisicao invalido." },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("mensagem" in body)
    ) {
      return NextResponse.json(
        { erro: "Mensagem obrigatoria." },
        { status: 400 }
      );
    }

    const mensagemBruta = (body as { mensagem?: unknown }).mensagem;

    if (typeof mensagemBruta !== "string") {
      return NextResponse.json(
        { erro: "Mensagem invalida." },
        { status: 400 }
      );
    }

    const mensagem = mensagemBruta.trim();

    if (mensagem.length < 1) {
      return NextResponse.json(
        { erro: "Mensagem obrigatoria." },
        { status: 400 }
      );
    }

    if (mensagem.length > 5000) {
      return NextResponse.json(
        {
          erro: "Mensagem excede o limite de 5000 caracteres.",
        },
        { status: 400 }
      );
    }

    const novaMensagem = await prisma.ticketMensagem.create({
      data: {
        ticketId: ticket.id,
        autorTipo: "CLIENTE",
        mensagem,
      },
      select: {
        id: true,
        autorTipo: true,
        mensagem: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        mensagem: novaMensagem,
      },
      { status: 201 }
    );
  } catch (erro) {
    console.error(
      "[cliente/solicitacoes/mensagens] erro ao registrar mensagem",
      erro
    );

    return NextResponse.json(
      { erro: "Erro ao registrar mensagem." },
      { status: 500 }
    );
  }
}