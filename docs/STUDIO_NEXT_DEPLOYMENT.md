# IncidentGate V12 — Studio Next deployment gate

Deploy on **Studio Next** (`chainId=61997`, RPC `https://studio-next.genlayer.com/api`). Older V8–V11 addresses are historical evidence and are not V12.

## Before deployment

- Handshake: `IncidentGate`, version `12`, schema `autonomous-incident-gate-v12-atomic-sdk-v03`.
- SDK: `genlayer-js@2.0.0-rc.1`.
- Transaction Kit: `@genlayer/transaction-kit@0.1.0-rc.2`.
- Local result: 81 tests pass; lint and production build pass.
- Studio Next accepted the source schema with 13 methods.

## User-owned deployment

1. Open Studio Next and deploy `contracts/incident_gate.py` with **no constructor arguments**.
2. Record the contract address and deployment transaction hash.
3. Call `get_contract_version()` and require the exact V12 handshake above.
4. Call `get_stats()` and require `policies=0`, `intents=0`, `executions=0`, `paused=False`.
5. Put the new address in `NEXT_PUBLIC_CONTRACT_ADDRESS`. V12 has no `NEXT_PUBLIC_TARGET_ADDRESS`.
6. Run the failure-first live suite, then Coinbase and Kraken happy paths. The published V12 deployment and completed run are recorded in [`V12_E2E_EVIDENCE.md`](V12_E2E_EVIDENCE.md).

There is no GuardedTarget deployment, binding transaction or internal-message fee allocation in V12. Authorization consumption, receipt storage and route-volume accounting occur atomically inside IncidentGate.

## Evidence policy

Every V12 transaction hash must link to `https://explorer-studio-dev.genlayer.com/tx/<hash>`. Do not relabel V8–V11 transactions as V12 evidence. The suite completed with `LIVE_V12_COMPLETE`; current claims must remain limited to the exact outcomes in the linked evidence ledger.
