import { createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";

const address = process.argv[2]?.trim();
if (!/^0x[0-9a-fA-F]{40}$/.test(address ?? "")) throw new Error("Pass a GuardedTarget address");

const client = createClient({ chain: studioNext });
const raw = await client.readContract({ address, functionName: "get_status", args: [] });
let value = typeof raw === "string" ? JSON.parse(raw) : raw;
if (value && typeof value === "object" && Object.keys(value).length === 1 && "result" in value) {
  value = value.result;
  if (typeof value === "string") value = JSON.parse(value);
}
process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
