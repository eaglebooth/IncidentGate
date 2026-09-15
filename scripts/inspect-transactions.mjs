import { createClient } from "genlayer-js";
import { studioNext } from "./network.mjs";

const hashes = process.argv.slice(2);
if (!hashes.length || hashes.some(hash => !/^0x[0-9a-fA-F]{64}$/.test(hash))) {
  throw new Error("Pass one or more transaction hashes");
}

const client = createClient({ chain: studioNext });
for (const hash of hashes) {
  const tx = await client.getTransaction({ hash });
  const consensus = tx?.consensus_data ?? {};
  const receipts = [
    ...(Array.isArray(consensus.leader_receipt) ? consensus.leader_receipt : []),
    ...(Array.isArray(consensus.validator_receipts) ? consensus.validator_receipts : []),
  ];
  const executions = receipts.map((receipt, index) => ({
    index,
    execution_result: receipt?.execution_result ?? "",
    result_status: receipt?.result?.status ?? "",
    stdout: receipt?.stdout ?? receipt?.result?.stdout ?? "",
    stderr: receipt?.stderr ?? receipt?.result?.stderr ?? receipt?.error_description ?? "",
    payload: receipt?.result?.payload ?? null,
  }));
  process.stdout.write(`${JSON.stringify({
    hash,
    status: tx?.statusName,
    consensus: tx?.resultName,
    from: tx?.from,
    to: tx?.to,
    type: tx?.type,
    data: tx?.data,
    input: tx?.input,
    decodedData: tx?.decodedData ?? tx?.decoded_data,
    executions,
  }, null, 2)}\n`);
  if (process.env.DEBUG_TRACE === "1") {
    try {
      const trace = await client.debugTraceTransaction({ hash });
      process.stdout.write(`TRACE ${JSON.stringify(trace, null, 2)}\n`);
    } catch (error) {
      process.stdout.write(`TRACE_UNAVAILABLE ${error instanceof Error ? error.message : "unknown error"}\n`);
    }
  }
}
