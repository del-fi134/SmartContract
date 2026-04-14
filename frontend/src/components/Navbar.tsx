"use client";

import { useWallet } from "./WalletContext";

export function Navbar() {
  const { isConnected, connect, disconnect } = useWallet();

  return (
    <nav className="sticky top-0 z-10 flex justify-between items-center px-[5%] py-6 
                    bg-slate-900/70 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🛡️</span>
        <h1 
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 
                     bg-clip-text text-transparent tracking-tight"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          LifeGuard Contract
        </h1>
      </div>
      
      <button
        onClick={isConnected ? disconnect : connect}
        className={`
          px-6 py-3 rounded-lg font-semibold transition-all duration-300 
          hover:-translate-y-0.5 hover:shadow-lg
          ${isConnected 
            ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" 
            : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
          }
          shadow-md text-white
        `}
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {isConnected ? "Desconectar" : "Conectar Wallet"}
      </button>
    </nav>
  );
}
