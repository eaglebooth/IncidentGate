import { createAccount, createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";
import { TransactionStatus } from "genlayer-js/types";

const gate = process.env.INCIDENTGATE_CONTRACT_ADDRESS?.trim();
const target = process.env.INCIDENTGATE_TARGET_ADDRESS?.trim();
if (!gate || !/^0x[0-9a-fA-F]{40}$/.test(gate)) throw new Error("Missing INCIDENTGATE_CONTRACT_ADDRESS");
if (!target || !/^0x[0-9a-fA-F]{40}$/.test(target)) throw new Error("Missing INCIDENTGATE_TARGET_ADDRESS");

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
if (!secret) throw new Error("Pass target-owner private key through stdin");
const account = createAccount(secret.startsWith("0x") ? secret : `0x${secret}`); secret = "";
const client = createClient({ chain: studioNext, account });
const args = [gate];
const estimate = await client.estimateTransactionFeesForWrite({ address: target, functionName: "bind_incident_gate", args });
const hash = await client.writeContract({ address: target, functionName: "bind_incident_gate", args, fees: { distribution: estimate.distribution, feeValue: estimate.feeValue } });
process.stdout.write(`owner: ${account.address}\nbind: ${hash}\n`);
const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 2000, retries: 300 });
process.stdout.write(`bind finalized: ${JSON.stringify(receipt)}\n`);
