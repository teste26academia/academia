import React from "react";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CreditCard, 
  Award, 
  Flame,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { EagleClawLogo } from "./BrasaoOficial";
import { Presenca, Aluno, Pagamento, GlobalConfigs, Turma, Exame, Produto, Venda, Familia } from "../types";

interface DashboardProps {
  activeRole: string;
  presencas: Presenca[];
  alunos: Aluno[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  defaultStudent?: Aluno;
  defaultStudentTurma?: Turma;
  setActiveBottomTab: (tab: "inicio" | "alunos" | "presencas" | "relatorios" | "menu") => void;
  handleStudentCheckin?: () => void;
  studentStatusMsg?: string;
  graduacoes?: any[]; // Historico de graduacoes real do Firestore
  exames?: Exame[];
  produtos?: Produto[];
  vendas?: Venda[];
  familias?: Familia[];
}

export function Dashboard({
  activeRole,
  presencas,
  alunos,
  pagamentos,
  config,
  defaultStudent,
  defaultStudentTurma,
  setActiveBottomTab,
  handleStudentCheckin,
  studentStatusMsg,
  graduacoes = [],
  exames = [],
  produtos = [],
  vendas = [],
  familias = []
}: DashboardProps) {
  // Current month prefix format (YYYY-MM)
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // Ex: "2026-06"
  const currentMonthYearRef = new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }); // Ex: "06/2026"

  // 1. Total de alunos
  const totalAlunos = alunos.length;

  // 2. Alunos ativos
  const alunosAtivos = alunos.filter(a => {
    const s = (a.status || "").toUpperCase().trim();
    return s === "ATIVO" || s === "" || !a.status;
  }).length;

  // 3. Alunos inativos
  const alunosInativos = alunos.filter(a => {
    const s = (a.status || "").toUpperCase().trim();
    return s === "INATIVO";
  }).length;

  // 4. Presenças do mês (Filtrando as presenças na modalidade realizadas no mês atual)
  const presencasDoMes = presencas.filter(p => 
    p.data && p.data.startsWith(currentMonthPrefix) && 
    (p.status === "APPROVED" || p.status === "Presente")
  ).length;

  // 5. Receita mensal (soma das mensalidades pagas no mês referente)
  const receitaMensal = pagamentos
    .filter(p => 
      (p.referencia === currentMonthYearRef || (p.vencimento && p.vencimento.startsWith(currentMonthPrefix))) && 
      ((p.status as string) === "Pago" || (p.status as string) === "EM DIA" || (p.status as string) === "Em Dia")
    )
    .reduce((acc, p) => acc + (p.valorFinal || p.valor || 0), 0);

  // 6. Mensalidades Pendentes (Soma total das mensalidades abertas pendentes)
  const mensalidadesPendentesValor = pagamentos
    .filter(p => (p.status as string) === "Pendente" || (p.status as string) === "PENDENTE")
    .reduce((acc, p) => acc + (p.valorFinal || p.valor || 0), 0);
  const mensalidadesPendentesCount = pagamentos.filter(p => (p.status as string) === "Pendente" || (p.status as string) === "PENDENTE").length;

  // 7. Mensalidades Atrasadas (Soma total das mensalidades em atraso)
  const mensalidadesAtrasadasValor = pagamentos
    .filter(p => (p.status as string) === "Atrasado" || (p.status as string) === "ATRASADO")
    .reduce((acc, p) => acc + (p.valorFinal || p.valor || 0), 0);
  const mensalidadesAtrasadasCount = pagamentos.filter(p => (p.status as string) === "Atrasado" || (p.status as string) === "ATRASADO").length;

  // 8. Próximos exames (quantidade de exames de faixas marcados como PENDENTE)
  const proximosExamesValor = exames.filter(e => e.resultado === "PENDENTE" || e.resultado === "Pendente").length;

  // 9. Últimas graduações (quantidade de históricos de graduações aprovados no mês atual ou total acumulado)
  const ultimasGraduacoesValor = graduacoes.filter(g => g.resultado === "APROVADO" || g.resultado === "Aprovado" || g.resultado === "aprovado").length;
  
  // Student active view calculations
  const studentId = defaultStudent?.id;
  const studentPresRef = presencas.filter(p => p.alunoId === studentId);
  const studentPresApproved = studentPresRef.filter(p => p.status === "APPROVED" || p.status === "Presente");
  const sortedPresences = [...studentPresRef].sort((a, b) => b.data.localeCompare(a.data));
  const lastPresence = sortedPresences.length > 0 ? sortedPresences[0].data : "Nenhuma registrada";
  const attendanceRate = studentPresRef.length > 0
    ? Math.min(100, Math.round((studentPresApproved.length / studentPresRef.length) * 100))
    : 100;

  const currentCheckinStatus = studentPresRef.length > 0 && studentPresRef[0].data === new Date().toISOString().split('T')[0]
    ? (studentPresRef[0].status === "PENDING" ? "Solicitado (Pendente)" : "Confirmado")
    : "Não solicitado hoje";

  return (
    <div className="space-y-4 animate-fadeIn" id="dashboard-tab-content">
      
      {/* 1. SE FOR ADMIN OU INSTRUTOR - PAINEL DO ADMINISTRADOR */}
      {activeRole !== "ALUNO" ? (
        <div className="space-y-4 font-sans text-left">
          <div className="text-left pb-1 border-b border-zinc-900 flex justify-between items-center bg-black/40 p-3.5 rounded-2xl">
            <div>
              <span className="text-[9px] font-black tracking-widest text-red-500 uppercase font-mono">Controle da Associação</span>
              <h3 className="text-xs font-black uppercase text-zinc-100 tracking-wider">Metas e Saúde da Academia</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400">Ref: {currentMonthYearRef}</span>
            </div>
          </div>

          {/* Grid de Bento-Style Estatísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5" id="admin-bento-dashboard-grid">
            
            {/* KPI 1: Total de Alunos */}
            <div 
              onClick={() => setActiveBottomTab("alunos")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-red-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-red-950/30 rounded-xl text-red-500 border border-red-900/20">
                  <Users className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">Geral</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-white">{totalAlunos}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Total de Alunos</p>
              </div>
            </div>

            {/* KPI 2: Alunos Ativos */}
            <div 
              onClick={() => setActiveBottomTab("alunos")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-emerald-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-emerald-950/30 rounded-xl text-emerald-400 border border-emerald-900/20">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[8px] bg-emerald-950/80 text-emerald-400 px-1.5 rounded-full font-mono font-bold">Ativo</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-emerald-450">{alunosAtivos}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Alunos Ativos</p>
              </div>
            </div>

            {/* KPI 3: Alunos Inativos */}
            <div 
              onClick={() => setActiveBottomTab("alunos")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-zinc-800 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-800/60">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-[8px] bg-zinc-900 text-zinc-400 px-1.5 rounded-full font-mono font-bold">Inativo</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-zinc-400">{alunosInativos}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Alunos Inativos</p>
              </div>
            </div>

            {/* KPI 4: Presenças no Mês */}
            <div 
              onClick={() => setActiveBottomTab("presencas")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-amber-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-amber-950/20 rounded-xl text-amber-500 border border-amber-900/20">
                  <Calendar className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-amber-400 font-mono">{currentMonthYearRef.split("/")[0]}</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-amber-450">{presencasDoMes}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Presenças no Mês</p>
              </div>
            </div>

            {/* KPI 5: Receita Mensal */}
            <div 
              onClick={() => setActiveBottomTab("relatorios")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-teal-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-teal-950/20 rounded-xl text-teal-400 border border-teal-900/20">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-teal-400 font-mono">Faturamento</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-teal-400">R$ {receitaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Receita Mensal</p>
              </div>
            </div>

            {/* KPI 6: Mensalidades Pendentes */}
            <div 
              onClick={() => setActiveBottomTab("relatorios")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-amber-500 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-amber-950/30 rounded-xl text-amber-400 border border-amber-900/20">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="text-[8px] bg-amber-950 text-amber-450 px-1.5 rounded-full font-mono font-bold">{mensalidadesPendentesCount} refs</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-amber-400">R$ {mensalidadesPendentesValor.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Mensalidades Pendentes</p>
              </div>
            </div>

            {/* KPI 7: Mensalidades Atrasadas */}
            <div 
              onClick={() => setActiveBottomTab("relatorios")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-rose-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-rose-950/30 rounded-xl text-rose-500 border border-rose-900/20">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-[8px] bg-rose-950 text-rose-400 px-1.5 rounded-full font-mono font-bold">{mensalidadesAtrasadasCount} atrasos</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-rose-500 font-bold">R$ {mensalidadesAtrasadasValor.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Mensalidades Atrasadas</p>
              </div>
            </div>

            {/* KPI 8: Próximos Exames */}
            <div 
              onClick={() => setActiveBottomTab("relatorios")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-indigo-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-indigo-950/20 rounded-xl text-indigo-400 border border-indigo-900/20">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-indigo-400 font-mono">Agendados</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-purple-400">{proximosExamesValor}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Próximos Exames</p>
              </div>
            </div>

            {/* KPI 9: Últimas Graduações */}
            <div 
              onClick={() => setActiveBottomTab("relatorios")}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 cursor-pointer hover:border-violet-850 hover:bg-zinc-900/30 transition-all shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="p-2 bg-violet-950/20 rounded-xl text-violet-400 border border-violet-900/20">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[9px] text-violet-400 font-mono">Associação</span>
              </div>
              <div className="leading-none pt-1">
                <p className="text-2xl font-black font-mono text-amber-500">{ultimasGraduacoesValor}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Últimas Graduações</p>
              </div>
            </div>

          </div>

          {/* List of upcoming belt examinations */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider font-mono">Cronograma de Exames e Promoções Técnicas</h4>
              <span className="text-[9px] font-mono text-zinc-500">{exames.length} registros totais</span>
            </div>
            {exames.length === 0 ? (
              <p className="text-[11px] text-zinc-550 py-2 font-mono">Sem exames de faixas cadastrados no Firestore.</p>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {exames.map((ex) => {
                  const s = alunos.find(a => a.id === ex.alunoId);
                  return (
                    <div key={ex.id} className="flex justify-between items-center p-2 bg-[#101011] border border-zinc-900 rounded-xl text-xs font-mono">
                      <div>
                        <p className="font-bold text-white uppercase">{s?.nome || ex.alunoNome || "Ficha Registrada"}</p>
                        <p className="text-[9px] text-zinc-500">Nota Téc: {ex.notaTecnica} • Nota Teor: {ex.notaTeorica} • Aval: {ex.avaliador || "Décio"}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-900 text-purple-400 text-[9px] font-bold">
                          {ex.graduacaoPretendida}
                        </span>
                        <p className="text-[9px] text-zinc-400 mt-0.5 font-bold">{ex.dataExame}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        
        /* 2. SE FOR ALUNO REGULAR - PAINEL DO ALUNO */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="student-dashboard-panels">
          <div className="col-span-1 md:col-span-2 bg-[#0d0d0e]/60 border border-zinc-900 rounded-3xl p-5.5 text-left space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase font-mono bg-amber-950/20 border border-amber-900/40 px-2.5 py-0.5 rounded-full inline-block">
                Área Geral do Aluno
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Olá, <span className="text-red-500 uppercase">{defaultStudent?.nome || "Membro"}</span>!
              </h2>
              <p className="text-xs text-zinc-400 leading-normal">
                Graduação <strong className="text-amber-400">{defaultStudent?.graduacao || "Preparatória - Branca"}</strong> na modalidade <strong className="text-zinc-200">{defaultStudent?.modalidade || "Kung Fu"}</strong>. Seu status financeiro:{" "}
                <span className={`font-black uppercase text-[10px] ${defaultStudent?.statusFinanceiro && defaultStudent.statusFinanceiro.toUpperCase() === "EM DIA" ? "text-emerald-400" : "text-rose-500"}`}>
                  {defaultStudent?.statusFinanceiro || "Regular"}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900">
                <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Status Check-in</p>
                <p className="text-[10px] font-black font-sans text-zinc-200 mt-1 truncate">{currentCheckinStatus}</p>
              </div>
              <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900">
                <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Último Treino</p>
                <p className="text-[10px] font-mono font-bold text-amber-500 mt-1">{lastPresence}</p>
              </div>
              <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900">
                <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Frequência Mensal</p>
                <p className="text-[10px] font-mono font-black text-emerald-400 mt-1">{attendanceRate}%</p>
              </div>
            </div>

            {handleStudentCheckin && (
              <div className="pt-2.5 space-y-2">
                <button
                  onClick={handleStudentCheckin}
                  disabled={(defaultStudent?.status || "").toUpperCase().trim() === "INATIVO"}
                  className={`w-full text-white font-black text-xs tracking-wider uppercase py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    (defaultStudent?.status || "").toUpperCase().trim() === "INATIVO"
                      ? "bg-zinc-800 border-zinc-700 text-zinc-500 opacity-60 cursor-not-allowed shadow-none"
                      : "bg-red-850 hover:bg-red-800 border-red-750/30 shadow-[0_4px_12px_rgba(153,27,27,0.3)]"
                  }`}
                >
                  ⚡ Solicitar Presença de Hoje
                </button>
                {studentStatusMsg && (
                  <p className="text-[10px] text-teal-400 font-bold font-mono text-center bg-teal-950/15 p-2 rounded-xl border border-teal-900/30 animate-fadeIn leading-snug">
                    {studentStatusMsg}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Carteirinha Digital */}
          <div className="bg-gradient-to-br from-red-900 via-red-950 to-black border-2 border-amber-500/30 p-5 rounded-3xl text-left relative overflow-hidden shadow-2xl space-y-4" id="digital-membership-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <EagleClawLogo className="w-12 h-12" />
                <div className="leading-tight">
                  <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase font-sans">GARRA DE ÁGUIA</span>
                  <p className="text-[8px] text-zinc-400 font-mono tracking-widest leading-none">MEMBRO ACADEMIA</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[7px] uppercase font-black tracking-widest">
                ATIVO
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 items-center">
              <div className="col-span-2 space-y-2">
                <div>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider leading-none">Aluno</p>
                  <p className="text-sm font-black text-white">{defaultStudent?.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <p className="text-[8px] text-zinc-400 font-mono uppercase leading-none">Matrícula</p>
                    <p className="text-[11px] font-mono font-bold text-zinc-100">{defaultStudent?.id}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-400 font-mono uppercase leading-none">Graduação</p>
                    <p className="text-[11px] font-bold text-amber-400">{defaultStudent?.graduacao || "Preparatória - Branca"}</p>
                  </div>
                </div>
              </div>

              {/* simulated qr */}
              <div className="col-span-1 bg-zinc-950 p-2 border border-zinc-800 rounded-xl flex items-center justify-center">
                <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h6v6H2V2zm2 2v2h2V4H4zm1 1h1v1H5V5zM16 2h6v6h-6V2zm2 2v2h2V4h-2zm-1 4h1v1h-1V8zm-2-6h1v1h-1V2zM2 16h6v6H2v-6zm2 2v2h2v-2H4zm14-2h4v6h-4v-6zm2 2v2h-1v-2h1zM11 2h2v2h-2V2zm0 4h2v2h-2V6zm2 5h-2v2h2v-2zm-3-1H8v2h2v-2zm1 4v2h-2v-2h2zm4-3h2v2h-2v-2zm3 1h1v2h-2v-1h1v-1z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Attendance visual progress */}
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl text-left space-y-3.5 flex flex-col justify-between" id="student-attendance-progress">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              <div className="leading-tight">
                <h4 className="text-xs font-black uppercase text-zinc-200">Frequência de Aulas</h4>
                <p className="text-[10px] text-zinc-500 font-sans">Aprovadas pela Administração</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="relative w-16 h-16 rounded-full border-4 border-zinc-900 border-t-red-650 flex items-center justify-center font-mono text-sm font-black text-white">
                <span>{attendanceRate}%</span>
              </div>
              <div className="text-xs space-y-1 text-zinc-400 leading-normal font-sans">
                <p>Status Financeiro: <span className={`font-bold ${defaultStudent?.statusFinanceiro && defaultStudent.statusFinanceiro.toUpperCase() === "EM DIA" ? "text-emerald-400" : "text-rose-500"}`}>{defaultStudent?.statusFinanceiro === "EM DIA" ? "EM DIA ✓" : "PENDENTE ⚠️"}</span></p>
                <p>Presenças Confirmadas: <strong className="text-white">{studentPresApproved.length} aulas</strong></p>
                <p className="text-[10px] text-amber-500 font-semibold">Exame de Grau requer frequência ativa.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MURAL DE AVISOS GERAL */}
      <div className="bg-[#141414] border border-zinc-900/60 p-4.5 rounded-2xl text-left space-y-2" id="dashboard-bulletin-board">
        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 font-sans">
          <Flame className="w-4 h-4 text-red-600 animate-pulse fill-red-800" />
          Mural de Avisos - Praia Grande
        </h4>
        <p className="text-xs text-zinc-350 font-sans leading-relaxed">
          {config.avisoMural || "Treino tradicional às segundas e quartas na academia."}
        </p>
      </div>

    </div>
  );
}
