# Contract release map

## Current submission

`incident_gate.py` is the only V12 contract. It is the source deployed on Studio Next chain `61997`. V12 atomically consumes an authorization, records its canonical receipt and updates governed route volume in the same contract transaction.

Do not deploy or bind a second contract for V12.

## Historical source

`guarded_target.py` is retained to keep the V6–V8 regression tests and migration evidence reproducible. It belongs to the retired two-contract StudioNet architecture and is not called by, bound to or required by V12.

`studio_next_probe.py` is a runtime compatibility probe, not an application contract for the current release.

Current deployment instructions and evidence are in [`../docs/STUDIO_NEXT_DEPLOYMENT.md`](../docs/STUDIO_NEXT_DEPLOYMENT.md) and [`../docs/V12_E2E_EVIDENCE.md`](../docs/V12_E2E_EVIDENCE.md).
