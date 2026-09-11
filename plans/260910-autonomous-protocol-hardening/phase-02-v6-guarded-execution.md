# Phase 02 — V6 guarded execution

Priority: critical  
Status: ready for ordered StudioNet deployment and live verification

## Architecture

Add `GuardedTarget` as the narrow executor using only finalized messages. StudioNet testing showed that the attempted synchronous cross-contract view handshake was not reliable at this pinned runtime boundary. The target is deployed first; Gate pins it in its constructor; the target then binds Gate exactly once. The agent queues execution at Gate, the target applies the exact message idempotently, and the target emits confirmation back to Gate.

## Exact operation commitment

Commit to:

- IncidentGate and executor addresses/domain versions.
- Target chain and target contract.
- Function selector and hash of canonical calldata.
- Native value, token address, amount and recipient.
- Policy ID/revision, requester, executor, nonce and expiry.
- Evidence digest and observation time.

## Minimal hackathon target

Use a demo treasury target with one meaningful guarded action and no unguarded equivalent. Do not integrate production funds. Coinbase/Kraken incidents govern a simulated exchange-funding/withdrawal operation represented by the target call.

## Required behavior

- Executor rejects unknown IncidentGate, target or selector.
- Authorization mutation, wrong caller, replay, expiry and policy rotation revert.
- Gate validates the capability before queuing. Target application and target replay protection are atomic in the target transaction; Gate confirmation is eventual and no atomic cross-contract claim is made.
- Emergency owner pause is deterministic and revision-bound.
- Direct target invocation cannot produce the governed state transition.

## Files

- Make IncidentGate the executor and create `contracts/guarded_target.py`.
- Add contract interfaces/call integration supported by the pinned runner.
- Add direct and Studio integration tests.
- Update frontend to show scheduled, assessing, blocked, authorized and executed states.

## Success gate

- Demonstrate authorize → queued finalized message → idempotent target application → finalized Gate confirmation.
- Demonstrate incident/uncertainty → no target mutation.
- Demonstrate altered calldata and replay → revert.
- Only then request final contract deployments.

Async redesign pre-deployment gate (2026-09-10): 52 tests passed; both contracts passed GenVM lint and semantic validation; frontend lint/build passed. Red-team review's expiry finding was fixed at both sender and receiver boundaries, and Gate exposes its pinned target for pre-binding verification; no Critical/High issue remained in scope. Live verification remains required before completion.
