import React from "react";
import { Smartphone } from "lucide-react";
import InstructorPanel from "./InstructorPanel";
import StudentPanel from "./StudentPanel";
import { Aluno, Turma, Presenca, Pagamento } from "../types";

interface PresencasProps {
  activeRole: string;
  presenceFilter: string;
  setPresenceFilter: (filter: string) => void;
  presencas: Presenca[];
  alunos: Aluno[];
  turmas: Turma[];
  graduacoes: any[];
  selectedCheckinDate: string;
  setSelectedCheckinDate: (date: string) => void;
  studentStatusMsg: string;
  handleStudentCheckin: () => void;
  handleDecideCheckin: (id: string, status: string) => void;
  handleAddPresenca: (p: any) => void;
  handleUpdateGraduacao: (gradId: string, notaTec: number, notaPhil: number, status: "A provado" | "Aprovado" | "Pendente") => void;
  defaultStudent?: Aluno;
  defaultStudentTurma?: Turma;
  pagamentos: Pagamento[];
  handleSolicitarPresenca: (turmaId: string, data: string) => void;
}

export function Presencas({
  activeRole,
  presenceFilter,
  setPresenceFilter,
  presencas,
  alunos,
  turmas,
  graduacoes,
  selectedCheckinDate,
  setSelectedCheckinDate,
  studentStatusMsg,
  handleStudentCheckin,
  handleDecideCheckin,
  handleAddPresenca,
  handleUpdateGraduacao,
  defaultStudent,
  defaultStudentTurma,
  pagamentos,
  handleSolicitarPresenca
}: PresencasProps) {
  return (
    <div className="space-y-4 animate-fadeIn" id="presencas-tab-content">
      {/* If power user: show Pending approve lists. If Student, show simulation checks */}
      {activeRole !== "ALUNO" ? (
        /* INSTRUCTOR/ADMIN PRESENÇAS DIRECTORY */
        <div className="space-y-4">
          <div className="text-left pb-1 border-b border-zinc-900">
            <h2 className="text-base font-black font-sans text-white uppercase">Homologação de Presenças</h2>
            <p className="text-[10px] text-zinc-500">Aprovação regulamentar de check-ins digitais dos alunos</p>
          </div>

          {/* Filter Pills with Counters */}
          <div className="flex justify-between p-1 bg-[#141414] border border-zinc-900 rounded-xl text-[9px] font-black uppercase font-mono">
            <button
              onClick={() => setPresenceFilter("PENDING")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 ${presenceFilter === "PENDING" ? "bg-red-800 text-white" : "text-zinc-500"}`}
            >
              Pendentes <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold font-mono">{presencas.filter(p => p.status === "PENDING").length}</span>
            </button>
            <button
              onClick={() => setPresenceFilter("APPROVED")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 ${presenceFilter === "APPROVED" ? "bg-red-800 text-white" : "text-zinc-500"}`}
            >
              Aprovadas <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold font-mono">{presencas.filter(p => p.status === "APPROVED" || p.status === "Presente").length}</span>
            </button>
            <button
              onClick={() => setPresenceFilter("REJECTED")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${presenceFilter === "REJECTED" ? "bg-red-800 text-white" : "text-zinc-500"}`}
            >
              Rejeitadas <span className="bg-red-950 text-red-500 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold font-mono">{presencas.filter(p => p.status === "REJECTED" || p.status === "Faltou").length}</span>
            </button>
          </div>

          {/* Check-ins lists */}
          <div className="space-y-2.5">
            {presencas
              .filter(p => {
                if (presenceFilter === "PENDING") return p.status === "PENDING";
                if (presenceFilter === "APPROVED") return p.status === "APPROVED" || p.status === "Presente";
                return p.status === "REJECTED" || p.status === "Faltou";
              })
              .length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-10 font-mono">Nenhuma solicitação de presença correspondente encontrada.</p>
              ) : (
                presencas
                  .filter(p => {
                    if (presenceFilter === "PENDING") return p.status === "PENDING";
                    if (presenceFilter === "APPROVED") return p.status === "APPROVED" || p.status === "Presente";
                    return p.status === "REJECTED" || p.status === "Faltou";
                  })
                  .map(p => (
                    <div 
                      key={p.id}
                      className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-950/30 border border-red-900/40 flex items-center justify-center text-xs">
                          🥋
                        </div>
                        <div className="text-left space-y-0.5">
                          <h4 className="text-xs font-bold text-white uppercase">{p.alunoNome}</h4>
                          <p className="text-[10px] text-zinc-400 font-mono">Data check-in: {p.data} • canal: {p.solicitadoPorAluno ? "Aplicativo Celular" : "Chamada do Professor"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleDecideCheckin(p.id, "APPROVED")}
                              className="p-1 px-2.5 bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800 hover:bg-emerald-900 rounded-lg text-[10px] font-black uppercase tracking-wider"
                            >
                              ✓ APROVAR
                            </button>
                            <button
                              onClick={() => handleDecideCheckin(p.id, "REJECTED")}
                              className="p-1 px-2.5 bg-red-950 text-red-500 ring-1 ring-red-800 hover:bg-red-900 rounded-lg text-[10px] font-black uppercase tracking-wider"
                            >
                              ✕ RECUSAR
                            </button>
                          </>
                        )}
                        {p.status !== "PENDING" && (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${p.status === "APPROVED" || p.status === "Presente" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-500"}`}>
                            {p.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
          </div>

          {/* Class Call sheets inline embedding */}
          <div className="pt-4 border-t border-zinc-900 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-2">Chamada Rápida da Academia</h3>
            <InstructorPanel
              alunos={alunos}
              turmas={turmas}
              presencas={presencas}
              graduacoes={graduacoes}
              onAddPresenca={handleAddPresenca}
              onUpdateGraduacao={handleUpdateGraduacao}
              onDecideCheckin={handleDecideCheckin}
            />
          </div>
        </div>
      ) : (
        /* ALUNO CHECK-IN INTERFACE */
        <div className="space-y-4 text-left">
          <div className="pb-1 border-b border-zinc-900">
            <h2 className="text-base font-black font-sans text-white uppercase">Minha Frequência de Treino</h2>
            <p className="text-[10px] text-zinc-500">Solicite check-in de treino para validação do Professor</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black text-amber-500 uppercase tracking-wide">Solicitação de Presença Remota</span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-bold font-mono">SELECIONE A DATA DO SEU TREINO:</label>
                <input
                  id="student-checkin-date-input"
                  type="date"
                  value={selectedCheckinDate}
                  onChange={(e) => setSelectedCheckinDate(e.target.value)}
                  className="w-full bg-black border border-zinc-900 p-2 text-xs rounded text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="p-3 bg-red-950/20 rounded border border-red-950 text-[10.5px] text-red-300 leading-normal">
                O check-in inicia como PENDENTE. O Professor avaliará sua assiduidade e dedicação em aula para aprovação.
              </div>

              {studentStatusMsg && (
                <div className="p-3 border border-amber-500/30 rounded text-[10.5px] text-amber-400 font-mono">
                  {studentStatusMsg}
                </div>
              )}

              <button
                id="btn-aluno-checkin-submit"
                onClick={handleStudentCheckin}
                disabled={(defaultStudent?.status || "").toUpperCase().trim() === "INATIVO"}
                className={`w-full text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all ${
                  (defaultStudent?.status || "").toUpperCase().trim() === "INATIVO"
                    ? "bg-zinc-800 border border-zinc-700 text-zinc-500 opacity-60 cursor-not-allowed"
                    : "bg-red-700 hover:bg-red-650 cursor-pointer shadow-md"
                }`}
              >
                SOLICITAR CHECK-IN 🥋
              </button>
            </div>
          </div>

          {/* Student presence history */}
          <StudentPanel
            aluno={defaultStudent!}
            turma={defaultStudentTurma!}
            presencas={presencas}
            pagamentos={pagamentos}
            onSolicitarPresenca={handleSolicitarPresenca}
          />
        </div>
      )}
    </div>
  );
}
