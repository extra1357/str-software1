import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import {
  isAdminAutenticado,
  respostaNaoAutorizado,
} from "@/lib/auth-admin";

export async function GET(request: NextRequest) {
  if (!isAdminAutenticado(request)) {
    console.warn(
      "[admin/export] tentativa de exportacao sem autenticacao"
    );

    return respostaNaoAutorizado();
  }

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const header = [
      "ID",
      "Nome",
      "Email",
      "Telefone",
      "Mensagem",
      "Criado em",
    ];

    const rows = leads.map((lead) => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone,
      lead.release.replace(/\n/g, " "),
      lead.createdAt.toISOString(),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map(
            (field) =>
              `"${String(field).replace(/"/g, '""')}"`
          )
          .join(";")
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="leads.csv"',
      },
    });
  } catch (erro) {
    console.error(
      "[admin/export] falha ao exportar leads",
      erro
    );

    return NextResponse.json(
      { erro: "Falha ao exportar leads." },
      { status: 500 }
    );
  }
}
