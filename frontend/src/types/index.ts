export interface ContractState {
  owner: string;
  beneficiario: string;
  ultimaSenalDeVida: bigint;
  PLAZO_DEMO: bigint;
  balance: string;
}

export interface MockState {
  owner: string;
  beneficiario: string;
  ultimaSenalDeVida: number;
  PLAZO_DEMO: number;
  balance: string;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
