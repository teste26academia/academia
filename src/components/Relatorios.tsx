import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Award, 
  Activity, 
  ChevronRight,
  Download,
  AlertCircle,
  Package,
  ShoppingBag,
  ArrowLeft,
  UsersRound,
  DollarSign
} from "lucide-react";
import { Pagamento, Aluno, Turma, Presenca, Produto, Venda, Familia, AlunoModalidade, Exame } from "../types";

interface RelatoriosProps {
  pagamentos: Pagamento[];
  handleCopyPixKey: () => void;
  alunos?: Aluno[];
  turmas?: Turma[];
  presencas?: Presenca[];
  produtos?: Produto[];
  vendas?: Venda[];
  familias?: Familia[];
  activeRole?: string;
  alunoModalidades?: AlunoModalidade[];
  exames?: Exame[];
}

export function Relatorios({ 
  pagamentos, 
  handleCopyPixKey,
  alunos = [],
  turmas = [],
  presencas = [],
  produtos = [],
  vendas = [],
  familias = [],
  activeRole = "ALUNO",
  alunoModalidades = [],
  exames = []
}: RelatoriosProps) {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  // States to support rich interactiveness and filters over official gradings and exams
  const [filterModalidade, setFilterModalidade] = useState<string>("TODAS");
  const [filterFaixa, setFilterFaixa] = useState<string>("TODAS");
  const [filterGraduacao, setFilterGraduacao] = useState<string>("TODAS");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");

  // Exclude sensitive headers or format cells for safe parsing
  const downloadCSV = (title: string, headers: string[], rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(";"), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `relatorio_${title}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="relatorios-tab-content">
      {activeReport === null ? (
        <>
          <div className="text-left pb-1 border-b border-zinc-900">
            <h2 className="text-base font-black text-white uppercase tracking-wider">Diretório de Relatórios Fiscais</h2>
            <p className="text-[10px] text-zinc-500">Métricas consolidadas de evolução, exames, comercial e financeiro</p>
          </div>

          {/* Category selector rows */}
          <div className="space-y-2 text-xs font-black text-left" id="reports-categories-list">
            <div 
              onClick={() => setActiveReport("alunos")}
              className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <p className="font-extrabold text-white text-xs uppercase">Alunos (Ativos, Inativos e Pendentes)</p>
                  <p className="text-[10px] font-mono font-medium text-zinc-500">Mapeamento de status cadastrais no corpo discente</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>

            <div 
              onClick={() => setActiveReport("presencas")}
              className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <p className="font-extrabold text-white text-xs uppercase">Quadro de Presenças e Histórico de Aulas</p>
                  <p className="text-[10px] font-mono font-medium text-zinc-500">Frequência por período, chamadas e estatísticas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>

            <div 
              onClick={() => setActiveReport("financeiro")}
              className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <p className="font-extrabold text-white text-xs uppercase">Financeiro Mensal consolidado</p>
                  <p className="text-[10px] font-mono font-medium text-zinc-500">Total recebido, inadimplentes e faturamentos pendentes</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>

            <div 
              onClick={() => setActiveReport("inadimplentes")}
              className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <p className="font-extrabold text-white text-xs uppercase text-red-500">Inadimplentes e Cobranças Vencidas</p>
                  <p className="text-[10px] font-mono font-medium text-zinc-500">Relação de alunos com faturas em atraso</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>

            <div 
              onClick={() => setActiveReport("graduacoes_exames")}
              className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <p className="font-extrabold text-white text-xs uppercase">Graduações, Faixas & Exames Oficiais</p>
                  <p className="text-[10px] font-mono font-medium text-zinc-500">Alunos por modalidade, faixa, graduação e próximos candidatos</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>

            <div 
              onClick={() => setActiveReport("estoque_vendas")}
              className="bg-zinc-950 border border-zinc-900 hover:border-red-900 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <p className="font-extrabold text-white text-xs uppercase">Estoque de Produtos & Comercialização</p>
                  <p className="text-[10px] font-mono font-medium text-zinc-500">Consolidação de compras, alertas de reposição e vendas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {/* Dynamic summary numbers block based on financial details */}
          <div className="bg-zinc-950 border border-zinc-900 p-4.5 rounded-2xl text-left space-y-3.5" id="reports-cash-closer-box">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Resumo Consolidado Interno</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/60 border border-zinc-900 p-3.5 rounded-xl">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Receitas Homologadas</span>
                <p className="text-sm font-black font-mono text-emerald-455">R$ {pagamentos.filter(p => p.status === "PAGO" || p.status === "Pago" || p.status === "EM DIA").reduce((a, b) => a + b.valor, 0).toFixed(2)}</p>
              </div>
              <div className="bg-black/60 border border-zinc-900 p-3.5 rounded-xl">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Boletos Pendentes</span>
                <p className="text-sm font-black font-mono text-amber-550">R$ {pagamentos.filter(p => p.status === "PENDENTE" || p.status === "Pendente").reduce((a, b) => a + b.valor, 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Vencimentos list */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase">Controle de Inadimplência Rápidas:</p>
              <div className="max-h-[140px] overflow-y-auto space-y-1 text-xs">
                {pagamentos.filter(p => p.status === "PENDENTE" || p.status === "Pendente" || p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado").map(p => (
                  <div key={p.id} className="p-2.5 bg-[#141414] border border-zinc-900 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold truncate max-w-[155px]">{p.alunoNome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-mono font-bold">R$ {p.valor.toFixed(0)}</span>
                      <button
                        onClick={handleCopyPixKey}
                        className="bg-red-800 text-white font-black text-[8px] uppercase tracking-wider py-1 px-2 rounded-xl cursor-pointer"
                      >
                        Copia Pix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4 text-left font-sans animate-fadeIn">
          <button 
            onClick={() => setActiveReport(null)}
            className="flex items-center gap-1.5 text-xs text-zinc-450 hover:text-white uppercase font-bold font-mono transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-red-550" />
            Voltar ao Diretório de Relatórios
          </button>

          {activeReport === "alunos" && (
            <div className="space-y-4">
              <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-sans">Relatório Consolidado de Alunos</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Consolidação cadastral de status, matrículas e corpos discentes</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const ativos = alunos.filter(a => !a.status || a.status === "ATIVO" || a.status === "Ativo");
                      const headers = ["ID", "Nome", "E-mail", "WhatsApp", "CPF", "Status", "Graduacao"];
                      const rows = ativos.map(a => [a.id, a.nome, a.email, a.celular || a.telefone || "", a.cpf || "", a.status || "Ativo", a.graduacao || "Preparatória - Branca"]);
                      downloadCSV("alunos_ativos", headers, rows);
                    }}
                    className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar Ativos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["ID", "Nome", "E-mail", "WhatsApp", "CPF", "Status", "Graduacao"];
                      const rows = alunos.map(a => [a.id, a.nome, a.email, a.celular || a.telefone || "", a.cpf || "", a.status || "Ativo", a.graduacao || "Preparatória - Branca"]);
                      downloadCSV("corpo_docente", headers, rows);
                    }}
                    className="px-3 py-1.5 bg-red-850 hover:bg-red-800 text-white font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar Todos
                  </button>
                </div>
              </div>

              {/* Stats boxes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Alunos Ativos</span>
                  <span className="text-lg font-black font-mono text-emerald-400">{alunos.filter(a => !a.status || a.status === "ATIVO" || a.status === "Ativo").length}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Alunos Inativos</span>
                  <span className="text-lg font-black font-mono text-red-500">{alunos.filter(a => a.status === "INATIVO" || a.status === "Inativo").length}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Alunos Pendentes</span>
                  <span className="text-lg font-black font-mono text-amber-500">{alunos.filter(a => a.status === "PENDENTE" || a.status === "Pendente").length}</span>
                </div>
              </div>

              {/* Roster detail list */}
              <div className="max-h-80 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black font-mono text-[9px] text-zinc-500 uppercase border-b border-zinc-900">
                      <th className="p-2.5">Nome</th>
                      <th className="p-2.5">Graduação</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                    {alunos.map(a => (
                      <tr key={a.id} className="hover:bg-zinc-900/40">
                        <td className="p-2.5 text-white font-bold">{a.nome}</td>
                        <td className="p-2.5 font-mono text-[11px] text-amber-500">{a.graduacao || "Preparatória - Branca"}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            (!a.status || a.status === "ATIVO" || a.status === "Ativo")
                              ? "bg-emerald-950 text-emerald-400"
                              : a.status === "INATIVO" || a.status === "Inativo"
                              ? "bg-red-950 text-red-500"
                              : "bg-amber-950 text-amber-550"
                          }`}>
                            {a.status || "ATIVO"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === "presencas" && (
            <div className="space-y-4">
              <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-sans">Estatística de Quadro de Frequência</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Consolidação de registros de presença, exames e carimbos de chamadas</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ["ID", "Aluno ID", "Aluno Nome", "Data", "Confirmada", "Horário"];
                    const rows = presencas.map(p => [p.id, p.alunoId, p.alunoNome || "", p.data || "", (p.status === "APPROVED" || p.status === "Presente") ? "Sim" : "Não", p.horario || ""]);
                    downloadCSV("presencas_corpo_docente", headers, rows);
                  }}
                  className="px-3 py-1.5 bg-red-850 hover:bg-red-800 text-white font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>

              {/* Stats boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Total de Registros</span>
                  <span className="text-lg font-black font-mono text-white">{presencas.length}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Presenças Confirmadas</span>
                  <span className="text-lg font-black font-mono text-emerald-450">{presencas.filter(p => p.status === "APPROVED" || p.status === "Presente").length}</span>
                </div>
              </div>

              {/* Presencas detail list */}
              <div className="max-h-80 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-xl">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-black font-mono text-[9px] text-zinc-500 uppercase border-b border-zinc-900">
                      <th className="p-2.5">Aluno</th>
                      <th className="p-2.5">Data de Chamada</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                    {presencas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-zinc-650 font-mono text-[11px]">Nenhuma presença registrada no banco de dados.</td>
                      </tr>
                    ) : (
                      presencas.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-900/40">
                          <td className="p-2.5 text-white font-bold">{p.alunoNome || "Aluno ID: " + p.alunoId}</td>
                          <td className="p-2.5 font-mono text-[11px] text-zinc-400">{p.data}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                              (p.status === "APPROVED" || p.status === "Presente")
                                ? "bg-emerald-950 text-emerald-400"
                                : "bg-amber-950 text-amber-550 animation-pulse"
                            }`}>
                              {(p.status === "APPROVED" || p.status === "Presente") ? "CONFIRMADA" : "SOLICITADA"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === "financeiro" && (
            <div className="space-y-4">
              <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-sans">Demonstrativo Financeiro Mensal</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Consolidado geral de recebimentos, fluxo de faturamento por competência</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ["ID", "Aluno ID", "Aluno Nome", "Competencia", "Vencimento", "Valor R$", "Status", "Pgto Data", "Modo"];
                    const rows = pagamentos.map(p => [p.id, p.alunoId, p.alunoNome || "", p.competencia || p.referencia || "", p.vencimento, p.valor, p.status, p.dataPagamento || "", p.formaPagamento || ""]);
                    downloadCSV("financeiro_mensal", headers, rows);
                  }}
                  className="px-3 py-1.5 bg-red-850 hover:bg-red-800 text-white font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>

              {/* Stats boxes */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] text-zinc-500 block uppercase">Total Recebido</span>
                  <span className="text-sm font-black text-emerald-400">R$ {pagamentos.filter(p => p.status === "PAGO" || p.status === "Pago" || p.status === "EM DIA").reduce((a, b) => a + b.valor, 0).toFixed(2)}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] text-zinc-500 block uppercase">Total Pendente</span>
                  <span className="text-sm font-black text-amber-500">R$ {pagamentos.filter(p => p.status === "PENDENTE" || p.status === "Pendente").reduce((a, b) => a + b.valor, 0).toFixed(2)}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] text-zinc-500 block uppercase">Total Vencido</span>
                  <span className="text-sm font-black text-red-500">R$ {pagamentos.filter(p => p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado").reduce((a, b) => a + b.valor, 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Pagamentos lists */}
              <div className="max-h-80 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-xl">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-black font-mono text-[9px] text-zinc-500 uppercase border-b border-zinc-900">
                      <th className="p-2.5">Nome Aluno</th>
                      <th className="p-2.5">Periodo</th>
                      <th className="p-2.5 font-right">Valor</th>
                      <th className="p-2.5">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                    {pagamentos.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-900/40">
                        <td className="p-2.5 text-white font-bold">{p.alunoNome || p.alunoId}</td>
                        <td className="p-2.5 font-mono text-[11px]">{p.competencia || p.referencia}</td>
                        <td className="p-2.5 font-mono text-zinc-200">R$ {p.valor.toFixed(2)}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            (p.status === "PAGO" || p.status === "Pago" || p.status === "EM DIA")
                              ? "bg-emerald-950 text-emerald-400"
                              : (p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado")
                              ? "bg-red-950 text-red-500"
                              : "bg-amber-950 text-amber-550"
                          }`}>
                            {p.status || "PENDENTE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === "inadimplentes" && (
            <div className="space-y-4 font-sans">
              <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-red-500 uppercase font-sans">Dossiê de Alunos Inadimplentes</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Listagem focada fiscal de inadimplência e correspondência de boletos vencidos</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const delinquentBillings = pagamentos.filter(p => p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado");
                    const headers = ["ID Cobrança", "Aluno ID", "Nome Aluno", "Competencia", "Vencimento", "Valor Divida R$"];
                    const rows = delinquentBillings.map(d => [d.id, d.alunoId, d.alunoNome || "", d.competencia || "", d.vencimento, d.valor]);
                    downloadCSV("inadimplentes_totais", headers, rows);
                  }}
                  className="px-3 py-1.5 bg-red-850 hover:bg-red-800 text-white font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>

              {/* Roster of deliquencies */}
              <div className="max-h-80 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black font-mono text-[9px] text-zinc-550 uppercase border-b border-zinc-900">
                      <th className="p-2.5">Aluno Omissor</th>
                      <th className="p-2.5">Vencimento Original</th>
                      <th className="p-2.5 text-right">Valor em Débito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                    {(() => {
                      const overdue = pagamentos.filter(p => p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado");
                      if (overdue.length === 0) {
                        return (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-emerald-400 font-mono text-xs">🥋 Nenhum aluno em atraso financeiro encontrado! Caixa 100% regularizado.</td>
                          </tr>
                        );
                      }
                      return overdue.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-905/40 text-left">
                          <td className="p-2.5 text-white font-bold">{p.alunoNome || p.alunoId}</td>
                          <td className="p-2.5 font-mono text-red-500 font-bold">{p.vencimento}</td>
                          <td className="p-2.5 text-right font-mono text-white text-sm font-black">R$ {p.valor.toFixed(2)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === "estoque_vendas" && (
            <div className="space-y-4">
              <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-sans">Auditoria Tributária de Estoque & Vendas</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Análise de catálogo, vendas comerciais, ticket médio e nível crítico de reposição</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["ID", "Nome", "Categoria", "Estoque", "Estoque Minimo", "Preço de Venda"];
                      const rows = produtos.map(p => [p.id, p.nome, p.categoria, p.estoque, p.estoqueMinimo, p.valorVenda || p.valor || 0]);
                      downloadCSV("estoque_produtos", headers, rows);
                    }}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-[10px] rounded-lg uppercase font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Produtos CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["ID Venda", "Data", "Aluno Nome", "Produto Nome", "Quantidade", "Valor Total"];
                      const rows = vendas.map(v => [v.id, v.data || v.dataVenda || "", v.alunoNome, v.produtoNome, v.quantidade, v.valorTotal || v.valor || 0]);
                      downloadCSV("historico_vendas", headers, rows);
                    }}
                    className="px-2.5 py-1.5 bg-red-850 hover:bg-red-800 text-white font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Vendas CSV
                  </button>
                </div>
              </div>

              {/* Stats boxes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Itens Cadastrados</span>
                  <span className="text-lg font-black font-mono text-sky-400">{produtos.length}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Estoque Baixo</span>
                  <span className="text-lg font-black font-mono text-red-500">{produtos.filter(p => p.estoque <= p.estoqueMinimo).length}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Faturamento Vendas</span>
                  <span className="text-sm font-black font-mono text-amber-500">R$ {vendas.reduce((acc, current) => acc + (current.valorTotal || current.valor || 0), 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Low stock alerts panel */}
              {(() => {
                const criticalProds = produtos.filter(p => p.estoque <= p.estoqueMinimo);
                if (criticalProds.length > 0) {
                  return (
                    <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl text-xs space-y-1.5">
                      <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-550 animate-pulse" />
                        Alerta de Abastecimento Crítico de Estoque:
                      </p>
                      <ul className="list-disc pl-4 text-[10.5px] text-zinc-400 space-y-0.5 font-mono">
                        {criticalProds.map(cp => (
                          <li key={cp.id}>Produto <strong>{cp.nome}</strong> está com {cp.estoque} unidades disponíveis (Estoque de segurança: {cp.estoqueMinimo}).</li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Roster detail list */}
              <div className="max-h-80 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black font-mono text-[9px] text-zinc-500 uppercase border-b border-zinc-900">
                      <th className="p-2.5">Nome do Item</th>
                      <th className="p-2.5">Qtd Estoque</th>
                      <th className="p-2.5 text-right font-mono">Preço Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                    {produtos.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-900/40">
                        <td className="p-2.5 text-white font-bold">{p.nome}</td>
                        <td className="p-2.5 font-mono text-[11px]">{p.estoque} unidades</td>
                        <td className="p-2.5 text-right font-mono text-zinc-300">R$ {(p.valorVenda || p.valor || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === "graduacoes_exames" && (
            <div className="space-y-4 font-sans animate-fadeIn">
              <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase">Relatório Oficial de Graduações, Faixas & Exames</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Quadro dinâmico de graduações oficiais da Associação Liga Garra de Águia PG</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ["ID Registro", "Aluno ID", "Modalidade", "Graduacao", "Faixa", "Ordem", "Status Aluno"];
                    const rows = alunoModalidades.map(am => {
                      const stud = alunos.find(a => a.id === am.alunoId);
                      return [am.id, am.alunoId, am.modalidade, am.graduacaoAtual, am.faixaAtual, am.ordemGraduacao, stud?.status || "Ativo"];
                    });
                    downloadCSV("graduacoes_oficiais_alunos", headers, rows);
                  }}
                  className="px-3 py-1.5 bg-amber-650 hover:bg-amber-500 text-zinc-950 font-black text-[10px] rounded-lg uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>

              {/* Filtros robustos: Modalidade, Faixa, Graduação, Status */}
              <div className="bg-[#141414] border border-zinc-900 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                <div>
                  <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1 font-bold">Modalidade</label>
                  <select
                    value={filterModalidade}
                    onChange={(e) => setFilterModalidade(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-805 p-2 text-[10.5px] rounded-xl focus:border-red-900 focus:outline-none text-zinc-300 font-mono bg-zinc-950"
                  >
                    <option value="TODAS">TODAS</option>
                    <option value="Kung Fu">Kung Fu</option>
                    <option value="Tai Chi Chuan">Tai Chi Chuan</option>
                    <option value="Boxe Chinês">Boxe Chinês</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1 font-bold">Status Aluno</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-805 p-2 text-[10.5px] rounded-xl focus:border-red-900 focus:outline-none text-zinc-300 font-mono bg-zinc-950"
                  >
                    <option value="TODOS">TODOS</option>
                    <option value="Ativos">Ativos</option>
                    <option value="Inativos">Inativos</option>
                    <option value="Pendentes">Pendentes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1 font-bold">Faixa</label>
                  <select
                    value={filterFaixa}
                    onChange={(e) => setFilterFaixa(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-805 p-2 text-[10.5px] rounded-xl focus:border-red-900 focus:outline-none text-zinc-300 font-mono bg-zinc-950"
                  >
                    <option value="TODAS">TODAS</option>
                    <option value="Branca">Branca / Símiles</option>
                    <option value="Amarela">Amarela / Símiles</option>
                    <option value="Laranja">Laranja / Símiles</option>
                    <option value="Vermelha font-bold">Vermelha / Símiles</option>
                    <option value="Verde">Verde / Símiles</option>
                    <option value="Marrom bg-amber-900">Marrom / Símiles</option>
                    <option value="Cinza">Cinza / Símiles</option>
                    <option value="Preta">Preta / Grau Superior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1 font-bold">Graduação</label>
                  <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    value={filterGraduacao === "TODAS" ? "" : filterGraduacao}
                    onChange={(e) => setFilterGraduacao(e.target.value ? e.target.value : "TODAS")}
                    className="w-full bg-zinc-950 border border-zinc-805 p-2 text-[10.5px] rounded-xl focus:border-red-900 focus:outline-none text-zinc-300 placeholder-zinc-700 bg-zinc-950"
                  />
                </div>
              </div>

              {/* KPIs de Resultados das Consultas */}
              {(() => {
                const matchedModalidades = alunoModalidades.filter(am => {
                  const student = alunos.find(a => am.alunoId === a.id);
                  if (!student) return false;

                  // Filter status
                  if (filterStatus !== "TODOS") {
                    const normStat = (student.status || "Ativo").toUpperCase();
                    if (filterStatus === "Ativos" && normStat !== "ATIVO") return false;
                    if (filterStatus === "Inativos" && normStat !== "INATIVO") return false;
                    if (filterStatus === "Pendentes" && normStat !== "PENDENTE") return false;
                  }

                  // Filter modalidade
                  if (filterModalidade !== "TODAS" && am.modalidade !== filterModalidade) return false;

                  // Filter faixa
                  if (filterFaixa !== "TODAS") {
                    if (!(am.faixaAtual || "").toLowerCase().includes(filterFaixa.toLowerCase())) return false;
                  }

                  // Filter graduacao
                  if (filterGraduacao !== "TODAS") {
                    if (!(am.graduacaoAtual || "").toLowerCase().includes(filterGraduacao.toLowerCase())) return false;
                  }

                  return am.ativo !== false;
                });

                // Calculate KPIs
                const kungFuCount = matchedModalidades.filter(am => am.modalidade === "Kung Fu").length;
                const taiChiCount = matchedModalidades.filter(am => am.modalidade === "Tai Chi Chuan").length;
                const boxeCount = matchedModalidades.filter(am => am.modalidade === "Boxe Chinês").length;

                return (
                  <div className="space-y-4">
                    {/* Stats panel */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-950 border border-zinc-900/40 p-4 rounded-2xl">
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl relative overflow-hidden">
                        <span className="text-[8px] font-mono text-zinc-550 block uppercase">Total Matriculado</span>
                        <span className="text-base font-black font-mono text-white">{matchedModalidades.length} registros</span>
                      </div>
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl">
                        <span className="text-[8px] font-mono text-zinc-550 block uppercase">Alunos Kung Fu</span>
                        <span className="text-base font-black font-mono text-red-500">{kungFuCount}</span>
                      </div>
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl">
                        <span className="text-[8px] font-mono text-zinc-550 block uppercase">Alunos Tai Chi Chuan</span>
                        <span className="text-base font-black font-mono text-cyan-400">{taiChiCount}</span>
                      </div>
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl">
                        <span className="text-[8px] font-mono text-zinc-550 block uppercase">Alunos Boxe Chinês</span>
                        <span className="text-base font-black font-mono text-orange-400">{boxeCount}</span>
                      </div>
                    </div>

                    {/* Section 1: Alunos por Modalidade, Graduação e Faixa */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-4 text-left space-y-3">
                      <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">🎭 Distribuição de Alunos Por Graduação e Faixa</h4>
                      <div className="max-h-72 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-black font-mono text-[9px] text-zinc-555 uppercase border-b border-zinc-900">
                              <th className="p-2.5">Nome Aluno</th>
                              <th className="p-2.5">Modalidade</th>
                              <th className="p-2.5">Graduação Oficial</th>
                              <th className="p-2.5">Faixa Corresponder</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                            {matchedModalidades.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-zinc-650 font-mono text-[10px]">Nenhum registro correspondente aos filtros.</td>
                              </tr>
                            ) : (
                              matchedModalidades.map(am => {
                                const stud = alunos.find(a => a.id === am.alunoId);
                                return (
                                  <tr key={am.id} className="hover:bg-zinc-900/30">
                                    <td className="p-2.5 text-white font-bold">{stud?.nome || "Aluno Excluído"}</td>
                                    <td className="p-2.5 font-bold">
                                      <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase ${
                                        am.modalidade === "Kung Fu" ? "bg-red-950/40 text-red-400" :
                                        am.modalidade === "Tai Chi Chuan" ? "bg-cyan-950/40 text-cyan-400" : "bg-orange-950/40 text-orange-400"
                                      }`}>
                                        {am.modalidade}
                                      </span>
                                    </td>
                                    <td className="p-2.5 font-mono text-zinc-300 font-medium text-[11px]">{am.graduacaoAtual}</td>
                                    <td className="p-2.5">
                                      <span className="inline-flex py-0.5 px-2 rounded-md bg-zinc-900 text-[10px] font-bold text-amber-400 border border-zinc-800 font-mono">
                                        🥋 {am.faixaAtual}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section 2: Próximos candidatos a exame (última graduação à mais de 3 meses) */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-4 text-left space-y-3">
                      <div>
                        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">🎯 Próximos Candidatos Indicados Para Exame de Faixa</h4>
                        <p className="text-[9.5px] text-zinc-555 font-mono leading-none mt-1">Carência de avaliação mínima sugerida de 3 meses para Kung Fu/Tai Chi/Boxe</p>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-black font-mono text-[9px] text-zinc-555 uppercase border-b border-zinc-900">
                              <th className="p-2.5">Aluno</th>
                              <th className="p-2.5">Modalidade</th>
                              <th className="p-2.5">Carência Atual</th>
                              <th className="p-2.5">Última Promoção</th>
                              <th className="p-2.5 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                            {(() => {
                              // We list any students with active modalities and check time since am.dataUltimaGraduacao
                              const candidates = matchedModalidades.map(am => {
                                const stud = alunos.find(a => a.id === am.alunoId);
                                if (!stud || stud.status === "Inativo") return null;

                                const dateStr = am.dataUltimaGraduacao || stud.dataUltimaGraduacao || stud.dataMatricula || new Date().toISOString().split("T")[0];
                                const diffMs = Date.now() - new Date(dateStr).getTime();
                                const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                const meses = Math.floor(dias / 30);

                                return {
                                  am,
                                  stud,
                                  dias,
                                  meses,
                                  dateStr
                                };
                              })
                              .filter(Boolean)
                              .filter((x: any) => x.meses >= 3)
                              .sort((a: any, b: any) => b.dias - a.dias);

                              if (candidates.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={5} className="p-6 text-center text-emerald-400 font-mono text-[10px]">🥋 Nenhum aluno elegível no momento (todos avaliados recentemente).</td>
                                  </tr>
                                );
                              }

                              return candidates.map((c: any) => (
                                <tr key={c.am.id} className="hover:bg-zinc-900/30">
                                  <td className="p-2.5 text-white font-bold">{c.stud.nome}</td>
                                  <td className="p-2.5 text-[10.5px] font-bold text-zinc-350">{c.am.modalidade}</td>
                                  <td className="p-2.5">
                                    <span className="text-amber-500 font-mono font-bold text-[11px]">
                                      {c.meses} meses ({c.dias} dias)
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono text-[10.5px] text-zinc-500">
                                    {new Date(c.dateStr).toLocaleDateString("pt-BR")}
                                  </td>
                                  <td className="p-2.5 text-right">
                                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-550 border border-amber-900/50 text-[8.5px] font-black uppercase font-mono tracking-wider">
                                      Indicado
                                    </span>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section 3: Histórico e Evolução das Graduações (Últimos Exames registrados) */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-4 text-left space-y-3">
                      <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">📈 Evolução Histórica de Exames Executados (Estatística)</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-black font-mono text-[9px] text-zinc-555 uppercase border-b border-zinc-900">
                              <th className="p-2.5">Aluno</th>
                              <th className="p-2.5">Faixa Avaliada</th>
                              <th className="p-2.5 font-mono">Nota Final</th>
                              <th className="p-2.5">Avaliador</th>
                              <th className="p-2.5 text-right">Resultado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-400 font-sans">
                            {exames.filter(e => {
                              if (filterModalidade === "TODAS") return true;
                              // Match if candidate modality matches
                              const stud = alunos.find(a => a.id === e.alunoId);
                              if (!stud) return false;
                              return (stud.modalidade || "").includes(filterModalidade);
                            }).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-6 text-center text-zinc-650 font-mono text-[10px]">Nenhum exame cadastrado para a modalidade ativa.</td>
                              </tr>
                            ) : (
                              exames
                                .filter(e => {
                                  if (filterModalidade === "TODAS") return true;
                                  const stud = alunos.find(a => a.id === e.alunoId);
                                  if (!stud) return false;
                                  return (stud.modalidade || "").includes(filterModalidade);
                                })
                                .sort((a,b) => new Date(b.dataExame).getTime() - new Date(a.dataExame).getTime())
                                .map(e => (
                                  <tr key={e.id} className="hover:bg-zinc-900/30">
                                    <td className="p-2.5 text-white font-bold">{e.alunoNome}</td>
                                    <td className="p-2.5 font-mono text-zinc-300 text-[10.5px]">{e.graduacaoPretendida}</td>
                                    <td className="p-2.5 font-mono font-bold text-zinc-200">
                                      {(((e.notaTecnica || 8) + (e.notaTeorica || 8)) / 2).toFixed(1)} / 10
                                    </td>
                                    <td className="p-2.5 text-zinc-500 font-mono text-[11px]">{e.avaliador || "Mestre Décio"}</td>
                                    <td className="p-2.5 text-right">
                                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase font-mono ${
                                        e.resultado === "Aprovado" ? "bg-emerald-950 text-emerald-450" :
                                        e.resultado === "Reprovado" ? "bg-red-950 text-red-500" : "bg-neutral-900 text-zinc-400"
                                      }`}>
                                        {e.resultado}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
