import React, { useState } from "react";
import { Aluno, Presenca, Pagamento, HistoricoGraduacao, Exame } from "../types";
import { 
  X, User, Shield, Phone, FileText, Calendar, DollarSign, Award, CheckCircle, Clock, Archive, HelpCircle
} from "lucide-react";

interface FichaAlunoModalProps {
  aluno: Aluno;
  presencas: Presenca[];
  pagamentos: Pagamento[];
  graduacoes: HistoricoGraduacao[];
  exames: Exame[];
  onClose: () => void;
  alunoModalidades?: AlunoModalidade[];
  graduacoesConfig?: GraduacoesConfig[];
}

const KUNG_FU_GRADUATIONS = [
  { ordem: 1, graduacao: "Preparatória", faixa: "Branca" },
  { ordem: 2, graduacao: "1ª Fase", faixa: "Branca Ponta Amarela" },
  { ordem: 3, graduacao: "2ª Fase", faixa: "Branca Ponta Verde" },
  { ordem: 4, graduacao: "3ª Fase", faixa: "Verde" },
  { ordem: 5, graduacao: "4ª Fase", faixa: "Verde Ponta Marrom" },
  { ordem: 6, graduacao: "5ª Fase", faixa: "Marrom" },
  { ordem: 7, graduacao: "6ª Fase", faixa: "Marrom Ponta Preta" },
  { ordem: 8, graduacao: "7ª Fase", faixa: "Preta" },
  { ordem: 9, graduacao: "1º Dhuen", faixa: "Preta" },
  { ordem: 10, graduacao: "2º Dhuen", faixa: "Preta" }
];

const TAI_CHI_GRADUATIONS = [
  { ordem: 1, graduacao: "Preparatória", faixa: "Branca" },
  { ordem: 2, graduacao: "1ª Fase", faixa: "Branca Ponta Amarela" },
  { ordem: 3, graduacao: "2ª Fase", faixa: "Branca Ponta Verde" },
  { ordem: 4, graduacao: "3ª Fase", faixa: "Verde" }
];

const BOXE_CHINES_GRADUATIONS = [
  { ordem: 1, graduacao: "Preparatória", faixa: "Branca" },
  { ordem: 2, graduacao: "1ª Fase", faixa: "Laranja" },
  { ordem: 3, graduacao: "2ª Fase", faixa: "Vermelha" },
  { ordem: 4, graduacao: "3ª Fase", faixa: "Azul" },
  { ordem: 5, graduacao: "4ª Fase", faixa: "Marrom" },
  { ordem: 6, graduacao: "5ª Fase", faixa: "Preta" }
];

function mapLegacyToNewGrad(legacy: string, mod: string): { graduacao: string; faixa: string; ordem: number } {
  const normSymbol = (legacy || "").toLowerCase();
  
  if (mod === "Kung Fu") {
    if (normSymbol.includes("branca") && normSymbol.includes("amarela")) {
      return { graduacao: "1ª Fase", faixa: "Branca Ponta Amarela", ordem: 2 };
    }
    if (normSymbol.includes("branca") && normSymbol.includes("verde")) {
      return { graduacao: "2ª Fase", faixa: "Branca Ponta Verde", ordem: 3 };
    }
    if (normSymbol.includes("verde") && normSymbol.includes("marrom")) {
      return { graduacao: "4ª Fase", faixa: "Verde Ponta Marrom", ordem: 5 };
    }
    if (normSymbol.includes("verde")) {
      return { graduacao: "3ª Fase", faixa: "Verde", ordem: 4 };
    }
    if (normSymbol.includes("marrom") && normSymbol.includes("preta")) {
      return { graduacao: "6ª Fase", faixa: "Marrom Ponta Preta", ordem: 7 };
    }
    if (normSymbol.includes("marrom")) {
      return { graduacao: "5ª Fase", faixa: "Marrom", ordem: 6 };
    }
    if (normSymbol.includes("dhuen") || normSymbol.includes("duen") || normSymbol.includes("duan")) {
      if (normSymbol.includes("2")) return { graduacao: "2º Dhuen", faixa: "Preta", ordem: 10 };
      return { graduacao: "1º Dhuen", faixa: "Preta", ordem: 9 };
    }
    if (normSymbol.includes("preta")) {
      return { graduacao: "7ª Fase", faixa: "Preta", ordem: 8 };
    }
    return { graduacao: "Preparatória", faixa: "Branca", ordem: 1 };
  }

  if (mod === "Tai Chi Chuan") {
    if (normSymbol.includes("branca") && normSymbol.includes("amarela")) {
      return { graduacao: "1ª Fase", faixa: "Branca Ponta Amarela", ordem: 2 };
    }
    if (normSymbol.includes("branca") && normSymbol.includes("verde")) {
      return { graduacao: "2ª Fase", faixa: "Branca Ponta Verde", ordem: 3 };
    }
    if (normSymbol.includes("verde")) {
      return { graduacao: "3ª Fase", faixa: "Verde", ordem: 4 };
    }
    return { graduacao: "Preparatória", faixa: "Branca", ordem: 1 };
  }

  if (mod === "Boxe Chinês" || mod.includes("Boxe")) {
    if (normSymbol.includes("laranja")) {
      return { graduacao: "1ª Fase", faixa: "Laranja", ordem: 2 };
    }
    if (normSymbol.includes("vermelha")) {
      return { graduacao: "2ª Fase", faixa: "Vermelha", ordem: 3 };
    }
    if (normSymbol.includes("azul")) {
      return { graduacao: "3ª Fase", faixa: "Azul", ordem: 4 };
    }
    if (normSymbol.includes("marrom")) {
      return { graduacao: "4ª Fase", faixa: "Marrom", ordem: 5 };
    }
    if (normSymbol.includes("preta")) {
      return { graduacao: "5ª Fase", faixa: "Preta", ordem: 6 };
    }
    return { graduacao: "Preparatória", faixa: "Branca", ordem: 1 };
  }

  return { graduacao: "Preparatória", faixa: "Branca", ordem: 1 };
}

import { AlunoModalidade, GraduacoesConfig } from "../types";

export default function FichaAlunoModal({
  aluno,
  presencas,
  pagamentos,
  graduacoes,
  exames,
  onClose,
  alunoModalidades = [],
  graduacoesConfig = []
}: FichaAlunoModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dados" | "presencas" | "mensalidades" | "graduacoes">("dados");

  // Determine actual student modalities list
  const getStudentModalities = () => {
    let raw: string[] = [];
    if (aluno.modalidades && aluno.modalidades.length > 0) {
      raw = aluno.modalidades;
    } else if (aluno.modalidade) {
      raw = aluno.modalidade.split(",").map(x => x.trim()).filter(Boolean);
    } else {
      raw = ["Kung Fu"];
    }
    return raw.map(m => {
      if (m.toLowerCase().includes("tai chi") || m.toLowerCase().includes("taichi")) return "Tai Chi Chuan";
      if (m.toLowerCase().includes("boxe") || m.toLowerCase().includes("sanda")) return "Boxe Chinês";
      return "Kung Fu";
    });
  };

  const studentModsList = getStudentModalities();

  const getModalityGraduation = (modName: string) => {
    const studentModalitiesFiltered = alunoModalidades.filter(am => am.alunoId === aluno.id && am.ativo);
    const found = studentModalitiesFiltered.find(am => am.modalidade === modName);
    if (found) {
      return {
        graduacaoAtual: found.graduacaoAtual,
        faixaAtual: found.faixaAtual,
        ordemGraduacao: found.ordemGraduacao,
        dataUltimaGraduacao: found.dataUltimaGraduacao
      };
    }
    const mapped = mapLegacyToNewGrad(aluno.graduacaoAtual || aluno.graduacao || "Faixa Branca", modName);
    return {
      graduacaoAtual: mapped.graduacao,
      faixaAtual: mapped.faixa,
      ordemGraduacao: mapped.ordem,
      dataUltimaGraduacao: aluno.dataUltimaGraduacao || ""
    };
  };

  const getNextGraduation = (modName: string, currentOrdem: number) => {
    let list = KUNG_FU_GRADUATIONS;
    if (modName === "Tai Chi Chuan") list = TAI_CHI_GRADUATIONS;
    if (modName === "Boxe Chinês") list = BOXE_CHINES_GRADUATIONS;

    const nextItem = list.find(g => g.ordem === currentOrdem + 1);
    if (nextItem) {
      return {
        graduacao: nextItem.graduacao,
        faixa: nextItem.faixa
      };
    }
    return null;
  };

  // Filter historical data specifically for this student
  const filteredPresencas = presencas.filter(p => p.alunoId === aluno.id);
  const filteredPagamentos = pagamentos.filter(p => p.alunoId === aluno.id);
  
  // Combine custom sashes historical logs with standard graduation data of this student
  const filteredGraduacoes = graduacoes.filter(g => g.alunoId === aluno.id);
  const filteredExames = exames.filter(e => e.alunoId === aluno.id);

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "---";
    const parts = dataStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  };

  const statusColorMap = {
    "Em Dia": "bg-emerald-950/65 text-emerald-405 border border-emerald-900",
    "EM DIA": "bg-emerald-950/65 text-emerald-405 border border-emerald-900",
    "Atrasado": "bg-red-950/65 text-red-405 border border-red-900",
    "ATRASADO": "bg-red-950/65 text-red-405 border border-red-900",
    "Pendente": "bg-amber-950/65 text-amber-405 border border-amber-900",
    "PENDENTE": "bg-amber-950/65 text-amber-405 border border-amber-900",
    "Isento": "bg-blue-950/65 text-blue-405 border border-blue-900",
    "ISENTO": "bg-blue-950/65 text-blue-405 border border-blue-900"
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-left shadow-2xl animate-fadeIn">
        
        {/* Header Block with Student Photo / Name */}
        <div className="p-5 border-b border-zinc-900 bg-[#121212] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {aluno.foto ? (
              <img 
                src={aluno.foto} 
                alt={aluno.nome} 
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-red-900"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center text-zinc-400 text-lg font-black uppercase">
                {aluno.nome?.substring(0, 2)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">{aluno.nome}</h3>
                <span className={`px-2 py-0.5 text-[8.5px] uppercase font-black font-mono rounded border ${
                  statusColorMap[aluno.statusFinanceiro] || statusColorMap["PENDENTE"]
                }`}>
                  {aluno.statusFinanceiro}
                </span>
                <span className={`px-2 py-0.5 text-[8.5px] uppercase font-black font-mono rounded border ${
                  aluno.status === "Ativo" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900" : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}>
                  {aluno.status || "Ativo"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono flex flex-wrap gap-x-2">
                <span>MATRÍCULA: {formatarData(aluno.dataMatricula)}</span>
                <span>•</span>
                <span className="text-amber-500 font-bold uppercase">{aluno.graduacao || aluno.graduacaoAtual || "Faixa Branca"}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors text-zinc-500 hover:text-white font-extrabold text-[10px] uppercase font-mono"
          >
            [ Fechar ]
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex border-b border-zinc-900 bg-[#161616] px-4 font-mono text-[10px] font-black uppercase tracking-wider">
          <button 
            onClick={() => setActiveSubTab("dados")}
            className={`p-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeSubTab === "dados" ? "border-red-750 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
          >
            <User className="w-3.5 h-3.5" /> Ficha Cadastral
          </button>
          <button 
            onClick={() => setActiveSubTab("presencas")}
            className={`p-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeSubTab === "presencas" ? "border-red-750 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
          >
            <Clock className="w-3.5 h-3.5" /> Frequência de Treino ({filteredPresencas.length})
          </button>
          <button 
            onClick={() => setActiveSubTab("mensalidades")}
            className={`p-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeSubTab === "mensalidades" ? "border-red-750 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Mensalidades ({filteredPagamentos.length})
          </button>
          <button 
            onClick={() => setActiveSubTab("graduacoes")}
            className={`p-3 border-b-2 flex items-center gap-1.5 transition-colors ${activeSubTab === "graduacoes" ? "border-red-750 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
          >
            <Award className="w-3.5 h-3.5" /> Exames / Graduações ({filteredExames.length + filteredGraduacoes.length})
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-[#0e0e0e]">
          
          {/* TAB 1: CADASTRO DETALHADO */}
          {activeSubTab === "dados" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Box: Dados de Identificação */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 space-y-3">
                <h4 className="text-[10px] font-mono text-amber-500 font-black uppercase tracking-wider border-b border-zinc-900 pb-2">Identificação Civil</h4>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Nome Completo:</span>
                    <span className="font-bold text-zinc-300">{aluno.nome}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">CPF:</span>
                    <span className="font-bold text-zinc-250">{aluno.cpf || "---"}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">RG:</span>
                    <span className="font-bold text-zinc-250">{aluno.rg || "---"}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Nascimento:</span>
                    <span className="font-bold text-zinc-250">{formatarData(aluno.dataNascimento)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Responsável:</span>
                    <span className="font-bold text-zinc-250 uppercase">{aluno.responsavel || "O próprio"}</span>
                  </div>
                </div>
              </div>

              {/* Box: Dados Escolares / Matrícula */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 space-y-3">
                <h4 className="text-[10px] font-mono text-amber-500 font-black uppercase tracking-wider border-b border-zinc-900 pb-2">Vínculo de Academia</h4>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Data de Matrícula:</span>
                    <span className="font-bold text-zinc-250">{formatarData(aluno.dataMatricula)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Última Graduação:</span>
                    <span className="font-bold text-zinc-250">{formatarData(aluno.dataUltimaGraduacao)}</span>
                  </div>
                  <div className="flex justify-between font-mono flex-col gap-1.5 text-left mt-2 border-t border-zinc-900 pt-2">
                    <span className="text-zinc-500 font-mono">Modalidade(s) & Graduação Atual:</span>
                    <div className="flex flex-col gap-2">
                      {studentModsList.map((m) => {
                        const gradInfo = getModalityGraduation(m);
                        const icon = m === "Kung Fu" ? "🥋" : m === "Tai Chi Chuan" ? "☯" : "🥊";
                        return (
                          <div key={m} className="bg-zinc-900 border border-zinc-850 p-2 rounded flex flex-col font-mono text-[10.5px]">
                            <span className="text-white font-bold uppercase block">{icon} {m}</span>
                            <span className="text-amber-500 font-medium block mt-0.5">{gradInfo.graduacaoAtual} ({gradInfo.faixaAtual})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Plano Técnico:</span>
                    <span className="font-bold text-zinc-300 uppercase">{aluno.planoTipo?.replace("_", " ") || "2x semana"}</span>
                  </div>
                </div>
              </div>

              {/* Box: Informações de Contato */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 space-y-3 md:col-span-2">
                <h4 className="text-[10px] font-mono text-amber-500 font-black uppercase tracking-wider border-b border-zinc-900 pb-2">Contato & Endereço Autorizado</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Telefone Fixo:</span>
                    <span className="font-bold text-zinc-350">{aluno.telefone || aluno.celular || "---"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">WhatsApp:</span>
                    <span className="font-bold text-emerald-400 font-bold">{aluno.whatsapp || aluno.celular || "---"}</span>
                  </div>
                  <div className="flex justify-between sm:col-span-2">
                    <span className="text-zinc-500">E-mail:</span>
                    <span className="font-bold text-zinc-350 select-all">{aluno.email || "---"}</span>
                  </div>
                  <div className="flex justify-between sm:col-span-2 flex-col gap-1">
                    <span className="text-zinc-500">Endereço Residencial:</span>
                    <span className="font-medium text-zinc-300 bg-zinc-900 p-2.5 rounded border border-zinc-850 mt-1 block">
                      {aluno.endereco || "Nenhum endereço cadastrado para esta ficha."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box: Observações Gerais do Tatame */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 space-y-2 md:col-span-2 font-mono">
                <h4 className="text-[10px] text-amber-500 font-black uppercase tracking-wider border-b border-zinc-900 pb-2">Observações Marciais e Técnicas</h4>
                <p className="text-zinc-400 leading-relaxed text-xs bg-zinc-900/60 p-3 rounded-lg border border-zinc-850 whitespace-pre-wrap">
                  {aluno.observacoes || "Nenhuma observação ou restrição médica anotada do aluno."}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: HISTÓRICO DE PRESENÇAS DIÁRIAS */}
          {activeSubTab === "presencas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Presenças Auditadas:</span>
                <span className="text-emerald-400 font-bold">{filteredPresencas.filter(p => p.status === "Presente" || p.status === "APPROVED").length} Confirmadas</span>
              </div>

              {filteredPresencas.length === 0 ? (
                <div className="text-center py-10 bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500 text-xs font-mono">
                  Nenhum registro de controle de presença foi arquivado para este aluno até o momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPresencas
                    .sort((a, b) => b.data.localeCompare(a.data))
                    .map((p) => (
                      <div 
                        key={p.id}
                        className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between text-xs font-mono"
                      >
                        <div className="space-y-0.5 text-left">
                          <p className="font-bold text-white">{formatarData(p.data)}</p>
                          <p className="text-[10px] text-zinc-500">
                            Estilo: {p.modalidade || "Kung Fu"} • {p.horario || "Sem hora"}
                          </p>
                          {p.observacao && (
                            <p className="text-[9.5px] text-amber-500 italic mt-0.5">Nota: "{p.observacao}"</p>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase leading-none ${
                          p.status === "APPROVED" || p.status === "Presente" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                          p.status === "Faltou" || p.status === "REJECTED" ? "bg-red-950 text-red-500 border border-red-900" :
                          "bg-amber-950 text-amber-500 border border-amber-900"
                        }`}>
                          {p.status === "APPROVED" ? "Presente" : p.status === "REJECTED" ? "Faltou" : p.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENSALIDADES E FATURAMENTO */}
          {activeSubTab === "mensalidades" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Carnê do Aluno:</span>
                <span className="text-emerald-400 font-bold">Líquido Regular: R$ {aluno.mensalidade || "---"}</span>
              </div>

              {filteredPagamentos.length === 0 ? (
                <div className="text-center py-10 bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500 text-xs font-mono">
                  Não existem mensalidades em aberto ou registradas para esta ficha.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPagamentos
                    .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento))
                    .map((pay) => (
                      <div 
                        key={pay.id}
                        className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between text-xs font-mono"
                      >
                        <div className="space-y-0.5 text-left">
                          <p className="font-black text-white">Ref: {pay.referencia}</p>
                          <p className="text-[10px] text-zinc-500">
                            Vencimento: {formatarData(pay.dataVencimento || pay.vencimento)}
                          </p>
                          <p className="text-[10px] text-zinc-350">
                            Bruto: R$ {((pay.valorFinal || pay.valor) + (pay.desconto || 0)).toFixed(2)} {pay.desconto ? `(Desc: R$ ${pay.desconto.toFixed(2)})` : ""}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-emerald-400 font-black">R$ {(pay.valorFinal || pay.valor).toFixed(2)}</p>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            (pay.status as string) === "Pago" || (pay.status as string) === "PAGO" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-amber-950 text-amber-500 border border-amber-900"
                          }`}>
                            {(pay.status as string) === "PAGO" ? "Pago" : pay.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXAMES DE FAIXAS E HISTÓRICO DE GRADUAÇÃO */}
          {activeSubTab === "graduacoes" && (
            <div className="space-y-4">
              
              {/* Seção das Graduações Oficiais do Aluno por Modalidade */}
              <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-4.5 space-y-4">
                <h4 className="text-[10px] font-mono text-amber-500 font-black uppercase tracking-wider border-b border-zinc-900 pb-1.5">Estrutura Oficial de Graduações</h4>
                <div className="space-y-4 divide-y divide-zinc-900">
                  {studentModsList.map((modName, index) => {
                    const gradInfo = getModalityGraduation(modName);
                    const nextGrad = getNextGraduation(modName, gradInfo.ordemGraduacao);
                    const icon = modName === "Kung Fu" ? "🥋" : modName === "Tai Chi Chuan" ? "☯" : "🥊";
                    
                    return (
                      <div key={modName} className={`pt-3.5 ${index === 0 ? "pt-0 border-t-0" : "border-t"}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-white uppercase font-sans tracking-wide">
                            {icon} {modName.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div>
                            <p className="text-zinc-500 text-[10px] uppercase">Graduação Atual:</p>
                            <p className="text-zinc-200 font-black">{gradInfo.graduacaoAtual}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-[10px] uppercase">Faixa:</p>
                            <p className="text-amber-500 font-black">{gradInfo.faixaAtual}</p>
                          </div>
                          {nextGrad ? (
                            <div className="sm:col-span-2 pt-1.5 border-t border-zinc-900/40 mt-1">
                              <p className="text-zinc-500 text-[10px] uppercase">Próxima Graduação:</p>
                              <p className="text-xs font-black text-emerald-400">
                                {nextGrad.graduacao} - {nextGrad.faixa}
                              </p>
                            </div>
                          ) : (
                            <div className="sm:col-span-2 pt-1.5 border-t border-zinc-900/40 mt-1">
                              <p className="text-zinc-500 text-[10px] uppercase">Próxima Graduação:</p>
                              <p className="text-xs font-black text-indigo-400">Grau Máximo Atingido nesta Modalidade</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Histórico de Exames / Registros:</span>
              </div>

              {filteredExames.length === 0 && filteredGraduacoes.length === 0 ? (
                <div className="text-center py-10 bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500 text-xs font-mono">
                  Nenhum exame de faixa ou promoção formal foi arquivado para esta ficha técnica.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  
                  {/* Exames de faixa cadastrados */}
                  {filteredExames.map((ex) => (
                    <div key={ex.id} className="p-3 px-4 bg-zinc-950 border border-zinc-900 rounded-xl text-left space-y-1">
                      <div className="flex justify-between items-center bg-zinc-900/60 p-1.5 rounded pr-3">
                        <span className="font-black text-amber-400 uppercase text-[10.5px]">EXAME DE GRADUAÇÃO</span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                          ex.resultado === "Aprovado" || ex.resultado === "APROVADO" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                          ex.resultado === "Reprovado" || ex.resultado === "REPROVADO" ? "bg-red-950 text-red-550 border border-red-900" : "bg-amber-950 text-amber-500 border border-amber-900"
                        }`}>
                          {ex.resultado}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 leading-normal text-zinc-400">
                        <p><strong>Nova faixa:</strong> <span className="text-white font-bold">{ex.graduacaoPretendida}</span></p>
                        <p className="text-right"><strong>Data Exame:</strong> {formatarData(ex.dataExame)}</p>
                        <p><strong>Avaliador:</strong> {ex.avaliador}</p>
                        <p className="text-right"><strong>Notas:</strong> Téc: <span className="text-white font-bold">{ex.notaTecnica}</span> / Teor: <span className="text-white font-bold">{ex.notaTeorica}</span></p>
                      </div>
                      {ex.observacoes && (
                        <p className="text-[10px] text-zinc-505 italic bg-zinc-900 p-2 rounded mt-1">Obs: "{ex.observacoes}"</p>
                      )}
                    </div>
                  ))}

                  {/* Histórico histórico complementar */}
                  {filteredGraduacoes.map((g) => (
                    <div key={g.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-left text-[11px] leading-normal space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-white">Promoção para {g.graduacaoNova}</span>
                        <span className="text-zinc-500">{formatarData(g.dataGraduacao)}</span>
                      </div>
                      <p className="text-zinc-450">Anterior: <span className="text-zinc-300">{g.graduacaoAnterior}</span> • Avaliador: {g.avaliador || "Professor Décio"}</p>
                      {g.observacoes && <p className="text-[10px] text-amber-505 italic">"{g.observacoes}"</p>}
                    </div>
                  ))}

                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
