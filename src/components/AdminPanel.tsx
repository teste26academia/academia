import React, { useState, useEffect } from "react";
import { Aluno, Turma, Instrutor, Pagamento, GlobalConfigs, Produto, Venda, Familia, Presenca } from "../types";
import { Users, DollarSign, Award, Plus, Trash2, Search, UserPlus, BookOpen, Clock, UsersRound, Settings, CheckCircle2, AlertCircle, Sparkles, Megaphone, Smartphone, Activity, Pencil, BarChart3, Package, Download } from "lucide-react";
import DiagnosticPanel from "./DiagnosticPanel";

interface AdminPanelProps {
  alunos: Aluno[];
  turmas: Turma[];
  instrutores?: Instrutor[];
  pagamentos: Pagamento[];
  config: GlobalConfigs;
  produtos?: Produto[];
  vendas?: Venda[];
  familias?: Familia[];
  presencas?: Presenca[];
  onSaveProduto?: (p: Produto) => Promise<void>;
  onDeleteProduto?: (id: string) => Promise<void>;
  onSaveVenda?: (v: Venda) => Promise<void>;
  onSaveFamilia?: (f: Familia) => Promise<void>;
  onDeleteFamilia?: (id: string) => Promise<void>;
  onSaveMensalidade?: (m: Pagamento) => Promise<void>;
  onDeleteMensalidade?: (id: string) => Promise<void>;
  onGenerateMensalidadesLote?: (competencia: string, vencimento: string, valorPadrao: number) => Promise<void>;
  activeRole?: string;
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
  produtos = [],
  vendas = [],
  familias = [],
  presencas = [],
  onSaveProduto,
  onDeleteProduto,
  onSaveVenda,
  onSaveFamilia,
  onDeleteFamilia,
  onSaveMensalidade,
  onDeleteMensalidade,
  onGenerateMensalidadesLote,
  activeRole = "ALUNO",
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
  const [activeTab, setActiveTab] = useState<"alunos" | "configuracoes" | "diagnostico" | "instrutores" | "financeiro" | "produtos" | "familias" | "backup">("diagnostico");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatusAdmin, setFilterStatusAdmin] = useState<"ATIVOS" | "INATIVOS" | "PENDENTES" | "TODOS">("ATIVOS");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAlunoId, setEditingAlunoId] = useState<string | null>(null);

  // MÓDULO 1: FINANCEIRO STATES
  const [showPayForm, setShowPayForm] = useState(false);
  const [editingPayId, setEditingPayId] = useState<string | null>(null);
  const [payAlunoId, setPayAlunoId] = useState("");
  const [payCompetencia, setPayCompetencia] = useState("");
  const [payVencimento, setPayVencimento] = useState("");
  const [payValor, setPayValor] = useState(160);
  const [payStatus, setPayStatus] = useState<"PENDENTE" | "PAGO" | "VENCIDO">("PENDENTE");
  const [payDataPagamento, setPayDataPagamento] = useState("");
  const [payFormaPagamento, setPayFormaPagamento] = useState("PIX");
  const [payObservacoes, setPayObservacoes] = useState("");

  const [bulkCompetencia, setBulkCompetencia] = useState("");
  const [bulkVencimento, setBulkVencimento] = useState("");
  const [bulkValor, setBulkValor] = useState(160);
  const [searchTermFinanceiro, setSearchTermFinanceiro] = useState("");

  // MÓDULO 2 & 3: PRODUTOS & VENDAS STATES
  const [showProdForm, setShowProdForm] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodNome, setProdNome] = useState("");
  const [prodCategoria, setProdCategoria] = useState("Equipamento");
  const [prodEstoque, setProdEstoque] = useState(0);
  const [prodEstoqueMinimo, setProdEstoqueMinimo] = useState(5);
  const [prodValorVenda, setProdValorVenda] = useState(0);
  const [prodAtivo, setProdAtivo] = useState(true);

  const [showVendaForm, setShowVendaForm] = useState(false);
  const [vendaAlunoId, setVendaAlunoId] = useState("");
  const [vendaProdutoId, setVendaProdutoId] = useState("");
  const [vendaQuantidade, setVendaQuantidade] = useState(1);
  const [vendaFormaPagamento, setVendaFormaPagamento] = useState("PIX");

  // MÓDULO 4: FAMÍLIAS STATES
  const [showFamForm, setShowFamForm] = useState(false);
  const [editingFamId, setEditingFamId] = useState<string | null>(null);
  const [famNomeFamilia, setFamNomeFamilia] = useState("");
  const [famResponsavel, setFamResponsavel] = useState("");
  const [famTelefone, setFamTelefone] = useState("");
  const [famAlunosIds, setFamAlunosIds] = useState<string[]>([]);

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
  const [graduacao, setGraduacao] = useState<string>("Preparatória - Branca");
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
    (a.nome || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (a.email || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (a.cpf || "").includes(searchTerm || "")
  ).filter(a => {
    const norm = (a.status || "").toUpperCase().trim();
    if (filterStatusAdmin === "ATIVOS") return norm === "ATIVO" || norm === "" || !a.status;
    if (filterStatusAdmin === "INATIVOS") return norm === "INATIVO";
    if (filterStatusAdmin === "PENDENTES") return norm === "PENDENTE";
    return true; // TODOS
  });

  const handleResetForm = () => {
    setNome("");
    setEmail("");
    setCelular("");
    setCpf("");
    setRg("");
    setDataNascimento("");
    setGraduacao("Preparatória - Branca");
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
        <button
          onClick={() => setActiveTab("financeiro")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "financeiro"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Financeiro Lote & Manual
        </button>
        <button
          onClick={() => setActiveTab("produtos")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "produtos"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <Package className="w-4 h-4 text-sky-500" />
          Produtos & Vendas
        </button>
        <button
          onClick={() => setActiveTab("familias")}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "familias"
              ? "border-amber-400 text-amber-400 font-extrabold"
              : "border-transparent text-zinc-450 hover:text-zinc-300"
          }`}
        >
          <UsersRound className="w-4 h-4 text-purple-500" />
          Vínculos Familiares
        </button>
        {activeRole === "ADMIN" && (
          <button
            onClick={() => setActiveTab("backup")}
            className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "backup"
                ? "border-amber-400 text-amber-400 font-extrabold"
                : "border-transparent text-zinc-450 hover:text-zinc-300"
            }`}
          >
            <Download className="w-4 h-4 text-rose-550" />
            Backup do Sistema
          </button>
        )}
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

              {/* Filtros rápidos de alunos no AdminPanel */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 pb-1">
                {(["ATIVOS", "INATIVOS", "PENDENTES", "TODOS"] as const).map((fs) => {
                  const isSel = filterStatusAdmin === fs;
                  // Contagem correspondente ao admin
                  const count = alunos.filter((a) => {
                    const norm = (a.status || "").toUpperCase().trim();
                    if (fs === "ATIVOS") return norm === "ATIVO" || norm === "" || !a.status;
                    if (fs === "INATIVOS") return norm === "INATIVO";
                    if (fs === "PENDENTES") return norm === "PENDENTE";
                    return true;
                  }).filter(a =>
                    (a.nome || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
                    (a.email || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
                    (a.cpf || "").includes(searchTerm || "")
                  ).length;

                  return (
                    <button
                      key={fs}
                      type="button"
                      onClick={() => setFilterStatusAdmin(fs)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                        isSel
                          ? "bg-amber-950/40 text-amber-500 border-amber-800 shadow-sm"
                          : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-400"
                      }`}
                    >
                      <span>{fs}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-sans ${
                        isSel ? "bg-amber-900/60 text-amber-300" : "bg-zinc-900 text-zinc-650"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
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
                        onChange={(e) => setGraduacao(e.target.value)}
                        className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none"
                      >
                        {(() => {
                          const OBTEM_GRADUACOES_DE_MODALIDADE = (mod: string): string[] => {
                            const normalized = mod.toLowerCase();
                            if (normalized.includes("kung fu")) {
                              return [
                                "Preparatória - Branca",
                                "1ª Fase - Branca Ponta Amarela",
                                "2ª Fase - Branca Ponta Verde",
                                "3ª Fase - Verde",
                                "4ª Fase - Verde Ponta Marrom",
                                "5ª Fase - Marrom",
                                "6ª Fase - Marrom Ponta Preta",
                                "7ª Fase - Preta",
                                "1º Dhuen - Preta",
                                "2º Dhuen - Preta",
                                "3º Dhuen - Preta",
                                "4º Dhuen - Preta",
                                "5º Dhuen - Preta",
                                "6º Dhuen - Preta",
                                "7º Dhuen - Preta",
                                "8º Dhuen - Preta",
                                "9º Dhuen - Preta"
                              ];
                            }
                            if (normalized.includes("tai chi")) {
                              return [
                                "Preparatória - Branca",
                                "1ª Fase - Branca Ponta Amarela",
                                "2ª Fase - Branca Ponta Verde",
                                "3ª Fase - Verde"
                              ];
                            }
                            if (normalized.includes("boxe") || normalized.includes("sanda")) {
                              return [
                                "Preparatória - Branca",
                                "1ª Fase - Laranja",
                                "2ª Fase - Vermelha",
                                "3ª Fase - Azul",
                                "4ª Fase - Marrom",
                                "5ª Fase - Preta"
                              ];
                            }
                            return [];
                          };

                          const allGrads = Array.from(new Set(
                            modalidadesSelecionadas.flatMap(m => OBTEM_GRADUACOES_DE_MODALIDADE(m))
                          ));

                          if (allGrads.length === 0) {
                            allGrads.push("Preparatória - Branca");
                          }

                          return allGrads.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ));
                        })()}
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
                                    if (confirm(`Tem certeza de que deseja INATIVAR o aluno ${a.nome}? O acesso será suspenso, mas seu histórico completo (mensalidades, presenças, exames e graduações) permanecerá preservado.`)) {
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
      ) : activeTab === "financeiro" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-zinc-900/35 p-4 rounded-xl border border-zinc-800">
            <div className="text-left font-sans">
              <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider">Módulo Financeiro Geral (Coleção: mensalidades)</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Gestão de mensalidades individuais, cobranças em lote e faturamento</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingPayId(null);
                  setPayAlunoId("");
                  setPayCompetencia("");
                  setPayVencimento("");
                  setPayValor(160);
                  setPayStatus("PENDENTE");
                  setPayDataPagamento("");
                  setPayFormaPagamento("PIX");
                  setPayObservacoes("");
                  setShowPayForm(!showPayForm);
                }}
                className="px-4 py-2 bg-red-850 hover:bg-red-800 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showPayForm ? "Fechar Form" : "Lançamento Manual"}
              </button>
            </div>
          </div>

          {/* Form manual billing */}
          {showPayForm && (
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 animate-fadeIn text-left font-sans max-w-3xl">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider font-mono">
                {editingPayId ? "📝 Editar Cobrança Financeira" : "💵 Lançar Cobrança Manual"}
              </h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!payAlunoId || !payCompetencia || !payVencimento || payValor <= 0) {
                  alert("Por favor, preencha todos os campos obrigatórios.");
                  return;
                }
                const alObj = alunos.find(a => a.id === payAlunoId);
                const payment: Pagamento = {
                  id: editingPayId || `mensalidade_${Date.now()}`,
                  alunoId: payAlunoId,
                  alunoNome: alObj ? alObj.nome : "Aluno avulso",
                  referencia: payCompetencia,
                  competencia: payCompetencia,
                  vencimento: payVencimento,
                  valor: Number(payValor),
                  valorFinal: Number(payValor),
                  status: payStatus,
                  dataPagamento: payStatus === "PAGO" ? (payDataPagamento || new Date().toISOString().split("T")[0]) : undefined,
                  formaPagamento: payStatus === "PAGO" ? payFormaPagamento : undefined,
                  observacoes: payObservacoes
                };
                if (onSaveMensalidade) {
                  await onSaveMensalidade(payment);
                  alert("Lançamento financeiro realizado com sucesso!");
                  setShowPayForm(false);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Selecionar Aluno *</label>
                    <select
                      value={payAlunoId}
                      onChange={(e) => setPayAlunoId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="">Selecione...</option>
                      {alunos.map(al => (
                        <option key={al.id} value={al.id}>{al.nome} ({al.status || "Ativo"})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Competência * (Ex: 06/2026)</label>
                    <input
                      type="text"
                      placeholder="MM/AAAA"
                      value={payCompetencia}
                      onChange={(e) => setPayCompetencia(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Valor R$ *</label>
                    <input
                      type="number"
                      value={payValor}
                      onChange={(e) => setPayValor(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Data de Vencimento *</label>
                    <input
                      type="date"
                      value={payVencimento}
                      onChange={(e) => setPayVencimento(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Status de Cobrança</label>
                    <select
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="PENDENTE">PENDENTE</option>
                      <option value="PAGO">PAGO</option>
                      <option value="VENCIDO">VENCIDO</option>
                    </select>
                  </div>
                  {payStatus === "PAGO" && (
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Data de Pagamento</label>
                      <input
                        type="date"
                        value={payDataPagamento}
                        onChange={(e) => setPayDataPagamento(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                {payStatus === "PAGO" && (
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Forma de Pagamento</label>
                    <select
                      value={payFormaPagamento}
                      onChange={(e) => setPayFormaPagamento(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Transferência">Transferência Bancária</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={payObservacoes}
                    onChange={(e) => setPayObservacoes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded-lg text-white font-mono text-[11px]"
                    placeholder="Ex: Pagador responsável tio do aluno, acréscimos, etc..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowPayForm(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 rounded-lg text-xs"
                  >
                    Salvar Cobrança
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Invoice Box */}
          {activeRole === "ADMIN" && (
            <div className="bg-zinc-900 border border-zinc-855 p-5 rounded-2xl space-y-4 text-left font-sans max-w-3xl">
              <span className="text-[10px] text-amber-500 font-bold font-mono uppercase block tracking-wider">📦 Cobrança Automática em Lote</span>
              <p className="text-xs text-zinc-400">Gera faturamento de mensalidades em massa para todos os alunos ativos que ainda não possuam mensalidade criada para o período.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Competência (MM/AAAA)</label>
                  <input
                    type="text"
                    placeholder="Ex: 07/2026"
                    value={bulkCompetencia}
                    onChange={(e) => setBulkCompetencia(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Data de Vencimento Padrão</label>
                  <input
                    type="date"
                    value={bulkVencimento}
                    onChange={(e) => setBulkVencimento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Valor Geral Padrão R$</label>
                  <input
                    type="number"
                    value={bulkValor}
                    onChange={(e) => setBulkValor(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    if (!bulkCompetencia || !bulkVencimento || bulkValor <= 0) {
                      alert("Por favor, preencha todos os campos do faturamento em lote.");
                      return;
                    }
                    if (confirm(`Confirma a geração em lote de faturas para a competência ${bulkCompetencia}? Alunos ativos receberão suas respectivas cobranças.`)) {
                      if (onGenerateMensalidadesLote) {
                        await onGenerateMensalidadesLote(bulkCompetencia, bulkVencimento, bulkValor);
                      }
                    }
                  }}
                  className="px-5 py-2.5 bg-red-900 hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Confirmar Faturamento em Lote
                </button>
              </div>
            </div>
          )}

          {/* Quick Metrics Dashboard of current pagamentos list */}
          {(() => {
            const totalPagoVal = pagamentos
              .filter(p => p.status === "PAGO" || p.status === "Pago" || p.status === "EM DIA")
              .reduce((a, b) => a + (b.valor || 0), 0);
            
            const totalPendenteVal = pagamentos
              .filter(p => p.status === "PENDENTE" || p.status === "Pendente")
              .reduce((a, b) => a + (b.valor || 0), 0);

            const totalVencidoVal = pagamentos
              .filter(p => p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado")
              .reduce((a, b) => a + (b.valor || 0), 0);

            const inadimplentesCount = new Set(
              pagamentos
                .filter(p => p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado")
                .map(p => p.alunoId)
            ).size;

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Total Recebido</span>
                  <div className="text-xl font-black text-emerald-450 font-mono mt-1">R$ {totalPagoVal.toFixed(2)}</div>
                  <span className="text-[9px] text-zinc-550 italic mt-0.5">Faturamento realizado</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Total Pendente</span>
                  <div className="text-xl font-black text-amber-500 font-mono mt-1">R$ {totalPendenteVal.toFixed(2)}</div>
                  <span className="text-[9px] text-zinc-550 italic mt-0.5">Faturas aguardando</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Total Inadimplente</span>
                  <div className="text-xl font-black text-red-500 font-mono mt-1">R$ {totalVencidoVal.toFixed(2)}</div>
                  <span className="text-[9px] text-zinc-550 italic mt-0.5">Faturas vencidas</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl text-left">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Inadimplentes Ativos</span>
                  <div className="text-xl font-black text-zinc-100 font-mono mt-1">{inadimplentesCount} Alunos</div>
                  <span className="text-[9px] text-zinc-550 italic mt-0.5">Com faturas pendentes atrasadas</span>
                </div>
              </div>
            );
          })()}

          {/* List of billings */}
          <div className="space-y-4">
            <div className="flex gap-2 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-800">
              <input
                type="text"
                placeholder="🔍 Filtrar faturas por nome de aluno..."
                value={searchTermFinanceiro}
                onChange={(e) => setSearchTermFinanceiro(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white font-mono text-[11px]"
              />
            </div>

            <div className="overflow-x-auto bg-zinc-900 border border-zinc-805 rounded-xl">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-zinc-950 font-mono text-[10px] text-zinc-450 uppercase border-b border-zinc-800">
                    <th className="p-3">Aluno</th>
                    <th className="p-3">Referência</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Data Pgto</th>
                    <th className="p-3">Modo</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {pagamentos
                    .filter(p => {
                      const name = p.alunoNome || "";
                      return name.toLowerCase().includes((searchTermFinanceiro || "").toLowerCase());
                    })
                    .map(p => {
                      const isPago = p.status === "PAGO" || p.status === "Pago" || p.status === "EM DIA";
                      const isVencido = p.status === "VENCIDO" || p.status === "Vencido" || p.status === "ATRASADO" || p.status === "Atrasado";
                      
                      return (
                        <tr key={p.id} className="hover:bg-zinc-900/60 font-sans">
                          <td className="p-3 font-bold text-white">{p.alunoNome || "Id: " + p.alunoId}</td>
                          <td className="p-3 font-mono">{p.competencia || p.referencia}</td>
                          <td className="p-3 font-mono">{p.vencimento}</td>
                          <td className="p-3 font-mono text-zinc-100">R$ {p.valor.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${
                              isPago
                                ? "bg-emerald-950 text-emerald-450 border border-emerald-900/40"
                                : isVencido
                                ? "bg-red-955 text-red-500 border border-red-900/40 animate-pulse"
                                : "bg-amber-955 text-amber-500 border border-amber-900/40"
                            }`}>
                              {(p.status || "PENDENTE").toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{p.dataPagamento || "-"}</td>
                          <td className="p-3 text-zinc-400">{p.formaPagamento || p.metodo || "-"}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {!isPago && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const mode = prompt("Qual a forma de pagamento? (PIX, Dinheiro, Cartão...)", "PIX");
                                    if (mode === null) return;
                                    const upd: Pagamento = {
                                      ...p,
                                      status: "PAGO",
                                      dataPagamento: new Date().toISOString().split("T")[0],
                                      formaPagamento: mode || "PIX"
                                    };
                                    if (onSaveMensalidade) {
                                      await onSaveMensalidade(upd);
                                      alert("Mensalidade marcada como PAGA!");
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-450 text-[10px] font-bold rounded-lg"
                                >
                                  Marcar Paga
                                </button>
                              )}
                              {!isPago && !isVencido && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const upd: Pagamento = { ...p, status: "VENCIDO" };
                                    if (onSaveMensalidade) {
                                      await onSaveMensalidade(upd);
                                      alert("Mensalidade marcada como VENCIDA!");
                                    }
                                  }}
                                  className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-400 text-[10px] font-bold rounded-lg"
                                >
                                  Vencida
                                </button>
                              )}
                              {activeRole === "ADMIN" && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm("Deseja realmente cancelar/remover esta cobrança?")) {
                                      if (onDeleteMensalidade) {
                                        await onDeleteMensalidade(p.id);
                                        alert("Cobrança excluída!");
                                      }
                                    }
                                  }}
                                  className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-550 hover:text-red-500 text-[10px] rounded-lg border border-zinc-850"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "produtos" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-zinc-900/35 p-4 rounded-xl border border-zinc-800">
            <div className="text-left font-sans">
              <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider">Produtos e Controle de Vendas (Coleções: produtos, vendas)</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Gerenciamento de estoque da academia, uniformes, exames e lanchonete</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingProdId(null);
                  setProdNome("");
                  setProdCategoria("Equipamento");
                  setProdEstoque(0);
                  setProdEstoqueMinimo(5);
                  setProdValorVenda(0);
                  setProdAtivo(true);
                  setShowProdForm(!showProdForm);
                }}
                className="px-4 py-2 bg-red-850 hover:bg-red-800 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showProdForm ? "Fechar Form" : "Novo Produto"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVendaAlunoId("");
                  setVendaProdutoId("");
                  setVendaQuantidade(1);
                  setVendaFormaPagamento("PIX");
                  setShowVendaForm(!showVendaForm);
                }}
                className="px-4 py-2 bg-amber-550 hover:bg-amber-500 text-zinc-950 font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {showVendaForm ? "Fechar Registrar" : "Registrar Venda"}
              </button>
            </div>
          </div>

          {/* Form Produto registration */}
          {showProdForm && (
            <div className="bg-zinc-900 border border-zinc-805 p-5 rounded-2xl space-y-4 animate-fadeIn text-left font-sans max-w-2xl">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest font-mono">
                {editingProdId ? "📝 Editar Cadastro de Produto" : "🥋 Cadastrar Produto"}
              </h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!prodNome || prodValorVenda < 0 || prodEstoque < 0) {
                  alert("Por favor, preencha os campos obrigatórios corretamente.");
                  return;
                }
                const prod: Produto = {
                  id: editingProdId || `produto_${Date.now()}`,
                  nome: prodNome,
                  categoria: prodCategoria,
                  estoque: Number(prodEstoque),
                  estoqueMinimo: Number(prodEstoqueMinimo),
                  valorVenda: Number(prodValorVenda),
                  ativo: prodAtivo,
                  valor: Number(prodValorVenda)
                };
                if (onSaveProduto) {
                  await onSaveProduto(prod);
                  alert("Produto salvo com sucesso!");
                  setShowProdForm(false);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Nome do Produto *</label>
                    <input
                      type="text"
                      value={prodNome}
                      onChange={(e) => setProdNome(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                      placeholder="Ex: Kimono Tradicional Trançado"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Categoria</label>
                    <select
                      value={prodCategoria}
                      onChange={(e) => setProdCategoria(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="Equipamento">🥋 Equipamento / Kimono</option>
                      <option value="Acessório">Protetores / Acessórios</option>
                      <option value="Uniforme">👕 Camisetas / Uniformes</option>
                      <option value="Graduação">🏷️ Faixas / Graduações</option>
                      <option value="Alimentação">🥤 Bebidas / Lanches</option>
                      <option value="Outro">📦 Outros</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Preço de Venda R$ *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prodValorVenda}
                      onChange={(e) => setProdValorVenda(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Estoque Atual *</label>
                    <input
                      type="number"
                      value={prodEstoque}
                      onChange={(e) => setProdEstoque(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Estoque Mínimo Alerta *</label>
                    <input
                      type="number"
                      value={prodEstoqueMinimo}
                      onChange={(e) => setProdEstoqueMinimo(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prodAtivoCheck"
                    checked={prodAtivo}
                    onChange={(e) => setProdAtivo(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-850 text-red-650"
                  />
                  <label htmlFor="prodAtivoCheck" className="text-zinc-350 text-xs font-bold uppercase tracking-wider select-none cursor-pointer">
                    Produto Ativo para Vendas online/presencial
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowProdForm(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 rounded-lg text-xs"
                  >
                    Salvar Produto
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form Sale registration (Módulo 3) */}
          {showVendaForm && (
            <div className="bg-zinc-900 border border-zinc-805 p-5 rounded-2xl space-y-4 animate-fadeIn text-left font-sans max-w-2xl">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider font-mono">
                🛒 Registrar Venda de Produto
              </h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!vendaProdutoId || !vendaAlunoId || vendaQuantidade <= 0) {
                  alert("Por favor, preencha todos os campos da venda.");
                  return;
                }
                const selectedProdObj = produtos.find(p => p.id === vendaProdutoId);
                const selectedAlunoObj = alunos.find(a => a.id === vendaAlunoId);

                if (!selectedProdObj) {
                  alert("Produto não encontrado.");
                  return;
                }

                if (selectedProdObj.estoque < vendaQuantidade) {
                  alert(`Estoque insuficiente! Estoque disponível do produto: ${selectedProdObj.estoque} unidades.`);
                  return;
                }

                const uPrice = selectedProdObj.valorVenda !== undefined ? selectedProdObj.valorVenda : (selectedProdObj.valor || 0);
                const tot = uPrice * vendaQuantidade;

                const vendaRecord: Venda = {
                  id: `venda_${Date.now()}`,
                  data: new Date().toISOString().split("T")[0],
                  alunoId: vendaAlunoId,
                  alunoNome: selectedAlunoObj ? selectedAlunoObj.nome : "Aluno avulso",
                  produtoId: vendaProdutoId,
                  produtoNome: selectedProdObj.nome,
                  quantidade: Number(vendaQuantidade),
                  valorUnitario: uPrice,
                  valorTotal: tot,
                  formaPagamento: vendaFormaPagamento,
                  valor: tot,
                  dataVenda: new Date().toISOString().split("T")[0]
                };

                if (onSaveVenda) {
                  await onSaveVenda(vendaRecord);
                  alert(`Venda registrada com sucesso! Faturamento de R$ ${tot.toFixed(2)}. Estoque deduzido.`);
                  setShowVendaForm(false);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Escolher Produto *</label>
                    <select
                      value={vendaProdutoId}
                      onChange={(e) => setVendaProdutoId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="">Selecione...</option>
                      {produtos
                        .filter(p => p.ativo)
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nome} - R$ {(p.valorVenda || p.valor || 0).toFixed(2)} (Em Estoque: {p.estoque})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Selecionar Aluno *</label>
                    <select
                      value={vendaAlunoId}
                      onChange={(e) => setVendaAlunoId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="">Selecione...</option>
                      {alunos.map(al => (
                        <option key={al.id} value={al.id}>{al.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Quantidade *</label>
                    <input
                      type="number"
                      min={1}
                      value={vendaQuantidade}
                      onChange={(e) => setVendaQuantidade(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Forma de Pagamento</label>
                    <select
                      value={vendaFormaPagamento}
                      onChange={(e) => setVendaFormaPagamento(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão">Cartão</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowVendaForm(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 rounded-lg text-xs"
                  >
                    Registrar Baixa de Estoque e Venda
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Roster List */}
          <div className="space-y-4">
            <span className="text-[10px] text-amber-500 font-bold font-mono uppercase block tracking-wider text-left font-sans">📦 Catálogo de Estoque Atual</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left font-sans">
              {produtos.length === 0 ? (
                <div className="col-span-full bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
                  <Package className="w-8 h-8 text-zinc-650 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">Nenhum produto cadastrado no sistema.</p>
                </div>
              ) : (
                produtos.map(p => {
                  const isLowStock = p.estoque <= p.estoqueMinimo;
                  return (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-805 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-900/30 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
                              {p.categoria}
                            </span>
                            <h4 className="text-sm font-black text-white mt-1.5 uppercase font-sans">{p.nome}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${p.ativo ? "bg-emerald-950 text-emerald-400 border border-emerald-950/40" : "bg-zinc-950 text-zinc-550 border border-zinc-850"}`}>
                            {p.ativo ? "ATIVO" : "INATIVO"}
                          </span>
                        </div>
                        
                        <div className="border-t border-zinc-950 pt-2 pb-1 text-xs text-zinc-400 font-mono space-y-1">
                          <p>Estoque: <strong className={`font-mono ${isLowStock ? "text-red-500 font-black animate-pulse" : "text-white"}`}>{p.estoque} unidades</strong></p>
                          <p>Mínimo de Alerta: <span className="text-zinc-500">{p.estoqueMinimo} unidades</span></p>
                          <p className="text-amber-500 font-bold text-sm">R$ {(p.valorVenda || p.valor || 0).toFixed(2)}</p>
                        </div>

                        {isLowStock && (
                          <div className="flex items-center gap-1 bg-red-950/50 border border-red-900/40 p-2 rounded text-[10px] text-red-450 font-bold uppercase">
                            <AlertCircle className="w-3.5 h-3.5 text-red-550 animate-pulse" />
                            Alerta: Estoque Mínimo Atingido! Reabastecer.
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-1.5 pt-4 mt-auto border-t border-zinc-950">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProdId(p.id);
                            setProdNome(p.nome);
                            setProdCategoria(p.categoria);
                            setProdEstoque(p.estoque);
                            setProdEstoqueMinimo(p.estoqueMinimo);
                            setProdValorVenda(p.valorVenda || p.valor || 0);
                            setProdAtivo(p.ativo);
                            setShowProdForm(true);
                          }}
                          className="px-2.5 py-1 bg-zinc-950 text-zinc-350 hover:text-white border border-zinc-850 hover:border-zinc-750 font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          Editar
                        </button>
                        {activeRole === "ADMIN" && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Deseja realmente remover o produto ${p.nome}?`)) {
                                if (onDeleteProduto) {
                                  await onDeleteProduto(p.id);
                                  alert("Produto removido.");
                                }
                              }
                            }}
                            className="px-2.5 py-1 bg-zinc-950 text-zinc-550 hover:text-red-550 border border-zinc-855 hover:border-red-900/40 font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sales History (Módulo 3) */}
          <div className="space-y-4 pt-4 border-t border-zinc-850">
            <span className="text-[10px] text-amber-500 font-bold font-mono uppercase block tracking-wider text-left font-sans">🛍️ Histórico Comercial de Vendas</span>
            <div className="overflow-x-auto bg-zinc-900 border border-zinc-805 rounded-xl text-left font-sans">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 font-mono text-[10px] text-zinc-450 uppercase border-b border-zinc-800">
                    <th className="p-3">Data</th>
                    <th className="p-3">Aluno</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3 text-right">Qtd</th>
                    <th className="p-3 text-right">Unidade R$</th>
                    <th className="p-3 text-right">Total R$</th>
                    <th className="p-3">Pagamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {vendas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-550 font-mono text-xs">Nenhuma transação comercial efetuada de compras até o momento.</td>
                    </tr>
                  ) : (
                    vendas.map(v => (
                      <tr key={v.id} className="hover:bg-zinc-900/60 font-sans">
                        <td className="p-3 font-mono">{v.data || v.dataVenda}</td>
                        <td className="p-3 font-bold text-white">{v.alunoNome}</td>
                        <td className="p-3 text-zinc-100">{v.produtoNome}</td>
                        <td className="p-3 text-right font-mono">{v.quantidade}</td>
                        <td className="p-3 text-right font-mono">R$ {v.valorUnitario?.toFixed(2) || ((v.valor || 0) / v.quantidade).toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-amber-500 font-bold">R$ {(v.valorTotal || v.valor || 0).toFixed(2)}</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 bg-zinc-950 rounded text-[10px] text-zinc-400 font-mono border border-zinc-800">{v.formaPagamento || "PIX"}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "familias" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-zinc-900/35 p-4 rounded-xl border border-zinc-800">
            <div className="text-left font-sans">
              <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider">Vínculos de Núcleo Familiar (Coleção: familias)</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Gestão de famílias e descontos integrados para irmãos ou responsáveis</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingFamId(null);
                setFamNomeFamilia("");
                setFamResponsavel("");
                setFamTelefone("");
                setFamAlunosIds([]);
                setShowFamForm(!showFamForm);
              }}
              className="px-4 py-2 bg-red-850 hover:bg-red-800 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showFamForm ? "Fechar Form" : "Nova Família"}
            </button>
          </div>

          {/* Form Create Family */}
          {showFamForm && (
            <div className="bg-zinc-900 border border-zinc-805 p-5 rounded-2xl space-y-4 animate-fadeIn text-left font-sans max-w-2xl">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest font-mono">
                {editingFamId ? "📝 Editar Núcleo Familiar" : "👨‍👩‍👧‍👦 Registrar Novo Núcleo Familiar"}
              </h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!famNomeFamilia || !famResponsavel) {
                  alert("Por favor, preencha Nome da Família e Responsável Financeiro.");
                  return;
                }
                const fam: Familia = {
                  id: editingFamId || `familia_${Date.now()}`,
                  nomeFamilia: famNomeFamilia,
                  responsavel: famResponsavel,
                  telefone: famTelefone,
                  alunosIds: famAlunosIds,
                  nome: famNomeFamilia // compatibility
                };
                if (onSaveFamilia) {
                  await onSaveFamilia(fam);
                  alert("Família salva com sucesso!");
                  setShowFamForm(false);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Nome do Núcleo *</label>
                    <input
                      type="text"
                      value={famNomeFamilia}
                      onChange={(e) => setFamNomeFamilia(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                      placeholder="Ex: Família Padovani"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Responsável Financeiro *</label>
                    <input
                      type="text"
                      value={famResponsavel}
                      onChange={(e) => setFamResponsavel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                      placeholder="Ex: Décio Padovani"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Telefone WhatsApp</label>
                    <input
                      type="text"
                      value={famTelefone}
                      onChange={(e) => setFamTelefone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-white font-mono text-[11px]"
                      placeholder="(13) 99999-9999"
                    />
                  </div>
                </div>

                {/* Multiselect checkboxes for linking active students */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-mono font-bold text-zinc-500">Vincular Integrantes (Alunos Cadastrados)</label>
                  <div className="max-h-40 overflow-y-auto bg-zinc-950 border border-zinc-850 p-3 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {alunos.map(al => {
                      const isChecked = famAlunosIds.includes(al.id);
                      return (
                        <div key={al.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`check-al-fam-${al.id}`}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFamAlunosIds([...famAlunosIds, al.id]);
                              } else {
                                setFamAlunosIds(famAlunosIds.filter(id => id !== al.id));
                              }
                            }}
                            className="rounded bg-zinc-900 border-zinc-800 text-red-650"
                          />
                          <label htmlFor={`check-al-fam-${al.id}`} className="text-zinc-200 cursor-pointer text-[11px] truncate select-none">
                            🥋 {al.nome} ({al.status || "Ativo"})
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowFamForm(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-zinc-950 rounded-lg text-xs"
                  >
                    Salvar Núcleo Familiar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Families Roster Row */}
          <div className="space-y-4 font-sans">
            <span className="text-[10px] text-amber-500 font-bold font-mono uppercase block tracking-wider text-left">👨‍👩‍👧‍👦 Núcleos Familiares Sincronizados</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {familias.length === 0 ? (
                <div className="col-span-full bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
                  <UsersRound className="w-8 h-8 text-zinc-650 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">Nenhuma família registrada no sistema.</p>
                </div>
              ) : (
                familias.map(f => {
                  const linkedStudents = alunos.filter(al => f.alunosIds?.includes(al.id));
                  return (
                    <div key={f.id} className="bg-zinc-900 border border-zinc-805 p-5 rounded-xl space-y-3 flex flex-col justify-between hover:border-zinc-700 transition">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-black text-white uppercase">{f.nomeFamilia || f.nome}</h4>
                            <p className="text-[11px] text-zinc-400 mt-1 font-mono">Responsável: <strong className="text-zinc-200">{f.responsavel}</strong></p>
                          </div>
                          {f.telefone && (
                            <span className="text-[10px] font-mono text-zinc-400">📞 {f.telefone}</span>
                          )}
                        </div>

                        <div className="border-t border-zinc-950 pt-2 pb-1 text-xs text-zinc-400 space-y-1">
                          <p className="font-bold text-[10px] text-zinc-550 uppercase tracking-widest font-mono">Alunos Vinculados ({linkedStudents.length}):</p>
                          {linkedStudents.length === 0 ? (
                            <p className="text-[11px] text-zinc-550 italic">Nenhum aluno associado.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {linkedStudents.map(child => (
                                <span key={child.id} className="inline-block text-[10px] bg-zinc-950 border border-zinc-850 text-amber-500 px-2 py-0.5 rounded font-mono font-medium">
                                  🥋 {child.nome} ({child.graduacao || child.graduacaoAtual || "Branca"})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-950">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFamId(f.id);
                            setFamNomeFamilia(f.nomeFamilia || f.nome || "");
                            setFamResponsavel(f.responsavel || "");
                            setFamTelefone(f.telefone || "");
                            setFamAlunosIds(f.alunosIds || []);
                            setShowFamForm(true);
                          }}
                          className="px-2.5 py-1 bg-zinc-950 text-zinc-350 hover:text-white border border-zinc-850 hover:border-zinc-750 font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          Editar
                        </button>
                        {activeRole === "ADMIN" && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Excluir o vínculo da Família ${f.nomeFamilia || f.nome}? Os alunos permanecerão ativos individualmente.`)) {
                                if (onDeleteFamilia) {
                                  await onDeleteFamilia(f.id);
                                  alert("Vínculo familiar excluído!");
                                }
                              }
                            }}
                            className="px-2.5 py-1 bg-zinc-950 text-zinc-550 hover:text-red-500 border border-zinc-850 hover:border-red-900/40 font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "backup" ? (
        <div className="space-y-6 text-left font-sans">
          {/* Header */}
          <div className="bg-zinc-900/35 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider">🔄 Central de Backups Gerenciais (JSON / CSV)</h3>
            <p className="text-zinc-400 text-xs mt-0.5">Cópia de segurança administrativa e migração de tabelas locais para prestação de contas externa</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-805 p-6 rounded-2xl max-w-2xl space-y-5 text-left font-sans">
            <p className="text-xs text-zinc-300">
              Gere exportações integrais no formato <strong>JSON Estruturado</strong> contendo todas as coleções em produção do banco de dados Firestore da academia Garra de Águia.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-850 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest font-mono">JSON Completo</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">Exporta todos os dados do sistema em um único arquivo unificado contendo Arrays para Alunos, Faturas, Frequências, Exames, Produtos, Vendas e Famílias.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const backupData = {
                      dataBackup: new Date().toISOString(),
                      unidade: "Praia Grande",
                      alunos,
                      pagamentos,
                      presencas,
                      produtos,
                      vendas,
                      familias
                    };
                    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `backup_completo_garra_de_aguia_${new Date().toISOString().split("T")[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                    alert("Backup em formato JSON exportado com sucesso!");
                  }}
                  className="w-full text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Confirmar Backup JSON
                </button>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-850 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest font-mono font-bold text-[11px]">CSV de Alunos & Cobranças</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Exporta arquivos tabulares (CSV) ideais para abertura no Excel contendo a relação cadastral completa dos alunos matriculados e o faturamento financeiro.</p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (alunos.length === 0) return alert("Nenhum registro.");
                      const headers = ["ID", "Nome", "E-mail", "Celular", "CPF", "Graduacao", "Status"];
                      const rows = alunos.map(a => [
                        a.id,
                        a.nome,
                        a.email,
                        a.celular || a.telefone || "",
                        a.cpf || "",
                        a.graduacao || a.graduacaoAtual || "",
                        a.status || "Ativo"
                      ]);
                      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                        + [headers.join(";"), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))].join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.href = encodedUri;
                      link.download = `backup_alunos_${new Date().toISOString().split("T")[0]}.csv`;
                      link.click();
                    }}
                    className="w-full text-center py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold uppercase rounded-lg border border-zinc-800 cursor-pointer"
                  >
                    Exportar Alunos (CSV)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pagamentos.length === 0) return alert("Nenhum faturamento.");
                      const headers = ["ID", "Aluno ID", "Aluno Nome", "Competencia", "Vencimento", "Valor", "Status", "Pagamento Data", "Forma"];
                      const rows = pagamentos.map(p => [
                        p.id,
                        p.alunoId,
                        p.alunoNome || "",
                        p.competencia || p.referencia || "",
                        p.vencimento,
                        p.valor,
                        p.status,
                        p.dataPagamento || "",
                        p.formaPagamento || ""
                      ]);
                      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                        + [headers.join(";"), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))].join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.href = encodedUri;
                      link.download = `backup_financeiro_${new Date().toISOString().split("T")[0]}.csv`;
                      link.click();
                    }}
                    className="w-full text-center py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold uppercase rounded-lg border border-zinc-800 cursor-pointer"
                  >
                    Exportar Financeiro (CSV)
                  </button>
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
