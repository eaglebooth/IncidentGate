import { readFile } from "node:fs/promises";
import { createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";

const code = await readFile(new URL("../contracts/incident_gate.py", import.meta.url), "utf8");
const client = createClient({ chain: studioNext });

try {
  const schema = await client.getContractSchemaForCode(code);
  const methods = Object.keys(schema?.methods ?? schema ?? {});
  if (!methods.includes("get_contract_version") || !methods.includes("assess_intent")) {
    throw new Error("Studio Next returned a schema without required IncidentGate methods");
  }
  process.stdout.write(`Studio Next schema accepted IncidentGate V12 (${methods.length} methods).\n`);
} catch (error) {
  const message = error instanceof Error ? error.shortMessage || error.message : "Schema check failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
