import { studioDevnet } from "genlayer-js/chains";

const rpcUrl = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio-next.genlayer.com/api";
const chainId = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || studioDevnet.id);
const chainName = process.env.NEXT_PUBLIC_GENLAYER_CHAIN_NAME || "GenLayer Studio Next";
const symbol = process.env.NEXT_PUBLIC_GENLAYER_SYMBOL || "GEN";

if (!Number.isSafeInteger(chainId) || chainId <= 0) {
  throw new Error("NEXT_PUBLIC_GENLAYER_CHAIN_ID must be a positive integer.");
}

export const GENLAYER_CHAIN = {
  ...studioDevnet,
  id: chainId,
  name: chainName,
  nativeCurrency: { name: symbol, symbol, decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
} satisfies typeof studioDevnet;

export const GENLAYER_WALLET_NETWORK = {
  chainId: `0x${chainId.toString(16).toUpperCase()}`,
  chainName,
  nativeCurrency: GENLAYER_CHAIN.nativeCurrency,
  rpcUrls: [rpcUrl],
  blockExplorerUrls: ["https://explorer-studio-dev.genlayer.com/"],
};

export const GENLAYER_NETWORK_NAME = "studioDevnet";
