import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const gate = process.env.INCIDENTGATE_CONTRACT_ADDRESS?.trim();
const target = process.env.INCIDENTGATE_TARGET_ADDRESS?.trim();
if (!/^0x[0-9a-fA-F]{40}$/.test(gate ?? "")) throw new Error("Missing INCIDENTGATE_CONTRACT_ADDRESS");
if (!/^0x[0-9a-fA-F]{40}$/.test(target ?? "")) throw new Error("Missing INCIDENTGATE_TARGET_ADDRESS");

const client = createClient({ chain: studioDevnet });

async function read(address, functionName) {
  const raw = await client.readContract({ address, functionName, args: [] });
  let value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) {
    value = value.result;
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch {}
    }
  }
  return value;
}

const [targetStatus, gateStats] = await Promise.all([
  read(target, "get_status"),
  read(gate, "get_stats"),
]);

process.stdout.write(`${JSON.stringify({ targetStatus, gateStats }, null, 2)}\n`);
