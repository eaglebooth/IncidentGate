# Threat model

## Assets and consequence

The protected asset is the ability of a registered agent to mark an exact operation executable. A false positive authorization is more dangerous than a false negative block, so uncertainty fails closed.

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
- Gate and target pin each other through constructor plus a one-time owner binding; target rejects direct callers.
- Finalized messages use a queued state, target-side idempotency, immutable receipts, and explicit retry paths.

## Accepted limitations

- A public status page reflects what its publisher disclosed, not objective universal safety.
- The current contract supports exactly two audited source profiles. Adding another authority requires a reviewed contract update; users cannot register arbitrary URLs.
- Cross-contract writes are finalized messages, not an atomic call. A queued operation may require retry; the target receipt is authoritative once applied and Gate confirmation is eventual.
- The target binding is irreversible and must be checked before use. The runtime exposes no code-hash attestation, so the published deployment pair remains part of the trusted release configuration.
- This version records a governed demo transition on GenLayer; it does not pause Coinbase/Kraken, custody production funds, or directly execute on an external chain.
- A live page is mutable. Recorded digest proves the bytes projected at validator retrieval, not historical content before retrieval.
- A `MAJORITY_DISAGREE` transaction does not commit state. V5 removes retry authority from the beneficiary and bounds the ticket window, but cannot count a malicious assessor's non-finalized attempts without a protocol-level receipt.
