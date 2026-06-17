import React from "react";
import { 
  Calendar, 
  Clock, 
  Settings, 
  FileText, 
  CreditCard, 
  Award, 
  Flame 
} from "lucide-react";
import { EagleClawLogo } from "./BrasaoOficial";
import { Presenca, Aluno, Pagamento, GlobalConfigs, Turma } from "../types";

interface DashboardProps {
  activeRole: string;
  presencas: Presenca[];
  alunos: Aluno[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  defaultStudent?: Aluno;
  defaultStudentTurma?: Turma;
  setActiveBottomTab: (tab: string) => void;
  handleStudentCheckin?: () => void;
  studentStatusMsg?: string;
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
  studentStatusMsg
}: DashboardProps) {
  // Calculate dynamic student statistics
  const studentId = defaultStudent?.id;
  const studentPresRef = presencas.filter(p => p.alunoId === studentId);
  const studentPresApproved = studentPresRef.filter(p => p.status === "APPROVED" || p.status === "Presente");
  const sortedPresences = [...studentPresRef].sort((a, b) => b.data.localeCompare(a.data));
  const lastPresence = sortedPresences.length > 0 ? sortedPresences[0].data : "Nenhuma registrada";
  
  // Dynamic attendance percentage out of their recorded presences (default 100% or 75% if no records)
  const attendanceRate = studentPresRef.length > 0
    ? Math.min(100, Math.round((studentPresApproved.length / studentPresRef.length) * 100))
    : 78;

  const currentCheckinStatus = studentPresRef.length > 0 && studentPresRef[0].data === new Date().toISOString().split('T')[0]
    ? (studentPresRef[0].status === "PENDING" ? "Solicitado (Pendente)" : "Confirmado")
    : "Não solicitado hoje";

  return (
    <div className="space-y-4 animate-fadeIn" id="dashboard-tab-content">
      {/* Dynamic Main Action Panels based on logged-in role */}
      {activeRole !== "ALUNO" ? (
        /* ADMIN/INSTRUCTOR specific premium views: GRID OF REAL FIRESTORE STATISTICS CARDS */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fadeIn" id="stats-dashboard-counters">
          {/* Card 1: Total de alunos cadastrados */}
          <div 
            id="card-quick-alunos"
            onClick={() => setActiveBottomTab("alunos")}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 text-left space-y-3 cursor-pointer hover:border-red-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-start">
              <span className="p-2 bg-amber-950/40 rounded-xl border border-amber-900/40 text-amber-500 font-mono">
                🥋
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-black font-mono text-white leading-none">{alunos.length}</p>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wide">Alunos Cadastrados</p>
              <p className="text-[9px] text-zinc-500 font-mono">Gerenciar Alunos</p>
            </div>
          </div>

          {/* Card 2: Total de presenças */}
          <div 
            id="card-quick-presencas"
            onClick={() => setActiveBottomTab("presencas")}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 text-left space-y-3 cursor-pointer hover:border-red-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-start">
              <span className="p-2 bg-red-950/40 rounded-xl border border-red-900/40 text-red-500">
                <Calendar className="w-5 h-5" />
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-black font-mono text-white leading-none">{presencas.length}</p>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wide">Total de Presenças</p>
              <p className="text-[9px] text-zinc-500 font-mono">Registrar Presença</p>
            </div>
          </div>

          {/* Card 3: Total de mensalidades */}
          <div 
            id="card-quick-mensalidades"
            onClick={() => setActiveBottomTab("relatorios")}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 text-left space-y-3 cursor-pointer hover:border-red-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-start">
              <span className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400">
                <FileText className="w-5 h-5" />
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-black font-mono text-white leading-none">{pagamentos.length}</p>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wide">Total de Mensalidades</p>
              <p className="text-[9px] text-zinc-500 font-mono">Lançamentos Financeiros</p>
            </div>
          </div>

          {/* Card 4: Total arrecadado */}
          <div 
            id="card-quick-arrecadado"
            onClick={() => setActiveBottomTab("relatorios")}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 text-left space-y-3 cursor-pointer hover:border-emerald-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] col-span-2 lg:col-span-1"
          >
            <div className="flex justify-between items-start">
              <span className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-900/40 text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-black font-mono text-emerald-400 leading-none">
                R$ {pagamentos.filter(p => p.status === "Pago").reduce((a, b) => a + (b.valor || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wide">Total Arrecadado</p>
              <p className="text-[9px] text-zinc-500 font-mono">Receita Recebida</p>
            </div>
          </div>
        </div>
      ) : (
        /* STUDENT specific premium views: CARTEIRINHA + ATTENDANCE RATE + QUICK ACTION */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="student-dashboard-panels">
          {/* Custom Pupil Welcome and Quick Check-in Request Actions */}
          <div className="col-span-1 md:col-span-2 bg-[#0d0d0e]/60 border border-zinc-900 rounded-3xl p-5.5 text-left space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase font-mono bg-amber-950/20 border border-amber-900/40 px-2.5 py-0.5 rounded-full inline-block">
                Área Geral do Aluno
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Olá, <span className="text-red-500 uppercase">{defaultStudent?.nome || "Membro"}</span>!
              </h2>
              <p className="text-xs text-zinc-400 leading-normal">
                Faixa <strong className="text-amber-400">{defaultStudent?.graduacao ? defaultStudent.graduacao : "Branca"}</strong> na turma <strong className="text-zinc-200">{defaultStudentTurma?.nomeEstilo || "Geral"}</strong>. Seu status financeiro:{" "}
                <span className={`font-black uppercase text-[10px] ${defaultStudent?.statusFinanceiro === "Em Dia" ? "text-emerald-400" : "text-rose-500"}`}>
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
                  className="w-full bg-red-850 hover:bg-red-800 text-white font-black text-xs tracking-wider uppercase py-3 rounded-2xl transition-all shadow-[0_4px_12px_rgba(153,27,27,0.3)] flex items-center justify-center gap-2 border border-red-750/30"
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
                    <p className="text-[11px] font-bold text-amber-400">{defaultStudent?.graduacao?.replace(" (Iniciante)", "")}</p>
                  </div>
                </div>
              </div>

              {/* Simulated QR Code */}
              <div className="col-span-1 bg-zinc-950 p-2 border border-zinc-800 rounded-xl flex items-center justify-center">
                <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h6v6H2V2zm2 2v2h2V4H4zm1 1h1v1H5V5zM16 2h6v6h-6V2zm2 2v2h2V4h-2zm-1 4h1v1h-1V8zm-2-6h1v1h-1V2zM2 16h6v6H2v-6zm2 2v2h2v-2H4zm14-2h4v6h-4v-6zm2 2v2h-1v-2h1zM11 2h2v2h-2V2zm0 4h2v2h-2V6zm2 5h-2v2h2v-2zm-3-1H8v2h2v-2zm1 4v2h-2v-2h2zm4-3h2v2h-2v-2zm3 1h1v2h-2v-1h1v-1z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Attendance visual ring meter */}
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
                <p>Status Financeiro: <span className={`font-bold ${defaultStudent?.statusFinanceiro === "Em Dia" ? "text-emerald-400" : "text-rose-500"}`}>{defaultStudent?.statusFinanceiro === "Em Dia" ? "EM DIA ✓" : "PENDENTE ⚠️"}</span></p>
                <p>Presenças Confirmadas: <strong className="text-white">{studentPresApproved.length} aulas</strong></p>
                <p className="text-[10px] text-amber-500 font-semibold">Exame de Grau requer frequência ativa.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Resumo do dia" statistics section under action cards */}
      {activeRole !== "ALUNO" && (
        <div className="space-y-2 text-left" id="dashboard-daily-summary">
          <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black">Resumo do dia</h4>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#141414] border border-zinc-900 py-3.5 px-3 rounded-xl text-center space-y-0.5">
              <p className="text-xs font-bold font-mono text-emerald-400">{alunos.filter(a => a.status === "Ativo").length}</p>
              <p className="text-[9px] text-zinc-400 font-sans font-black uppercase">Alunos Ativos</p>
            </div>

            <div className="bg-[#141414] border border-zinc-900 py-3.5 px-3 rounded-xl text-center space-y-0.5">
              <p className="text-xs font-bold font-mono text-amber-500">{presencas.filter(p => p.status === "Presente" || p.status === "APPROVED").length}</p>
              <p className="text-[9px] text-zinc-400 font-sans font-black uppercase">Presenças Hoje</p>
            </div>

            <div className="bg-[#141414] border border-zinc-900 py-3.5 px-3 rounded-xl text-center space-y-0.5">
              <p className="text-xs font-bold font-mono text-red-500">{pagamentos.filter(p => p.status === "Pendente").length}</p>
              <p className="text-[9px] text-zinc-400 font-sans font-black uppercase">Vencimentos</p>
            </div>
          </div>
        </div>
      )}

      {/* Mural de avisos from config */}
      <div className="bg-[#141414] border border-zinc-900/60 p-4.5 rounded-2xl text-left space-y-2" id="dashboard-bulletin-board">
        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 font-sans">
          <Flame className="w-4 h-4 text-red-600 animate-pulse fill-red-800" />
          Mural de Avisos - Praia Grande
        </h4>
        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          {config.avisoMural || "Treino tradicional às segundas e quartas na academia."}
        </p>
      </div>
    </div>
  );
}
