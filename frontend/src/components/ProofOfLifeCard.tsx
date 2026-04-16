"use client";

import { useWallet } from "./WalletContext";
import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/contract";

export function ProofOfLifeCard() {
  const { isConnected, contractState, mockState, ping } = useWallet();
  const [countdown, setCountdown] = useState("--:--:--");
  const [isExpired, setIsExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const state = contractState || mockState;

  useEffect(() => {
    if (!isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountdown("--:--:--");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExpired(false);
      return;
    }

    const update = () => {
      const deadlineMs = (Number(state.ultimaSenalDeVida) + Number(state.PLAZO_DEMO)) * 1000;
      const timeLeftMs = deadlineMs - Date.now();

      if (timeLeftMs <= 0) {
        setCountdown("00:00:00:00");
        setIsExpired(true);
      } else {
        setCountdown(formatCountdown(timeLeftMs));
        setIsExpired(false);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isConnected, contractState, state]);

  const handlePing = async () => {
    setIsProcessing(true);
    await ping();
    setIsProcessing(false);
  };

  const formatLastPing = () => {
    return new Date(Number(state.ultimaSenalDeVida) * 1000).toLocaleString("es-ES");
  };

  return (
    <div className="card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <h2
        className="text-2xl mb-6 pb-3 border-b border-white/10 text-white"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Prueba de Vida
      </h2>

      <p className="text-slate-400 leading-relaxed mb-4">
        Confirma que sigues activo para reiniciar el contador de la herencia y garantizar el control de tus fondos.
      </p>

      <div className="text-center my-6 p-6 bg-black/20 rounded-xl border border-white/10">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Tiempo Restante:
        </label>
        <div
          className={`text-4xl font-bold mt-2 tracking-wide ${isExpired ? "text-red-500" : "text-blue-500"
            }`}
          style={{
            fontFamily: "var(--font-outfit)",
            textShadow: isExpired
              ? "0 0 25px rgba(239,68,68,0.4)"
              : "0 0 25px rgba(59,130,246,0.4)"
          }}
        >
          {mounted ? countdown : "--:--:--"}
        </div>
      </div>

      <p className="text-sm text-center text-slate-400 mb-auto">
        Última actividad: <span className="text-slate-200 font-medium">{mounted ? formatLastPing() : "Cargando..."}</span>
      </p>

      <button
        onClick={handlePing}
        disabled={!isConnected || isProcessing}
        className="w-full py-4 mt-6 rounded-xl font-semibold text-lg text-white
                   bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30
                   disabled:hover:translate-y-0 disabled:hover:shadow-none"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {isProcessing ? "Procesando TX..." : "Sigo Vivo"}
      </button>
    </div>
  );
}
