"use client";

import { useState, useEffect } from "react";
import { useWallet } from "./WalletContext";

export function InheritanceCard() {
  const { isConnected, contractState, mockState, executeInheritance, userAddress } = useWallet();

  const state = contractState || mockState;
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [amountStr, setAmountStr] = useState("0");

  useEffect(() => {
    if (!isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeftMs(0);
      return;
    }

    const update = () => {
      const deadline = (Number(state.ultimaSenalDeVida) + Number(state.PLAZO_DEMO)) * 1000;
      setTimeLeftMs(deadline - Date.now());
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isConnected, state]);

  const canExecute = isConnected && timeLeftMs <= 0 && userAddress?.toLowerCase() === state.beneficiario.toLowerCase();
  const isExpired = timeLeftMs <= 0;

  const status = !isConnected
    ? "Conecta tu wallet para ver el estado"
    : isExpired
      ? "⚠️ El tiempo límite ha finalizado. La herencia digital puede ser ejecutada por el heredero designado."
      : "El fondo está asegurado y el contrato se mantiene bloqueado.";

  const statusColor = !isConnected
    ? "text-slate-400"
    : isExpired
      ? "text-red-500"
      : "text-emerald-500";

  const handleExecute = async () => {
    console.log("Boton clicado. Iniciando handleExecute...");
    await executeInheritance(amountStr);
  };

  // DEBUG LOG
  console.log("[DEBUG] InheritanceCard: ", { 
    isConnected, 
    timeLeftMs, 
    userAddress, 
    beneficiario: state.beneficiario,
    canExecute
  });

  return (
    <div className="card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-t-4 border-t-red-500">
      <h2
        className="text-2xl mb-6 pb-3 border-b border-white/10 text-white"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Herencia Digital
      </h2>

      <p className="text-slate-400 leading-relaxed mb-auto">
        Si el propietario no ha dado señales de vida y el tiempo se agota, el heredero asignado podrá ejecutar esta función.
      </p>

      <div className={`mt-6 p-4 rounded-lg bg-black/20 text-center font-medium border border-dashed border-white/10 ${statusColor}`}>
        {status}
      </div>

      <div className="mt-4">
        <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 block">
          Monto a exigir (en mínima unidad)
        </label>
        <input 
          type="number" 
          value={amountStr} 
          onChange={(e) => setAmountStr(e.target.value)}
          disabled={!canExecute}
          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-40"
          placeholder="Ej: 1000000"
        />
      </div>

      <button
        onClick={handleExecute}
        disabled={!canExecute}
        className="w-full py-4 mt-6 rounded-xl font-semibold text-lg text-white
                   bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-red-500/30
                   disabled:hover:translate-y-0 disabled:hover:shadow-none"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Ejecutar Herencia
      </button>
    </div>
  );
}
