import React, { useState } from "react";
import { Aluno, Turma, Presenca, HistoricoGraduacao } from "../types";
import { Calendar, Check, AlertCircle, FileSpreadsheet, Star, UserCheck, ShieldCheck, CheckCircle, XCircle, Hand, MessageSquare, Clock } from "lucide-react";

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
  const [selectedTurmaId, setSelectedTurmaId] = useState(turmas[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceState, setAttendanceState] = useState<{ [stuId: string]: { status: "APPROVED" | "Faltou" | "Justificado"; obs: string } }>({});
  
  // Grading Board active edit mode
  const [editingGradId, setEditingGradId] = useState<string | null>(null);
  const [notaTecnica, setNotaTecnica] = useState(0);
  const [notaFilosofica, setNotaFilosofica] = useState(0);
  const [gradStatus, setGradStatus] = useState<"Aprovado" | "Pendente">("Pendente");

  const activeTurma = turmas.find(t => t.id === selectedTurmaId);
  const studentsInTurma = alunos.filter(a => a.turmaId === selectedTurmaId && a.status === "Ativo");

  const handleStatusChange = (stuId: string, status: "APPROVED" | "Faltou" | "Justificado") => {
    setAttendanceState(prev => ({
      ...prev,
      [stuId]: {
        status,
        obs: prev[stuId]?.obs || ""
      }
    }));
  };

  const handleObsChange = (stuId: string, obs: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [stuId]: {
        status: prev[stuId]?.status || "APPROVED",
        obs
      }
    }));
  };

  const handleSaveAttendance = () => {
    let count = 0;
    studentsInTurma.forEach(stu => {
      const record = attendanceState[stu.id] || { status: "APPROVED", obs: "" };
      
      onAddPresenca({
        id: `p_new_${Date.now()}_${stu.id}`,
        turmaId: selectedTurmaId,
        alunoId: stu.id,
        alunoNome: stu.nome,
        data: selectedDate,
        status: record.status,
        observacao: record.obs,
        solicitadoPorAluno: false
      });
      count++;
    });

    alert(`Frequência de ${count} alunos lançada com sucesso no sistema (simulado em Firestore)!`);
    setAttendanceState({});
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

  // Filter pending check-in requests from mobile students
  const pendingRequests = presencas.filter(p => p.status === "PENDING");

  return (
    <div className="space-y-6">

      {/* 📋 NEW STEP: PENDING STUDENT CHECK-IN REQUESTS FROM CELULAR */}
      <div className="bg-zinc-900 border border-amber-500/35 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-black tracking-wider text-amber-400 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 font-bold" />
              Solicitações de Check-In Pendentes (Presença Alunos)
            </h3>
            <p className="text-[11px] text-zinc-400">Revisão obrigatória de sinal de presenças enviadas via celular antes de serem homologadas.</p>
          </div>
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold font-mono text-amber-400 bg-amber-950/60 border border-amber-900 rounded-full">
            {pendingRequests.length} Solicitados
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 font-mono text-xs">
            Nenhum pedido de check-in pendente. As frequências estão em dia!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(p => {
              const studentTurma = turmas.find(t => t.id === p.turmaId);
              return (
                <div key={p.id} className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-850 flex flex-col justify-between gap-3 animate-fadeIn">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-white text-xs">{p.alunoNome}</p>
                      <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{p.data}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Turma: <strong className="text-zinc-300">{studentTurma ? studentTurma.nomeEstilo : "Desconhecida"}</strong></p>
                    <p className="text-[11px] text-amber-500 italic flex items-center gap-1.5 mt-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500 inline" /> Status Atual: PENDING (Solicitado via celular)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onDecideCheckin && onDecideCheckin(p.id, "APPROVED")}
                      className="flex-1 py-1 px-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                      Aprovar Presença
                    </button>
                    <button
                      onClick={() => onDecideCheckin && onDecideCheckin(p.id, "REJECTED")}
                      className="py-1 px-3 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 font-bold rounded text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      Recusar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Regular daily roll-call spreadsheet */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-black tracking-wider text-white flex items-center gap-2 uppercase">
              <ClipboardCheck className="w-5 h-5 text-red-650" />
              Diário Metódico de Presenças Gerais
            </h3>
            <p className="text-xs text-zinc-400">Selecione a turma, registre as frequências e aplique notas de tatame no banco de dados.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold block uppercase font-sans">Selecione a Turma Oficial</span>
              <select
                id="instructor-select-class"
                value={selectedTurmaId}
                onChange={(e) => setSelectedTurmaId(e.target.value)}
                className="p-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-amber-400 font-semibold focus:outline-none"
              >
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.nomeEstilo}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold block uppercase font-sans">Data Marcial</span>
              <input
                id="instructor-attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Attendance interactive sheet */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-950 p-3 rounded border border-zinc-850">
            <span className="text-xs font-mono text-zinc-400">
              Grade: <strong className="text-white">{activeTurma?.nomeEstilo}</strong> | Horas: <strong className="text-amber-400">{activeTurma?.horario}</strong>
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Alunos matriculados: <strong className="text-emerald-400">{studentsInTurma.length} Ativos</strong>
            </span>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto rounded-lg border border-zinc-850">
            <table className="w-full text-left" id="instructor-attendance-table">
              <thead>
                <tr className="bg-zinc-950 text-zinc-400 text-[10px] font-sans uppercase border-b border-zinc-805">
                  <th className="py-3 px-4">Nome do Aluno Marcial</th>
                  <th className="py-3 px-4 text-center">Opções de Presença Directa</th>
                  <th className="py-3 px-4">Nota de Desempenho / Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs">
                {studentsInTurma.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500 text-xs">
                      Não há alunos cadastrados ativos nesta grade horária.
                    </td>
                  </tr>
                ) : (
                  studentsInTurma.map(stu => {
                    const statusVal = attendanceState[stu.id]?.status || "APPROVED";
                    const obsVal = attendanceState[stu.id]?.obs || "";

                    return (
                      <tr key={stu.id} className="hover:bg-zinc-950/40 text-zinc-300">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs">{stu.nome}</span>
                            <span className="text-[9px] text-zinc-400 font-mono">Faixa Atual: <strong className="text-amber-400 font-medium">{stu.graduacao}</strong></span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              id={`attendance-${stu.id}-p`}
                              onClick={() => handleStatusChange(stu.id, "APPROVED")}
                              className={`p-1.5 px-3 rounded text-[10px] uppercase font-bold transition-colors ${
                                statusVal === "APPROVED" ? "bg-emerald-950 text-emerald-400 border border-emerald-500" : "bg-zinc-950 border border-zinc-800 text-zinc-400"
                              }`}
                            >
                              Presente
                            </button>
                            <button
                              id={`attendance-${stu.id}-f`}
                              onClick={() => handleStatusChange(stu.id, "Faltou")}
                              className={`p-1.5 px-3 rounded text-[10px] uppercase font-bold transition-colors ${
                                statusVal === "Faltou" ? "bg-red-950 text-red-500 border border-red-800" : "bg-zinc-950 border border-zinc-800 text-zinc-400"
                              }`}
                            >
                              Falta
                            </button>
                            <button
                              id={`attendance-${stu.id}-j`}
                              onClick={() => handleStatusChange(stu.id, "Justificado")}
                              className={`p-1.5 px-3 rounded text-[10px] uppercase font-bold transition-colors ${
                                statusVal === "Justificado" ? "bg-amber-950 text-amber-500 border border-amber-800" : "bg-zinc-950 border border-zinc-800 text-zinc-400"
                              }`}
                            >
                              Justificar
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            id={`attendance-obs-${stu.id}`}
                            type="text"
                            placeholder="Anote o foco marcial do aluno hoje..."
                            value={obsVal}
                            onChange={(e) => handleObsChange(stu.id, e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-500 w-full"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Homologação final de chamadas em conformidade com o regulamento.</span>
            </div>
            
            <button
              id="btn-save-attendance-roll"
              onClick={handleSaveAttendance}
              disabled={studentsInTurma.length === 0}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
            >
              <UserCheck className="w-4 h-4" />
              REGISTRAR ENTRADA CHEFE
            </button>
          </div>
        </div>
      </div>

      {/* Belt promotion examinations evaluation boards */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md space-y-4">
        <div>
          <h3 className="text-base font-black tracking-wider text-white flex items-center gap-2 uppercase">
            <Star className="w-5 h-5 text-amber-400" />
            Banca de Exame (Acompanhamento Tradicional)
          </h3>
          <p className="text-xs text-zinc-400">Atribua pontuações técnicas e filosóficas exigidas para o avanço dos sashes dos alunos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 border border-zinc-800 rounded-lg p-3 bg-zinc-950">
            <span className="text-[10px] text-red-500 font-bold block uppercase tracking-wider font-mono">Avaliação Agendada</span>
            
            <div className="divide-y divide-zinc-850 text-xs">
              {graduacoes.map(g => (
                <div key={g.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{g.alunoNome}</p>
                    <p className="text-zinc-400 text-[10px]">Candidato de {g.sashAnterior} para <span className="text-amber-400 font-bold">{g.sashNovo}</span></p>
                  </div>
                  <div>
                    {g.status === "Pendente" ? (
                      <button
                        id={`btn-eval-grad-${g.id}`}
                        onClick={() => handleOpenGradingEdit(g)}
                        className="p-1 px-3 bg-red-800 hover:bg-red-900 border border-red-700 text-white font-bold rounded text-[10.5px]"
                      >
                        Avaliar Notas
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[10px] border border-emerald-950 bg-emerald-950/60 p-1 rounded font-mono">APROVADO</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950/30 rounded-lg border border-red-900/10 p-4 flex flex-col justify-between">
            {editingGradId ? (
              <div className="space-y-4 animate-fadeIn" id="p-grading-form">
                <span className="text-xs font-bold text-amber-400 block border-b border-zinc-800 pb-1.5 uppercase font-mono tracking-wider">Lançamento de Desempenho</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Avaliação Física & Técnica (0 a 10)</span>
                    <span className="text-amber-400 font-mono font-bold">{notaTecnica}</span>
                  </div>
                  <input
                    id="grading-tech-score"
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={notaTecnica}
                    onChange={(e) => setNotaTecnica(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Avaliação Filosófica (0 a 10)</span>
                    <span className="text-amber-400 font-mono font-bold">{notaFilosofica}</span>
                  </div>
                  <input
                    id="grading-philo-score"
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={notaFilosofica}
                    onChange={(e) => setNotaFilosofica(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium block font-sans">Veredito Final da Banca</label>
                  <select
                    id="grading-decision-status"
                    value={gradStatus}
                    onChange={(e) => setGradStatus(e.target.value as any)}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none w-full"
                  >
                    <option value="Pendente">Em Avaliação (Mesa Examinadora)</option>
                    <option value="Aprovado">Aprovado e Promovido na Hierarquia</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setEditingGradId(null)}
                    className="p-1 px-3 border border-zinc-800 text-zinc-400 rounded text-xs"
                  >
                    Descartar
                  </button>
                  <button
                    id="btn-save-grading"
                    onClick={handleSaveGrading}
                    className="p-1 px-4 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800"
                  >
                    Homologar Notas
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-zinc-500">
                <ShieldCheck className="w-8 h-8 text-zinc-800 mb-2" />
                <p className="text-xs">Selecione um aluno candidato na lista à esquerda para iniciar o lançamento das pontuações do exame da Garra de Águia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline temporary custom SVG wrapper
function ClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}
