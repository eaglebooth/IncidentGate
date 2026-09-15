# IncidentGate V9 — Studio Next deployment gate

This release must be deployed on **Studio Next** (`chainId=61997`, RPC `https://studio-next.genlayer.com/api`). Do not reuse the V8 addresses from Studionet `61999`; state and addresses do not migrate between the networks.

## Before deployment

- Contract handshake: `IncidentGate`, version `9`, schema `autonomous-incident-gate-v9-consensus-v06`.
- SDK: `genlayer-js@2.0.0-rc.1`.
- Transaction Kit: `@genlayer/transaction-kit@0.1.0-rc.2`.
- Every deployment and write must include the live quoted fee distribution and `feeValue`.
- A successful transaction must be finalized with execution result `FINISHED_WITH_RETURN`.

## User-owned deployment order

1. In Studio Next, deploy `contracts/guarded_target.py` with no constructor arguments. Record the target address and deployment transaction hash.
2. Deploy `contracts/incident_gate.py` with the fresh GuardedTarget address as its single constructor argument. Record the Gate address and deployment transaction hash.
3. On GuardedTarget, call `bind_incident_gate(fresh_gate_address)` once, from the GuardedTarget owner. Record the binding transaction hash.
4. Read `get_contract_version()` on the Gate and require the exact V9 handshake.
5. Read `get_stats()` on the Gate and require `guarded_target` to equal the fresh target address.
6. Read `get_target_info()` on GuardedTarget and require `incident_gate` to equal the fresh Gate address.

Current Studio Next deployment:

- IncidentGate V9: `0x65816369de04Bb5dfb366189f9967F8D13480CA8`
- GuardedTarget: `0x2503Be8a3004Df2E3a9B30f7A2920382Ee636a5b`
- Binding transaction: `0x6d8a06a901e926acb84b19af626e683a561f4c4133ed27bf468b32b43b8b17ca`

The constructor and binding checks have passed. The remaining release gate is the Studio Next fail-fast suite: failure paths, Coinbase path, Kraken path, cross-contract execution, and replay rejection.

## Evidence policy

All V9 transaction hashes must link to `https://explorer-studio-dev.genlayer.com/tx/<hash>`. Do not relabel historical chain `61999` evidence as Studio Next evidence. Until the V9 suite is complete, documentation must say “migration pending,” not “Studio Next verified.”
