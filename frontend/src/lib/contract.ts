import { BrowserProvider, Contract, formatEther } from "ethers";

export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CONTRACT_ABI = [
  "function ping() public",
  "function executeInheritance() public",
  "function owner() public view returns (address)",
  "function heir() public view returns (address)",
  "function lastPingTime() public view returns (uint256)",
  "function timeoutDuration() public view returns (uint256)",
];

export const MOCK_STATE = {
  owner: "0x1234567890abcdef1234567890abcdef12345678",
  heir: "0xabcdef1234567890abcdef1234567890abcdef12",
  lastPingTime: Math.floor(Date.now() / 1000) - 86400 * 25,
  timeoutDuration: 86400 * 30,
  balance: "1.5",
};

export async function getContract(provider: BrowserProvider, _signerAddress?: string) {
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function formatBalance(balanceWei: bigint): string {
  return `${formatEther(balanceWei)} ETH`;
}

export function formatCountdown(timeLeftMs: number): string {
  if (timeLeftMs <= 0) return "00:00:00:00";
  
  const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTimeoutDays(timeout: bigint): string {
  return `${Number(timeout) / 86400} Días`;
}
