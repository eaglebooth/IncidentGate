import { createAccount, createClient } from "genlayer-js";
import { transactionResultNumberToName } from "genlayer-js/types";
import { studioNext } from "./network.mjs";

const contract = process.env.INCIDENTGATE_CONTRACT_ADDRESS?.trim();
if (!contract || !/^0x[0-9a-fA-F]{40}$/.test(contract)) throw new Error("Missing INCIDENTGATE_CONTRACT_ADDRESS");
const expectedPolicyOwner = "0xeb57bc7125fa60d7482ce12058397369ab3581f8";
const expectedAgent = "0x2da5393d7bbb9a037dc3abb56dbbc5c150fc843f";

const unwrap = raw => {
  let value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) value = value.result;
  if (typeof value === "string") { try { return JSON.parse(value); } catch { return value; } }
  return value;
};

async function readSecrets() {
  if (process.stdin.isTTY && process.stdin.setRawMode) process.stdin.setRawMode(true);
  process.stdin.resume(); const values = []; let value = "";
  process.stdout.write("Private key 1 (64 hex characters), then Enter: ");
  for await (const chunk of process.stdin) for (const character of String(chunk)) {
    if (character === "\r" || character === "\n") {
      if (value) {
        const matches = value.match(/[0-9a-fA-F]{64}/g) || [];
        if (!matches.length) throw new Error("Private key input did not contain exactly 64 hex characters");
        values.push(matches[matches.length - 1]); value = "";
        if (values.length === 1) process.stdout.write("\nPrivate key 2 (64 hex characters), then Enter: ");
        if (values.length === 2) { process.stdout.write("\n"); return values; }
      }
    } else value += character;
  }
  return values;
}

const secrets = await readSecrets();
if (secrets.length !== 2) throw new Error("Pass owner and agent private keys as two stdin lines");
const accounts = secrets.map(secret => createAccount(`0x${secret}`));
secrets.fill("");
const publicClient = createClient({ chain: studioNext });
const initialVersion = unwrap(await publicClient.readContract({ address: contract, functionName: "get_contract_version", args: [] }));
if (initialVersion.version !== 12 || initialVersion.schema !== "autonomous-incident-gate-v12-atomic-sdk-v03") throw new Error("V12 handshake failed");
const ownerIndex = accounts.findIndex(account => account.address.toLowerCase() === expectedPolicyOwner);
const agentIndex = accounts.findIndex(account => account.address.toLowerCase() === expectedAgent);
if (ownerIndex < 0 || agentIndex < 0) throw new Error("The supplied keys do not match the reviewed policy-owner and treasury-agent wallets");
const ownerAccount = accounts[ownerIndex];
const agentAccount = accounts[agentIndex];
if (ownerAccount.address.toLowerCase() === agentAccount.address.toLowerCase()) throw new Error("Owner and agent must differ");
const owner = createClient({ chain: studioNext, account: ownerAccount });
const agent = createClient({ chain: studioNext, account: agentAccount });

const read = async (name, args = []) => unwrap(await owner.readContract({ address: contract, functionName: name, args }));

function rejection(tx, receipt) {
  const leader = tx?.consensus_data?.leader_receipt?.[0];
  const execution = String(leader?.execution_result ?? "").toUpperCase();
  const resultStatus = String(leader?.result?.status ?? "").toUpperCase();
  const finalized = String(tx?.statusName ?? receipt?.statusName ?? "").toUpperCase();
  const consensus = String(tx?.resultName ?? transactionResultNumberToName?.[String(tx?.result)] ?? "").toUpperCase();
  if (execution && execution !== "SUCCESS") return String(leader?.result?.payload?.readable ?? leader?.result?.payload ?? execution);
  if (["ROLLBACK", "ERROR", "FAILED"].some(item => resultStatus.includes(item))) return String(leader?.result?.payload?.readable ?? leader?.result?.payload ?? resultStatus);
  if (finalized && finalized !== "FINALIZED") return `status ${finalized}`;
  if (consensus && !["AGREE", "MAJORITY_AGREE"].includes(consensus)) return `consensus ${consensus}`;
  return "";
}

const transactions = [];
async function write(label, name, args, client, expected = "") {
  let estimate;
  try { estimate = await client.estimateTransactionFeesForWrite({ address: contract, functionName: name, args, value: 0n }); }
  catch { estimate = await client.estimateTransactionFees({ leaderTimeunitsAllocation: 600, validatorTimeunitsAllocation: 600 }); }
  const hash = await client.writeContract({ address: contract, functionName: name, args, value: 0n,
    fees: { distribution: estimate.distribution, feeValue: estimate.feeValue } });
  transactions.push({ label, hash });
  process.stdout.write(`${label}: ${hash}\n`);
  const receipt = await client.waitForTransactionReceipt({ hash, waitUntil: "finalized", interval: 2000, retries: 240 });
  let tx = receipt; try { tx = await client.getTransaction({ hash }); } catch {}
  const failed = rejection(tx, receipt);
  if (expected) {
    if (!failed.includes(expected)) throw new Error(`${label}: expected ${expected}, got ${failed || "success"}`);
    process.stdout.write(`${label}: FINALIZED ROLLBACK ${expected}\n`); return;
  }
  if (failed) throw new Error(`${label}: ${failed}`);
  process.stdout.write(`${label}: FINALIZED\n`);
}

const tag = String(Date.now());
const policy = `cb-v12-${tag}`;
const stale = `stale-v12-${tag}`;
const coinbase = `coinbase-v12-${tag}`;
const krakenPolicy = `kr-v12-${tag}`;
const kraken = `kraken-v12-${tag}`;

await write("setup.coinbasePolicy", "register_policy", [policy, agentAccount.address, "COINBASE", "https://status.coinbase.com/api/v2/incidents/unresolved.json", "kr0djjh0jyy9", "Coinbase", ownerAccount.address, "PLATFORM_INTERNAL", "USDC", "BUY", 1000000n, 900], owner);

// Failure paths first.
await write("failure.wrongCaller", "create_intent", [`wrong-${tag}`, policy, 1n, `wrong-${tag}`], owner, "AGENT_ONLY");
await write("failure.staleCreate", "create_intent", [stale, policy, 1n, `stale-${tag}`], agent);
await write("failure.staleSchedule", "schedule_assessment", [stale, 300], agent);
await write("failure.rotate", "rotate_policy", [policy, true, 1000000n, 900], owner);
await write("failure.staleAssess", "assess_intent", [stale], owner, "STALE_POLICY_REVISION");

async function assessFlow(intentId, policyId, nonce, clientLabel) {
  await write(`${clientLabel}.create`, "create_intent", [intentId, policyId, 1000n, nonce], agent);
  await write(`${clientLabel}.schedule`, "schedule_assessment", [intentId, 300], agent);
  const scheduled = await read("get_intent", [intentId]);
  const waitMs = Math.max(0, Number(scheduled.assessment_not_before) * 1000 - Date.now() + 1500);
  if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
  await write(`${clientLabel}.assess`, "assess_intent", [intentId], owner);
  return read("get_intent", [intentId]);
}

let coinbaseState = await assessFlow(coinbase, policy, `cb-${tag}`, "coinbase");
if (coinbaseState.status === "AUTHORIZED") {
  await write("failure.badDigest", "execute_intent", [coinbase, "0".repeat(64)], agent, "AUTHORIZATION_DIGEST_MISMATCH");
  await write("coinbase.execute", "execute_intent", [coinbase, coinbaseState.authorization_digest], agent);
  coinbaseState = await read("get_intent", [coinbase]);
  const receipt = await read("get_execution_receipt", [coinbase]);
  if (coinbaseState.status !== "EXECUTED" || !coinbaseState.consumed || !receipt.exists) throw new Error("Atomic receipt invariant failed");
  await write("failure.replay", "execute_intent", [coinbase, coinbaseState.authorization_digest], agent, "AUTHORIZATION_NOT_ACTIVE");
} else if (!["BLOCKED_INCIDENT", "BLOCKED_UNCERTAIN", "SOURCE_FAILURE"].includes(coinbaseState.status)) throw new Error(`Unexpected Coinbase state ${coinbaseState.status}`);

await write("setup.krakenPolicy", "register_policy", [krakenPolicy, agentAccount.address, "KRAKEN", "https://status.kraken.com/api/v2/incidents/unresolved.json", "lfz25gyhcpjf", "Kraken", ownerAccount.address, "MOONBEAM", "GLMR", "WITHDRAW", 1000000n, 900], owner);
const krakenState = await assessFlow(kraken, krakenPolicy, `kr-${tag}`, "kraken");
if (!["AUTHORIZED", "BLOCKED_INCIDENT", "BLOCKED_UNCERTAIN", "SOURCE_FAILURE"].includes(krakenState.status)) throw new Error(`Unexpected Kraken state ${krakenState.status}`);

const stats = await read("get_stats");
process.stdout.write(`LIVE_V12_COMPLETE ${JSON.stringify({ contract, states: { coinbase: coinbaseState, kraken: krakenState }, stats, transactions }, null, 2)}\n`);
