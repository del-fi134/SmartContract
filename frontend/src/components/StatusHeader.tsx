"use client";

import { useWallet } from "./WalletContext";
import { formatAddress } from "@/lib/contract";
import { useEffect, useState } from "react";

type StatusType = "disconnected" | "active" | "warning" | "expired";

export function StatusHeader() {
  const { isConnected, userAddress, contractState, mockState } = useWallet();
  const [status, setStatus] = useState<StatusType>("disconnected");

  const state = contractState || mockState;

  useEffect(() => {
    if (!isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("disconnected");
      return;
    }

    const update = () => {
      const deadlineMs = (Number(state.ultimaSenalDeVida) + Number(state.PLAZO_DEMO)) * 1000;
      const timeLeftMs = deadlineMs - Date.now();
      const ratio = timeLeftMs / (Number(state.PLAZO_DEMO) * 1000);

      if (timeLeftMs <= 0) setStatus("expired");
      else if (ratio <= 0.3) setStatus("warning");
      else setStatus("active");
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isConnected, contractState, state]);

  const getStatusText = () => {
    switch (status) {
      case "disconnected": return "Desconectado";
      case "active": return "Contrato Saludable";
      case "warning": return "Alerta: Verificación Necesaria";
      case "expired": return "Ventana Expirada - Herencia Abierta";
    }
  };

  const getDotClass = () => {
    switch (status) {
      case "disconnected": return "bg-slate-500";
      case "active": return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]";
      case "warning": return "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,1)]";
      case "expired": return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]";
    }
  };

  return (
    <div className="flex justify-between items-center px-8 py-5 
                    bg-slate-800/50 rounded-xl border border-white/10
                    backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-3 text-lg font-medium">
        <div className={`w-3.5 h-3.5 rounded-full ${getDotClass()}`} />
        <span style={{ fontFamily: "var(--font-outfit)" }}>{getStatusText()}</span>
      </div>

      <div className="font-mono text-slate-400 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
        {userAddress ? formatAddress(userAddress) : ""}
      </div>
    </div>
  );
}
