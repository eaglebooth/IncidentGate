# Phase 03 — adversarial verification and submission

Priority: high  
Status: blocked by V6

## Local gates

- Contract syntax, GenVM lint/validation and complete unit suite.
- Frontend ESLint, TypeScript and production build.
- At least 70% negative/adversarial cases.
- Review source for secret leakage and misleading claims.

## StudioNet matrix

- Coinbase authorize and atomic target execution.
- Kraken authorize and atomic target execution.
- Relevant incident blocks target mutation.
- Source outage/malformed identity fails closed.
- Wrong requester/assessor/executor reverts.
- Early/late assessment reverts.
- Policy rotation invalidates scheduled intent and authorization.
- Changed target/calldata/value/token/amount/recipient reverts.
- Capability replay reverts.
- Inspect leader and every validator stderr for storage warnings.
- Record any disagreement and retry; never omit adverse results.

## Submission artifacts

- Deployment addresses and explorer transaction links.
- Reproducible test commands and expected states.
- Architecture diagram showing judgment on the execution critical path.
- Threat model with redirect, disclosure lag, upstream compromise and non-finalized-attempt limitations.
- Demo instructions under 500 characters and project description under 1000 characters.

## Final rule

Do not call the project an Autonomous Protocol until the guarded target cannot perform its governed transition without a fresh IncidentGate capability.
