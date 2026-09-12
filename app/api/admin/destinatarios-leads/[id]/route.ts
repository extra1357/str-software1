import {
  Prisma,
  type LeadEmailRecipient,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { obterUsuarioPorRequest } from "@/lib/auth-usuario";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function respostaNaoAutorizada() {
  return NextResponse.json(
    { erro: "Não autorizado." },
    { status: 401 },
  );
}

function respostaSemPermissao() {
  return NextResponse.json(
    {
      erro:
        "Somente o SUPER_ADMIN pode gerenciar destinatários de leads.",
    },
    { status: 403 },
  );
}

async function exigirSuperAdmin(request: NextRequest) {
  const usuario = await obterUsuarioPorRequest(request);

  if (!usuario) {
    return {
      usuario: null,
      resposta: respostaNaoAutorizada(),
    };
  }

  if (usuario.papel !== "SUPER_ADMIN") {
    return {
      usuario: null,
      resposta: respostaSemPermissao(),
    };
  }

  return {
    usuario,
    resposta: null,
  };
}

function emailValido(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  );
}

async function obterDestinatario(
  id: string,
): Promise<LeadEmailRecipient | null> {
  return prisma.leadEmailRecipient.findUnique({
    where: {
      id,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const acesso = await exigirSuperAdmin(request);

  if (acesso.resposta) {
    return acesso.resposta;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { erro: "Destinatário inválido." },
        { status: 400 },
      );
    }

    const atual = await obterDestinatario(id);

    if (!atual) {
      return NextResponse.json(
        { erro: "Destinatário não encontrado." },
        { status: 404 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { erro: "Solicitação inválida." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { erro: "Solicitação inválida." },
        { status: 400 },
      );
    }

    const data: Prisma.LeadEmailRecipientUpdateInput =
      {};

    let desativandoUltimo = false;

    if ("nome" in body && body.nome !== undefined) {
      const nome =
        typeof body.nome === "string"
          ? body.nome.trim()
          : "";

      if (nome.length < 2 || nome.length > 120) {
        return NextResponse.json(
          {
            erro:
              "O nome deve ter entre 2 e 120 caracteres.",
          },
          { status: 400 },
        );
      }

      data.nome = nome;
    }

    if ("email" in body && body.email !== undefined) {
      const email =
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "";

      if (!email || !emailValido(email)) {
        return NextResponse.json(
          { erro: "Informe um e-mail válido." },
          { status: 400 },
        );
      }

      const emailEmUso =
        await prisma.leadEmailRecipient.findFirst({
          where: {
            email,
            id: {
              not: id,
            },
          },
          select: {
            id: true,
          },
        });

      if (emailEmUso) {
        return NextResponse.json(
          {
            erro:
              "Este e-mail já está cadastrado como destinatário.",
          },
          { status: 409 },
        );
      }

      data.email = email;
    }

    if ("ativo" in body && body.ativo !== undefined) {
      if (typeof body.ativo !== "boolean") {
        return NextResponse.json(
          {
            erro:
              "O estado do destinatário é inválido.",
          },
          { status: 400 },
        );
      }

      desativandoUltimo =
        atual.ativo && body.ativo === false;

      data.ativo = body.ativo;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          erro:
            "Nenhuma alteração válida foi informada.",
        },
        { status: 400 },
      );
    }

    if (desativandoUltimo) {
      const totalAtivos =
        await prisma.leadEmailRecipient.count({
          where: {
            ativo: true,
          },
        });

      if (totalAtivos <= 1) {
        return NextResponse.json(
          {
            erro:
              "Cadastre ou ative outro destinatário antes de desativar o último.",
          },
          { status: 400 },
        );
      }
    }

    const destinatario =
      await prisma.leadEmailRecipient.update({
        where: {
          id,
        },
        data,
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    console.info(
      `[api-destinatarios-leads] destinatário ${destinatario.id} atualizado por ${acesso.usuario?.id}`,
    );

    return NextResponse.json({
      sucesso: true,
      destinatario,
    });
  } catch (erro) {
    if (
      erro instanceof
        Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return NextResponse.json(
        {
          erro:
            "Este e-mail já está cadastrado como destinatário.",
        },
        { status: 409 },
      );
    }

    console.error(
      "[api-destinatarios-leads] falha ao atualizar:",
      erro,
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível atualizar o destinatário.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const acesso = await exigirSuperAdmin(request);

  if (acesso.resposta) {
    return acesso.resposta;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { erro: "Destinatário inválido." },
        { status: 400 },
      );
    }

    const atual = await obterDestinatario(id);

    if (!atual) {
      return NextResponse.json(
        { erro: "Destinatário não encontrado." },
        { status: 404 },
      );
    }

    if (atual.ativo) {
      const totalAtivos =
        await prisma.leadEmailRecipient.count({
          where: {
            ativo: true,
          },
        });

      if (totalAtivos <= 1) {
        return NextResponse.json(
          {
            erro:
              "Cadastre ou ative outro destinatário antes de excluir o último.",
          },
          { status: 400 },
        );
      }
    }

    await prisma.leadEmailRecipient.delete({
      where: {
        id,
      },
    });

    console.info(
      `[api-destinatarios-leads] destinatário ${id} removido por ${acesso.usuario?.id}`,
    );

    return NextResponse.json({
      sucesso: true,
    });
  } catch (erro) {
    console.error(
      "[api-destinatarios-leads] falha ao remover:",
      erro,
    );

    return NextResponse.json(
      {
        erro:
          "Não foi possível remover o destinatário.",
      },
      { status: 500 },
    );
  }
}