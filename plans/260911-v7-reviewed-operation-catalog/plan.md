# IncidentGate V7 — Reviewed Operation Catalog

Status: local release gate complete; StudioNet deployment pending

Goal: broaden IncidentGate beyond two demo operations without allowing arbitrary, unsupported policy combinations.

## Phases

1. [Contract catalog and version boundary](phase-01-contract-catalog.md) — complete
2. [Frontend route composer](phase-02-frontend-route-composer.md) — complete
3. [Adversarial verification and deployment handoff](phase-03-verification.md) — local complete, live pending

## Architecture decision

- Keep two fixed, independently fetched authorities: Coinbase Status and Kraken Status.
- Enforce an explicit `(protocol, scope, asset, action)` allowlist inside the contract.
- Represent exchange-internal BUY/SELL/TRADE with `PLATFORM_INTERNAL`; use real networks only for DEPOSIT/WITHDRAW.
- Mirror the catalog in the UI with dependent selectors. Frontend filtering is usability; contract validation is security.
- Bump handshake and digest domains to V7 so old and new authorizations cannot be confused.

## Release boundary

- Local completion: contract/UI/docs updated; full deterministic suite, lint, and production build pass.
- Live completion: deploy a fresh guarded target and V7 gate, bind them, run representative Coinbase and Kraken StudioNet lifecycles.
- No custody vault in this scope. The governed target remains the verifiable downstream consequence.

## Dependencies

- Existing V6 asynchronous assessment and message-native execution lifecycle.
- Existing fixed Statuspage identities and fail-closed parser.
- User deployment addresses when local verification is complete.

## Unresolved questions

- None blocking. Initial catalog is deliberately curated and can only expand through a reviewed contract release.
