import { transactionResultNumberToName } from "genlayer-js/types";

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};

export function finalizedFailure(transaction: Record<string, unknown>): string {
  if (transaction.statusName !== "FINALIZED") return "Transaction is not finalized.";
  const names: Readonly<Record<string, string>> = transactionResultNumberToName;
  const consensus = transaction.resultName ?? names[String(transaction.result)];
  if (consensus !== "AGREE" && consensus !== "MAJORITY_AGREE") return "Consensus did not approve this transaction.";
  const receipts = record(transaction.consensus_data).leader_receipt;
  const leader = record(Array.isArray(receipts) ? receipts[0] : undefined);
  const result = record(leader.result);
  if (result.status === "rollback") return `Contract rejected: ${String(result.payload ?? "ROLLBACK")}`;
  if (leader.execution_result !== "SUCCESS" || result.status !== "return") return "Finalized execution could not be verified.";
  return "";
}
