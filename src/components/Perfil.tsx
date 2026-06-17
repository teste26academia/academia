import React from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Info, 
  LogOut, 
  ChevronRight 
} from "lucide-react";

interface PerfilProps {
  user: any;
  userProfile: any;
  activeRole: string;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

export function Perfil({
  user,
  userProfile,
  activeRole,
  sendPasswordReset,
  logout
}: PerfilProps) {
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
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 uppercase font-black mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </span>
        </div>
      </div>

      {/* Rows List */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden text-xs text-left font-semibold">
        
        <div className="p-4 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer flex items-center justify-between transition-colors">
          <span className="flex items-center gap-2.5 text-zinc-350">
            <User className="w-4.5 h-4.5 text-red-500" />
            Editar Perfil (Nome do Usuário)
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

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
        className="w-full py-3.5 bg-red-700 hover:bg-red-650 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2.5"
      >
        <LogOut className="w-4 h-4" />
        SAIR DA CONTA
      </button>

    </div>
  );
}
