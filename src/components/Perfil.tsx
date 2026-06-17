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
  MapPin
} from "lucide-react";

interface PerfilProps {
  user: any;
  userProfile: any;
  activeRole: string;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  onUpdateCadastro?: (dados: { nome: string; celular: string; endereco: string }) => Promise<void>;
}

export function Perfil({
  user,
  userProfile,
  activeRole,
  sendPasswordReset,
  logout,
  onUpdateCadastro
}: PerfilProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState(userProfile?.nome || user?.displayName || "");
  const [celular, setCelular] = useState(userProfile?.celular || "");
  const [endereco, setEndereco] = useState(userProfile?.endereco || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with props if they load later
  React.useEffect(() => {
    if (userProfile) {
      if (!nome) setNome(userProfile.nome || user?.displayName || "");
      if (!celular) setCelular(userProfile.celular || "");
      if (!endereco) setEndereco(userProfile.endereco || "");
    }
  }, [userProfile]);

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
          endereco
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
      {/* User Card */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl text-left flex flex-col sm:flex-row items-center gap-4 relative">
        <div className="w-16 h-16 rounded-full bg-red-800 border-2 border-amber-500 flex items-center justify-center text-xl font-black text-white shadow-lg flex-shrink-0 animate-pulse">
          🥋
        </div>
        <div className="text-center sm:text-left space-y-2 flex-grow">
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest leading-none">Perfil de Praia Grande</p>
          <div className="space-y-1 text-zinc-350 text-xs text-left">
            <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Nome:</span> <strong className="text-white text-sm uppercase">{userProfile?.nome || user?.displayName || "Usuário"}</strong></div>
            <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">E-mail:</span> <span className="text-zinc-200 font-mono">{user?.email}</span></div>
            <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Cargo:</span> <strong className="text-amber-400 font-mono text-xs uppercase">
              {userProfile?.role?.toLowerCase() === "admin" ? "ADMINISTRADOR" : userProfile?.role?.toLowerCase() === "instrutor" ? "PROFESSOR" : "ALUNO"}
            </strong></div>
            {userProfile?.celular && (
              <div><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">Tel:</span> <span className="text-zinc-305 font-mono">{userProfile.celular}</span></div>
            )}
            {userProfile?.endereco && (
              <div className="line-clamp-1"><span className="text-zinc-500 font-mono uppercase tracking-wider text-[9px]">📍 Endereço:</span> <span className="text-zinc-350">{userProfile.endereco}</span></div>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 uppercase font-black mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </span>
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
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Nome Completo</label>
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
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Celular / WhatsApp</label>
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="(13) 99123-4567"
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Endereço Residencial</label>
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
                className="flex-1 py-3.5 rounded-2xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-wider transition-all"
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
            <span className="flex items-center gap-2.5 text-zinc-350">
              <User className="w-4.5 h-4.5 text-red-500" />
              Editar Perfil (Nome do Usuário)
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
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
          className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2.5 text-zinc-350">
            <Lock className="w-4.5 h-4.5 text-red-500" />
            Alterar Senha de Acesso
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors">
          <span className="flex items-center gap-2.5 text-zinc-350">
            <Bell className="w-4.5 h-4.5 text-red-500" />
            Configuração de Notificações
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors">
          <span className="flex items-center gap-2.5 text-zinc-350">
            <Info className="w-4.5 h-4.5 text-red-500" />
            Sobre o App (A.G.A. Praia Grande v1.4)
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3.5 bg-red-700 hover:bg-red-650 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        SAIR DA CONTA
      </button>

    </div>
  );
}
