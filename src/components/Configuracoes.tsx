import React from "react";
import { Settings } from "lucide-react";
import AdminPanel from "./AdminPanel";
import { Aluno, Turma, Pagamento, GlobalConfigs } from "../types";

interface ConfiguracoesProps {
  activeRole: string;
  alunos: Aluno[];
  turmas: Turma[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  handleAddAluno: (stu: any) => void;
  handleDeleteAluno: (id: string) => void;
  handleUpdateStatusFinanceiro: (id: string, stat: string) => void;
  handleUpdateConfig: (cfg: GlobalConfigs) => void;
}

export function Configuracoes({
  activeRole,
  alunos,
  turmas,
  pagamentos,
  config,
  handleAddAluno,
  handleDeleteAluno,
  handleUpdateStatusFinanceiro,
  handleUpdateConfig
}: ConfiguracoesProps) {
  if (activeRole !== "ADMIN") {
    return (
      <div className="p-5 text-center text-zinc-500 text-xs" id="configuracoes-no-admin-warning">
        Apenas administradores possuem acesso às chaves e parâmetros globais do sistema.
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-900 bg-neutral-950/40 p-4 space-y-4 rounded-3xl" id="configuracoes-tab-content">
      <div className="flex items-center gap-2 text-amber-500">
        <Settings className="w-4.5 h-4.5 text-red-500" />
        <span className="text-xs font-black uppercase tracking-wider">Ajustes da Academia (Firestore)</span>
      </div>
      
      <AdminPanel
        alunos={alunos}
        turmas={turmas}
        pagamentos={pagamentos}
        config={config}
        onAddAluno={handleAddAluno}
        onDeleteAluno={handleDeleteAluno}
        onUpdateStatusFinanceiro={handleUpdateStatusFinanceiro}
        onUpdateConfig={(newCfg) => {
          handleUpdateConfig(newCfg);
          alert("Parâmetros globais salvos na coleção do Firestore com sucesso!");
        }}
      />
    </div>
  );
}
