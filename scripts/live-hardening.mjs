import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus, transactionResultNumberToName } from "genlayer-js/types";

const contract = process.env.INCIDENTGATE_CONTRACT_ADDRESS?.trim();
if (!contract || !/^0x[0-9a-fA-F]{40}$/.test(contract)) throw new Error("Missing INCIDENTGATE_CONTRACT_ADDRESS");

async function readSecrets() {
  if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(true);
  process.stdin.resume(); const values = []; let value = "";
  for await (const chunk of process.stdin) for (const character of String(chunk)) {
    if (character === "\r" || character === "\n") {
      if (value) { values.push(value.trim()); value = ""; if (values.length === 2) { if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(false); return values; } }
    } else value += character;
  }
  return values;
}

const keys = await readSecrets();
if (keys.length !== 2) throw new Error("Pass policy-owner and agent keys as two stdin lines");
const ownerAccount = createAccount(keys[0].startsWith("0x") ? keys[0] : `0x${keys[0]}`);
const agentAccount = createAccount(keys[1].startsWith("0x") ? keys[1] : `0x${keys[1]}`);
keys.fill("");
const owner = createClient({ chain: studionet, account: ownerAccount });
const agent = createClient({ chain: studionet, account: agentAccount });

function failure(tx, receipt) {
  const leader = tx?.consensus_data?.leader_receipt?.[0];
  const execution = String(leader?.execution_result ?? "").toUpperCase();
  const resultStatus = String(leader?.result?.status ?? "").toUpperCase();
  const finalized = String(tx?.statusName ?? receipt?.statusName ?? "").toUpperCase();
  const consensus = String(tx?.resultName ?? transactionResultNumberToName?.[String(tx?.result)] ?? "").toUpperCase();
  if (execution && execution !== "SUCCESS") return String(leader?.result?.payload?.readable ?? leader?.result?.payload ?? execution);
  if (["ROLLBACK", "ERROR", "FAILED"].some(value => resultStatus.includes(value))) return String(leader?.result?.payload?.readable ?? leader?.result?.payload ?? resultStatus);
  if (finalized && finalized !== "FINALIZED") return `status ${finalized}`;
  if (consensus && !["AGREE", "MAJORITY_AGREE"].includes(consensus)) return `consensus ${consensus}`;
  return "";
}

async function read(functionName, args = []) {
  let value = await owner.readContract({ address: contract, functionName, args });
  if (typeof value === "string") value = JSON.parse(value);
  if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) value = typeof value.result === "string" ? JSON.parse(value.result) : value.result;
  return value;
}

const transactions = [];
async function write(label, functionName, args, client, expectedError = "") {
  const hash = await client.writeContract({ address: contract, functionName, args, value: 0n });
  transactions.push({ label, hash }); process.stdout.write(`${label}: ${hash}\n`);
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 2000, retries: 180 });
  let tx = receipt; try { tx = await client.getTransaction({ hash }); } catch {}
  const rejected = failure(tx, receipt);
  if (expectedError) {
    if (!rejected.includes(expectedError)) throw new Error(`${label}: expected ${expectedError}, got ${rejected || "success"}`);
    process.stdout.write(`${label}: FINALIZED ROLLBACK ${expectedError}\n`); return hash;
  }
  if (rejected) throw new Error(`${label}: ${rejected}`);
  process.stdout.write(`${label}: FINALIZED\n`); return hash;
}

const version = await read("get_contract_version");
if (version.version !== 8 || version.schema !== "autonomous-incident-gate-v8-iso-offsets") throw new Error("V8 handshake failed");
const tag = String(Date.now());
const destination = ownerAccount.address;
await write("catalog.reject", "register_policy", [`bad-${tag}`, agentAccount.address, "COINBASE", "https://status.coinbase.com/api/v2/incidents/unresolved.json", "kr0djjh0jyy9", "Coinbase", destination, "ETHEREUM", "USDC", "BUY", 1000000n, 30], owner, "UNSUPPORTED_OPERATION_PROFILE");

const policy = `expiry-${tag}`; const intent = `expiry-intent-${tag}`; const nonce = `expiry-nonce-${tag}`;
await write("expiry.register", "register_policy", [policy, agentAccount.address, "KRAKEN", "https://status.kraken.com/api/v2/incidents/unresolved.json", "lfz25gyhcpjf", "Kraken", destination, "MOONBEAM", "GLMR", "WITHDRAW", 1000000n, 30], owner);
await write("expiry.create", "create_intent", [intent, policy, 1000n, nonce], agent);
await write("nonce.replay", "create_intent", [`nonce-replay-${tag}`, policy, 1000n, nonce], agent, "NONCE_ALREADY_USED");
await write("expiry.schedule", "schedule_assessment", [intent, 120], agent);
let state = await read("get_intent", [intent]);
const assessmentWait = Math.max(0, Number(state.assessment_not_before) * 1000 - Date.now() + 1500);
if (assessmentWait) await new Promise(resolve => setTimeout(resolve, assessmentWait));
await write("expiry.assess", "assess_intent", [intent], owner);
state = await read("get_intent", [intent]);
if (state.status !== "AUTHORIZED") throw new Error(`Expiry precondition not authorized: ${state.status} ${state.reason}`);
const expiryWait = Math.max(0, Number(state.expires_at) * 1000 - Date.now() + 1500);
if (expiryWait) await new Promise(resolve => setTimeout(resolve, expiryWait));
await write("expiry.execute", "execute_intent", [intent, state.authorization_digest], agent, "AUTHORIZATION_NOT_ACTIVE");
process.stdout.write(`LIVE_HARDENING_COMPLETE ${JSON.stringify({ contract, policy, intent, state: await read("get_intent", [intent]), transactions }, null, 2)}\n`);
