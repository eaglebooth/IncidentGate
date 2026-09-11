# Phase 03 — Adversarial verification and deployment handoff

## Overview

- Date: 2026-09-11
- Priority: critical
- Status: local complete; StudioNet deployment pending

## Requirements

- Run deterministic contract/runtime/static tests.
- Run frontend lint and production build.
- Update live suite to the V7 handshake and representative routes.
- Document exact deployment order and required fresh addresses.

## Related files

- Modify `G:/Genlayer/IncidentGate/scripts/live-suite.mjs`
- Modify `G:/Genlayer/IncidentGate/scripts/kraken-retry.mjs`
- Modify `G:/Genlayer/IncidentGate/README.md`

## Verification matrix

- Valid internal Coinbase action.
- Valid network-bound Coinbase action.
- Valid internal Kraken action.
- Valid network-bound Kraken action.
- Wrong action/scope, wrong asset/network, unknown protocol, arbitrary URL.
- Existing source failure, identity mismatch, malformed AI, consensus disagreement, replay, expiry, and stale revision cases.

## Success criteria

- Local tests, lint, and build all pass.
- Live scripts refuse any non-V7 deployment.
- README states limits: official disclosures only, no redirect-destination primitive, no custody, fail closed on uncertainty.
- Deployment is requested only after local release gate passes.
