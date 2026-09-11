import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../docs/VERIFICATION.md", import.meta.url);
const source = await readFile(path, "utf8");
const linked = source.replace(
  /`(0x[0-9a-fA-F]{64})`/g,
  (_, hash) => "[`" + hash + "`](https://explorer-studio.genlayer.com/tx/" + hash + ")",
);
await writeFile(path, linked);
