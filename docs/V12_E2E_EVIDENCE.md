# IncidentGate V12 — Studio Next live E2E evidence

Verified on Studio Next, chain `61997`, against the user-owned IncidentGate V12 deployment [`0xb98D7a2C4eF1c9e26A7C28b7d2116f5a72Cd703B`](https://explorer-studio-dev.genlayer.com/address/0xb98D7a2C4eF1c9e26A7C28b7d2116f5a72Cd703B).

The deployed handshake is `IncidentGate`, version `12`, schema `autonomous-incident-gate-v12-atomic-sdk-v03`. The run ended with the explicit marker `LIVE_V12_COMPLETE`; finalized readback reported one atomic execution, three intents, three registered policy revisions, `paused=False`, and `target_revision=0`.

The source returned by `gen_getContractCode` matches `contracts/incident_gate.py` in commit `72687c7` byte-for-byte after line-ending normalization. Both have SHA-256 `09a052003db7d928890bae52300fe62217c0e2d12e03f0f9caed995f3d95fd8a`.

## Coinbase complete lifecycle

| Step | Finalized evidence | Result |
| --- | --- | --- |
| Register reviewed Coinbase policy | [`0x9175…da39f`](https://explorer-studio-dev.genlayer.com/tx/0x9175aa032cfc0f39e3c91b8c7241664fc6d34bb47f3dab4b92c5085f1e8da39f) | Policy registered |
| Create exact intent | [`0x87c0…cee95`](https://explorer-studio-dev.genlayer.com/tx/0x87c069b697c58aa3c20754b301047b9d001dbb18c200750d5a00d8cd3f4cee95) | Intent committed |
| Lock assessment ticket | [`0x0ab3…fd62ea`](https://explorer-studio-dev.genlayer.com/tx/0x0ab3eb2666ed5b89fda0a4a6565a62c1882655028a2959ca6114b0ab56fd62ea) | Assessment window committed |
| Validator assessment | [`0x3e2f…17aa8d`](https://explorer-studio-dev.genlayer.com/tx/0x3e2fe22d43faa8415a485ec3acb01c19f881ea1a82c2f270f097a929a917aa8d) | `DOES_NOT_AFFECT_OPERATION`, authorization issued |
| Atomic execution | [`0xd77c…e91f57`](https://explorer-studio-dev.genlayer.com/tx/0xd77c6a8454330e46f79961bebe9edb150643cdfe35e2c3a26423d36bd5e91f57) | `EXECUTED`, `consumed=true`, receipt and volume recorded |

Final readback binds Coinbase, `PLATFORM_INTERNAL`, USDC, BUY, amount `1000`, the registered treasury agent, destination, nonce, calldata digest, operation digest, policy revision and expiry. The evidence and authorization digests are stored on-chain.

Fresh readback also confirms the execution transaction is `FINALIZED`, `FINISHED_WITH_RETURN`, and `MAJORITY_AGREE`; the canonical receipt has the same operation digest as the intent, and `get_volume(PLATFORM_INTERNAL, USDC, BUY)` returns `1000`. The finalized fee record reports one leader time unit, six validator time units and no child-message fee.

## Kraken second audited adapter

| Step | Finalized evidence | Result |
| --- | --- | --- |
| Register reviewed Kraken policy | [`0x861e…39ef5`](https://explorer-studio-dev.genlayer.com/tx/0x861ef7cb06b93e8d071897276019a024387a63bcc11e374641e35a2cf5339ef5) | Separate authority identity and source registered |
| Create Moonbeam/GLMR intent | [`0xfe28…c485e3`](https://explorer-studio-dev.genlayer.com/tx/0xfe28eb556251ff41852b4ce8a7a3f33400001c59ca90a3f7a81e7c8cf8c485e3) | Exact intent committed |
| Lock assessment ticket | [`0xfc30…ffa84e`](https://explorer-studio-dev.genlayer.com/tx/0xfc30b8fc94cc9f7983b9534cfdadc52ce7c3d4fc9b882b66830e60a354ffa84e) | Assessment window committed |
| Validator assessment | [`0xb2ea…100909`](https://explorer-studio-dev.genlayer.com/tx/0xb2ea18930ddc78ad21c68609d8730ac97e4db518345cfcbd28d8c9a653100909) | `DOES_NOT_AFFECT_OPERATION`, status `AUTHORIZED` |

This is the second genuinely verified authority adapter, not a renamed Coinbase route. It has its own fixed URL, Statuspage subject identity, reviewed schema boundary and fail-closed assessment.

Both assessment transactions finalized with `FINISHED_WITH_RETURN` and `MAJORITY_AGREE`. Each recorded three successful validator-mode `agree` executions from an initial set of five. The contract validator reruns the same `_fetch_feed(source)` path inside `validate`, compares the evidence digest, and requires agreement on verdict, matched incident IDs and material dimensions.

## Failure-first adversarial checks

| Attack / invalid state | Finalized evidence | Contract result |
| --- | --- | --- |
| Policy owner tries agent-only create | [`0x5195…06f78c`](https://explorer-studio-dev.genlayer.com/tx/0x51953fb666832a55ebce1c55ef7dbf3d59eea94d66025e3bddb23e38bb06f78c) | Rollback `AGENT_ONLY` |
| Create intent before policy rotation | [`0x7477…220f33`](https://explorer-studio-dev.genlayer.com/tx/0x747704c949727315930bdb42c1bc93a9be87c52840f7c445371801d566220f33) | Stale fixture committed for the next invariant |
| Lock stale assessment ticket | [`0x66a2…ee8e1e`](https://explorer-studio-dev.genlayer.com/tx/0x66a2c6d4c74dd7f10a1e33dae05bf58720f2fe6800523a2868da5d3eb9ee8e1e) | Ticket committed |
| Rotate policy revision | [`0x3570…3f5c88`](https://explorer-studio-dev.genlayer.com/tx/0x35705c941992a7fc000e25dbd8fcb7ea660a0c8eaab9fe9273a39ea07a3f5c88) | Revision incremented |
| Assess stale intent | [`0x2400…c911bf`](https://explorer-studio-dev.genlayer.com/tx/0x2400d31b0f7f1c139b4e9efe9f7a0356dca1961ee7badae2cccab2b58fc911bf) | Rollback `STALE_POLICY_REVISION` |
| Mutate authorization digest | [`0x69ba…f0f43`](https://explorer-studio-dev.genlayer.com/tx/0x69ba673e3f390f9fdec16ec650267caab803020bd88c0b0d02df1af3031f0f43) | Rollback `AUTHORIZATION_DIGEST_MISMATCH` |
| Replay consumed authorization | [`0x5e9a…e1b69`](https://explorer-studio-dev.genlayer.com/tx/0x5e9a49ab5f9dd684645dc35b5133f20ce7fcbbba880ba5a1d9485ba56bbe1b69) | Rollback `AUTHORIZATION_NOT_ACTIVE` |

## Honest limits

- V12 records a meaningful atomic authorization consequence, receipt and governed volume; it does not custody funds or claim to execute a real Coinbase/Kraken order.
- The runtime does not document a final redirect URL or redirect history. The contract therefore claims fixed canonical endpoints, 2xx acceptance, page-identity/schema binding and fail-closed source handling—not final redirect-destination protection.
- A live feed can only establish what the registered authority disclosed at retrieval time. It cannot prove the exchange is exploit-free, solvent or continuously available.
- Kraken was live-assessed and authorized in this run but deliberately not consumed; Coinbase demonstrates the complete atomic execution path.
