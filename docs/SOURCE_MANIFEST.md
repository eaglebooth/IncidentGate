# Source resource manifest

## `coinbase-unresolved-live-v1`

| Field | Value |
|---|---|
| Purpose | Production/live point-in-time incident applicability |
| Authoritative owner | Coinbase Status |
| Canonical origin | `https://status.coinbase.com` |
| Canonical API | `https://status.coinbase.com/api/v2/incidents/unresolved.json` |
| Subject identifier | Statuspage `page.id = kr0djjh0jyy9` |
| Subject name | `Coinbase` |
| Content type | Public JSON |
| Mutable | Yes |
| Expected facts | Page identity, unresolved incident IDs/status/timestamps/components/updates |
| Expected result | Semantic applicability to an exact bound intent; never general safety |

The feed is intentionally mutable because the product asks a current point-in-time question. Every assessment computes a digest over a canonical projection of the actual fetched content and records retrieval time. Authorization is short-lived and policy revisions invalidate prior capabilities.

## `kraken-unresolved-live-v1`

| Field | Value |
|---|---|
| Purpose | Second audited production adapter and funding-operation applicability |
| Authoritative owner | Kraken Status |
| Canonical origin | `https://status.kraken.com` |
| Canonical API | `https://status.kraken.com/api/v2/incidents/unresolved.json` |
| Subject identifier | Statuspage `page.id = lfz25gyhcpjf` |
| Subject name | `Kraken` |
| Content type | Public JSON |
| Mutable | Yes |
| Expected facts | Page identity, unresolved incidents, components and funding-specific updates |
| Expected result | Semantic applicability to the exact Kraken-bound asset/network/action |

Kraken was selected because its official public API documents the unresolved lifecycle and its real incident disclosures contain asset, network and deposit/withdrawal scope. Its URL and subject identity are validated independently.

**V12 release position:** Coinbase is the complete first adapter; Kraken is the second audited adapter demonstrating extensibility. Both fixed official sources completed live assessment on the user-owned Studio Next V12 release. No arbitrary source registry is exposed. V8 evidence remains historical and must not be used as the current deployment claim.

## Source feasibility decision

`status.aave.com` was investigated and rejected as the first production profile. Its rendered page reported `expose_status_summary_api=false`; the public structure only surfaced broad UI components and did not provide sufficient chain/market/action mapping for the proof obligation. IncidentGate does not weaken its proof to fit a recognizable brand.

## Synthetic regression controls

`tests/test_contract_runtime.py` installs mocked response bodies for:

- active relevant incident;
- explicit operation exclusion;
- ambiguous disclosure;
- wrong page identity;
- unavailable source;
- invalid lifecycle;
- policy revision race;
- replayed nonce;
- expired capability;
- wrong authorization digest.
- Kraken page identity and a relevant Kraken funding incident.

These fixtures test deterministic and adversarial behavior. They are never described as production authority evidence.
