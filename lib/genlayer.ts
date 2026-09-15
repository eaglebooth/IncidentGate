import { createTransactionKit, type SubmitInput } from "@genlayer/transaction-kit";
import { GENLAYER_CHAIN, GENLAYER_NETWORK_NAME, GENLAYER_WALLET_NETWORK } from "./network";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged", listener: (accounts: string[]) => void) => void;
  removeListener?: (event: "accountsChanged", listener: (accounts: string[]) => void) => void;
};
declare global { interface Window { ethereum?: EthereumProvider } }

export type ChainResult = { success: boolean; data?: unknown; hash?: string; error?: string };
export const networkName = GENLAYER_NETWORK_NAME;
export const contractAddress = () => process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
export const targetAddress = () => process.env.NEXT_PUBLIC_TARGET_ADDRESS || "0x0000000000000000000000000000000000000000";
export const isConfigured = () => !/^0x0{40}$/i.test(contractAddress()) && !/^0x0{40}$/i.test(targetAddress());
export const explorerAddress = () => `${process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_BASE || "https://explorer-studio-dev.genlayer.com/address/"}${contractAddress()}`;
export const explorerTargetAddress = () => `${process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_BASE || "https://explorer-studio-dev.genlayer.com/address/"}${targetAddress()}`;
export const explorerTx = (hash: string) => `${process.env.NEXT_PUBLIC_EXPLORER_TX_BASE || "https://explorer-studio-dev.genlayer.com/tx/"}${hash}`;

async function ensureStudioNext(provider: EthereumProvider): Promise<void> {
  const expected = GENLAYER_WALLET_NETWORK.chainId.toLowerCase();
  const current = String(await provider.request({ method: "eth_chainId" })).toLowerCase();
  if (current === expected) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: GENLAYER_WALLET_NETWORK.chainId }] });
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 4902) throw error;
    await provider.request({ method: "wallet_addEthereumChain", params: [GENLAYER_WALLET_NETWORK] });
  }
}

export async function connectWallet(): Promise<ChainResult> {
  if (!window.ethereum) return { success: false, error: "Install or unlock an EVM wallet." };
  try {
    await ensureStudioNext(window.ethereum);
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
  try {
    const query = new URLSearchParams({ method: functionName });
    if (args.length) query.set("id", String(args[0]));
    const response = await fetch(`/api/state?${query}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
    return await response.json() as ChainResult;
  }
  catch (error) { return { success: false, error: error instanceof Error ? error.message : "Contract read failed." }; }
}

export async function writeContract(functionName: string, args: unknown[] = [], address: string = contractAddress()): Promise<ChainResult> {
  if (!isConfigured()) return { success: false, error: "Deploy IncidentGate and configure its address first." };
  if (!window.ethereum) return { success: false, error: "Connect a wallet before writing." };
  try {
    await ensureStudioNext(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
    if (!accounts[0]) return { success: false, error: "No account selected." };
    const kit = createTransactionKit({ chain: GENLAYER_CHAIN, provider: window.ethereum, account: accounts[0] as `0x${string}` });
    const tx: SubmitInput = { kind: "write", address: address as `0x${string}`, method: functionName, args };
    const quote = await kit.estimate({ preset: "standard" }, tx);
    if (quote.verification.status === "mismatch") throw new Error("Fee policy changed while quoting. Refresh and try again.");
    if (quote.verification.status === "unavailable" && !quote.gasless) throw new Error("Live Studio Next fee policy could not be verified.");
    const submitted = await kit.submit(quote, tx);
    const final = await kit.track(submitted.genlayerTxId, () => undefined, { until: "finalized" });
    if (final.successful !== true || final.executionResultName !== "FINISHED_WITH_RETURN") {
      return { success: false, hash: submitted.genlayerTxId, error: `Transaction finalized without a successful contract return (${final.executionResultName || final.statusName || "unknown"}).` };
    }
    return { success: true, hash: submitted.genlayerTxId };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : "Contract write failed." }; }
}

export function unwrap<T>(value: unknown): T | null {
  try {
    if (typeof value === "string") return unwrap<T>(JSON.parse(value));
    if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) return unwrap<T>((value as { result: unknown }).result);
    return value as T;
  } catch { return null; }
}
