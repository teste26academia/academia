import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Info, 
  LogOut, 
  ChevronRight,
  Save,
  X,
  Phone,
  MapPin,
  FileBadge,
  Eye,
  Calendar,
  Image,
  Award
} from "lucide-react";
import { Aluno } from "../types";

interface PerfilProps {
  user: any;
  userProfile: any;
  activeRole: string;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  onUpdateCadastro?: (dados: { 
    nome: string; 
    celular: string; 
    endereco: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    foto?: string;
    responsavel?: string;
  }) => Promise<void>;
  alunoFicha?: Aluno;
}

export function Perfil({
  user,
  userProfile,
  activeRole,
  sendPasswordReset,
  logout,
  onUpdateCadastro,
  alunoFicha
}: PerfilProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState(alunoFicha?.nome || userProfile?.nome || user?.displayName || "");
  const [celular, setCelular] = useState(alunoFicha?.celular || userProfile?.celular || userProfile?.telefone || "");
  const [endereco, setEndereco] = useState(alunoFicha?.endereco || userProfile?.endereco || "");
  
  // Novos campos específicos de aluno para auditoria e completude
  const [cpf, setCpf] = useState(alunoFicha?.cpf || "");
  const [rg, setRg] = useState(alunoFicha?.rg || "");
  const [dataNascimento, setDataNascimento] = useState(alunoFicha?.dataNascimento || "2000-01-01");
  const [foto, setFoto] = useState(alunoFicha?.foto || "");
  const [responsavel, setResponsavel] = useState(alunoFicha?.responsavel || "");

  const [isSaving, setIsSaving] = useState(false);

  // Sync state with props if they load later
  React.useEffect(() => {
    if (userProfile) {
      if (!nome) setNome(userProfile.nome || user?.displayName || "");
      if (!celular) setCelular(userProfile.celular || userProfile.telefone || "");
      if (!endereco) setEndereco(userProfile.endereco || "");
    }
    if (alunoFicha) {
      if (!cpf) setCpf(alunoFicha.cpf || "");
      if (!rg) setRg(alunoFicha.rg || "");
      if (dataNascimento === "2000-01-01" && alunoFicha.dataNascimento) setDataNascimento(alunoFicha.dataNascimento);
      if (!foto) setFoto(alunoFicha.foto || "");
      if (!responsavel) setResponsavel(alunoFicha.responsavel || "");
    }
  }, [userProfile, alunoFicha]);

  // Completude do Aluno
  const completudeInfo = (() => {
    if (activeRole !== "ALUNO" || !alunoFicha) return { percent: 100, pendentes: [], isMenor: false };
    
    let count = 0;
    const pendentes: string[] = [];

    // CPF: 15%
    if (alunoFicha.cpf && alunoFicha.cpf.trim() !== "" && alunoFicha.cpf !== "(Não cadastrado)") {
      count += 15;
    } else {
      pendentes.push("CPF");
    }

    // RG: 15%
    if (alunoFicha.rg && alunoFicha.rg.trim() !== "") {
      count += 15;
    } else {
      pendentes.push("RG");
    }

    // Data de nascimento: 15%
    if (alunoFicha.dataNascimento && alunoFicha.dataNascimento.trim() !== "" && alunoFicha.dataNascimento !== "2000-01-01") {
      count += 15;
    } else {
      pendentes.push("Data de Nascimento");
    }

    // Telefone: 15%
    const tel = alunoFicha.telefone || alunoFicha.celular;
    if (tel && tel.trim() !== "" && tel !== "(Não cadastrado)") {
      count += 15;
    } else {
      pendentes.push("Telefone/Celular");
    }

    // Endereço: 15%
    if (alunoFicha.endereco && alunoFicha.endereco.trim() !== "") {
      count += 15;
    } else {
      pendentes.push("Endereço");
    }

    // Foto: 10%
    if (alunoFicha.foto && alunoFicha.foto.trim() !== "") {
      count += 10;
    } else {
      pendentes.push("Foto do Perfil");
    }

    // Idade e Responsável
    let isMenor = false;
    if (alunoFicha.dataNascimento && alunoFicha.dataNascimento !== "2000-01-01") {
      try {
        const nasc = new Date(alunoFicha.dataNascimento);
        const idadeDifMs = Date.now() - nasc.getTime();
        const idadeDate = new Date(idadeDifMs);
        const idade = Math.abs(idadeDate.getUTCFullYear() - 1970);
        isMenor = idade < 18;
      } catch {}
    }

    if (isMenor) {
      if (alunoFicha.responsavel && alunoFicha.responsavel.trim() !== "") {
        count += 15;
      } else {
        pendentes.push("Responsável (Menor de idade)");
      }
    } else {
      count += 15;
    }

    return { percent: Math.min(count, 100), pendentes, isMenor };
  })();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert("Por favor, preencha pelo menos o seu nome completo.");
      return;
    }
    setIsSaving(true);
    try {
      if (onUpdateCadastro) {
        await onUpdateCadastro({
          nome,
          celular,
          endereco,
          cpf,
          rg,
          dataNascimento,
          foto,
          responsavel
        });
      }
      setIsEditing(false);
    } catch (err: any) {
      alert("Erro ao salvar cadastro: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="perfil-tab-content">
      
      {/* INDICADOR DE CADASTRO COMPLETO (AVISO NO TOPO PARA ALUNOS) */}
      {activeRole === "ALUNO" && completudeInfo.percent < 100 && (
        <div className="bg-amber-950/20 border border-amber-550/35 p-5 rounded-3xl space-y-3 text-left animate-fadeIn shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-500 tracking-wider uppercase font-mono flex items-center gap-1.5">
              ⚠️ Cadastro Incompleto
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold px-2.5 py-0.5 rounded-full font-sans">
              {completudeInfo.percent}% Preenchido
            </span>
          </div>
          
          {/* Barra de Progresso Visual */}
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
            <div 
              className="bg-gradient-to-r from-red-800 to-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completudeInfo.percent}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-zinc-350 font-sans leading-relaxed">
            Sua ficha acadêmica de aluno está incompleta. Complete seu cadastro preenchendo todos os dados obrigatórios para que seu status mude de <span className="text-amber-500 font-bold">PENDENTE</span> para <span className="text-emerald-400 font-bold">ATIVO</span> e libere todos os recursos do seu plano.
          </p>

          <div className="space-y-1">
            <span className="block text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest">Campos obrigatórios faltantes:</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {completudeInfo.pendentes.map((p) => (
                <span key={p} className="px-2 py-0.8 bg-zinc-950 border border-zinc-900 rounded text-[9.5px] font-mono text-amber-400">
                  [{p}]
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CADASTRO 100% COMPLETO CELEBRAÇÃO */}
      {activeRole === "ALUNO" && completudeInfo.percent >= 100 && (
        <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-3xl text-left flex items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            ✓
          </div>
          <div>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono">Ficha Consolidada - 100%</span>
            <p className="text-[10.5px] text-zinc-400 font-sans">Parabéns! Seus dados estão completos, o que garante conformidade com a auditoria operacional acadêmica.</p>
          </div>
        </div>
      )}

      {/* User Card */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl text-left flex flex-col sm:flex-row items-center gap-4 relative">
        <div className="w-18 h-18 rounded-3xl bg-zinc-900 border-2 border-amber-500 flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0 overflow-hidden">
          {alunoFicha?.foto || userProfile?.foto ? (
            <img 
              src={alunoFicha?.foto || userProfile?.foto} 
              alt="Foto Perfil" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>🥋</span>
          )}
        </div>
        <div className="text-center sm:text-left space-y-2 flex-grow">
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest leading-none">Perfil de Praia Grande</p>
          <div className="space-y-1.5 text-zinc-350 text-xs text-left">
            <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Nome:</span> <strong className="text-white text-sm uppercase">{alunoFicha?.nome || userProfile?.nome || user?.displayName || "Usuário"}</strong></div>
            <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">E-mail:</span> <span className="text-zinc-200 font-mono">{user?.email}</span></div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Cargo:</span> 
              <strong className="text-amber-400 font-mono text-xs uppercase">
                {userProfile?.role?.toLowerCase() === "admin" ? "ADMINISTRADOR" : userProfile?.role?.toLowerCase() === "instrutor" ? "PROFESSOR" : "ALUNO"}
              </strong>
              
              {/* STATUS OPERACIONAL DA FICHA DO ALUNO */}
              {activeRole === "ALUNO" && alunoFicha && (
                <>
                  <span className="text-zinc-650 font-mono">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono border ${
                    (alunoFicha.status || "Ativo").toUpperCase() === "PENDENTE"
                      ? "bg-amber-950/40 text-amber-500 border-amber-900"
                      : (alunoFicha.status || "Ativo").toUpperCase() === "INATIVO"
                      ? "bg-red-950/40 text-red-500 border-red-900"
                      : "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                  }`}>
                    {alunoFicha.status || "Ativo"}
                  </span>
                </>
              )}
            </div>

            {(alunoFicha?.celular || userProfile?.celular) && (
              <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Tel:</span> <span className="text-zinc-350 font-mono">{alunoFicha?.celular || userProfile?.celular}</span></div>
            )}
            
            {/* Campos extras na visualização rápida do aluno */}
            {activeRole === "ALUNO" && alunoFicha && (
              <>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-zinc-900 text-[11px]">
                  <div>
                    <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">CPF:</span>
                    <span className="text-zinc-300 font-mono">{alunoFicha.cpf ? alunoFicha.cpf : <em className="text-red-500/80 font-sans">Pendente</em>}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">RG:</span>
                    <span className="text-zinc-300 font-mono">{alunoFicha.rg ? alunoFicha.rg : <em className="text-red-500/80 font-sans">Pendente</em>}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Graduação:</span>
                    <span className="text-amber-500 font-bold font-sans">{alunoFicha.graduacaoAtual || alunoFicha.graduacao || "Faixa Branca"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Estilo/Modalidade:</span>
                    <span className="text-red-400 font-mono font-bold text-[11px] uppercase tracking-tighter">{alunoFicha.modalidade || "Kung Fu"}</span>
                  </div>
                </div>

                {alunoFicha.responsavel && (
                  <div className="pt-1.5"><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Responsável:</span> <span className="text-zinc-350 uppercase font-medium">{alunoFicha.responsavel}</span></div>
                )}
              </>
            )}

            {(alunoFicha?.endereco || userProfile?.endereco) && (
              <div className="line-clamp-1 pt-0.5"><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">📍 Endereço:</span> <span className="text-zinc-350">{alunoFicha?.endereco || userProfile?.endereco}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Rows List */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden text-xs text-left font-semibold space-y-0.5">
        
        {isEditing ? (
          <form onSubmit={handleSave} className="p-5 bg-zinc-950 border border-zinc-900 space-y-4 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-1">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider font-mono">Editar Dados Cadastrais</span>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="text-zinc-550 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><User className="w-3" /> Nome Completo</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo do aluno"
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><Phone className="w-3" /> Celular / WhatsApp</label>
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="(13) 99123-4567"
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* SE FOR ALUNO, MOSTRAR CAMPI ESPECÍFICOS DE AUDITORIA DE DOCUMENTAÇÃO */}
            {activeRole === "ALUNO" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><FileBadge className="w-3" /> CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><FileBadge className="w-3" /> RG</label>
                    <input
                      type="text"
                      value={rg}
                      onChange={(e) => setRg(e.target.value)}
                      placeholder="00.000.000-0"
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><Calendar className="w-3" /> Data de Nascimento</label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><Image className="w-3" /> Link da Foto de Perfil (URL)</label>
                  <input
                    type="text"
                    value={foto}
                    onChange={(e) => setFoto(e.target.value)}
                    placeholder="https://exemplo.com/suaframe.jpg"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1">
                    <User className="w-3" /> Responsável Legal {completudeInfo.isMenor && <span className="text-red-500 font-bold ml-1">* (Obrigatório por ser menor)</span>}
                  </label>
                  <input
                    type="text"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Nome do pai, mãe ou tutor"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1"><MapPin className="w-3" /> Endereço Residencial</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua Guimarães Rosa, 1191 - Praia Grande, SP"
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3.5 rounded-2xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-750 to-amber-600 hover:from-red-700 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Gravando..." : "Salvar Dados"}
              </button>
            </div>
          </form>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2.5 text-zinc-350 font-sans font-medium text-xs">
              <User className="w-4.5 h-4.5 text-red-500 animate-pulse" />
              Editar Dados Cadastrais (Ficha de Praia Grande)
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-650" />
          </div>
        )}

        <div 
          onClick={async () => {
            try {
              await sendPasswordReset(user.email || "");
              alert("E-mail de alteração de senha enviado para sua conta!");
            } catch (e: any) {
              alert("Erro ao disparar e-mail: " + e.message);
            }
          }}
          className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors font-sans font-medium text-xs text-zinc-350"
        >
          <span className="flex items-center gap-2.5">
            <Lock className="w-4.5 h-4.5 text-red-500" />
            Alterar Senha de Acesso
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-650" />
        </div>

        <div className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors font-sans font-medium text-xs text-zinc-350">
          <span className="flex items-center gap-2.5">
            <Bell className="w-4.5 h-4.5 text-red-500" />
            Configuração de Notificações
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-650" />
        </div>

        <div className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors font-sans font-medium text-xs text-zinc-350">
          <span className="flex items-center gap-2.5">
            <Info className="w-4.5 h-4.5 text-red-500" />
            Sobre o App (A.G.A. Praia Grande v1.5)
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-650" />
        </div>

      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3.5 bg-red-850 hover:bg-red-850 border border-red-700/30 text-white font-black uppercase tracking-widest text-[10.5px] rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer font-mono"
      >
        <LogOut className="w-4 h-4" />
        SAIR DA CONTA
      </button>

    </div>
  );
}
