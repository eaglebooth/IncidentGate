import { studioDevnet } from "genlayer-js/chains";

export const studioNext = {
  ...studioDevnet,
  name: "GenLayer Studio Next",
  rpcUrls: {
    default: {
      http: [process.env.GENLAYER_RPC_URL?.trim() || "https://studio-next.genlayer.com/api"],
    },
  },
};
