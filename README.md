# IncidentGate

**A GenLayer-powered semantic circuit breaker for autonomous treasuries and transaction agents, with two pre-audited live-source adapters and a contract-enforced operation catalog.**

V12 preserves the reviewed Coinbase/Kraken boundary and 22 operation profiles while making authorization consumption, receipt creation and governed-volume accounting one atomic state transition. The contract—not the frontend—rejects every unlisted `(authority, scope, asset, action)` tuple.

IncidentGate evaluates whether current authoritative incident disclosures materially affect one exact proposed operation. GenLayer validators independently retrieve the registered source and agree on the bounded semantic relation. Deterministic contract logic alone decides whether to issue a short-lived, single-use execution capability.

**Live application:** [incidentgate.vercel.app](https://incidentgate.vercel.app)  
**Studio Next V12 evidence:** [judge-facing live E2E ledger](docs/V12_E2E_EVIDENCE.md). V9–V11 are retained as migration evidence. V11 proved the semantic path but Studio Next did not finalize the cross-contract child-message consensus; V12 removes that network-dependent boundary and is live-verified on chain `61997`.

## Why GenLayer

Status APIs expose structured lifecycle fields but important scope remains natural language. A disclosure such as “sends and receives are delayed; buys, sells, and fiat withdrawals/deposits are unaffected” cannot safely gate every operation with a single component-status boolean. IncidentGate binds an operation across product, network, asset, action, destination, and amount, then asks only whether a current disclosure materially applies.

The model never returns `ALLOW` or `BLOCK`:

```text
authoritative incident feed
        ↓ independent validator retrieval
AFFECTS_OPERATION | DOES_NOT_AFFECT_OPERATION | UNCERTAIN
        ↓ deterministic policy gates
BLOCK | short-lived single-use authorization
        ↓ exact digest + nonce + expiry
ATOMIC RECEIPT + VOLUME | REVERT
```

## Production source profile

The first profile uses Coinbase Status because it exposes a public Statuspage JSON feed with stable incident IDs, lifecycle timestamps, affected components, and operation-specific prose. The second audited profile uses Kraken's official Statuspage API to prove multi-authority extensibility with an independently bound page identity.

### Redirect limitation

The pinned GenVM response API exposes HTTP status, headers, and body, but not the final URL or redirect history. IncidentGate therefore does not claim redirect-destination verification. It accepts only hardcoded canonical HTTPS endpoints, requires a 2xx response, and verifies the exact Statuspage page identity and schema. A raw 3xx response fails closed; a redirect followed internally by the runtime cannot currently be inspected.

- Origin: `https://status.coinbase.com`
- Feed: `https://status.coinbase.com/api/v2/incidents/unresolved.json`
- Required page ID: `kr0djjh0jyy9`
- Required page name: `Coinbase`

Kraken adapter:

- Origin: `https://status.kraken.com`
- Feed: `https://status.kraken.com/api/v2/incidents/unresolved.json`
- Required page ID: `lfz25gyhcpjf`
- Required page name: `Kraken`

The URL is not supplied per intent. It is exactly registered by the contract. The agent supplies only the operation it wants authorized.

## V12 reviewed operation catalog

`PLATFORM_INTERNAL` means an exchange-side BUY, SELL, or TRADE. It is deliberately not labeled as a blockchain. DEPOSIT and WITHDRAW profiles bind an actual network.

| Authority | Scope | Assets | Actions |
| --- | --- | --- | --- |
| Coinbase | `PLATFORM_INTERNAL` | USDC, BTC, ETH | BUY, SELL |
| Coinbase | Ethereum | USDC | DEPOSIT, WITHDRAW |
| Coinbase | Base | USDC | DEPOSIT, WITHDRAW |
| Kraken | `PLATFORM_INTERNAL` | BTC, ETH, USDC, GLMR | TRADE |
| Kraken | Bitcoin | BTC | DEPOSIT, WITHDRAW |
| Kraken | Ethereum | USDC | DEPOSIT, WITHDRAW |
| Kraken | Solana | SOL | DEPOSIT, WITHDRAW |
| Kraken | Moonbeam | GLMR | DEPOSIT, WITHDRAW |

This catalog is a reviewed policy surface, not a claim that every listed operation is continuously supported by an exchange. Adding an asset, action, network, or new authority requires a new audited contract release.

V12 is intentionally a single contract. Its own address is bound into each operation digest. A successful `execute_intent` atomically consumes the authorization, stores a canonical receipt and increments the route volume. This is a meaningful on-chain consequence, but it is not custody and does not claim to execute an order at Coinbase or Kraken.

### Epistemic boundary

An empty, successfully authenticated unresolved-incident feed means only that no blocking disclosure was found under this registered authority at retrieval time. It does **not** prove Coinbase or any protocol is safe, exploit-free, solvent, continuously available, or suitable for investment.

## Lifecycle

1. A policy owner registers a separate treasury agent, exact authority identity, destination, action, asset, amount limit, and authorization TTL. The owner becomes the assessor and cannot also be the agent.
2. The registered agent creates an exact intent with a unique nonce.
3. The agent locks a bounded assessment ticket. Only the policy owner/assessor can invoke its assessment.
4. Validators independently retrieve and structurally validate the live feed, then GenLayer adjudicates applicability.
5. Any relevant or uncertain disclosure blocks. Source/schema/identity failure also blocks.
6. Only `DOES_NOT_AFFECT_OPERATION` plus every deterministic prerequisite creates an authorization.
7. The same agent calls `IncidentGate.execute_intent`. Gate rechecks caller, pause state, expiry, policy revision, operation revision and authorization digest.
8. In that same transaction it consumes the capability, stores the exact canonical receipt, increments route volume and marks the intent `EXECUTED`. Replay reverts. Emergency pause/unpause increments the operation revision and invalidates older intents.

The Control Room includes the full lifecycle. Register with the owner wallet and a distinct treasury-agent address; switch to the agent for create/schedule/execute and back to the owner for assessment.

### Consensus retry limitation

A `MAJORITY_DISAGREE` transaction does not commit contract state, so an intelligent contract cannot persistently count that failed attempt. V5 prevents the beneficiary agent from invoking or retrying assessment and bounds assessment to a one-time ticket window. A malicious policy owner/assessor could still resubmit a non-finalized assessment inside that window; absolute prevention requires protocol-level attempt receipts or an external neutral assessor. No stronger claim is made.

## Local verification

```bash
python -m pytest -q
npm install
npm run lint
npm run build
npm run dev
```

Deploy `contracts/incident_gate.py` once with no constructor arguments. There is no target deployment or binding step in V12.

## Required hackathon network: Studio Next

IncidentGate V12 targets **Studio Next**, chain ID `61997`, RPC `https://studio-next.genlayer.com/api`. The old Studionet deployment on chain `61999` remains historical evidence only and is not the hackathon deployment.

Every frontend write uses `@genlayer/transaction-kit@0.1.0-rc.2` to obtain a live fee quote, submit the fee distribution, and require `FINISHED_WITH_RETURN` after finalization. The SDK is pinned to `genlayer-js@2.0.0-rc.1`.

Deployment order and the exact constructor/binding checks are in [`docs/STUDIO_NEXT_DEPLOYMENT.md`](docs/STUDIO_NEXT_DEPLOYMENT.md).

## Environment

Copy `.env.example` to `.env.local` after deployment. The hackathon frontend is pinned to Studio Next (`studioDevnet`, chain `61997`); it deliberately does not fall back to Studionet `61999`.

## Repository evidence

- [Historical V8 end-to-end evidence](docs/E2E_EVIDENCE.md)
- [V12 Studio Next live end-to-end evidence](docs/V12_E2E_EVIDENCE.md)
- [V12 Studio Next deployment gate](docs/STUDIO_NEXT_DEPLOYMENT.md)
- [Source manifest](docs/SOURCE_MANIFEST.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Verification record](docs/VERIFICATION.md)
- [Pre-submission red-team checklist](docs/RED_TEAM_CHECKLIST.md)
- [Contract source](contracts/incident_gate.py)

Synthetic inputs in tests are regression fixtures only. They are not presented as authoritative live evidence. Historical deployments remain explicitly historical. V12 live verification uses the user-owned Studio Next deployment, independent validator retrieval from both registered authorities, finalized readback, and linked transactions on chain `61997`.
