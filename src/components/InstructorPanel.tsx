import React, { useState, useEffect } from "react";
import { Aluno, Turma, Presenca, HistoricoGraduacao } from "../types";
import { 
  Calendar, Check, AlertCircle, FileSpreadsheet, Star, UserCheck, ShieldCheck, 
  CheckCircle, XCircle, Hand, MessageSquare, Clock, UserCheck2, ListFilter
} from "lucide-react";

interface InstructorPanelProps {
  alunos: Aluno[];
  turmas: Turma[];
  presencas: Presenca[];
  graduacoes: HistoricoGraduacao[];
  onAddPresenca: (presenca: Presenca) => void;
  onUpdateGraduacao: (id: string, notaTecnica: number, notaFilosofica: number, status: "Aprovado" | "Pendente") => void;
  onDecideCheckin?: (presencaId: string, status: "APPROVED" | "REJECTED") => void;
}

export default function InstructorPanel({
  alunos,
  turmas,
  presencas,
  graduacoes,
  onAddPresenca,
  onUpdateGraduacao,
  onDecideCheckin
}: InstructorPanelProps) {
  // Inicialização preferindo a data de hoje
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTurmaId, setSelectedTurmaId] = useState("");
  const [attendanceState, setAttendanceState] = useState<{ [stuId: string]: { status: string; obs: string } }>({});
  
  // Real-time time tracker for identifying current and next class
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  // Grading Board active edit mode
  const [editingGradId, setEditingGradId] = useState<string | null>(null);
  const [notaTecnica, setNotaTecnica] = useState(0);
  const [notaFilosofica, setNotaFilosofica] = useState(0);
  const [gradStatus, setGradStatus] = useState<"Aprovado" | "Pendente">("Pendente");

  // Keep tracking of current time
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 15000); // 15s check
    return () => clearInterval(interval);
  }, []);

  // Helpers de formatação e correspondência do dia da semana
  const getDiaSemanaCompleto = (dataStr: string) => {
    if (!dataStr) return "";
    const [year, month, day] = dataStr.split("-").map(Number);
    // Cria data segura sem timezone drift local
    const dateObj = new Date(year, month - 1, day);
    const diasCompletos = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado"
    ];
    return diasCompletos[dateObj.getDay()];
  };

  const getDiaSemanaCurto = (dataStr: string) => {
    if (!dataStr) return "";
    const [year, month, day] = dataStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const diasCurtos = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return diasCurtos[dateObj.getDay()];
  };

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return "";
    const parts = dataStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  };

  const parseIntervaloHorario = (horarioStr: string) => {
    if (!horarioStr) return null;
    const cleaned = horarioStr.toLowerCase().replace("às", "-").replace("to", "-").replace(/\s/g, "");
    const parts = cleaned.split("-");
    if (parts.length < 2) return null;
    
    // Auxiliar para interpretar hh:mm em minutos totais
    const parseParaMinutos = (hStr: string) => {
      const subParts = hStr.split(":");
      if (subParts.length < 2) return 0;
      return Number(subParts[0]) * 60 + Number(subParts[1]);
    };

    return {
      startMin: parseParaMinutos(parts[0]),
      endMin: parseParaMinutos(parts[1])
    };
  };

  // 1. Filtragens de turmas baseadas estritamente no dia selecionado
  const diaSemanaSelecionado = getDiaSemanaCurto(selectedDate);
  const turmasDoDia = turmas.filter(t => t.diasSemana && t.diasSemana.includes(diaSemanaSelecionado));

  // 2. Determinação de Turma Atual e Próxima Turma do cronograma
  let turmaAtual: Turma | null = null;
  let proximaTurma: Turma | null = null;

  if (turmasDoDia.length > 0) {
    const turmasMapeadas = turmasDoDia.map(t => {
      const times = parseIntervaloHorario(t.horario);
      return {
        turma: t,
        times
      };
    }).filter(item => item.times !== null) as Array<{ turma: Turma, times: { startMin: number, endMin: number } }>;

    // Acha se alguma turma está acontecendo agora
    const currentClassMatch = turmasMapeadas.find(item => 
      currentTimeMinutes >= item.times.startMin && currentTimeMinutes <= item.times.endMin
    );
    if (currentClassMatch) {
      turmaAtual = currentClassMatch.turma;
    }

    // Acha a próxima (aquela com início maior que currentTimeMinutes de forma crescente)
    const proximasEncontradas = turmasMapeadas
      .filter(item => item.times.startMin > currentTimeMinutes)
      .sort((a, b) => a.times.startMin - b.times.startMin);
    
    if (proximasEncontradas.length > 0) {
      proximaTurma = proximasEncontradas[0].turma;
    } else if (turmasMapeadas.length > 0 && !turmaAtual) {
      // Fallback: primeira turma do dia
      proximaTurma = turmasMapeadas[0].turma;
    }
  }

  // Define a turma ativa selecionada. Se não houver seleção padrão, prefere a Turma Atual ou a Próxima Turma
  const activeTurmaId = selectedTurmaId || turmaAtual?.id || proximaTurma?.id || turmasDoDia[0]?.id || "";
  const activeTurma = turmas.find(t => t.id === activeTurmaId);

  // Atualizar a turma selecionada na inicialização ou mudança de data
  useEffect(() => {
    if (turmasDoDia.length > 0) {
      const defaultId = turmaAtual?.id || proximaTurma?.id || turmasDoDia[0]?.id || "";
      setSelectedTurmaId(defaultId);
    } else {
      setSelectedTurmaId("");
    }
  }, [selectedDate, turmas.length]);

  // 3. Discernir modalidade técnica da turma para realizar a filtragem correta
  const discernirModalidadeTurma = (nomeEstiloClass: string) => {
    if (!nomeEstiloClass) return "Kung Fu";
    const lower = nomeEstiloClass.toLowerCase();
    if (lower.includes("tai chi") || lower.includes("taichi")) {
      return "Tai Chi Chuan";
    }
    if (lower.includes("sanda") || lower.includes("boxe") || lower.includes("boxe chin")) {
      return "Boxe Chinês / Sanda";
    }
    return "Kung Fu";
  };

  // 4. Filtrar automaticamente alunos matriculados pela modalidade da turma selecionada
  const activeModalidadeTurma = activeTurma ? discernirModalidadeTurma(activeTurma.nomeEstilo) : "Kung Fu";
  
  const activeStudentsForClass = alunos.filter(a => {
    if (a.status !== "Ativo") return false;
    
    // Se o aluno possui o array reativo do novo módulo, verifica se inclui a modalidade da turma
    if (a.modalidades && a.modalidades.length > 0) {
      return a.modalidades.includes(activeModalidadeTurma);
    }
    
    // Fallback retrocompatível: verifica se o texto coincide
    const alunoModalidadeDiscernida = discernirModalidadeTurma(a.modalidade || "");
    return alunoModalidadeDiscernida === activeModalidadeTurma;
  });

  // Mapeia presenças arquivadas no Firestore para pintar os botões com status real
  const getPresencaGravada = (alunoId: string) => {
    return presencas.find(p => p.alunoId === alunoId && p.data === selectedDate);
  };

  // 5. Salvar Presença Reativamente com atualização em tempo real no Firestore!
  const handlLancarPresencaReal = async (stu: Aluno, statusDesejado: "APPROVED" | "Faltou" | "Justificado") => {
    if (!activeTurma) {
      alert("Selecione uma turma para registrar a chamada rápida.");
      return;
    }

    // Tradução de APPROVED para "Presente"
    const statusPersistido = statusDesejado === "APPROVED" ? "Presente" : statusDesejado === "Faltou" ? "Faltou" : "Justificado";
    const currentObs = attendanceState[stu.id]?.obs || "";

    const presencaDocumento: Presenca = {
      id: `p_inst_${selectedDate}_${stu.id}`,
      alunoId: stu.id,
      alunoNome: stu.nome,
      turmaId: activeTurma.id,
      data: selectedDate,
      status: statusPersistido as any,
      observacao: currentObs,
      solicitadoPorAluno: false,
      modalidade: activeModalidadeTurma,
      horario: activeTurma.horario || "15:00 - 16:00",
      confirmadoPor: "Instrutor"
    };

    onAddPresenca(presencaDocumento);
    
    // Atualiza feedback de UI sem travar
    setAttendanceState(prev => ({
      ...prev,
      [stu.id]: {
        status: statusDesejado,
        obs: currentObs
      }
    }));
  };

  const handleObsChange = (stuId: string, text: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [stuId]: {
        status: prev[stuId]?.status || "",
        obs: text
      }
    }));
  };

  const handleOpenGradingEdit = (g: HistoricoGraduacao) => {
    setEditingGradId(g.id);
    setNotaTecnica(g.notaTecnica || 7.0);
    setNotaFilosofica(g.notaFilosofica || 7.0);
    setGradStatus(g.status === "Aprovado" ? "Aprovado" : "Pendente");
  };

  const handleSaveGrading = () => {
    if (editingGradId) {
      onUpdateGraduacao(editingGradId, notaTecnica, notaFilosofica, gradStatus);
      setEditingGradId(null);
      alert("Avaliação do exame de faixa salva tradicionalmente!");
    }
  };

  // Filtra as solicitações pendentes sincronizadas via mobile
  const pendingRequests = presencas.filter(p => (p.status as string) === "PENDING" || (p.status as string) === "Pendente");

  return (
    <div className="space-y-6 text-left">

      {/* 📘 WIDGET 1: DIA DE HOJE & CALENDÁRIO GERAL */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono">Controle de Frequência Profissional</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Hoje:</span>
              <span className="text-red-500">{getDiaSemanaCompleto(selectedDate)}</span>
              <span className="text-zinc-500 font-normal">—</span>
              <span className="text-zinc-305 font-mono font-medium">{formatarDataBR(selectedDate)}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-850">
            <label className="text-[10px] font-mono font-black text-zinc-400 px-2 uppercase">Selecionar Data:</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setAttendanceState({});
              }}
              className="bg-black text-[11px] font-mono text-white p-1 rounded font-bold border border-zinc-800 focus:outline-none"
            />
          </div>
        </div>

        {/* 🥋 WIDGET 2: BENTO GRID DE TURMA ATUAL & PRÓXIMA TURMA DEL DIA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1.5 font-mono text-xs">
          
          {/* Box 1: Turma Atual */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            turmaAtual 
              ? "bg-[#0b1b11] border-emerald-950/80 text-emerald-300"
              : "bg-zinc-950 border-zinc-900 text-zinc-550"
          }`}>
            <h4 className="text-[9.5px] font-black uppercase text-zinc-500 tracking-widest mb-1">AULA EM ANDAMENTO</h4>
            {turmaAtual ? (
              <div className="space-y-1.5">
                <p className="font-sans font-black text-white uppercase text-[12.5px] leading-tight">{turmaAtual.nomeEstilo}</p>
                <div className="flex items-center gap-1.5 text-[10px] bg-emerald-950/40 p-1 px-2 rounded-lg border border-emerald-900/40 w-fit">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Horas: {turmaAtual.horario}</span>
                </div>
              </div>
            ) : (
              <div className="py-2.5 text-[11px] italic">Nenhuma aula sendo ministrada neste exato horário.</div>
            )}
          </div>

          {/* Box 2: Próxima Turma */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between text-zinc-400">
            <h4 className="text-[9.5px] font-black uppercase text-zinc-500 tracking-widest mb-1">PRÓXIMA AULA DE HOJE</h4>
            {proximaTurma ? (
              <div className="space-y-1.5">
                <p className="font-sans font-black text-zinc-300 uppercase text-[12.5px] leading-tight">{proximaTurma.nomeEstilo}</p>
                <div className="flex items-center gap-1.5 text-[10px] bg-zinc-900 p-1 px-2 rounded-lg border border-zinc-850 w-fit">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Horas: {proximaTurma.horario}</span>
                </div>
              </div>
            ) : (
              <div className="py-2.5 text-[11px] italic text-zinc-500">Sem mais aulas programadas para o dia de hoje.</div>
            )}
          </div>

        </div>
      </div>

      {/* ⚠️ SOLICITAÇÕES PENDENTES VIA CELULAR */}
      {pendingRequests.length > 0 && (
        <div className="bg-zinc-900 border border-amber-500/35 rounded-2xl p-4 shadow space-y-3.5">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
            <div>
              <h3 className="text-xs font-black tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Pedidos de Check-In Pendentes (Celular)
              </h3>
              <p className="text-[10px] text-zinc-400 leading-normal">Alunos solicitaram presença remota hoje para validação técnica.</p>
            </div>
            <span className="px-2 py-0.5 text-[9px] uppercase font-bold font-mono text-amber-400 bg-amber-955/60 border border-amber-900 rounded-full">
              {pendingRequests.length} novos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingRequests.map(p => {
              const studentTurma = turmas.find(t => t.id === p.turmaId);
              return (
                <div key={p.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col justify-between gap-3 font-sans">
                  <div className="text-xs space-y-0.5">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-white uppercase text-[11.5px]">{p.alunoNome}</p>
                      <span className="font-mono text-[9px] text-zinc-400">{formatarDataBR(p.data)}</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-400">Turma: <strong className="text-zinc-300">{studentTurma ? studentTurma.nomeEstilo : "Frequência Livre"}</strong></p>
                  </div>

                  <div className="flex gap-2 font-mono text-[9px]">
                    <button
                      onClick={() => onDecideCheckin && onDecideCheckin(p.id, "APPROVED")}
                      className="flex-1 py-1.5 px-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded uppercase transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                      Homologar
                    </button>
                    <button
                      onClick={() => onDecideCheckin && onDecideCheckin(p.id, "REJECTED")}
                      className="py-1.5 px-3 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 font-extrabold rounded uppercase transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      Recusar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📋 CHAPA OFICIAL: CHAMADA INTELIGENTE POR DIA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5.5 space-y-4">
        
        {/* Filtros de Turma e Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 uppercase font-sans">
              <ListFilter className="w-4.5 h-4.5 text-red-650" />
              Cronograma & Chamada do Dia ({getDiaSemanaCurto(selectedDate)})
            </h3>
            <p className="text-[11px] text-zinc-400 italic">Exibindo somente turmas programadas para o dia e filtrando alunos matriculados.</p>
          </div>

          <div className="flex flex-wrap gap-2.5 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-bold block uppercase">Turma Ativa da Chamada:</span>
              <select
                id="instructor-select-class-smart"
                value={activeTurmaId}
                onChange={(e) => {
                  setSelectedTurmaId(e.target.value);
                  setAttendanceState({});
                }}
                className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-500 font-bold uppercase focus:outline-none focus:border-red-600"
              >
                {turmasDoDia.length === 0 ? (
                  <option value="">Nenhuma turma hoje ({diaSemanaSelecionado})</option>
                ) : (
                  turmasDoDia.map(t => (
                    <option key={t.id} value={t.id}>{t.nomeEstilo}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Grade de Alunos e Chamada Instantânea */}
        {activeTurma ? (
          <div className="space-y-3">
            
            {/* Header Técnico da Turma Ativa */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 gap-2 font-mono text-[11px]">
              <div className="space-y-0.5">
                <span className="text-zinc-500 uppercase tracking-wider block text-[9px] font-black">Estilo Selecionado:</span>
                <span className="text-white font-bold uppercase">{activeTurma.nomeEstilo}</span>
              </div>
              <div className="sm:text-right space-y-0.5">
                <span className="text-zinc-505 uppercase tracking-wider block text-[9.5px]">Modalidade Filtro:</span>
                <span className="bg-red-950/60 p-1 px-2 rounded font-bold text-red-400 border border-red-900/40 text-[10px] inline-block uppercase mt-0.5">
                  🛡️ {activeModalidadeTurma}
                </span>
              </div>
            </div>

            {/* Listagem Real de Alunos Filtrados por Modalidade em Formato de Cartões Mobile-First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="instructor-attendance-cards-smart">
              {activeStudentsForClass.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs leading-relaxed max-w-xl mx-auto">
                  <AlertCircle className="w-6 h-6 text-zinc-755 mx-auto mb-2 text-zinc-600" />
                  Nenhum aluno ativo matriculado na modalidade <strong className="text-zinc-300">"{activeModalidadeTurma}"</strong> foi encontrado para esta chamada.
                </div>
              ) : (
                activeStudentsForClass.map(stu => {
                  // Verifica se o aluno já possui presença gravada no Firestore para esse dia
                  const fStoreRecord = getPresencaGravada(stu.id);
                  
                  // Status final preferindo o estado recém-alterado ou o arquivo do Firestore
                  const finalStatus = attendanceState[stu.id]?.status || 
                    (fStoreRecord ? (fStoreRecord.status === "Presente" ? "APPROVED" : fStoreRecord.status) : "");
                  
                  const obsValue = attendanceState[stu.id]?.obs || (fStoreRecord ? fStoreRecord.observacao : "");

                  return (
                    <div 
                      key={stu.id} 
                      className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 flex flex-col justify-between gap-4.5 hover:border-zinc-800 transition-all shadow-md group text-left"
                    >
                      {/* Top Info of Pupil */}
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-white text-[13px] uppercase tracking-wide block leading-tight">{stu.nome}</span>
                        <div className="flex flex-wrap gap-1.5 text-[9.5px] font-mono">
                          <span className="bg-zinc-900 border border-zinc-800 text-amber-500 font-bold px-2 py-0.5 rounded-md">
                            🥋 {stu.graduacao}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                            stu.statusFinanceiro === "Em Dia" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" :
                            stu.statusFinanceiro === "Atrasado" ? "bg-red-950/40 text-red-500 border border-red-900/40" : "bg-zinc-900 text-zinc-400"
                          }`}>
                            {stu.statusFinanceiro}
                          </span>
                        </div>
                      </div>

                      {/* Giant Control Buttons conforming to Rules */}
                      <div className="flex gap-1.5 font-mono text-[9px] font-black">
                        {/* Botão PRESENTE */}
                        <button
                          onClick={() => handlLancarPresencaReal(stu, "APPROVED")}
                          className={`flex-1 py-3 px-1 rounded-xl uppercase transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                            finalStatus === "APPROVED" || finalStatus === "Presente"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black" 
                              : "bg-black hover:bg-zinc-900 border-zinc-900 text-zinc-500"
                          }`}
                        >
                          <span className="text-[14px]">🥋</span>
                          <span>PRESENTE</span>
                        </button>

                        {/* Botão FALTA */}
                        <button
                          onClick={() => handlLancarPresencaReal(stu, "Faltou")}
                          className={`flex-1 py-3 px-1 rounded-xl uppercase transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                            finalStatus === "Faltou"
                              ? "bg-red-950 text-red-500 border-red-800 shadow-[0_0_8px_rgba(239,68,68,0.15)] font-black" 
                              : "bg-black hover:bg-zinc-900 border-zinc-900 text-zinc-500"
                          }`}
                        >
                          <span className="text-[14px]">❌</span>
                          <span>FALTA</span>
                        </button>

                        {/* Botão JUSTIFICADA */}
                        <button
                          onClick={() => handlLancarPresencaReal(stu, "Justificado")}
                          className={`flex-1 py-3 px-1 rounded-xl uppercase transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                            finalStatus === "Justificado"
                              ? "bg-amber-950 text-amber-500 border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.15)] font-black" 
                              : "bg-black hover:bg-zinc-900 border-zinc-900 text-zinc-500"
                          }`}
                        >
                          <span className="text-[14px]">📝</span>
                          <span>JUSTIFICADA</span>
                        </button>
                      </div>

                      {/* Tatame Note Footer Input */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-mono font-bold block">Desempenho / Nota do Tatame:</label>
                        <input
                          type="text"
                          placeholder="Anote a destreza do aluno..."
                          value={obsValue}
                          onChange={(e) => handleObsChange(stu.id, e.target.value)}
                          onBlur={() => {
                            if (finalStatus) {
                              handlLancarPresencaReal(stu, finalStatus as any);
                            }
                          }}
                          className="bg-black border border-zinc-900 rounded-xl p-2 text-[10.5px] font-mono text-zinc-300 placeholder-zinc-805 focus:outline-none focus:border-red-700 w-full hover:border-zinc-800 transition-all"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center text-[10.5px] font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Sincronização Ativa com Firestore. Não há necessidade de salvar no fim.
              </span>
              <span className="font-bold text-zinc-400">
                Alunos na Lista de Chamada: {activeStudentsForClass.length}
              </span>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 bg-zinc-950 rounded-2xl border border-zinc-805 font-mono text-xs text-zinc-500 space-y-2">
            <AlertCircle className="w-6 h-6 text-zinc-700 mx-auto" />
            <p>Nenhuma aula programada ou cadastrada para as quartas-feiras.</p>
            <p className="text-[10px] text-zinc-600 max-w-sm mx-auto">Adicione turmas oficiais no painel do administrador para que o cronograma técnico de chamada diária seja construído.</p>
          </div>
        )}

      </div>

      {/* 🏅 BANCA DE EXAMES & COMPANHAMENTO DE SASHES */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5.5 shadow-md space-y-4">
        <div>
          <h3 className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 uppercase font-sans">
            <Star className="w-4.5 h-4.5 text-amber-500" />
            Banca Examinadora de Graduação (Fase Final)
          </h3>
          <p className="text-[11px] text-zinc-400">Acompanhe exames de sashes de alunos, pontuando critérios físicos, técnicos e filosóficos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 border border-zinc-850 rounded-2xl p-3 bg-zinc-950 font-mono text-xs">
            <span className="text-[9.5px] text-red-500 font-bold block uppercase tracking-wider">Candidatos Agendados</span>
            
            <div className="divide-y divide-zinc-850">
              {graduacoes.length === 0 ? (
                <div className="text-center py-8 text-zinc-650 text-[11px]">Nenhuma avaliação técnica de sash pendente hoje.</div>
              ) : (
                graduacoes.map(g => (
                  <div key={g.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-white uppercase text-[11px]">{g.alunoNome}</p>
                      <p className="text-zinc-505 text-[9.5px]">De {g.sashAnterior || "Branca"} para <span className="text-amber-500 font-bold">{g.sashNovo}</span></p>
                    </div>
                    <div>
                      {g.status === "Pendente" ? (
                        <button
                          onClick={() => handleOpenGradingEdit(g)}
                          className="p-1 px-3 bg-red-800 hover:bg-red-850 border border-red-700 transition-colors text-white font-black rounded text-[10px] uppercase font-mono"
                        >
                          Avaliar
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-black text-[9px] border border-emerald-950 bg-emerald-950/60 p-1 rounded font-mono uppercase">APROVADO</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-zinc-950/30 rounded-2xl border border-zinc-850 p-4.5 flex flex-col justify-between font-mono">
            {editingGradId ? (
              <div className="space-y-4 animate-fadeIn">
                <span className="text-[10px] font-black text-amber-500 block border-b border-zinc-800 pb-1.5 uppercase tracking-wider">Lançamento de Desempenho</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Avaliação Física & Técnica (0 a 10):</span>
                    <span className="text-amber-500 font-bold">{notaTecnica}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={notaTecnica}
                    onChange={(e) => setNotaTecnica(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-zinc-900 rounded"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Avaliação Filosófica (0 a 10):</span>
                    <span className="text-amber-500 font-bold">{notaFilosofica}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={notaFilosofica}
                    onChange={(e) => setNotaFilosofica(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-zinc-900 rounded"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-zinc-450 font-sans block">Veredito da Banca:</label>
                  <select
                    value={gradStatus}
                    onChange={(e) => setGradStatus(e.target.value as any)}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none w-full uppercase text-amber-500 font-bold"
                  >
                    <option value="Pendente">Em Julgamento Técnico</option>
                    <option value="Aprovado">Aprovado e Promovido</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800 text-[10px]">
                  <button
                    onClick={() => setEditingGradId(null)}
                    className="p-1 px-3 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded uppercase font-bold"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSaveGrading}
                    className="p-1.5 px-4 bg-emerald-800 hover:bg-emerald-700 transition-colors text-white rounded font-bold uppercase"
                  >
                    Homologar Notas
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-zinc-500">
                <ShieldCheck className="w-8 h-8 text-zinc-800 mb-2" />
                <p className="text-[11px] leading-relaxed">Selecione um candidato listado ao lado para lançar as notas da banca da Garra de Águia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
