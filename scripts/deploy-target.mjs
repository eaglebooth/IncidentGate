import { readFile } from "node:fs/promises";
import { createAccount, createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
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
const account = createAccount(secret.startsWith("0x") ? secret : `0x${secret}`); secret = "";
const client = createClient({ chain: studioDevnet, account });
const code = await readFile(new URL("../contracts/guarded_target.py", import.meta.url), "utf8");
const estimate = await client.estimateTransactionFees();
const hash = await client.deployContract({ code, args: [], fees: { distribution: estimate.distribution, feeValue: estimate.feeValue } });
process.stdout.write(`deployer: ${account.address}\ndeploy target: ${hash}\n`);
const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 2000, retries: 300 });
process.stdout.write(`target deploy finalized: ${JSON.stringify(receipt)}\n`);
