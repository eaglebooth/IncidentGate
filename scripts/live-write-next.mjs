import { createAccount, createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";

async function secret() {
  if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(true);
  process.stdin.resume();
  let value = "";
  for await (const chunk of process.stdin) for (const character of String(chunk)) {
    if ((character === "\r" || character === "\n") && value) return value.trim();
    if (character !== "\r" && character !== "\n") value += character;
  }
  return value.trim();
}

const address = process.env.LIVE_ADDRESS;
const functionName = process.env.LIVE_FUNCTION;
const args = JSON.parse(process.env.LIVE_ARGS || "[]");
let key = await secret();
const account = createAccount(key.startsWith("0x") ? key : `0x${key}`);
key = "";
const client = createClient({ chain: studioNext, account });
let estimate;
try {
  estimate = await client.estimateTransactionFeesForWrite({ address, functionName, args, value: 0n });
} catch (error) {
  const payload = error?.cause?.data?.receipt?.result;
  const readable = typeof payload === "string"
    ? Buffer.from(payload, "base64").toString("utf8")
    : "simulation failed";
  process.stdout.write(`Preflight ${readable}; using the network fee preset for the real transaction.\n`);
  estimate = await client.estimateTransactionFees({
    leaderTimeunitsAllocation: 600,
    validatorTimeunitsAllocation: 600,
  });
}
const hash = await client.writeContract({ address, functionName, args, value: 0n, fees: { distribution: estimate.distribution, feeValue: estimate.feeValue } });
console.log(hash);
await client.waitForTransactionReceipt({ hash, waitUntil: "finalized", interval: 2000, retries: 180 });
const tx = await client.getTransaction({ hash });
const leader = tx?.consensus_data?.leader_receipt?.[0];
console.log(JSON.stringify({ hash, status: tx?.statusName, execution: leader?.execution_result, result: leader?.result }, null, 2));
