import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAutenticado, respostaNaoAutorizado } from "@/lib/auth-admin";

type DadosCliente = {
  nome?: string;
  email?: string;
  telefone?: string | null;
  tipoPessoa?: string | null;
  documento?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  nomeContato?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
};

function textoOpcional(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

function normalizarTipoPessoa(valor: unknown): string | null {
  const tipo = textoOpcional(valor)?.toUpperCase() ?? null;

  if (tipo !== null && tipo !== "PF" && tipo !== "PJ") {
    throw new Error("TIPO_PESSOA_INVALIDO");
  }

  return tipo;
}

function normalizarUf(valor: unknown): string | null {
  const uf = textoOpcional(valor)?.toUpperCase() ?? null;

  if (uf !== null && !/^[A-Z]{2}$/.test(uf)) {
    throw new Error("UF_INVALIDA");
  }

  return uf;
}

const selecaoCliente = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  tipoPessoa: true,
  documento: true,
  razaoSocial: true,
  nomeFantasia: true,
  nomeContato: true,
  cep: true,
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  uf: true,
  observacoes: true,
  ativo: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminAutenticado(request)) {
    return respostaNaoAutorizado();
  }

  const { id } = await params;
  const dadosPermitidos: DadosCliente = {};

  try {
    const body = await request.json();

    if (typeof body.nome === "string") {
      const nome = body.nome.trim();

      if (!nome) {
        return NextResponse.json(
          { erro: "Nome nao pode ficar vazio." },
          { status: 400 },
        );
      }

      dadosPermitidos.nome = nome;
    }

    if (typeof body.email === "string") {
      const email = body.email.trim().toLowerCase();

      if (!email) {
        return NextResponse.json(
          { erro: "Email nao pode ficar vazio." },
          { status: 400 },
        );
      }

      dadosPermitidos.email = email;
    }

    if (typeof body.telefone === "string" || body.telefone === null) {
      dadosPermitidos.telefone = textoOpcional(body.telefone);
    }

    if (typeof body.tipoPessoa === "string" || body.tipoPessoa === null) {
      dadosPermitidos.tipoPessoa = normalizarTipoPessoa(body.tipoPessoa);
    }

    if (typeof body.documento === "string" || body.documento === null) {
      dadosPermitidos.documento = textoOpcional(body.documento);
    }

    if (typeof body.razaoSocial === "string" || body.razaoSocial === null) {
      dadosPermitidos.razaoSocial = textoOpcional(body.razaoSocial);
    }

    if (typeof body.nomeFantasia === "string" || body.nomeFantasia === null) {
      dadosPermitidos.nomeFantasia = textoOpcional(body.nomeFantasia);
    }

    if (typeof body.nomeContato === "string" || body.nomeContato === null) {
      dadosPermitidos.nomeContato = textoOpcional(body.nomeContato);
    }

    if (typeof body.cep === "string" || body.cep === null) {
      dadosPermitidos.cep = textoOpcional(body.cep);
    }

    if (typeof body.logradouro === "string" || body.logradouro === null) {
      dadosPermitidos.logradouro = textoOpcional(body.logradouro);
    }

    if (typeof body.numero === "string" || body.numero === null) {
      dadosPermitidos.numero = textoOpcional(body.numero);
    }

    if (typeof body.complemento === "string" || body.complemento === null) {
      dadosPermitidos.complemento = textoOpcional(body.complemento);
    }

    if (typeof body.bairro === "string" || body.bairro === null) {
      dadosPermitidos.bairro = textoOpcional(body.bairro);
    }

    if (typeof body.cidade === "string" || body.cidade === null) {
      dadosPermitidos.cidade = textoOpcional(body.cidade);
    }

    if (typeof body.uf === "string" || body.uf === null) {
      dadosPermitidos.uf = normalizarUf(body.uf);
    }

    if (typeof body.observacoes === "string" || body.observacoes === null) {
      dadosPermitidos.observacoes = textoOpcional(body.observacoes);
    }

    if (typeof body.ativo === "boolean") {
      dadosPermitidos.ativo = body.ativo;
    }
  } catch (erro) {
    if (erro instanceof Error && erro.message === "TIPO_PESSOA_INVALIDO") {
      return NextResponse.json(
        { erro: "Tipo de pessoa deve ser PF ou PJ." },
        { status: 400 },
      );
    }

    if (erro instanceof Error && erro.message === "UF_INVALIDA") {
      return NextResponse.json(
        { erro: "UF deve conter exatamente duas letras." },
        { status: 400 },
      );
    }

    console.error("[admin/clientes/id] corpo da requisicao invalido:", erro);

    return NextResponse.json(
      { erro: "Requisicao invalida." },
      { status: 400 },
    );
  }

  if (Object.keys(dadosPermitidos).length === 0) {
    return NextResponse.json(
      { erro: "Nenhum campo valido para atualizar." },
      { status: 400 },
    );
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: dadosPermitidos,
      select: selecaoCliente,
    });

    return NextResponse.json({ cliente });
  } catch (erro: unknown) {
    const codigoPrisma = (erro as { code?: string })?.code;

    if (codigoPrisma === "P2025") {
      return NextResponse.json(
        { erro: "Cliente nao encontrado." },
        { status: 404 },
      );
    }

    if (codigoPrisma === "P2002") {
      return NextResponse.json(
        { erro: "Ja existe um cliente com esse email." },
        { status: 409 },
      );
    }

    console.error("[admin/clientes/id] falha ao atualizar cliente:", erro);

    return NextResponse.json(
      { erro: "Falha ao atualizar cliente." },
      { status: 500 },
    );
  }
}