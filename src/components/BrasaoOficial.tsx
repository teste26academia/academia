import React, { useState } from "react";

export function BrasaoOficial({ className = "w-16 h-16" }: { className?: string }) {
  const [hasError, setHasError] = useState<boolean>(false);

  if (hasError) {
    return (
      <div 
        id="brasao-erro-container"
        className="flex flex-col items-center justify-center p-3 rounded-2xl border border-red-950 bg-red-950/25 text-red-500 font-mono font-bold text-center select-none" 
        style={{ width: "inherit", height: "inherit" }}
      >
        <span className="text-[10px] leading-tight uppercase font-black font-mono tracking-wider">[Erro de carregamento do brasão oficial]</span>
        <span className="text-[8px] font-normal mt-1 opacity-60 text-zinc-500 font-sans">Verifique /public/logo.png</span>
      </div>
    );
  }

  return (
    <img
      id="img-logo-oficial"
      src="/logo.png"
      alt="Brasão Oficial Garra de Águia"
      className={`${className} object-contain`}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

export const EagleClawLogo = BrasaoOficial;
