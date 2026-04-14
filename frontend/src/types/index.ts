export interface ContractState {
  owner: string;
  heir: string;
  lastPingTime: bigint;
  timeoutDuration: bigint;
  balance: string;
}

export interface MockState {
  owner: string;
  heir: string;
  lastPingTime: number;
  timeoutDuration: number;
  balance: string;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
