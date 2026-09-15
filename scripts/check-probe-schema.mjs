import { readFile } from "node:fs/promises";
import { createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";

const code = await readFile(new URL("../contracts/studio_next_probe.py", import.meta.url), "utf8");
const client = createClient({ chain: studioNext });
try {
  const schema = await client.getContractSchemaForCode(code);
  process.stdout.write(`${JSON.stringify(schema, null, 2)}\n`);
} catch (error) {
  const message = error instanceof Error ? error.shortMessage || error.message : "Schema check failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
