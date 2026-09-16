# Threat model

## Assets and consequence

The protected asset is the ability of a registered agent to mark an exact operation executable. A false positive authorization is more dangerous than a false negative block, so uncertainty fails closed.

V12 is intentionally a single-contract authorization ledger. `execute_intent` atomically consumes one capability, records its canonical receipt and increments governed route volume inside IncidentGate. It does not custody funds, hold exchange credentials or execute an external Coinbase/Kraken order. Those boundaries are release properties, not missing cross-contract steps.

## Attacker goals

- Substitute a lookalike or attacker-controlled incident source.
- Reuse evidence or authorization across another intent.
- Change amount, action, asset, network, or destination after assessment.
- Reuse a consumed or expired authorization.
- Create an intent as another agent.
- Keep an authorization alive after policy rotation.
- Inject instructions through incident prose.
- Exploit malformed model output or validator disagreement.
- Retry a non-finalized assessment until a favorable validator set appears.
- Squat a predictable global policy or intent identifier to cause nuisance denial of service.
- Mislead an operator through non-consequential explanatory text while preserving the same verdict fields.

## Controls

- Exact HTTPS URL, origin, Statuspage page ID, and page name.
- Caller identity comes only from `gl.message.sender_address`.
- Unique per-agent nonce is consumed when the intent is created.
- Intent copies the full policy revision and execution fields.
- Policy owner/assessor must differ from the beneficiary agent.
- Agent locks one bounded assessment ticket; only the assessor may invoke judgment.
- Validators refetch and validate the complete source independently.
- Source content is explicitly untrusted data in the prompt.
- Consequential model fields are canonicalized and independently compared.
- Missing/malformed/unavailable sources and uncertainty never authorize.
- Authorization binds evidence digest, observed time, expiry, nonce, and all operation dimensions.
- Policy rotation invalidates pending and authorized intents.
- Execution checks caller, state, expiry, revision, digest, and consumption flag.
- Authorization consumption, canonical receipt creation and route-volume accounting are one atomic V12 state transition.
- The Gate's own address, selector, calldata digest, call value and operation revision are bound into the operation digest.
- Emergency pause changes the operation revision and invalidates older intents.

## Accepted limitations

- A public status page reflects what its publisher disclosed, not objective universal safety.
- The current contract supports exactly two audited source profiles. Adding another authority requires a reviewed contract update; users cannot register arbitrary URLs.
- The pinned GenVM response does not expose final redirect URL or redirect history. V12 therefore claims fixed canonical endpoints, strict 2xx acceptance and Statuspage identity/schema binding, not redirect-destination verification.
- A runtime-followed redirect that still returns the expected page identity cannot be distinguished from a direct response with the currently documented primitive.
- Incident names and update bodies are projected into bounded fields before hashing and judgment. V12 limits resource use but does not claim publisher-level signed completeness beyond that accepted projection.
- Validator consensus compares the consequential verdict, matched IDs, material dimensions and evidence digest. The human-readable `reason` is bounded but is not an authorization input.
- Policy and intent IDs are globally unique strings in V12. Squatting can cause nuisance denial of service but cannot grant the squatter another actor's policy authority or capability.
- The policy owner is also the assessor and the protocol deployer owns the emergency pause. Compromise or abuse can censor/liveness-block operation; neither role can impersonate the separately registered agent.
- A mutable feed can change between validator retrievals and cause disagreement. This fails closed and affects liveness rather than creating an authorization.
- This version records a governed transition on GenLayer; it does not pause Coinbase/Kraken, custody production funds, hold exchange API keys or directly execute on an external chain. A future external executor must independently require a valid Gate receipt instead of allowing the agent to bypass the decision boundary.
- A live page is mutable. Recorded digest proves the bytes projected at validator retrieval, not historical content before retrieval.
- A `MAJORITY_DISAGREE` transaction does not commit state. The current assessor separation and bounded ticket window remove retry authority from the beneficiary, but cannot count a malicious assessor's non-finalized attempts without a protocol-level receipt.

## Deferred hardening (requires a new contract release)

The following are intentionally not presented as V12 controls: rejecting rather than projecting overlong text fields, including `reason` in validator equality or deriving it deterministically, owner/agent-namespaced IDs, per-policy active-intent quotas, cumulative spending limits, and multisig/timelocked administration. They are tracked in [`V13_HARDENING_BACKLOG.md`](V13_HARDENING_BACKLOG.md). None can be added to the immutable V12 deployment through a documentation or frontend update.
