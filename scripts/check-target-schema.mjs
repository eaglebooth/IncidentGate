import { readFile } from "node:fs/promises";
import { createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";

const code = await readFile(new URL("../contracts/guarded_target.py", import.meta.url), "utf8");
const client = createClient({ chain: studioNext });
try {
  const schema = await client.getContractSchemaForCode(code);
  const methods = Object.keys(schema?.methods ?? schema ?? {});
  for (const required of ["bind_incident_gate", "apply_authorized", "get_status"]) {
    if (!methods.includes(required)) throw new Error(`Missing GuardedTarget method: ${required}`);
  }
  process.stdout.write(`Studio Next schema accepted GuardedTarget (${methods.length} methods).\n`);
} catch (error) {
  const message = error instanceof Error ? error.shortMessage || error.message : "Schema check failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
