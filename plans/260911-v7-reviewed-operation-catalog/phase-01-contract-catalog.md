# Phase 01 — Contract catalog and version boundary

## Overview

- Date: 2026-09-11
- Priority: critical
- Status: complete
- Add enforceable reviewed routes while preserving V6 authority, lifecycle, and execution controls.

## Requirements

- Accept only cataloged Coinbase/Kraken operation tuples.
- Normalize protocol, scope, asset, and action before validation/storage.
- Reject near-miss tuples before any policy storage write.
- Distinguish `PLATFORM_INTERNAL` from blockchain networks.
- Bump contract handshake and operation/authorization domain versions.

## Related files

- Modify `G:/Genlayer/IncidentGate/contracts/incident_gate.py`
- Modify `G:/Genlayer/IncidentGate/tests/test_contract_runtime.py`
- Modify `G:/Genlayer/IncidentGate/tests/test_contract_static.py`

## Implementation

1. Define immutable reviewed route tuples per authority.
2. Add canonical route-key helper.
3. Validate normalized tuple during `register_policy`.
4. Store only normalized facts.
5. Add positive coverage for every route and adversarial near-miss coverage.

## Success criteria

- Unsupported combinations revert with `UNSUPPORTED_OPERATION_PROFILE`.
- All catalog entries register successfully.
- Existing authorization, replay, expiry, source, and consensus tests remain green.

## Risks

- Status feeds can still omit incidents; UI/docs must not claim universal safety.
- Catalog duplication with frontend; contract remains authoritative and tests assert parity.
