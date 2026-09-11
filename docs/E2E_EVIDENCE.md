# IncidentGate V8 — end-to-end evidence

This page is the shortest reproducible path through the user-deployed V8 release. All links point to finalized GenLayer StudioNet transactions. Historical deployments and the complete test ledger are preserved in [VERIFICATION.md](VERIFICATION.md).

## Release under review

| Item | Value |
|---|---|
| Network | GenLayer StudioNet (chain ID `61999`) |
| Live application | [incidentgate.vercel.app](https://incidentgate.vercel.app) |
| IncidentGate V8 | [`0x11086a66FeDBEdC879C95701d0eF33C3F18Eb277`](https://explorer-studio.genlayer.com/address/0x11086a66FeDBEdC879C95701d0eF33C3F18Eb277) |
| GuardedTarget | [`0x5Bb7E1b9f476404bcbCBC290e30CF7Dda73bBd43`](https://explorer-studio.genlayer.com/address/0x5Bb7E1b9f476404bcbCBC290e30CF7Dda73bBd43) |
| One-time binding | [`0x730659…055bbc`](https://explorer-studio.genlayer.com/tx/0x730659b2f916d3b67ecde8cf139c5c08fb29d92704667ba24dc7713d9e055bbc) |
| Contract handshake | `IncidentGate`, version `8`, schema `autonomous-incident-gate-v8-iso-offsets` |

## Happy path: Coinbase judgment to target mutation

1. Register the exact Coinbase policy: [`0xaec0b9…dfe2c`](https://explorer-studio.genlayer.com/tx/0xaec0b973619bb48017341773e4653992e365d56ba39a33ad7612336000adfe2c).
2. Agent creates the bound intent: [`0x2f2b8a…d6f0f`](https://explorer-studio.genlayer.com/tx/0x2f2b8a9ad8ee0d2671dbd3aab952a6afe298e7900f64d843a326120a1d4d6f0f).
3. Agent schedules the assessment ticket: [`0x3081b8…f3cec`](https://explorer-studio.genlayer.com/tx/0x3081b83c87076bc5a208440a081d7b36abdbee6a1c3a9fbcd09a2b5458cf3cec).
4. Validators independently retrieve Coinbase's fixed official source and reach `DOES_NOT_AFFECT_OPERATION`: [`0x0f8bc5…0a1e6`](https://explorer-studio.genlayer.com/tx/0x0f8bc5c97453657306586f744648d3d23508f83fd9d9b20395e5703e6170a1e6).
5. The agent consumes the exact, short-lived capability: [`0x2a0ac0…744c2`](https://explorer-studio.genlayer.com/tx/0x2a0ac0760c1e85c5684bcf5fc3ebe8c9e6ecd560133df6b05bc19d52e58744c2).
6. Readback shows `EXECUTED`, `consumed=true`; GuardedTarget stores one receipt whose operation digest matches Gate.

## Second audited adapter: Kraken

Kraken independently completed policy registration, intent creation, ticket scheduling, and live source assessment:

- [Policy registration](https://explorer-studio.genlayer.com/tx/0x06d4c054c90283fb1dd3896faab9449e19002f172fd2d1f02b5450e76b32ad48)
- [Intent creation](https://explorer-studio.genlayer.com/tx/0xf5ad2b07270dfa973bfb4e9910ace3c27a8a4ad5180e3c489c4335e153243dbe)
- [Assessment scheduling](https://explorer-studio.genlayer.com/tx/0x7540e571d2d453be1ff15ca92aac261a24d711e13ba2d0f04afdee619f8bec13)
- [Live assessment — `AUTHORIZED`](https://explorer-studio.genlayer.com/tx/0x3b48ee0f8f73e614744e8b776156c3c070456f4adac33bc3161288e80a834fdb)

## Live failure-path evidence

| Attack or failure | Expected boundary | Finalized evidence |
|---|---|---|
| Direct target bypass | `INCIDENT_GATE_ONLY` | [`0x847941…03df4`](https://explorer-studio.genlayer.com/tx/0x84794192ad1c1fefb5b904a768f000c5c66e30237c4bd38015e6aaedced03df4) |
| Wrong agent | `AGENT_ONLY` | [`0x47270e…9268`](https://explorer-studio.genlayer.com/tx/0x47270e14e835661e15fb39119f0117e200b6c63591e2ea72a3cd0af2d1869268) |
| Mutated authorization digest | `AUTHORIZATION_DIGEST_MISMATCH` | [`0xac9fae…8585`](https://explorer-studio.genlayer.com/tx/0xac9fae8b314fea7c330494f36b4006b2d58453dab88bdeec5f4cbd2a1c458585) |
| Consumed authorization replay | `AUTHORIZATION_NOT_ACTIVE` | [`0x6d46e1…f8f84e`](https://explorer-studio.genlayer.com/tx/0x6d46e16480bb0f12d6f685ed0f33c9120883ff04c8a07a927431e94626f8f84e) |
| Reused nonce | `NONCE_ALREADY_USED` | [`0x1600b5…4c4db`](https://explorer-studio.genlayer.com/tx/0x1600b564120734d9585b8481d21cc8d0a5185bd95468e8dbf70dee22a518c4db) |
| Stale policy revision | `STALE_POLICY_REVISION` | [`0xbfe7e1…20c4e`](https://explorer-studio.genlayer.com/tx/0xbfe7e1e25d158e56854f81fc8418efbe68d8ec14327a43581e869ea30df20c4e) |
| Expired authorization | `AUTHORIZATION_NOT_ACTIVE` | [`0x7499cb…8b59e`](https://explorer-studio.genlayer.com/tx/0x7499cbf655903339c9950840eb32354b2c8472d178cee6f39ab89d9071b8b59e) |
| Unsupported operation tuple | `UNSUPPORTED_OPERATION_PROFILE` | [`0x0bd9e6…26987e`](https://explorer-studio.genlayer.com/tx/0x0bd9e64bec82682427248822d828a084d3cdea7daac63492b2f1ccc13526987e) |
| Bind target twice | `INCIDENT_GATE_ALREADY_BOUND` | [`0xe85fa9…b6cde`](https://explorer-studio.genlayer.com/tx/0xe85fa9bab4edb0f4ad276c8049fafb33d8b8a47c9f6a86815f660dabc0eb6cde) |

## Emergency control evidence

- [Pause enabled](https://explorer-studio.genlayer.com/tx/0x6d1cc02d72e062fe3526e4023bbfc4fe1152b5f7a2a02cdefe3cac5586f40f45).
- [Pause disabled](https://explorer-studio.genlayer.com/tx/0xcd9826bc5653e99bfb6538fe1ff435d16ddff1f296eafe2f79506bfb11057de6).
- Final readback: `paused=false`, GuardedTarget `pause_revision=2`, Gate `target_revision=2`.

## Verification scope and honest limitations

Live StudioNet proves both official adapters, semantic consensus, authorization, cross-contract execution, confirmation, emergency revision propagation, and adversarial rollbacks that can be triggered safely.

The 82-test local adversarial suite additionally covers source outage, raw 3xx/HTTP/HTML failure, wrong page identity, prompt injection, malformed model output, lifecycle corruption, near-neighbor operations, and forced consensus disagreement. Those conditions were not manufactured against the real Coinbase/Kraken services or StudioNet validator set.

IncidentGate does not claim that a status page proves universal safety, that GenVM exposes redirect destinations, that cross-contract delivery is atomic, or that this release custodies production funds or pauses Coinbase/Kraken. See [THREAT_MODEL.md](THREAT_MODEL.md) for the complete boundary.
