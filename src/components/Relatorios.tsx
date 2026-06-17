import React from "react";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Award, 
  Activity, 
  ChevronRight 
} from "lucide-react";
import { Pagamento } from "../types";

interface RelatoriosProps {
  pagamentos: Pagamento[];
  handleCopyPixKey: () => void;
}

export function Relatorios({ pagamentos, handleCopyPixKey }: RelatoriosProps) {
  return (
    <div className="space-y-4 animate-fadeIn" id="relatorios-tab-content">
      <div className="text-left pb-1 border-b border-zinc-900">
        <h2 className="text-base font-black text-white uppercase tracking-wider">Diretório de Relatórios</h2>
        <p className="text-[10px] text-zinc-500">Métricas consolidadas de evolução, exames e faturamento</p>
      </div>

      {/* Category selector rows */}
      <div className="space-y-2 text-xs font-black text-left" id="reports-categories-list">
        <div className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="font-extrabold text-white text-xs uppercase">Alunos</p>
              <p className="text-[10px] font-mono font-medium text-zinc-500">Ver relatório consolidado do corpo discente</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="font-extrabold text-white text-xs uppercase">Presenças</p>
              <p className="text-[10px] font-mono font-medium text-zinc-500">Relação e estatística de aulas dadas</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="font-extrabold text-white text-xs uppercase">Financeiro</p>
              <p className="text-[10px] font-mono font-medium text-zinc-500">Tabela de adimplência e faturamento PIX</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="font-extrabold text-white text-xs uppercase">Graduações</p>
              <p className="text-[10px] font-mono font-medium text-zinc-500">Mapeamento de Sashes e faixas ativas</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="font-extrabold text-white text-xs uppercase">Exames</p>
              <p className="text-[10px] font-mono font-medium text-zinc-500">Propostas de exames de sash e aprovações</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>
      </div>

      {/* Dynamic summary numbers block based on financial details */}
      <div className="bg-zinc-950 border border-zinc-900 p-4.5 rounded-2xl text-left space-y-3.5" id="reports-cash-closer-box">
        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Fechamento do Caixa Mensal</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/60 border border-zinc-900 p-3.5 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Receitas Homologadas</span>
            <p className="text-sm font-black font-mono text-emerald-400">R$ {pagamentos.filter(p => p.status === "Pago").reduce((a, b) => a + b.valor, 0).toFixed(2)}</p>
          </div>
          <div className="bg-black/60 border border-zinc-900 p-3.5 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Boletos Pendentes</span>
            <p className="text-sm font-black font-mono text-amber-500">R$ {pagamentos.filter(p => p.status === "Pendente").reduce((a, b) => a + b.valor, 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Vencimentos list */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase">Controle de Inadimplência:</p>
          <div className="max-h-[140px] overflow-y-auto space-y-1 text-xs">
            {pagamentos.filter(p => p.status === "Pendente").map(p => (
              <div key={p.id} className="p-2.5 bg-[#141414] border border-zinc-900 rounded-xl flex items-center justify-between text-[11px]">
                <span className="text-white font-semibold truncate max-w-[155px]">{p.alunoNome}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-mono font-bold">R$ {p.valor.toFixed(0)}</span>
                  <button
                    onClick={handleCopyPixKey}
                    className="bg-red-800 text-white font-black text-[8px] uppercase tracking-wider py-1 px-2 rounded-xl"
                  >
                    Copia Pix
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
