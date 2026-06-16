import React, { useState } from "react";
import { Aluno, Turma, Pagamento, GraduacaoSash, GlobalConfigs } from "../types";
import { Users, DollarSign, Award, Plus, Trash2, Search, UserPlus, BookOpen, Clock, UsersRound, Settings, CheckCircle2, AlertCircle, Sparkles, Megaphone, Smartphone, Activity } from "lucide-react";
import DiagnosticPanel from "./DiagnosticPanel";

interface AdminPanelProps {
  alunos: Aluno[];
  turmas: Turma[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  onAddAluno: (aluno: Omit<Aluno, "id" | "statusFinanceiro">) => void;
  onDeleteAluno: (id: string) => void;
  onUpdateStatusFinanceiro: (id: string, novoStatus: "Em Dia" | "Atrasado" | "Pendente") => void;
  onUpdateConfig: (newConfig: GlobalConfigs) => void;
}

export default function AdminPanel({
  alunos,
  turmas,
  pagamentos,
  config,
  onAddAluno,
  onDeleteAluno,
  onUpdateStatusFinanceiro,
  onUpdateConfig
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"alunos" | "configuracoes" | "diagnostico">("diagnostico");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Student Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [graduacao, setGraduacao] = useState<GraduacaoSash>(GraduacaoSash.BRANCA);
  const [turmaId, setTurmaId] = useState("");
  const [planoTipo, setPlanoTipo] = useState<"1x_semana" | "2x_semana" | "3x_semana" | "4x_semana" | "outro">("2x_semana");
  const [mensalidade, setMensalidade] = useState(160);
  const [descontoFamiliaTipo, setDescontoFamiliaTipo] = useState<"percentual" | "fixo" | "nenhum">("nenhum");
  const [descontoFamiliaValor, setDescontoFamiliaValor] = useState(0);
  const [observacoes, setObservacoes] = useState("");

  // Configuration Form states (pre-populated from prop)
  const [configPercent, setConfigPercent] = useState(config.descontoFamiliarPercentualPadrao);
  const [configFixo, setConfigFixo] = useState(config.descontoFamiliarFixoPadrao);
  const [configAviso, setConfigAviso] = useState(config.avisoMural);
  const [configSuporte, setConfigSuporte] = useState(config.contatoSuporte);
  const [configEndereco, setConfigEndereco] = useState(config.enderecoAcademia);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Helper calculated net mensualidade
  const calculateNetPrice = (bruto: number, tipo: "percentual" | "fixo" | "nenhum", valor: number) => {
    if (tipo === "percentual") {
      return Math.max(0, bruto - (bruto * (valor / 100)));
    }
    if (tipo === "fixo") {
      return Math.max(0, bruto - valor);
    }
    return bruto;
  };

  const handleApplyDefaultDiscount = () => {
    if (descontoFamiliaTipo === "percentual") {
      setDescontoFamiliaValor(config.descontoFamiliarPercentualPadrao);
    } else if (descontoFamiliaTipo === "fixo") {
      setDescontoFamiliaValor(config.descontoFamiliarFixoPadrao);
    } else {
      setDescontoFamiliaValor(0);
    }
  };

  // Sync pricing automatically based on Plan selection
  const handlePlanoChange = (plano: typeof planoTipo) => {
    setPlanoTipo(plano);
    if (plano === "1x_semana") setMensalidade(120);
    else if (plano === "2x_semana") setMensalidade(160);
    else if (plano === "3x_semana") setMensalidade(180);
    else if (plano === "4x_semana") setMensalidade(200);
    else setMensalidade(220);
  };

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !cpf) {
      alert("Por favor, preencha o Nome, E-mail e CPF do aluno.");
      return;
    }
    const tId = turmaId || (turmas.length > 0 ? turmas[0].id : "");
    onAddAluno({
      nome,
      email,
      celular,
      cpf,
      dataNascimento,
      graduacao,
      dataUltimaGraduacao: new Date().toISOString().split("T")[0],
      status: "Ativo",
      turmaId: tId,
      planoTipo,
      mensalidade,
      descontoFamiliaTipo,
      descontoFamiliaValor,
      observacoes
    });

    // Reset form
    setNome("");
    setEmail("");
    setCelular("");
    setCpf("");
    setDataNascimento("");
    setGraduacao(GraduacaoSash.BRANCA);
    setTurmaId("");
    setPlanoTipo("2x_semana");
    setMensalidade(160);
    setDescontoFamiliaTipo("nenhum");
    setDescontoFamiliaValor(0);
    setObservacoes("");
    setShowAddForm(false);
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      id: "global_config",
      descontoFamiliarPercentualPadrao: configPercent,
      descontoFamiliarFixoPadrao: configFixo,
      avisoMural: configAviso,
      contatoSuporte: configSuporte,
      enderecoAcademia: configEndereco
    });
    setConfigSaveSuccess(true);
    setTimeout(() => setConfigSaveSuccess(false), 3000);
  };

  // Stats Calculations
  const totalAlunos = alunos.length;
  const alunosAtivos = alunos.filter(a => a.status === "Ativo").length;
  
  // Calculate pricing considering individual student family discounts
  const faturamentoEstimado = alunos
    .filter(a => a.status === "Ativo")
    .reduce((acc, current) => {
      const net = calculateNetPrice(current.mensalidade, current.descontoFamiliaTipo || "nenhum", current.descontoFamiliaValor || 0);
      return acc + net;
    }, 0);

  const totalAtrasados = alunos.filter(a => a.statusFinanceiro === "Atrasado").length;

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex flex-wrap border-b border-zinc-855 pb-px gap-2">
        <button
          onClick={() => setActiveTab("diagnostico")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "diagnostico"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <Activity className="w-4 h-4 text-amber-500 font-black animate-pulse" />
          Fase 3: Diagnóstico do Sistema
        </button>
        <button
          onClick={() => setActiveTab("alunos")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "alunos"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Quadro de Alunos & Matrícula
        </button>
        <button
          onClick={() => setActiveTab("configuracoes")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "configuracoes"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <Settings className="w-4 h-4" />
          Ajustes Globais & Descontos (Coleção Configurações)
        </button>
      </div>

      {activeTab === "diagnostico" ? (
        <DiagnosticPanel />
      ) : activeTab === "alunos" ? (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-xl flex items-center justify-between" id="metric-total-alunos">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Fichas Cadastradas</span>
                <h3 className="text-2xl font-black font-mono text-white">{totalAlunos}</h3>
                <p className="text-[10px] text-zinc-550">Alunos no banco de dados</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-xl flex items-center justify-between" id="metric-alunos-ativos">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Status Treinando</span>
                <h3 className="text-2xl font-black font-mono text-emerald-400">{alunosAtivos}</h3>
                <p className="text-[10px] text-zinc-550">Matrículas ativas na escola</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <UsersRound className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-xl flex items-center justify-between" id="metric-financas">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Receita Líquida</span>
                <h3 className="text-2xl font-black font-mono text-amber-400">R$ {faturamentoEstimado?.toFixed(2)}</h3>
                <p className="text-[10px] text-zinc-550">Matrículas brutas (-) descontos</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-xl flex items-center justify-between" id="metric-pendencias">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Inadimplentes (Mensal)</span>
                <h3 className="text-2xl font-black font-mono text-red-500">{totalAtrasados}</h3>
                <p className="text-[10px] text-zinc-550">Contas com pendência de PIX</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Student List & Actions (Takes 2 cols) */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black tracking-wider text-white uppercase font-mono">Central de Registro de Praticantes</h3>
                  <p className="text-xs text-zinc-400 font-sans">Cadastre, remova, filtre e configure descontos familiares especiais.</p>
                </div>
                
                <button
                  id="btn-toggle-add-aluno"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 border border-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {showAddForm ? "Fechar Formulário" : "Matricular Aluno"}
                </button>
              </div>

              {/* Quick Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  id="admin-search-student"
                  type="text"
                  placeholder="Buscar aluno por nome, e-mail ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Expanded Add Form Panel */}
              {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-zinc-950 p-5 rounded-lg border border-amber-500/30 space-y-4 animate-fadeIn" id="form-add-aluno">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3">
                    <UserPlus className="w-4 h-4 text-amber-550 font-bold" />
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">Nova Inscrição - Escola Garra de Águia PG</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Nome Completo</label>
                      <input
                        id="form-nome"
                        type="text"
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Mendonça Padovani Filho"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Correio Eletrônico (E-mail)</label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mendonca@email.com"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Número de Celular</label>
                      <input
                        id="form-celular"
                        type="text"
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        placeholder="(13) 99123-4567"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">CPF (Documento)</label>
                      <input
                        id="form-cpf"
                        type="text"
                        required
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="111.222.333-44"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Data de Nascimento</label>
                      <input
                        id="form-datanascimento"
                        type="date"
                        required
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Graduação de Entrada</label>
                      <select
                        id="form-graduacao"
                        value={graduacao}
                        onChange={(e) => setGraduacao(e.target.value as GraduacaoSash)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                      >
                        {Object.values(GraduacaoSash).map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Horário / Turma Marcial</label>
                      <select
                        id="form-turma"
                        value={turmaId}
                        onChange={(e) => setTurmaId(e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-amber-400 focus:outline-none"
                      >
                        <option value="">Selecione uma turma oficial...</option>
                        {turmas.map((t) => (
                          <option key={t.id} value={t.id}>{t.nomeEstilo} ({t.horario})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Frequência Mensal Contratada</label>
                      <select
                        value={planoTipo}
                        onChange={(e) => handlePlanoChange(e.target.value as any)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                      >
                        <option value="1x_semana">1x por semana (Exclusivo)</option>
                        <option value="2x_semana">2x por semana (Padrão)</option>
                        <option value="3x_semana">3x por semana (Recomendado)</option>
                        <option value="4x_semana">4x por semana (Avançado)</option>
                        <option value="outro">Plano Personalizado / Livre</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Valor Bruto do Plano (R$)</label>
                      <input
                        id="form-mensalidade"
                        type="number"
                        value={mensalidade}
                        onChange={(e) => setMensalidade(Number(e.target.value))}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    {/* Desconto Familiar Module details */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Desconto Familiar Especial</label>
                        {descontoFamiliaTipo !== "nenhum" && (
                          <button
                            type="button"
                            onClick={handleApplyDefaultDiscount}
                            className="text-[9px] text-amber-400 hover:underline font-mono"
                          >
                            [Usar Valor Padrão]
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={descontoFamiliaTipo}
                          onChange={(e) => setDescontoFamiliaTipo(e.target.value as any)}
                          className="p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none flex-grow"
                        >
                          <option value="nenhum">Sem desconto familiar</option>
                          <option value="percentual">Desconto % (Familiar)</option>
                          <option value="fixo">Desconto R$ Fixo (Familiar)</option>
                        </select>
                        {descontoFamiliaTipo !== "nenhum" && (
                          <input
                            type="number"
                            value={descontoFamiliaValor}
                            placeholder="Valor"
                            onChange={(e) => setDescontoFamiliaValor(Number(e.target.value))}
                            className="w-20 p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-amber-400 font-bold font-mono focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Net fee visual calculations feedback */}
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-850 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400">Previsão de Mensalidade Líquida:</span>
                    <strong className="text-emerald-400 text-sm">
                      R$ {calculateNetPrice(mensalidade, descontoFamiliaTipo, descontoFamiliaValor).toFixed(2)}
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Observações Clínicas ou Diferenciais</label>
                    <textarea
                      id="form-observacoes"
                      rows={2}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Anote restrições físicas, doenças preexistentes ou treinos anteriores..."
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded text-zinc-500 text-xs font-bold"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      id="btn-save-new-student"
                      className="px-5 py-2 bg-gradient-to-r from-red-850 to-amber-600 text-white rounded text-xs font-black shadow-md"
                    >
                      Confirmar Matrícula Marcial
                    </button>
                  </div>
                </form>
              )}

              {/* Students Table */}
              <div className="overflow-x-auto border border-zinc-850 rounded-lg">
                <table className="w-full text-left border-collapse" id="admin-students-table">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-400 text-[10px] font-mono uppercase tracking-wider border-b border-zinc-805">
                      <th className="py-3 px-4">Aluno / CPF</th>
                      <th className="py-3 px-4">Sash / Grau</th>
                      <th className="py-3 px-4 hidden md:table-cell">Modalidade</th>
                      <th className="py-3 px-4">Ajustes / Desconto</th>
                      <th className="py-3 px-4">Mensal Líquido</th>
                      <th className="py-3 px-4">Financeiro</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-xs">
                    {filteredAlunos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhum praticante registrado para os termos digitados.
                        </td>
                      </tr>
                    ) : (
                      filteredAlunos.map((a) => {
                        const turmaPertencente = turmas.find(t => t.id === a.turmaId);
                        const netPrice = calculateNetPrice(a.mensalidade, a.descontoFamiliaTipo || "nenhum", a.descontoFamiliaValor || 0);

                        return (
                          <tr key={a.id} className="hover:bg-zinc-950/40 text-zinc-300">
                            <td className="py-3 px-4 font-bold text-white">
                              <div className="flex flex-col">
                                <span>{a.nome}</span>
                                <span className="text-[9px] text-zinc-500 font-mono font-medium">{a.cpf}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black border uppercase font-mono"
                                    style={{
                                      borderColor: a.graduacao.includes("Preta") ? "#D4AF37" : "#5a5a5a",
                                      backgroundColor: a.graduacao.includes("Preta") ? "#18181b" : "#1e1b4b",
                                      color: a.graduacao.includes("Preta") ? "#D4AF37" : "#cbd5e1"
                                    }}>
                                {a.graduacao ? a.graduacao.split(" ")[0] : "Branca"}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell text-zinc-450 font-sans">
                              {turmaPertencente ? turmaPertencente.nomeEstilo.split(" - ")[0] : "Livre"}
                            </td>
                            <td className="py-3 px-4">
                              {a.descontoFamiliaTipo && a.descontoFamiliaTipo !== "nenhum" ? (
                                <div className="text-[10px] text-amber-400 font-mono font-semibold">
                                  {a.descontoFamiliaTipo === "percentual" ? `Fam. -${a.descontoFamiliaValor}%` : `Fam. -R$ ${a.descontoFamiliaValor}`}
                                </div>
                              ) : (
                                <span className="text-zinc-650 text-[10px]">Sem desconto</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-xs">
                              R$ {netPrice?.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={a.statusFinanceiro}
                                onChange={(e) => onUpdateStatusFinanceiro(a.id, e.target.value as any)}
                                className={`p-1 text-[10px] uppercase font-bold rounded focus:outline-none ${
                                  a.statusFinanceiro === "Em Dia" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900" :
                                  a.statusFinanceiro === "Atrasado" ? "bg-red-950/65 text-red-400 border border-red-900" :
                                  "bg-amber-950/60 text-amber-500 border border-amber-900"
                                }`}
                              >
                                <option value="Em Dia">Em Dia</option>
                                <option value="Atrasado">Atrasado</option>
                                <option value="Pendente">Pago Parcial</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                id={`delete-stu-${a.id}`}
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja cancelar e desvincular a matrícula de: ${a.nome}?`)) {
                                    onDeleteAluno(a.id);
                                  }
                                }}
                                className="p-1 px-2 text-red-500 hover:bg-red-950/50 rounded text-[11px] transition-colors font-extrabold flex items-center mx-auto"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Desativar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side: Quick Schedule Rules & Traditional Info */}
            <div className="space-y-6">
              
              {/* Active Turmas Quick list */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">Horários Oficiais da Escola</h4>
                </div>
                <div className="space-y-3">
                  {turmas.map((t) => (
                    <div key={t.id} className="p-3 bg-zinc-950 rounded border border-zinc-850 text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white font-sans">{t.nomeEstilo}</span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-amber-400 font-bold border border-zinc-800 uppercase">{t.categoria}</span>
                      </div>
                      <div className="space-y-1 text-zinc-450 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Dias: {t.diasSemana.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span>Mesa: <strong>{t.instrutorNome}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notice Board Preview */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md space-y-2">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2">
                  <Megaphone className="w-4 h-4 text-amber-550" />
                  <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">Mural de Avisos Ativo</h5>
                </div>
                <p className="text-zinc-300 text-xs italic leading-relaxed">
                  "{config.avisoMural}"
                </p>
                <div className="pt-2 text-[9px] font-mono text-zinc-550 flex justify-between">
                  <span>Atualizado na coleção</span>
                  <span className="text-emerald-500">CONECTADO</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Adjust Global configurations settings (COLEÇÃO CONFIGURACOES) */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md max-w-3xl">
          <div className="border-b border-zinc-800 pb-3 mb-5">
            <h3 className="text-base font-black tracking-wider text-white uppercase font-mono flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              Parâmetros Globais de Gerenciamento (Coleção: configuracoes)
            </h3>
            <p className="text-xs text-zinc-400">Configure descontos familiares padronizados, avisos de tela do mural e informações de contato.</p>
          </div>

          <form onSubmit={handleSaveConfigs} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Default Discount Configs */}
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-850 space-y-3">
                <span className="text-[10px] text-amber-400 font-bold font-mono uppercase block tracking-wider">Módulos de Desconto Familiar Padrão</span>
                
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-300 block">Percentual de Desconto Familiar Padrão (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={configPercent}
                      onChange={(e) => setConfigPercent(Number(e.target.value))}
                      className="p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-amber-400 font-bold font-mono w-24 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-500">% de desconto nas mensalidades de irmãos</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-zinc-900">
                  <label className="text-[11px] text-zinc-300 block">Valor Fixo de Desconto Familiar Padrão (R$)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={configFixo}
                      onChange={(e) => setConfigFixo(Number(e.target.value))}
                      className="p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-amber-400 font-bold font-mono w-24 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-500">R$ deduzidos para grupo familiar</span>
                  </div>
                </div>
              </div>

              {/* Location and Info settings */}
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-850 space-y-3">
                <span className="text-[10px] text-zinc-400 font-bold font-mono uppercase block tracking-wider">Suporte & Endereço</span>
                
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-300 block">Telefone de Contato Marcial</label>
                  <input
                    type="text"
                    value={configSuporte}
                    onChange={(e) => setConfigSuporte(e.target.value)}
                    className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-300 block">Endereço da Sede Oficial</label>
                  <input
                    type="text"
                    value={configEndereco}
                    onChange={(e) => setConfigEndereco(e.target.value)}
                    className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Announcement text */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-bold block uppercase font-mono">Texto Informativo Principal (Mensagem no Mural Alunos)</label>
              <textarea
                rows={3}
                value={configAviso}
                onChange={(e) => setConfigAviso(e.target.value)}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none placeholder-zinc-700"
                placeholder="Exemplo de chamada para exames ou eventos..."
              />
            </div>

            {configSaveSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-800 p-3 rounded text-xs text-emerald-400 font-mono animate-fadeIn flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Configurações gravadas com sucesso na coleção configuracoes do Firestore simulado!
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("alunos")}
                className="px-4 py-2 border border-zinc-800 text-zinc-500 rounded text-xs"
              >
                Voltar ao Quadro
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 rounded text-xs"
              >
                Gravar Parâmetros
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
