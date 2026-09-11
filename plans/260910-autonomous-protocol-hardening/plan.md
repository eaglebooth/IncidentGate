# IncidentGate autonomous protocol hardening

Status: Phase 01 complete; Phase 02 async redesign passes local gates and awaits ordered StudioNet deployment; Phase 03 pending.

## Objective

Turn IncidentGate from a semantic authorization registry into an enforced Autonomous Protocol: authoritative incident evidence controls whether an exact target call can execute.

## Non-negotiable invariants

- Only audited Coinbase/Kraken adapters; no user-selected evidence URL.
- Storage values are copied into plain calldata-safe snapshots before nondeterministic execution.
- AI decides only incident applicability; deterministic code owns identity, schema, freshness, call binding, expiry and replay.
- Uncertain, malformed, unavailable, stale, or disputed evidence never authorizes execution.
- Authorization binds target, selector, calldata hash, value, chain, token, amount, recipient, policy revision and nonce.
- The beneficiary cannot directly invoke assessment or bypass the guarded executor.
- No redirect-destination claim until GenVM exposes a supported primitive.
- Failed consensus does not become an authorization. Non-finalized attempts cannot be counted on-chain; documentation must state this protocol limitation.

## Releases

1. [Phase 01 — V5 assessment boundary](phase-01-v5-assessment-boundary.md)
2. [Phase 02 — V6 guarded execution](phase-02-v6-guarded-execution.md)
3. [Phase 03 — adversarial verification and submission](phase-03-verification-submission.md)

## Deployment gates

- Deploy V5 only after contract unit tests, GenVM validation and adversarial review pass.
- Deploy V6 only after GatedExecutor tests prove exact-call binding and bypass resistance.
- Frontend switches only to the final warning-free deployment.
- Every live claim requires transaction hash plus authoritative post-state readback.

## Architecture decision

V5 separates roles: policy owner configures; beneficiary requests; independent assessor executes the scheduled assessment; executor consumes the resulting capability. This removes beneficiary-controlled consensus shopping. A failed-consensus transaction cannot mutate state, so absolute one-attempt enforcement is impossible at contract level; cooldown, a short assessment window, assessor separation, and network transaction cost provide bounded mitigation.

V6 makes IncidentGate materially autonomous by placing a pinned target on the critical path. A successful verdict alone is insufficient: the agent queues an exact finalized message, the target applies it idempotently, and a confirmation message consumes the capability. Cross-contract atomicity is not claimed.

## Out of scope

- Pausing Coinbase or Kraken themselves.
- Claiming Statuspage proves absence of undisclosed incidents.
- Arbitrary adapters or arbitrary URLs.
- Custody of production funds before an independent audit.

## Completion

- V5 and V6 source, tests, ABI/frontend integration and threat model complete.
- Warning-free StudioNet receipts for leader and validators.
- Coinbase and Kraken live paths plus block, uncertainty, replay, mutation, expiry and stale-policy evidence.
- Honest README: demonstrated capabilities separated from limitations.
