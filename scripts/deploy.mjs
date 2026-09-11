import { readFile } from "node:fs/promises";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

async function readSecret() {
  if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(true);
  process.stdin.resume(); let value = "";
  for await (const chunk of process.stdin) for (const character of String(chunk)) {
    if (character === "\r" || character === "\n") {
      if (value) { if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(false); return value.trim(); }
    } else value += character;
  }
  return value.trim();
}

let secret = await readSecret();
if (!secret) throw new Error("Pass deployer private key through stdin");
const account = createAccount(secret.startsWith("0x") ? secret : `0x${secret}`);
secret = "";
const client = createClient({ chain: studionet, account });
const target = process.env.INCIDENTGATE_TARGET_ADDRESS?.trim();
if (!target || !/^0x[0-9a-fA-F]{40}$/.test(target)) throw new Error("Missing INCIDENTGATE_TARGET_ADDRESS");
const code = await readFile(new URL("../contracts/incident_gate.py", import.meta.url), "utf8");
const hash = await client.deployContract({ code, args: [target] });
process.stdout.write(`deployer: ${account.address}\ndeploy: ${hash}\n`);
const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 2000, retries: 300 });
process.stdout.write(`deploy finalized: ${JSON.stringify(receipt)}\n`);
