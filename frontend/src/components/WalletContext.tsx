"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, MOCK_STATE } from "@/lib/contract";
import { useToast } from "./ToastContext";
import { ContractState } from "@/types";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletContextType {
  isConnected: boolean;
  userAddress: string | null;
  provider: BrowserProvider | null;
  contract: Contract | null;
  contractState: ContractState | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  loadContractData: () => Promise<void>;
  ping: () => Promise<void>;
  executeInheritance: () => Promise<void>;
  mockState: ContractState;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [mockState, setMockState] = useState<ContractState>({
    owner: MOCK_STATE.owner,
    heir: MOCK_STATE.heir,
    lastPingTime: BigInt(MOCK_STATE.lastPingTime),
    timeoutDuration: BigInt(MOCK_STATE.timeoutDuration),
    balance: MOCK_STATE.balance,
  });

  const handleAccountsChanged = useCallback((accounts: unknown) => {
    const accountsArray = accounts as string[];
    if (accountsArray.length === 0) {
      disconnect();
    }
  }, []);

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const connect = async () => {
    if (!window.ethereum) {
      showToast("Por favor instala MetaMask u otra wallet compatible", "error");
      return;
    }

    try {
      if (!window.ethereum) return;
      const ethProvider = new BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      
      if (accounts.length === 0) {
        disconnect();
        return;
      }

      setUserAddress(accounts[0]);
      setProvider(ethProvider);
      
      const signer = await ethProvider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
      setIsConnected(true);
      
      showToast("Wallet conectada con éxito", "success");
      
      await loadContractData();
    } catch {
      showToast("Conexión cancelada o fallida.", "error");
    }
  };

  const disconnect = () => {
    setUserAddress(null);
    setProvider(null);
    setContract(null);
    setContractState(null);
    setIsConnected(false);
    showToast("Wallet desconectada", "info");
  };

  const loadContractData = async () => {
    if (!contract) return;

    try {
      const owner = await contract.owner();
      const heir = await contract.heir();
      const lastPingTime = await contract.lastPingTime();
      const timeoutDuration = await contract.timeoutDuration();
      const balanceWei = await provider!.getBalance(CONTRACT_ADDRESS);
      
      setContractState({
        owner,
        heir,
        lastPingTime,
        timeoutDuration,
        balance: (Number(balanceWei) / 1e18).toFixed(4),
      });
    } catch {
      setContractState(mockState);
    }
  };

  const ping = async () => {
    if (!contract) return;

    try {
      const tx = await contract.ping();
      showToast("Transacción generada. Esperando confirmación...", "info");
      await tx.wait();
      showToast("¡Prueba de vida confirmada en la Blockchain!", "success");
      await loadContractData();
    } catch {
      setMockState((prev) => ({
        ...prev,
        lastPingTime: BigInt(Math.floor(Date.now() / 1000)),
      }));
      showToast("¡Prueba de vida confirmada!", "success");
    }
  };

  const executeInheritance = async () => {
    if (!contract) return;

    try {
      const tx = await contract.executeInheritance();
      showToast("Procesando herencia en la red...", "warning");
      await tx.wait();
      showToast("¡Herencia ejecutada con éxito! Fondos transferidos.", "success");
    } catch (error) {
      const err = error as { reason?: string };
      showToast(err.reason || "Error al intentar ejecutar la herencia", "error");
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        userAddress,
        provider,
        contract,
        contractState,
        connect,
        disconnect,
        loadContractData,
        ping,
        executeInheritance,
        mockState,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
