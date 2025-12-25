"use client";

import { useState } from "react";
import { saveLead } from "../app/actions/save-lead";

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    const result = await saveLead(formData);
    setLoading(false);
    if (result.success) setSent(true);
  }

  if (sent) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-4 border border-blue-500/50">
        <h2 className="text-3xl font-bold text-white italic">🚀 Recebido!</h2>
        <p className="text-slate-400 font-medium">Nossa equipe entrará em contato em breve.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
      <h2 className="text-xl font-bold text-white mb-6 text-center tracking-tight">Solicite seu Projeto Web</h2>
      <form action={handleAction} className="space-y-4">
        <input name="name" placeholder="Seu Nome" required className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 transition-colors" />
        <input name="email" type="email" placeholder="E-mail" required className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 transition-colors" />
        <input name="phone" placeholder="WhatsApp" required className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 transition-colors" />
        <textarea name="release" placeholder="Descreva o sistema ou site desejado..." rows={3} required className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 resize-none transition-colors" />
        <button 
          disabled={loading}
          className="btn-shiny w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-lg font-black text-white uppercase tracking-wider transition-all disabled:bg-slate-700"
        >
          {loading ? "Processando..." : "Enviar Proposta"}
        </button>
      </form>
    </div>
  );
}