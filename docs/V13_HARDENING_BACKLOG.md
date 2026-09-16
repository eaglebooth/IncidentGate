# IncidentGate V13 deferred hardening backlog

This document separates future hardening from the immutable, live-verified V12 release. Nothing below is claimed by the V12 deployment, and none of it can be introduced through a frontend or documentation-only update.

## Evidence projection

- Reject an incident name longer than 240 characters and an update body longer than 1,500 characters instead of silently projecting a prefix.
- Keep the total response, incident, component and update count limits already enforced by V12.
- Re-run prompt-injection, lifecycle, oversized-source and near-neighbor semantic tests after changing the projection.

Why deferred: the fixed public authority already controls the full source content, so prefix projection does not give an unrelated caller new authority. Rejecting is nevertheless a cleaner completeness property for a production release.

## Consensus explanation integrity

- Either compare normalized `reason` during validator validation or derive a deterministic reason from the agreed consequential fields.
- Continue to bind authorization only to verdict, evidence and exact operation facts; prose must never become an execution permission.

Why deferred: V12 validators already compare verdict, matched incident IDs, material dimensions and evidence digest. A differing reason can mislead an operator but cannot change authorization state.

## Identifier namespaces and quotas

- Store policy keys under owner plus caller-visible policy ID.
- Store intent keys under agent plus caller-visible intent ID, or require a digest-derived ID.
- Add a bounded number of active intents per policy and optional cumulative value windows.

Why deferred: global-ID squatting is a nuisance/liveness issue. It does not let the squatter act as the policy owner, assessor or registered agent. Changing keys changes storage compatibility and requires a new deployment.

## Administration

- Add explicit ownership transfer with two-step acceptance.
- Use a multisig or timelocked administrator for a production deployment.
- Define emergency-pause monitoring and recovery procedures.

Why deferred: V12's deployer-owned pause is appropriate for the disclosed hackathon boundary but remains a production governance trust assumption.

## External execution

- Treat an exchange executor, vault or custody system as a separate audited integration.
- Require that executor to verify and consume an IncidentGate authorization path; do not leave an agent-controlled bypass.
- Add destination allowlists, per-operation limits, cumulative limits, idempotency and reconciliation before real value is placed at risk.

This is not a request to restore the historical V6–V8 `GuardedTarget`. V12 intentionally became a single-contract atomic authorization ledger after Studio Next child-message incompatibility. Any future executor must be designed against the then-current runtime and audited independently.
