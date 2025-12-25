import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
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
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}
