# Phase 01 — V5 assessment boundary

Priority: critical  
Status: complete — StudioNet lifecycle and clean assessment stderr verified

## Requirements

- Extend `Intent` with requester, assessor, target-call digest, schedule time, assessment deadline and assessment round.
- Add `schedule_assessment` as a deterministic transaction. It locks immutable operation fields and a short assessment window.
- Permit `assess_intent` only from the policy's independent assessor, never the beneficiary/agent.
- Require `ASSESSMENT_SCHEDULED`, matching policy revision and current time inside the locked window.
- Snapshot every storage-backed field before `run_nondet_unsafe`; closure captures only strings, integers, booleans, lists and dictionaries.
- Deterministically order incident updates and validate IDs, timestamps, lifecycle and bounds before prompting.
- Distinguish `BLOCKED_INCIDENT`, `BLOCKED_UNCERTAIN`, `SOURCE_FAILURE`, `AUTHORIZED`, `EXPIRED`. Evidence changes between validators reject equivalence and therefore cannot persist a separate state in the reverted transaction.
- Preserve exact evidence digest and reason; no positive safety language.

## Consensus design

- Leader and validators refetch the fixed authority independently.
- Exact digest mismatch rejects equivalence; it never degrades into authorization.
- Validator compares verdict and material incident IDs/dimensions, not prose.
- A disagreement leaves the prior scheduled state unchanged because GenLayer does not commit the transaction.
- Beneficiary cannot retry because it is not the assessor. Assessor policy requires cooldown and a bounded window; absolute prevention of malicious assessor retries is not claimed.

## Files

- Modify `contracts/incident_gate.py`.
- Expand `tests/test_contract_runtime.py` and `tests/test_contract_static.py`.
- Update `scripts/live-suite.mjs`, `docs/THREAT_MODEL.md`, `docs/VERIFICATION.md`.

## Tests

- Beneficiary assessment reverts.
- Wrong assessor reverts.
- Early/late assessment reverts.
- Storage objects absent from nondeterministic closure.
- Feed ordering deterministic.
- Invalid timestamp syntax, inconsistent ordering and lifecycle fail closed. The unresolved endpoint itself, rather than incident age, defines current inclusion; the contract does not make an unsupported wall-clock freshness claim.
- Evidence digest drift causes validator disagreement/fail closed.
- Authorization issued only for `DOES_NOT_AFFECT_OPERATION`.

## Success gate

- Fresh local tests, GenVM validation, lint and build pass.
- Independent code review finds no critical/high issue.
- Then request user deployment; inspect all StudioNet stderr before proceeding.

Gate result (2026-09-10): 45 tests passed; GenVM lint/validation passed with only the expected `time.time()` nondeterminism warning; frontend lint/build passed; final adversarial review found no Critical/High issue in the V5 boundary or ABI parity.
