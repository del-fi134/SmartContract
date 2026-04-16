"use client";

import { useWallet } from "./WalletContext";
import { formatAddress } from "@/lib/contract";

export function InfoCard() {
  const { contractState, mockState } = useWallet();
  const state = contractState || mockState;

  const formatTimeout = () => {
    return `${Number(state.PLAZO_DEMO) / 86400} Días`;
  };



  return (
    <div className="card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <h2
        className="text-2xl mb-6 pb-3 border-b border-white/10 text-white"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Información del Contrato
      </h2>

      <div className="space-y-4">
        <InfoGroup label="Propietario (Owner)" value={formatAddress(state.owner)} />
        <InfoGroup label="Heredero (Heir)" value={formatAddress(state.beneficiario)} />
        <InfoGroup label="Balance del Contrato" value={`${state.balance} ETH`} />
        <InfoGroup label="Tiempo de Inactividad Límite" value={formatTimeout()} />
      </div>
    </div>
  );
}

function InfoGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl">
      <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
        {label}
      </label>
      <p className="text-base mt-1 font-mono break-all text-slate-100">{value}</p>
    </div>
  );
}
