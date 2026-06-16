import React, { useState } from "react";
import { Aluno, Turma, Presenca, Pagamento, GraduacaoSash } from "../types";
import { Award, CheckCircle, Copy, CreditCard, Calendar, FileText, Footprints, Sparkles, Smartphone, Plus, Clock, HelpCircle, XCircle } from "lucide-react";

interface StudentPanelProps {
  aluno: Aluno;
  turma?: Turma;
  presencas: Presenca[];
  pagamentos: Pagamento[];
  onSolicitarPresenca: (turmaId: string, data: string) => void;
}

export default function StudentPanel({ aluno, turma, presencas, pagamentos, onSolicitarPresenca }: StudentPanelProps) {
  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [requestStatusMsg, setRequestStatusMsg] = useState("");

  const studentPresencas = presencas.filter(p => p.alunoId === aluno.id);

  // Status calculation: "Somente após aprovação a presença conta para frequência."
  // Valid attendances are APPROVED or Presente
  const presentCount = studentPresencas.filter(p => p.status === "APPROVED" || p.status === "Presente").length;
  const processedClasessCount = studentPresencas.filter(p => p.status !== "PENDING" && p.status !== "REJECTED").length;
  const totalClasess = studentPresencas.length;

  const attendanceRate = processedClasessCount > 0 ? Math.round((presentCount / processedClasessCount) * 100) : 100;

  const myPayments = pagamentos.filter(p => p.alunoId === aluno.id);

  const mockPixKey = "00020126580014br.gov.pix0136e4f3de52-8c11-4775-8025-a7b21fe88fcf5204000053039865406180.005802BR5925GestaoKungFuAcademy6009SaoPaulo62070503***6304D1A0";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(mockPixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSendCheckin = () => {
    if (!turma) {
      setRequestStatusMsg("Você precisa estar matriculado em uma turma!");
      return;
    }

    // Check if there is already a presence record for this specific date
    const exists = studentPresencas.some(p => p.data === selectedDate);
    if (exists) {
      setRequestStatusMsg("Você já possui um registro de presença ou solicitação pendente para esta data!");
      return;
    }

    onSolicitarPresenca(turma.id, selectedDate);
    setRequestStatusMsg("✓ Solicitação enviada! Status inicial: PENDENDE. Aguardando aprovação do Sifu Décio Padovani.");
    setTimeout(() => setRequestStatusMsg(""), 6000);
  };

  // Defining belt roadmap order
  const sashesRoadmap = [
    { sash: GraduacaoSash.BRANCA, label: "Branca", colorBg: "bg-zinc-100", colorText: "text-zinc-900", desc: "Primeiras posturas fundamentais (Ma Bu, Gong Bu)." },
    { sash: GraduacaoSash.AMARELA, label: "Amarela", colorBg: "bg-yellow-400/90", colorText: "text-zinc-950", desc: "Chutes básicos, punhos e rotinas iniciais." },
    { sash: GraduacaoSash.LARANJA, label: "Laranja", colorBg: "bg-orange-500", colorText: "text-white", desc: "Lian Bu Quan (Punho de Passos Combinados)." },
    { sash: GraduacaoSash.VERDE, label: "Verde", colorBg: "bg-emerald-600", colorText: "text-white", desc: "Técnicas intermediárias, agilidade de pernas." },
    { sash: GraduacaoSash.AZUL, label: "Azul", colorBg: "bg-blue-600", colorText: "text-white", desc: "Chin Na (Chaves, Torções e Defesa Pessoal)." },
    { sash: GraduacaoSash.VERMELHA, label: "Vermelha", colorBg: "bg-red-700", colorText: "text-white", desc: "Bastão tradicional (Gun Shu) e combate." },
    { sash: GraduacaoSash.PRETA_1_DUAN, label: "Preta 1º Duan", colorBg: "bg-zinc-950 border border-amber-500", colorText: "text-amber-400", desc: "Início do verdadeiro caminho sênior e Wu De." }
  ];

  // Find index of student's current sash in roadmap
  const currentSashIndex = sashesRoadmap.findIndex(b => b.sash === aluno.graduacao);

  return (
    <div className="space-y-6">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Identity Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-inner flex items-start gap-4">
          <div className="p-3 bg-red-950/80 rounded-lg border border-red-800 flex-shrink-0">
            <Award className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest font-mono">Ficha Estudantil</span>
            <h3 className="text-base font-bold text-white">{aluno.nome}</h3>
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p>Graduação Atual: <span className="text-amber-400 font-semibold">{aluno.graduacao}</span></p>
              <p>ID Aluno: <span className="font-mono text-zinc-300">{aluno.id}</span></p>
              <p>Plano Selecionado: <span className="text-emerald-400 font-mono font-bold capitalize">{aluno.planoTipo?.replace("_", " ")}</span></p>
            </div>
          </div>
        </div>

        {/* Style Class Details Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-inner flex items-start gap-4">
          <div className="p-3 bg-amber-950/60 rounded-lg border border-amber-800 flex-shrink-0">
            <Calendar className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-mono">Modalidade & Grade</span>
            <h3 className="text-base font-bold text-white">{turma ? turma.nomeEstilo : "Nenhuma modalidade configurada"}</h3>
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p>Horário Marcial: <span className="text-white font-mono">{turma?.horario}</span></p>
              <p>Dias Treino: <span className="text-amber-400/90 font-semibold">{turma?.diasSemana.join(" / ")}</span></p>
              <p>Instrutor Responsável: <span className="text-zinc-300">{turma?.instrutorNome}</span></p>
            </div>
          </div>
        </div>

        {/* Academic Standings Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-inner flex items-start gap-4">
          <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-900 flex-shrink-0">
            <Footprints className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Frequência da Ficha</span>
            <h3 className="text-2xl font-bold font-mono text-emerald-400">{attendanceRate}%</h3>
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p>Aulas Homologadas: <span className="text-white font-semibold">{presentCount}</span> / <span className="text-zinc-500">{processedClasessCount}</span></p>
              <p>Solicitações Pendentes: <span className="text-amber-500 font-bold font-mono">{studentPresencas.filter(p => p.status === "PENDING").length}</span></p>
              <p className="text-[10px] text-amber-500/80 italic font-medium">Requisito para Exame de Faixa: Mínimo 75%</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main interactive area: Mobile phone mockup to request presences side-by-side with history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* App Celular Mockup for Check-In Requests */}
        <div className="lg:col-span-1 bg-zinc-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Top Bar Speaker and Notch simulating a real smartphone */}
          <div className="w-full bg-zinc-950 h-6 flex justify-between items-center px-4 text-[9px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-amber-500" /> 13:00</span>
            <div className="w-16 h-3.5 bg-zinc-900 rounded-b-md mx-auto -mt-1 flex items-center justify-center">
              <div className="w-6 h-1 bg-zinc-950 rounded-full"></div>
            </div>
            <span>98% [⚡]</span>
          </div>

          <div className="p-4 space-y-4">
            <div className="text-center border-b border-zinc-800 pb-3">
              <h4 className="text-xs font-black tracking-wider text-amber-400 uppercase font-mono">App Aluno Garra de Águia</h4>
              <p className="text-[10px] text-zinc-400">Solicitação de Presença Remota (Celular)</p>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1.5 text-xs">
                <p className="text-[10px] text-amber-500/90 font-bold uppercase tracking-wider font-mono">Seu Treino</p>
                <p className="font-bold text-white">{turma ? turma.nomeEstilo : "Nenhum"}</p>
                <p className="text-zinc-400 text-[11px]">Horário oficial: {turma ? turma.horario : "Não definido"}</p>
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Selecione o Dia de Treino:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status information */}
              <div className="bg-zinc-950 p-2.5 rounded text-[10px] text-zinc-400 space-y-1 border border-zinc-900">
                <p className="text-white font-semibold">🔒 Regra de Segurança:</p>
                <p>O check-in inicia com status <span className="text-amber-400 font-bold">PENDENDE</span>.</p>
                <p className="text-red-400">Somente após a homologação do Sifu ou Instrutor, a presença será contabilizada na sua frequência marcial.</p>
              </div>

              <button
                id="btn-aluno-checkin"
                onClick={handleSendCheckin}
                className="w-full py-2.5 bg-gradient-to-r from-red-800 to-amber-600 hover:from-red-900 hover:to-amber-700 text-white rounded font-bold text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                SOLICITAR ENTRADA (CHECK-IN)
              </button>

              {requestStatusMsg && (
                <div className="p-2.5 bg-zinc-950 border border-amber-500 rounded text-[10px] leading-relaxed text-amber-400 font-mono animate-fadeIn">
                  {requestStatusMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance roll / History tracker detailed list */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Histórico Geral de Presenças Solicitadas
              </h4>
              <p className="text-[11px] text-zinc-400">Verifique se suas solicitações foram devidamente aceitas pelo Sifu.</p>
            </div>
            <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono">
              Total: {totalClasess} registros
            </span>
          </div>

          <div className="overflow-y-auto max-h-[300px] space-y-2">
            {studentPresencas.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500 font-mono">
                Nenhum registro de presença solicitado ou inserido para este aluno.
              </div>
            ) : (
              studentPresencas.map(p => {
                const tr = p.status === "APPROVED" || p.status === "Presente";
                const isPending = p.status === "PENDING";
                const isRejected = p.status === "REJECTED";

                return (
                  <div key={p.id} className="p-3 bg-zinc-950 rounded border border-zinc-850 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-full ${
                        tr ? "bg-emerald-950 text-emerald-400" :
                        isPending ? "bg-amber-950 text-amber-400 animate-pulse" :
                        isRejected ? "bg-red-950 text-red-500" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {tr && <CheckCircle className="w-4 h-4" />}
                        {isPending && <Clock className="w-4 h-4" />}
                        {isRejected && <XCircle className="w-4 h-4" />}
                        {!tr && !isPending && !isRejected && <HelpCircle className="w-4 h-4" />}
                      </div>

                      <div>
                        <p className="font-bold text-white">Data Marcial: {p.data}</p>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                          Canal: {p.solicitadoPorAluno ? "Aplicativo do Celular" : "Chamada do Sifu"}
                          {p.observacao && <span>| obs: {p.observacao}</span>}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono border ${
                      tr ? "bg-emerald-900/40 text-emerald-400 border-emerald-900/60" :
                      isPending ? "bg-amber-900/40 text-amber-400 border-amber-900/60" :
                      isRejected ? "bg-red-900/40 text-red-400 border-red-900/60" :
                      "bg-zinc-900 text-zinc-400 border-zinc-850"
                    }`}>
                      {p.status === "APPROVED" ? "APROVADO" :
                       p.status === "PENDING" ? "PENDENTE (AGUARDANDO)" :
                       p.status === "REJECTED" ? "RECUSADO" :
                       p.status === "Presente" ? "PRESENTE" :
                       p.status === "Faltou" ? "FALTOU" : p.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Belt roadmap progression visualizer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sua Trilha de Evolução Marcial de Graduação (Ying Jow Pai)
          </h3>
          <p className="text-xs text-zinc-400">Acompanhe seu progresso tradicional pelos sashes da Garra de Águia até a Faixa Preta.</p>
        </div>

        {/* Horizontal linear nodes timeline */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 pt-2">
          {sashesRoadmap.map((b, i) => {
            const isCompleted = i < currentSashIndex;
            const isCurrent = i === currentSashIndex;
            
            return (
              <div 
                key={b.sash} 
                className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                  isCurrent ? "bg-zinc-950 border-amber-500 scale-102 ring-2 ring-amber-950/80" :
                  isCompleted ? "bg-zinc-900/60 border-emerald-900/40 opacity-70" :
                  "bg-zinc-900/10 border-zinc-800/40 opacity-45 hover:opacity-55"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${b.colorBg} ${b.colorText}`}>
                    {b.label}
                  </span>
                  {isCompleted && (
                    <span className="text-[9px] text-emerald-400 font-black">✓ OK</span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] text-amber-400 font-black animate-pulse">● ATUAL</span>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-tight mt-1">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two column grid block of invoice and requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left column: Financial PIX copy/paste */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-red-500" />
              Portal do Aluno - Financeiro & Mensalidade
            </h4>
          </div>

          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">Próxima Mensalidade Bruta</p>
              <p className="text-xl font-bold text-white">R$ {aluno.mensalidade?.toFixed(2)}</p>
              {aluno.descontoFamiliaTipo !== "nenhum" && (
                <p className="text-xs text-amber-500">
                  Desconto Familiar Ativado: {aluno.descontoFamiliaTipo === "percentual" ? `-${aluno.descontoFamiliaValor}%` : `- R$ ${aluno.descontoFamiliaValor}`}
                </p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Status da Conta</p>
              <span className={`inline-block mt-0.5 px-3 py-1 rounded-full text-xs uppercase font-extrabold font-mono ${
                aluno.statusFinanceiro === "Em Dia" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                aluno.statusFinanceiro === "Atrasado" ? "bg-red-950/80 text-red-400 border border-red-800 animate-pulse" :
                "bg-amber-950 text-amber-500 border border-amber-800"
              }`}>
                {aluno.statusFinanceiro}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-300">Boletos para Pagamento PIX:</p>
            {myPayments.map(p => (
              <div key={p.id} className="p-3 bg-zinc-950 rounded border border-zinc-850 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Boleto Mensalidade {p.dataVencimento.split("-")[1]}/{p.dataVencimento.split("-")[0]}</p>
                  <p className="text-zinc-400 font-mono">Vencimento: {p.dataVencimento}</p>
                  <p className="text-[10px] text-zinc-400">Valor com Desconto Aplicado: <strong className="text-emerald-400">R$ {p.valor?.toFixed(2)}</strong></p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono ${
                    p.status === "Pago" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                    p.status === "Atrasado" ? "bg-rose-950 text-rose-500 border border-rose-900" :
                    "bg-amber-950 text-amber-500 border border-amber-900"
                  }`}>
                    {p.status}
                  </span>

                  {p.status !== "Pago" && (
                    <button
                      id={`btn-copy-pix-${p.id}`}
                      onClick={handleCopyPix}
                      className="p-1.5 bg-red-800 hover:bg-red-900 text-white rounded font-sans transition-all flex items-center gap-1 font-bold text-[10px]"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedPix ? "Copiado!" : "Pix Copiar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {copiedPix && (
            <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded text-[10px] font-mono text-amber-400 text-center animate-fadeIn">
              Código PIX Copia-e-Cola copiado com sucesso! Abra o aplicativo do seu banco e insira como PIX Copia e Cola.
            </div>
          )}
        </div>

        {/* Right column: Next grading requirements check sheet */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-red-500" />
            Critérios Oficiais para seu Próximo Sash (Grau)
          </h4>

          <div className="space-y-3 font-sans text-xs">
            <div className="p-3 bg-zinc-950 rounded border border-zinc-850 space-y-2">
              <p className="font-bold text-zinc-200">Requisitos Técnicos do Sash:</p>
              
              <ul className="space-y-2 text-zinc-400 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Formas (Tao Lu):</strong> Execução exemplar da sequência Lian Bu Quan e bases de controle.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Defesa Pessoal:</strong> Aplicação de 4 movimentos básicos contra socos de curta distância.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Assiduidade Marcial:</strong> Possui {attendanceRate}% de presenças válidas homologadas.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-red-950/20 rounded border border-red-950 text-[11px] text-red-300">
              📌 <strong>Orientações de Treino:</strong> Concentre-se nas defesas de Ying Jow Pai, fortalecimento dos braços e respiração profunda. Respeite as regras do Wu De para o avanço espiritual e marcial.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
