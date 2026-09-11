import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus, transactionResultNumberToName } from "genlayer-js/types";

const contract = process.env.INCIDENTGATE_CONTRACT_ADDRESS?.trim();
const targetContract = process.env.INCIDENTGATE_TARGET_ADDRESS?.trim();
if (!contract || !/^0x[0-9a-fA-F]{40}$/.test(contract)) throw new Error("Missing INCIDENTGATE_CONTRACT_ADDRESS");
if (!targetContract || !/^0x[0-9a-fA-F]{40}$/.test(targetContract)) throw new Error("Missing INCIDENTGATE_TARGET_ADDRESS");

async function readSecrets(count) {
  if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(true);
  process.stdin.resume(); const values = []; let value = "";
  for await (const chunk of process.stdin) for (const character of String(chunk)) {
    if (character === "\r" || character === "\n") {
      if (value) { values.push(value.trim()); value = ""; if (values.length === count) { if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(false); return values; } }
    } else value += character;
  }
  return values;
}

const keys = await readSecrets(2);
if (keys.length !== 2) throw new Error("Pass owner and agent private keys as two stdin lines");
const ownerAccount = createAccount(keys[0].startsWith("0x") ? keys[0] : `0x${keys[0]}`);
const agentAccount = createAccount(keys[1].startsWith("0x") ? keys[1] : `0x${keys[1]}`);
keys.fill("");
if (ownerAccount.address.toLowerCase() === agentAccount.address.toLowerCase()) throw new Error("Owner and agent must differ");
const owner = createClient({ chain: studionet, account: ownerAccount });
const agent = createClient({ chain: studionet, account: agentAccount });

function failure(tx, receipt) {
  const leader = tx?.consensus_data?.leader_receipt?.[0];
  const execution = String(leader?.execution_result ?? "").toUpperCase();
  const resultStatus = String(leader?.result?.status ?? "").toUpperCase();
  const finalized = String(tx?.statusName ?? receipt?.statusName ?? "").toUpperCase();
  const consensus = String(tx?.resultName ?? transactionResultNumberToName?.[String(tx?.result)] ?? "").toUpperCase();
  if (execution && execution !== "SUCCESS") return String(leader?.result?.payload?.readable ?? leader?.result?.payload ?? leader?.error_description ?? execution);
  if (["ROLLBACK", "ERROR", "FAILED"].some(x => resultStatus.includes(x))) return String(leader?.result?.payload?.readable ?? leader?.result?.payload ?? resultStatus);
  if (finalized && finalized !== "FINALIZED") return `status ${finalized}`;
  if (consensus && !["AGREE", "MAJORITY_AGREE"].includes(consensus)) return `consensus ${consensus}`;
  return "";
}

async function retry(label, operation, attempts = 10) {
  let last;
  for (let index = 0; index < attempts; index++) {
    try { return await operation(); } catch (error) { last = error; process.stdout.write(`${label}: RPC retry ${index + 1}/${attempts}\n`); await new Promise(resolve => setTimeout(resolve, Math.min(index + 2, 8) * 1000)); }
  }
  throw last;
}

async function read(functionName, args = []) {
  const raw = await retry(`read.${functionName}`, () => owner.readContract({ address: contract, functionName, args }));
  let value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) {
    value = value.result; if (typeof value === "string") { try { return JSON.parse(value); } catch { return value; } }
  }
  return value;
}

async function readTarget(functionName, args = []) {
  const raw = await retry(`target.${functionName}`, () => owner.readContract({ address: targetContract, functionName, args }));
  let value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) value = typeof value.result === "string" ? JSON.parse(value.result) : value.result;
  return value;
}

async function finalized(client, hash) {
  const receipt = await retry("finality", () => client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 2000, retries: 180 }));
  let tx = receipt; try { tx = await retry("transaction", () => client.getTransaction({ hash })); } catch {}
  return { receipt, tx };
}

const transactions = [];
async function write(label, functionName, args, client, expectedError = "", address = contract) {
  const hash = await retry(`${label}.submit`, () => client.writeContract({ address, functionName, args, value: 0n }));
  transactions.push({ label, hash }); process.stdout.write(`${label}: ${hash}\n`);
  const { receipt, tx } = await finalized(client, hash); const rejected = failure(tx, receipt);
  if (expectedError) { if (!rejected.includes(expectedError)) throw new Error(`${label}: expected ${expectedError}, got ${rejected || "success"}`); process.stdout.write(`${label}: FINALIZED ROLLBACK ${expectedError}\n`); return hash; }
  if (rejected) throw new Error(`${label}: ${rejected}`);
  process.stdout.write(`${label}: FINALIZED\n`); return hash;
}

const version = await read("get_contract_version");
if (version.name !== "IncidentGate" || version.version !== 8 || version.schema !== "autonomous-incident-gate-v8-iso-offsets") throw new Error("Contract handshake failed");
const initialStats = await read("get_stats");
if (String(initialStats.guarded_target).toLowerCase() !== targetContract.toLowerCase()) throw new Error("IncidentGate constructor target mismatch");
const targetStatus = await readTarget("get_status");
if (String(targetStatus.incident_gate).toLowerCase() !== contract.toLowerCase()) throw new Error("GuardedTarget is not bound to this IncidentGate");
const tag = String(Date.now());
const coinbasePolicy = `coinbase-live-${tag}`;
const krakenPolicy = `kraken-live-${tag}`;
const coinbaseIntent = `coinbase-intent-${tag}`;
const krakenIntent = `kraken-intent-${tag}`;
const staleIntent = `stale-intent-${tag}`;
const destination = ownerAccount.address;
const waitUntilAssessmentReady = async (intentId) => {
  const state = await read("get_intent", [intentId]);
  const delayMs = Math.max(0, Number(state.assessment_not_before) * 1000 - Date.now() + 1500);
  if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
};

const resumeCoinbasePolicy = process.env.INCIDENTGATE_RESUME_COINBASE_POLICY?.trim();
if (resumeCoinbasePolicy) {
  const resumeExecutedIntent = process.env.INCIDENTGATE_RESUME_EXECUTED_INTENT?.trim();
  if (resumeExecutedIntent) {
    const executed = await read("get_intent", [resumeExecutedIntent]);
    if (executed.status !== "EXECUTED" || !executed.authorization_digest) throw new Error("Resume execution intent is not EXECUTED");
    await write("executed.replay", "execute_intent", [resumeExecutedIntent, executed.authorization_digest], agent, "AUTHORIZATION_NOT_ACTIVE");
  }
  const resumeStaleIntent = `stale-intent-${tag}`;
  await write("stale.create", "create_intent", [resumeStaleIntent, resumeCoinbasePolicy, 1000n, `stale-nonce-${tag}`], agent);
  await write("stale.schedule", "schedule_assessment", [resumeStaleIntent, 300], agent);
  await write("stale.rotate", "rotate_policy", [resumeCoinbasePolicy, true, 1000000n, 900], owner);
  await write("stale.assess", "assess_intent", [resumeStaleIntent], owner, "STALE_POLICY_REVISION");
  const resumeStats = await read("get_stats");
  process.stdout.write(`STALE_SUITE_COMPLETE ${JSON.stringify({ contract, policy: resumeCoinbasePolicy, intent: resumeStaleIntent, stats: resumeStats, transactions }, null, 2)}\n`);
  process.exit(0);
}

await write("coinbase.register", "register_policy", [coinbasePolicy, agentAccount.address, "COINBASE", "https://status.coinbase.com/api/v2/incidents/unresolved.json", "kr0djjh0jyy9", "Coinbase", destination, "PLATFORM_INTERNAL", "USDC", "BUY", 1000000n, 900], owner);
await write("coinbase.create", "create_intent", [coinbaseIntent, coinbasePolicy, 1000n, `coinbase-nonce-${tag}`], agent);
await write("coinbase.schedule", "schedule_assessment", [coinbaseIntent, 300], agent);
await waitUntilAssessmentReady(coinbaseIntent);
await write("coinbase.assess", "assess_intent", [coinbaseIntent], owner);
let coinbaseState = await read("get_intent", [coinbaseIntent]);
if (coinbaseState.status === "SOURCE_FAILURE") throw new Error(`V8 Coinbase regression failed: ${coinbaseState.reason}`);
if (coinbaseState.status === "AUTHORIZED") {
  await write("coinbase.mutatedDigest", "execute_intent", [coinbaseIntent, "0".repeat(64)], agent, "AUTHORIZATION_DIGEST_MISMATCH");
  await write("coinbase.queueExecution", "execute_intent", [coinbaseIntent, coinbaseState.authorization_digest], agent);
} else if (!["BLOCKED_INCIDENT", "BLOCKED_UNCERTAIN"].includes(coinbaseState.status)) throw new Error(`Unexpected Coinbase status ${coinbaseState.status}`);

await write("target.direct", "apply_authorized", [`direct-${tag}`, "0".repeat(64), "0".repeat(64), agentAccount.address, destination, "PLATFORM_INTERNAL", "USDC", "BUY", 1000n, 0, Math.floor(Date.now() / 1000) + 300], owner, "INCIDENT_GATE_ONLY", targetContract);
await write("wrongCaller.create", "create_intent", [`wrong-${tag}`, coinbasePolicy, 1000n, `wrong-nonce-${tag}`], owner, "AGENT_ONLY");
await write("kraken.register", "register_policy", [krakenPolicy, agentAccount.address, "KRAKEN", "https://status.kraken.com/api/v2/incidents/unresolved.json", "lfz25gyhcpjf", "Kraken", destination, "MOONBEAM", "GLMR", "WITHDRAW", 1000000n, 900], owner);

await write("kraken.create", "create_intent", [krakenIntent, krakenPolicy, 1000n, `kraken-nonce-${tag}`], agent);
await write("kraken.schedule", "schedule_assessment", [krakenIntent, 300], agent);
await waitUntilAssessmentReady(krakenIntent);
await write("kraken.assess", "assess_intent", [krakenIntent], owner);
const krakenState = await read("get_intent", [krakenIntent]);
if (!["AUTHORIZED", "BLOCKED_INCIDENT", "BLOCKED_UNCERTAIN", "SOURCE_FAILURE"].includes(krakenState.status)) throw new Error(`Unexpected Kraken status ${krakenState.status}`);

await write("stale.create", "create_intent", [staleIntent, coinbasePolicy, 1000n, `stale-nonce-${tag}`], agent);
await write("stale.schedule", "schedule_assessment", [staleIntent, 300], agent);
await write("stale.rotate", "rotate_policy", [coinbasePolicy, true, 1000000n, 900], owner);
await write("stale.assess", "assess_intent", [staleIntent], owner, "STALE_POLICY_REVISION");

coinbaseState = await read("get_intent", [coinbaseIntent]);
const finalKraken = await read("get_intent", [krakenIntent]);
const stats = await read("get_stats");
let targetReceipt = { exists: false };
if (coinbaseState.authorization_digest) {
  for (let attempt = 0; attempt < 20 && !targetReceipt.exists; attempt++) {
    targetReceipt = await readTarget("get_receipt", [coinbaseIntent]);
    if (!targetReceipt.exists) await new Promise(resolve => setTimeout(resolve, 3000));
  }
  if (!targetReceipt.exists || targetReceipt.operation_digest !== coinbaseState.operation_digest) throw new Error("Finalized GuardedTarget receipt missing or mismatched");
  for (let attempt = 0; attempt < 20 && coinbaseState.status !== "EXECUTED"; attempt++) {
    coinbaseState = await read("get_intent", [coinbaseIntent]);
    if (coinbaseState.status !== "EXECUTED") await new Promise(resolve => setTimeout(resolve, 3000));
  }
  if (coinbaseState.status !== "EXECUTED") throw new Error("GuardedTarget confirmation did not finalize on IncidentGate");
  await write("coinbase.replay", "execute_intent", [coinbaseIntent, coinbaseState.authorization_digest], agent, "AUTHORIZATION_NOT_ACTIVE");
}
process.stdout.write(`LIVE_SUITE_COMPLETE ${JSON.stringify({ contract, targetContract, network: "studionet", owner: ownerAccount.address, agent: agentAccount.address, policies: { coinbasePolicy, krakenPolicy }, states: { coinbase: coinbaseState, kraken: finalKraken }, targetReceipt, stats, transactions }, null, 2)}\n`);
