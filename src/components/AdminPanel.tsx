import React, { useState, useEffect } from "react";
import { Aluno, Turma, Instrutor, Pagamento, GraduacaoSash, GlobalConfigs } from "../types";
import { Users, DollarSign, Award, Plus, Trash2, Search, UserPlus, BookOpen, Clock, UsersRound, Settings, CheckCircle2, AlertCircle, Sparkles, Megaphone, Smartphone, Activity, Pencil } from "lucide-react";
import DiagnosticPanel from "./DiagnosticPanel";

interface AdminPanelProps {
  alunos: Aluno[];
  turmas: Turma[];
  instrutores?: Instrutor[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  onAddAluno: (aluno: Omit<Aluno, "id" | "statusFinanceiro"> & { id?: string }) => void;
  onDeleteAluno: (id: string) => void;
  onUpdateStatusFinanceiro: (id: string, novoStatus: "Em Dia" | "Atrasado" | "Pendente") => void;
  onSaveInstrutor?: (inst: Omit<Instrutor, "id"> & { id?: string }) => void;
  onDeleteInstrutor?: (id: string) => void;
  onUpdateTurma?: (turmaId: string, instrutorId: string, instrutorNome: string) => void;
  onUpdateConfig: (newConfig: GlobalConfigs) => void;
  initialEditAluno?: Aluno;
  onCancelEdit?: () => void;
}

export default function AdminPanel({
  alunos,
  turmas,
  instrutores = [],
  pagamentos,
  config,
  onAddAluno,
  onDeleteAluno,
  onUpdateStatusFinanceiro,
  onSaveInstrutor,
  onDeleteInstrutor,
  onUpdateTurma,
  onUpdateConfig,
  initialEditAluno,
  onCancelEdit
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"alunos" | "configuracoes" | "diagnostico" | "instrutores">("diagnostico");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAlunoId, setEditingAlunoId] = useState<string | null>(null);

  useEffect(() => {
    if (initialEditAluno) {
      handleStartEdit(initialEditAluno);
      setActiveTab("alunos");
    }
  }, [initialEditAluno]);

  // Instructor Form states
  const [instNome, setInstNome] = useState("");
  const [instFuncao, setInstFuncao] = useState("");
  const [instTelefone, setInstTelefone] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [instAtivo, setInstAtivo] = useState(true);
  const [instObservacoes, setInstObservacoes] = useState("");
  const [editingInstrutorId, setEditingInstrutorId] = useState<string | null>(null);
  const [showInstForm, setShowInstForm] = useState(false);

  // Student Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [graduacao, setGraduacao] = useState<GraduacaoSash>(GraduacaoSash.BRANCA);
  const [turmaId, setTurmaId] = useState("");
  const [planoTipo, setPlanoTipo] = useState<"1x_semana" | "2x_semana" | "3x_semana" | "4x_semana" | "outro">("2x_semana");
  const [mensalidade, setMensalidade] = useState(160);
  const [descontoFamiliaTipo, setDescontoFamiliaTipo] = useState<"percentual" | "fixo" | "nenhum">("nenhum");
  const [descontoFamiliaValor, setDescontoFamiliaValor] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [endereco, setEndereco] = useState("");
  
  // Novos campos obrigatórios de Aluno
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [foto, setFoto] = useState("");
  const [dataMatricula, setDataMatricula] = useState("");
  const [modalidade, setModalidade] = useState("Kung Fu");
  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<string[]>(["Kung Fu"]);
  const [statusFinanceiro, setStatusFinanceiro] = useState<"EM DIA" | "PENDENTE" | "ATRASADO" | "ISENTO">("EM DIA");

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

  const handleResetForm = () => {
    setNome("");
    setEmail("");
    setCelular("");
    setCpf("");
    setRg("");
    setDataNascimento("");
    setGraduacao(GraduacaoSash.BRANCA);
    setTurmaId("");
    setPlanoTipo("2x_semana");
    setMensalidade(160);
    setDescontoFamiliaTipo("nenhum");
    setDescontoFamiliaValor(0);
    setObservacoes("");
    setEndereco("");
    
    // Novos campos reset
    setTelefone("");
    setWhatsapp("");
    setResponsavel("");
    setFoto("");
    setDataMatricula("");
    setModalidade("Kung Fu");
    setModalidadesSelecionadas(["Kung Fu"]);
    setStatusFinanceiro("EM DIA");

    setEditingAlunoId(null);
    setShowAddForm(false);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleStartEdit = (aluno: Aluno) => {
    setEditingAlunoId(aluno.id);
    setNome(aluno.nome);
    setEmail(aluno.email);
    setCelular(aluno.celular || "");
    setCpf(aluno.cpf);
    setRg(aluno.rg || "");
    setDataNascimento(aluno.dataNascimento || "");
    setGraduacao(aluno.graduacao);
    setTurmaId(aluno.turmaId);
    setPlanoTipo(aluno.planoTipo);
    setMensalidade(aluno.mensalidade);
    setDescontoFamiliaTipo(aluno.descontoFamiliaTipo || "nenhum");
    setDescontoFamiliaValor(aluno.descontoFamiliaValor || 0);
    setObservacoes(aluno.observacoes || "");
    setEndereco(aluno.endereco || "");
    
    // Novos campos edit
    setTelefone(aluno.telefone || "");
    setWhatsapp(aluno.whatsapp || "");
    setResponsavel(aluno.responsavel || "");
    setFoto(aluno.foto || "");
    setDataMatricula(aluno.dataMatricula || "");
    const studentModalities = aluno.modalidades && aluno.modalidades.length > 0 
      ? aluno.modalidades 
      : [aluno.modalidade || "Kung Fu"];
    setModalidadesSelecionadas(studentModalities);
    setModalidade(studentModalities.join(", "));
    setStatusFinanceiro((aluno.statusFinanceiro as any) || "EM DIA");

    setShowAddForm(true);
    
    // Rolar suavemente até o formulário
    setTimeout(() => {
      const formElement = document.getElementById("form-add-aluno");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !cpf) {
      alert("Por favor, preencha o Nome, E-mail e CPF do aluno.");
      return;
    }
    const tId = turmaId || (turmas.length > 0 ? turmas[0].id : "");
    const editingAluno = editingAlunoId ? alunos.find(a => a.id === editingAlunoId) : null;
    
    onAddAluno({
      id: editingAlunoId || undefined,
      nome,
      email,
      celular,
      cpf,
      rg,
      dataNascimento,
      graduacao,
      dataUltimaGraduacao: editingAluno ? (editingAluno.dataUltimaGraduacao || new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
      status: editingAluno ? (editingAluno.status || "Ativo") : "Ativo",
      turmaId: tId,
      planoTipo,
      mensalidade,
      descontoFamiliaTipo,
      descontoFamiliaValor,
      observacoes,
      endereco,
      
      // Novos campos salvamento
      telefone: telefone || celular || "",
      whatsapp: whatsapp || celular || "",
      responsavel,
      foto,
      dataMatricula: dataMatricula || (editingAluno ? editingAluno.dataMatricula : new Date().toISOString().split("T")[0]) || new Date().toISOString().split("T")[0],
      graduacaoAtual: graduacao,
      modalidades: modalidadesSelecionadas,
      modalidade: modalidadesSelecionadas.join(", "),
      statusFinanceiro
    } as any);

    handleResetForm();
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
        <button
          onClick={() => setActiveTab("instrutores")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "instrutores"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <UsersRound className="w-4 h-4 text-red-500" />
          Instrutores Reais (Coleção Instrutores)
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
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-550 font-bold" />
                      <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
                        {editingAlunoId ? `Editar Matrícula - ${nome}` : "Nova Inscrição - Escola Garra de Águia PG"}
                      </span>
                    </div>
                    {editingAlunoId && (
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="text-[10px] uppercase font-bold text-red-500 hover:underline font-mono"
                      >
                        [Cancelar / Novo]
                      </button>
                    )}
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
                        onChange={(e) => {
                          setCelular(e.target.value);
                          if (!telefone) setTelefone(e.target.value);
                          if (!whatsapp) setWhatsapp(e.target.value);
                        }}
                        placeholder="(13) 99123-4567"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Telefone de Contato</label>
                      <input
                        id="form-telefone"
                        type="text"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(13) 3471-1234"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">WhatsApp</label>
                      <input
                        id="form-whatsapp"
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
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
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">RG (Documento)</label>
                      <input
                        id="form-rg"
                        type="text"
                        value={rg}
                        onChange={(e) => setRg(e.target.value)}
                        placeholder="12.345.678-9"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Endereço Residencial</label>
                      <input
                        id="form-endereco"
                        type="text"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Ex: Av. Presidente Kennedy, 1234 - Praia Grande, SP"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550/60"
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
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Horário / Turma de Treino</label>
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

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Responsável Legal (Se menor)</label>
                      <input
                        id="form-responsavel"
                        type="text"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                        placeholder="Ex: Nome do Pai ou Mãe"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Endereço da Foto (URL)</label>
                      <input
                        id="form-foto"
                        type="text"
                        value={foto}
                        onChange={(e) => setFoto(e.target.value)}
                        placeholder="Ex: https://images.com/image.png"
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-550"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Data de Matrícula</label>
                      <input
                        id="form-datamatricula"
                        type="date"
                        value={dataMatricula}
                        onChange={(e) => setDataMatricula(e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Modalidades Praticadas (Multi-seleção)</label>
                      <div className="flex flex-col sm:flex-row gap-3 bg-zinc-900 p-2.5 rounded border border-zinc-800 text-xs text-zinc-250">
                        {["Kung Fu", "Tai Chi Chuan", "Boxe Chinês / Sanda"].map((modOption) => {
                          const isChecked = modalidadesSelecionadas.includes(modOption);
                          return (
                            <label key={modOption} className="flex items-center gap-1.5 cursor-pointer select-none py-1 px-1 text-[11px] font-mono uppercase">
                              <input
                                type="checkbox"
                                value={modOption}
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setModalidadesSelecionadas(prev => [...prev, modOption]);
                                  } else {
                                    if (modalidadesSelecionadas.length > 1) {
                                      setModalidadesSelecionadas(prev => prev.filter(m => m !== modOption));
                                    } else {
                                      alert("Pelo menos uma modalidade oficial deve estar selecionada para o aluno!");
                                    }
                                  }
                                }}
                                className="accent-red-750 w-4.5 h-4.5 cursor-pointer rounded border-zinc-800 focus:ring-0"
                              />
                              <span>{modOption}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Situação Financeira</label>
                      <select
                        id="form-statusfinanceiro"
                        value={statusFinanceiro}
                        onChange={(e) => setStatusFinanceiro(e.target.value as any)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-amber-400 focus:outline-none font-bold"
                      >
                        <option value="EM DIA">EM DIA</option>
                        <option value="PENDENTE">PENDENTE</option>
                        <option value="ATRASADO">ATRASADO</option>
                        <option value="ISENTO">ISENTO</option>
                      </select>
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
                      onClick={editingAlunoId ? handleResetForm : () => setShowAddForm(false)}
                      className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded text-zinc-500 text-xs font-bold"
                    >
                      {editingAlunoId ? "Cancelar" : "Descartar"}
                    </button>
                    <button
                      type="submit"
                      id="btn-save-new-student"
                      className="px-5 py-2 bg-gradient-to-r from-red-850 to-amber-600 text-white rounded text-xs font-black shadow-md uppercase"
                    >
                      {editingAlunoId ? "Salvar Alterações" : "Confirmar Matrícula Regular"}
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
                              <div className="flex flex-col space-y-0.5">
                                <span>{a.nome}</span>
                                <div className="text-[9px] text-zinc-500 font-mono font-medium flex flex-wrap gap-x-2">
                                  <span>CPF: {a.cpf || "---"}</span>
                                  {a.celular && (
                                    <>
                                      <span className="text-zinc-650">•</span>
                                      <span>Cel: {a.celular}</span>
                                    </>
                                  )}
                                </div>
                                {a.endereco && (
                                  <span className="text-[9px] text-zinc-450 block font-normal leading-tight font-sans mt-0.5">
                                    📍 {a.endereco}
                                  </span>
                                )}
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
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleStartEdit(a)}
                                  className="p-1 px-2 text-amber-500 hover:bg-amber-950/50 rounded text-[11px] transition-colors font-extrabold flex items-center border border-transparent hover:border-amber-900 cursor-pointer"
                                  title="Editar cadastro do aluno"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-1" />
                                  Editar
                                </button>
                                <button
                                  id={`delete-stu-${a.id}`}
                                  onClick={() => {
                                    if (confirm(`Tem certeza de que deseja EXCLUIR permanentemente o aluno ${a.nome} e todos os seus históricos de cobrança? This action is permanent.`)) {
                                      onDeleteAluno(a.id);
                                    }
                                  }}
                                  className="p-1 px-2 text-red-500 hover:bg-red-950/50 rounded text-[11px] transition-colors font-extrabold flex items-center border border-transparent hover:border-red-900 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Excluir
                                </button>
                              </div>
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
                        <div className="mt-2.5 pt-2 border-t border-zinc-900 flex flex-col gap-1">
                          <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">Instrutor Responsável</label>
                          <select
                            value={t.instrutorId || ""}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const selectedInstName = selectedId ? (instrutores.find(ins => ins.id === selectedId)?.nome || "") : "";
                              if (onUpdateTurma) {
                                onUpdateTurma(t.id, selectedId, selectedInstName);
                              }
                            }}
                            className="bg-zinc-900 border border-zinc-800 p-1 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-amber-550 w-full"
                          >
                            <option value="">-- Instrutor não definido --</option>
                            {instrutores.map((ins) => (
                              <option key={ins.id} value={ins.id}>
                                {ins.nome} ({ins.funcao})
                              </option>
                            ))}
                          </select>
                          {!t.instrutorId && (
                            <span className="text-[10px] font-bold text-red-500 font-mono mt-0.5">⚠️ Instrutor não definido</span>
                          )}
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
      ) : activeTab === "instrutores" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
            <div className="text-left font-sans">
              <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider">Gestão Operacional de Instrutores</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Associação Liga Garra de Águia Praia Grande</p>
            </div>
            <button
              onClick={() => {
                setEditingInstrutorId(null);
                setInstNome("");
                setInstFuncao("");
                setInstTelefone("");
                setInstEmail("");
                setInstAtivo(true);
                setInstObservacoes("");
                setShowInstForm(!showInstForm);
              }}
              className="px-4 py-2 bg-red-850 hover:bg-red-800 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showInstForm ? "Fechar Formulário" : "Novo Instrutor"}
            </button>
          </div>

          {/* Form Panel */}
          {showInstForm && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 animate-fadeIn text-left font-sans">
              <h4 className="text-xs font-black uppercase text-white tracking-widest font-mono">
                {editingInstrutorId ? "📝 Editar Cadastro de Instrutor" : "🥋 Cadastrar Novo Instrutor Real"}
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!instNome.trim() || !instFuncao.trim()) {
                    alert("Por favor, preencha Nome e Função do Instrutor.");
                    return;
                  }
                  if (onSaveInstrutor) {
                    onSaveInstrutor({
                      ...(editingInstrutorId ? { id: editingInstrutorId } : {}),
                      nome: instNome.trim(),
                      funcao: instFuncao.trim(),
                      telefone: instTelefone.trim(),
                      email: instEmail.trim(),
                      ativo: instAtivo,
                      observacoes: instObservacoes.trim()
                    });
                  }
                  // Reset form
                  setInstNome("");
                  setInstFuncao("");
                  setInstTelefone("");
                  setInstEmail("");
                  setInstAtivo(true);
                  setInstObservacoes("");
                  setEditingInstrutorId(null);
                  setShowInstForm(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Nome Completo</label>
                    <input
                      type="text"
                      value={instNome}
                      onChange={(e) => setInstNome(e.target.value)}
                      placeholder="Ex: Maicon Padovani"
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-805 text-xs text-white focus:outline-none focus:border-red-550"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Função / Cargo</label>
                    <input
                      type="text"
                      value={instFuncao}
                      onChange={(e) => setInstFuncao(e.target.value)}
                      placeholder="Ex: Professor de Boxe Chinês"
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-805 text-xs text-white focus:outline-none focus:border-red-550"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Celular / Tel de Contato</label>
                    <input
                      type="text"
                      value={instTelefone}
                      onChange={(e) => setInstTelefone(e.target.value)}
                      placeholder="Ex: (13) 99123-4567"
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-805 text-xs text-white focus:outline-none focus:border-red-550"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">E-mail</label>
                    <input
                      type="email"
                      value={instEmail}
                      onChange={(e) => setInstEmail(e.target.value)}
                      placeholder="Ex: maicon@garradeaguia.com"
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-805 text-xs text-white focus:outline-none focus:border-red-550"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={instObservacoes}
                    onChange={(e) => setInstObservacoes(e.target.value)}
                    placeholder="Certificados, horários de preferência, observações do currículo..."
                    className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-850 text-xs text-white focus:outline-none focus:border-red-550"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="inst-ativo"
                    checked={instAtivo}
                    onChange={(e) => setInstAtivo(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 text-amber-500 bg-zinc-950 focus:ring-0"
                  />
                  <label htmlFor="inst-ativo" className="text-xs text-zinc-350 cursor-pointer font-bold uppercase select-none">
                    Status Ativo (Liberado para ministrar turmas e avaliações)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInstrutorId(null);
                      setInstNome("");
                      setInstFuncao("");
                      setInstTelefone("");
                      setInstEmail("");
                      setInstAtivo(true);
                      setInstObservacoes("");
                      setShowInstForm(false);
                    }}
                    className="px-4 py-2 border border-zinc-800 text-zinc-500 rounded text-xs hover:text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 rounded text-xs"
                  >
                    {editingInstrutorId ? "Salvar Alterações" : "Cadastrar Instrutor"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Roster list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-left">
            {instrutores.length === 0 ? (
              <div className="col-span-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
                <UsersRound className="w-10 h-10 text-zinc-650 mx-auto mb-2.5" />
                <p className="text-xs text-zinc-400 font-medium">Nenhum instrutor cadastrado em Praia Grande.</p>
                <p className="text-[10px] text-zinc-550 mt-1">Utilize o botão acima para cadastrar os instrutores oficiais da academia.</p>
              </div>
            ) : (
              instrutores.map((ins) => {
                const turmasLecionadas = turmas.filter(t => t.instrutorId === ins.id);
                return (
                  <div key={ins.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3.5 hover:border-zinc-700 transition-all text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-sans font-black text-zinc-100 uppercase tracking-wide">{ins.nome}</h4>
                        <span className="inline-block text-[10px] bg-red-950/40 border border-red-900/60 text-red-500 px-2.5 py-0.5 rounded-full font-bold mt-1">
                          {ins.funcao}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${ins.ativo ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" : "bg-zinc-950 text-zinc-400 border border-zinc-800/40"}`}>
                        {ins.ativo ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-400 font-mono text-[11px] border-t border-b border-zinc-950 py-2.5">
                      <p>📱 Telefone: <strong className="text-zinc-200">{ins.telefone || "Não informado"}</strong></p>
                      <p>✉️ E-mail: <strong className="text-zinc-200">{ins.email || "Não informado"}</strong></p>
                      <p>🥋 Turmas: <strong className="text-amber-500">{turmasLecionadas.length} turmas vinculadas</strong></p>
                    </div>

                    {ins.observacoes && (
                      <p className="text-[11.5px] text-zinc-400 italic font-medium leading-relaxed bg-black/25 p-2 rounded border border-zinc-850">
                        "{ins.observacoes}"
                      </p>
                    )}

                    <div className="flex justify-end gap-1.5 pt-2">
                      <button
                        onClick={() => {
                          setEditingInstrutorId(ins.id);
                          setInstNome(ins.nome);
                          setInstFuncao(ins.funcao);
                          setInstTelefone(ins.telefone || "");
                          setInstEmail(ins.email || "");
                          setInstAtivo(ins.ativo);
                          setInstObservacoes(ins.observacoes || "");
                          setShowInstForm(true);
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 rounded border border-zinc-800 text-[11px] text-zinc-300 font-bold flex items-center cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteInstrutor && onDeleteInstrutor(ins.id)}
                        className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/60 rounded border border-red-900/30 text-[11px] text-red-500 font-bold flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
                  <label className="text-[11px] text-zinc-300 block">Telefone de Contato</label>
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
