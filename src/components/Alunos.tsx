import React from "react";
import { Plus, Search } from "lucide-react";
import AdminPanel from "./AdminPanel";
import { Aluno, Turma, Pagamento, GlobalConfigs } from "../types";

interface AlunosProps {
  alunos: Aluno[];
  activeRole: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  turmas: Turma[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  handleAddAluno: (stu: any) => void;
  handleDeleteAluno: (id: string) => void;
  handleUpdateStatusFinanceiro: (id: string, stat: string) => void;
  handleUpdateConfig: (cfg: GlobalConfigs) => void;
}

export function Alunos({
  alunos,
  activeRole,
  searchTerm,
  setSearchTerm,
  showAddForm,
  setShowAddForm,
  turmas,
  pagamentos,
  config,
  handleAddAluno,
  handleDeleteAluno,
  handleUpdateStatusFinanceiro,
  handleUpdateConfig
}: AlunosProps) {
  return (
    <div className="space-y-4 animate-fadeIn" id="alunos-tab-content">
      {/* Header and Add button if Admin */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-base font-black font-sans text-white uppercase tracking-wider">Quadro de Alunos</h2>
          <p className="text-[10px] text-zinc-400">Total de {alunos.length} fichas cadastradas na academia</p>
        </div>
        {activeRole === "ADMIN" && (
          <button
            id="btn-trigger-add-aluno-form"
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 bg-red-700 hover:bg-red-650 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
            Novo Aluno
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          id="input-pesquisa-alunos"
          type="text"
          placeholder="Pesquisar por nome de aluno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-700 p-3 pr-10 text-xs rounded-xl focus:outline-none text-zinc-200 placeholder-zinc-650"
        />
        <Search className="w-4 h-4 text-zinc-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Add Aluno inline modal form */}
      {showAddForm && activeRole === "ADMIN" && (
        <div className="bg-[#141414] border border-zinc-900 p-4.5 rounded-2xl text-left space-y-4 animate-fadeIn" id="students-form-wrapper">
          <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Formulário de Matrícula Regular</h4>
          
          <AdminPanel
            alunos={alunos}
            turmas={turmas}
            pagamentos={pagamentos}
            config={config}
            onAddAluno={(newStu) => {
              handleAddAluno(newStu);
              setShowAddForm(false);
              alert("Aluno cadastrado com sucesso!");
            }}
            onDeleteAluno={handleDeleteAluno}
            onUpdateStatusFinanceiro={handleUpdateStatusFinanceiro}
            onUpdateConfig={handleUpdateConfig}
          />
        </div>
      )}

      {/* Student list elements */}
      <div className="space-y-2.5" id="students-list-container">
        {alunos.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
          <p className="text-center text-xs text-zinc-550 py-8">Nenhum aluno encontrado na lista da academia.</p>
        ) : (
          alunos
            .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(a => (
              <div 
                key={a.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-amber-500 uppercase">
                    {a.nome?.substring(0, 2)}
                  </div>
                  <div className="leading-tight text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-white uppercase">{a.nome}</h4>
                    <p className="text-[10px] font-mono text-zinc-500">ID: {a.id} • CPF: {a.cpf || "não registrado"}</p>
                    <span className="inline-flex py-0.5 px-2 rounded-full bg-neutral-900 text-[8px] font-bold text-amber-400">
                      {a.graduacao ? a.graduacao : "Branca"}
                    </span>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="text-right space-y-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black font-mono leading-none ${
                    a.statusFinanceiro === "Em Dia" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-950/60" :
                    a.statusFinanceiro === "Atrasado" ? "bg-red-950/40 text-red-500 border border-red-950/60" : "bg-zinc-900 text-zinc-400 border border-zinc-855"
                  }`}>
                    {a.statusFinanceiro}
                  </span>
                  {activeRole === "ADMIN" && (
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover ${a.nome} da academia?`)) {
                            handleDeleteAluno(a.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-400 text-[10px] font-mono uppercase bg-red-950/20 p-1.5 rounded-lg border border-red-950"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
