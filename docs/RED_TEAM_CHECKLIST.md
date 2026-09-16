# IncidentGate pre-submission red-team checklist

Target ratio: at least 70% adversarial/failure paths and at most 30% happy paths. A checked item needs a reproducible test or finalized StudioNet transaction; prose is not evidence.

## GenLayer necessity and semantic boundary

- [x] AI decides only incident applicability, not `ALLOW` or `BLOCK`.
- [x] Deterministic code parses schema, identity, lifecycle, limits and digests.
- [x] Exact chain, asset, action, destination and amount enter the prompt.
- [x] Relevant incident produces `AFFECTS_OPERATION` and blocks.
- [x] Explicit exclusion can produce `DOES_NOT_AFFECT_OPERATION`.
- [x] Ambiguous scope produces `UNCERTAIN` and blocks.
- [x] Different chain is independently represented in the semantic input.
- [x] Different asset is independently represented in the semantic input.
- [x] Different action is independently represented in the semantic input.
- [ ] Verify near-neighbor semantic cases with live GenLayer validators.

## Authority and provenance attacks

- [x] Arbitrary third-party URL cannot be registered.
- [x] Correct domain but wrong path cannot be registered.
- [x] Coinbase exact page ID and name are required.
- [x] Kraken exact page ID and name are required.
- [x] Cross-wiring Coinbase identity into Kraken fails closed.
- [x] Redirect mismatch fails closed when the runtime exposes final URL.
- [x] HTTP failure fails closed.
- [x] Invalid UTF-8 fails closed in contract logic.
- [x] HTML/non-JSON fails closed.
- [x] Missing page object fails closed.
- [x] Missing incidents array fails closed.
- [x] Invalid incident lifecycle fails closed.
- [x] Oversized response fails closed.
- [x] Too many incidents fails closed instead of truncating.
- [x] Too many components/updates fails closed instead of truncating.
- [x] Evidence digest covers the complete accepted canonical projection.
- [x] Retrieval time is recorded on-chain.
- [x] Confirm the pinned SDK Response schema has no final URL or redirect history; do not claim redirect detection.
- [x] Reject a raw 3xx response through the strict 2xx requirement.
- [x] Record live Coinbase response digest on StudioNet.
- [x] Record live Kraken response digest on StudioNet.

## Model and consensus attacks

- [x] Source content is explicitly labeled untrusted.
- [x] Prompt-injection fixture cannot escape the result schema.
- [x] Unknown verdict such as `ALLOW` is rejected.
- [x] Extra output fields are rejected.
- [x] Non-JSON output is rejected.
- [x] `AFFECTS_OPERATION` without incident IDs is rejected.
- [x] Positive premise with incident IDs is rejected.
- [x] Unknown material dimension is rejected.
- [x] Oversized incident-ID list is rejected.
- [x] Validator refetches the authority independently.
- [x] Validator compares evidence digest and consequential fields.
- [x] Forced validator disagreement yields no authorization.
- [ ] Exercise genuine multi-validator disagreement on StudioNet.
- [ ] Exercise live model timeout/retry behavior on StudioNet.

## State and authorization attacks

- [x] Only the bound agent can create an intent.
- [x] Intent amount must be positive and under policy limit.
- [x] Nonce replay is rejected.
- [x] Intent ID replay is rejected.
- [x] Policy revision is copied into the intent.
- [x] Policy rotation invalidates old intents.
- [x] Inactive policy cannot authorize.
- [x] Authorization binds agent and policy.
- [x] Authorization binds destination and chain.
- [x] Authorization binds asset, action and amount.
- [x] Authorization binds nonce and evidence digest.
- [x] Authorization binds observation time and expiry.
- [x] Wrong authorization digest reverts.
- [x] Expired authorization reverts.
- [x] Wrong caller cannot consume authorization.
- [x] Capability can be consumed only once.
- [x] Empty authenticated feed means only “no applicable disclosure found,” never general safety.
- [x] Verify policy rotation race with finalized StudioNet transactions.
- [x] Verify duplicate consumption with finalized StudioNet transactions.

## Economic consequence and release evidence

- [x] Product copy identifies this version as an authorization gateway.
- [x] No claim says IncidentGate pauses Coinbase or Kraken.
- [x] No claim says the current contract custodies or transfers funds.
- [x] Capability consumption creates a finalized on-chain state consequence.
- [ ] Verify contract-to-contract call capability on the selected runner before building a vault.
- [ ] Add a downstream consumer only after that primitive is verified.
- [x] Deploy the reviewed V2 source to StudioNet and verify its version/schema readback.
- [ ] Record deployment transaction hash (the V12 address and exact deployed-source hash are recorded).
- [ ] Run Coinbase happy, blocked, source-failure and replay lifecycles.
- [ ] Run Kraken blocked, source-failure and replay lifecycles (live happy authorization is verified; failure paths are locally covered).
- [x] Match repository commit, deployed byte/source identity and frontend address.
- [ ] Run a ten-minute judge simulation by a reviewer unfamiliar with the project.

## Five judge questions

1. Why GenLayer? Natural-language incident scope must be related to one exact operation.
2. Who controls evidence? Validators retrieve one of two contract-audited authorities; the agent cannot supply a URL.
3. What does AI decide? Only `AFFECTS_OPERATION`, `DOES_NOT_AFFECT_OPERATION`, or `UNCERTAIN` plus bounded material facts.
4. What happens when uncertain? Deterministic code blocks and emits no capability.
5. What happens on-chain? A short-lived, exact, single-use capability is issued and its consumption is finalized; downstream value transfer is not claimed in this version.
