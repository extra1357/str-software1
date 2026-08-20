import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarSessionToken, CLIENTE_SESSION_COOKIE } from "@/lib/auth-cliente";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import PagarButton from "./pagar-button";

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  VENCIDO: "Vencido",
};

export default async function ClienteDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENTE_SESSION_COOKIE)?.value;

  if (!token) {
    console.warn("[cliente/dashboard] acesso sem cookie de sessao");
    redirect("/cliente/login");
  }

  const sessao = verificarSessionToken(token);

  if (!sessao) {
    console.warn("[cliente/dashboard] token de sessao invalido ou expirado");
    redirect("/cliente/login");
  }

  const cliente = await prisma.cliente
    .findUnique({
      where: { id: sessao.clienteId },
      select: { id: true, nome: true, email: true, ativo: true },
    })
    .catch((erro) => {
      console.error("[cliente/dashboard] falha ao buscar cliente:", erro);
      return null;
    });

  if (!cliente || !cliente.ativo) {
    console.warn("[cliente/dashboard] cliente nao encontrado ou inativo");
    redirect("/cliente/login");
  }

  const faturas = await prisma.fatura
    .findMany({
      where: { clienteId: cliente.id },
      orderBy: { vencimento: "desc" },
    })
    .catch((erro) => {
      console.error("[cliente/dashboard] falha ao buscar faturas:", erro);
      return [];
    });

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Ola, {cliente.nome}</h1>
            <p className="text-slate-400 text-sm">{cliente.email}</p>
          </div>
          <LogoutButton />

        </div>

        <h2 className="text-lg font-semibold mb-4">Suas faturas</h2>

        {faturas.length === 0 ? (
          <p className="text-slate-400">Nenhuma fatura encontrada.</p>
        ) : (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3">Descricao</th>
                  <th className="text-left px-4 py-3">Vencimento</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="text-right px-4 py-3">Acao</th>
                </tr>
              </thead>
              <tbody>
                {faturas.map((fatura) => (
                  <tr key={fatura.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{fatura.descricao}</td>
                    <td className="px-4 py-3">{formatarData(fatura.vencimento)}</td>
                    <td className="px-4 py-3">{ROTULO_STATUS[fatura.status] ?? fatura.status}</td>
                    <td className="px-4 py-3 text-right">{formatarMoeda(Number(fatura.valor))}</td>
                    <td className="px-4 py-3 text-right">
                      {fatura.status === "PENDENTE" ? <PagarButton faturaId={fatura.id} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
