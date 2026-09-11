import { createClient } from "genlayer-js";
import { localnet, studionet, testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { finalizedFailure } from "./finality";

type NetworkName = "localnet" | "studionet" | "testnetBradbury";
type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged", listener: (accounts: string[]) => void) => void;
  removeListener?: (event: "accountsChanged", listener: (accounts: string[]) => void) => void;
};
declare global { interface Window { ethereum?: EthereumProvider } }
const network = (process.env.NEXT_PUBLIC_NETWORK as NetworkName) || "studionet";
const chains = { localnet, studionet, testnetBradbury };
const reader = createClient({ chain: chains[network] ?? studionet });
type RuntimeClient = {
  connect?: (name: NetworkName) => Promise<unknown>;
  readContract: (args: { address: string; functionName: string; args: unknown[] }) => Promise<unknown>;
  writeContract: (args: { address: string; functionName: string; args: unknown[]; value: bigint }) => Promise<string | { txId: string }>;
  waitForTransactionReceipt: (args: { hash: `0x${string}`; status: string; interval?: number; retries?: number }) => Promise<Record<string, unknown>>;
  getTransaction: (args: { hash: `0x${string}` }) => Promise<Record<string, unknown>>;
};

export type ChainResult = { success: boolean; data?: unknown; hash?: string; error?: string };
export const networkName = network;
export const contractAddress = () => process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
export const targetAddress = () => process.env.NEXT_PUBLIC_TARGET_ADDRESS || "0x0000000000000000000000000000000000000000";
export const isConfigured = () => !/^0x0{40}$/i.test(contractAddress()) && !/^0x0{40}$/i.test(targetAddress());
export const explorerAddress = () => `${process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_BASE || "https://explorer-studio.genlayer.com/address/"}${contractAddress()}`;
export const explorerTargetAddress = () => `${process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_BASE || "https://explorer-studio.genlayer.com/address/"}${targetAddress()}`;
export const explorerTx = (hash: string) => `${process.env.NEXT_PUBLIC_EXPLORER_TX_BASE || "https://explorer-studio.genlayer.com/tx/"}${hash}`;

export async function connectWallet(): Promise<ChainResult> {
  if (!window.ethereum) return { success: false, error: "Install or unlock an EVM wallet." };
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
    return accounts[0] ? { success: true, data: accounts[0] } : { success: false, error: "No account selected." };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : "Wallet connection failed." }; }
}

export async function disconnectWallet(): Promise<ChainResult> {
  if (!window.ethereum) return { success: true };
  try {
    await window.ethereum.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
  } catch {
    // Not every EIP-1193 wallet supports permission revocation. The dApp still
    // clears its session; account switching remains controlled by the wallet.
  }
  return { success: true };
}

export async function connectedWallet(): Promise<string> {
  if (!window.ethereum) return "";
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
    return accounts[0] || "";
  } catch { return ""; }
}

export function watchWallet(listener: (address: string) => void): () => void {
  if (!window.ethereum?.on) return () => undefined;
  const onAccountsChanged = (accounts: string[]) => listener(accounts[0] || "");
  window.ethereum.on("accountsChanged", onAccountsChanged);
  return () => window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged);
}

export async function readContract(functionName: string, args: unknown[] = []): Promise<ChainResult> {
  if (!isConfigured()) return { success: false, error: "Contract deployment is not configured yet." };
  try { return { success: true, data: await (reader as unknown as RuntimeClient).readContract({ address: contractAddress(), functionName, args }) }; }
  catch (error) { return { success: false, error: error instanceof Error ? error.message : "Contract read failed." }; }
}

export async function writeContract(functionName: string, args: unknown[] = [], address: string = contractAddress()): Promise<ChainResult> {
  if (!isConfigured()) return { success: false, error: "Deploy IncidentGate and configure its address first." };
  if (!window.ethereum) return { success: false, error: "Connect a wallet before writing." };
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
    if (!accounts[0]) return { success: false, error: "No account selected." };
    const client = createClient({ chain: chains[network] ?? studionet, provider: window.ethereum, account: accounts[0] as `0x${string}` }) as unknown as RuntimeClient;
    if (client.connect) await client.connect(network);
    const raw = await client.writeContract({ address, functionName, args, value: BigInt(0) });
    const hash = typeof raw === "string" ? raw : raw.txId;
    if (!/^0x[0-9a-f]{64}$/i.test(hash)) throw new Error("No transaction hash returned.");
    await client.waitForTransactionReceipt({ hash: hash as `0x${string}`, status: TransactionStatus.FINALIZED, interval: 2000, retries: 600 });
    const tx = await client.getTransaction({ hash: hash as `0x${string}` });
    const failure = finalizedFailure(tx);
    return failure ? { success: false, hash, error: failure } : { success: true, hash };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : "Contract write failed." }; }
}

export function unwrap<T>(value: unknown): T | null {
  try {
    if (typeof value === "string") return unwrap<T>(JSON.parse(value));
    if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) return unwrap<T>((value as { result: unknown }).result);
    return value as T;
  } catch { return null; }
}
