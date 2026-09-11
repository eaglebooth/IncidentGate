# Verification record

## Local contract checks

Run:

```bash
python -m pytest -q
```

The suite imports the actual submitted contract with a controlled GenLayer runtime stub. The current suite exercises relevant disclosure blocking, explicit exclusion authorization, Coinbase/Kraken identity binding, 3xx/HTTP/HTML/prompt-injection controls, malformed AI output, forced consensus disagreement, near-neighbor chain/asset/action inputs, exact target-call binding, delayed assessment, single-use execution, source outage, policy revision invalidation, unauthorized actor, nonce replay, expiry, and wrong digest rollback.

## Frontend checks

```bash
npm run lint
npm run build
```

## Live network status

Contract address supplied for Studionet:

- Network: GenLayer Studionet (`NEXT_PUBLIC_NETWORK=studionet`)
- Contract: `0x033966E12CA378145526420b2e89E6CE9D588c38`
- RPC readback on 2026-09-10: `name=IncidentGate`, `schema=semantic-circuit-breaker-v1`, `version=1`
- Initial RPC stats: `policies=0`, `intents=0`, `executions=0`

This proves address/interface readback only. It does not yet prove source equivalence, deployment transaction identity, validator semantics, or a complete live lifecycle. Remaining evidence:

## V1 StudioNet lifecycle — 2026-09-10

Test wallets:

- Policy owner/destination: `0xeb57bc7125fa60d7482CE12058397369AB3581f8`
- Treasury agent: `0x2da5393d7BBb9A037dc3abB56DbbC5C150fc843f`

Finalized positive and adversarial evidence:

| Step | Result | Transaction |
|---|---|---|
| Coinbase policy registration | Finalized | [`0x6982e4dece69220b601e403be12a27d80a3c026a2f46e83352c03426bad1be1d`](https://explorer-studio.genlayer.com/tx/0x6982e4dece69220b601e403be12a27d80a3c026a2f46e83352c03426bad1be1d) |
| Kraken policy registration | Finalized | [`0x9bb63ec4f2ac65705ab31d59be9e761f712befa972af3454bba61a0ec0903eac`](https://explorer-studio.genlayer.com/tx/0x9bb63ec4f2ac65705ab31d59be9e761f712befa972af3454bba61a0ec0903eac) |
| Wrong caller | Finalized rollback `AGENT_ONLY` | [`0x3490ee71fb45b58f676664a38b43814eaa0ac4e0ae5e8fc5834bd9aedb832623`](https://explorer-studio.genlayer.com/tx/0x3490ee71fb45b58f676664a38b43814eaa0ac4e0ae5e8fc5834bd9aedb832623) |
| Coinbase intent | Finalized | [`0x588d1fadf8dd74fd4abcd0b81bebeba45e3902051ba7c5b562918a4b0c2f1520`](https://explorer-studio.genlayer.com/tx/0x588d1fadf8dd74fd4abcd0b81bebeba45e3902051ba7c5b562918a4b0c2f1520) |
| Coinbase live assessment | Finalized `DOES_NOT_AFFECT_OPERATION` | [`0x1995ae52939590da1cfb7e8a6bddb8afabfc55b11a63f1da071a8fb708528e3a`](https://explorer-studio.genlayer.com/tx/0x1995ae52939590da1cfb7e8a6bddb8afabfc55b11a63f1da071a8fb708528e3a) |
| Coinbase capability consumption | Finalized `EXECUTED` | [`0xf625d6d76a9783daf0d361f7258746d16782303c99df6141c52eaa3a67d19b02`](https://explorer-studio.genlayer.com/tx/0xf625d6d76a9783daf0d361f7258746d16782303c99df6141c52eaa3a67d19b02) |
| Coinbase replay | Finalized rollback `AUTHORIZATION_NOT_ACTIVE` | [`0x2dbf44a47db0e4c2860f5e48eb109cff696fdb5ae48c7d2498eb8995e3a016c3`](https://explorer-studio.genlayer.com/tx/0x2dbf44a47db0e4c2860f5e48eb109cff696fdb5ae48c7d2498eb8995e3a016c3) |
| Kraken intent | Finalized | [`0x645302a6406d207701204e8c608fe350d75bb3afeb957db66fe40df1b57075ba`](https://explorer-studio.genlayer.com/tx/0x645302a6406d207701204e8c608fe350d75bb3afeb957db66fe40df1b57075ba) |
| Kraken live assessment | Finalized fail-closed `UNCERTAIN / INVALID_MODEL_OUTPUT` | [`0x71a6b00ace2221f5bc30bda1f0ccd169639dbfbf6aa2c63a2bfc6d47ebafed8b`](https://explorer-studio.genlayer.com/tx/0x71a6b00ace2221f5bc30bda1f0ccd169639dbfbf6aa2c63a2bfc6d47ebafed8b) |
| Stale intent creation | Finalized | [`0x6ccae2699ed967aaf061e4bdebbbe759a57d415077a9748141bc48228a8d067d`](https://explorer-studio.genlayer.com/tx/0x6ccae2699ed967aaf061e4bdebbbe759a57d415077a9748141bc48228a8d067d) |
| Policy rotation | Finalized | [`0xde7e9641b8f701b9d7e48036dd740181c7017fcbd31390dc35435cfeb3418bb4`](https://explorer-studio.genlayer.com/tx/0xde7e9641b8f701b9d7e48036dd740181c7017fcbd31390dc35435cfeb3418bb4) |
| Stale assessment | Finalized rollback `STALE_POLICY_REVISION` | [`0x7c4ef4ae7afd369a27834bdccb2a09ef3f98f05e76f8a944c6e32f8f410d4f5d`](https://explorer-studio.genlayer.com/tx/0x7c4ef4ae7afd369a27834bdccb2a09ef3f98f05e76f8a944c6e32f8f410d4f5d) |
| Kraken retry intent | Finalized | [`0x24573d01bd9cf1efa4385abb65c6e0605554ca7b71f12a52bb386b9746ac7b3c`](https://explorer-studio.genlayer.com/tx/0x24573d01bd9cf1efa4385abb65c6e0605554ca7b71f12a52bb386b9746ac7b3c) |
| Kraken retry assessment | Finalized fail-closed `UNCERTAIN / INVALID_MODEL_OUTPUT` | [`0x4f008c3d21df35383f8eb90279014fc28999dd7967f1c40e3455076a0778aa81`](https://explorer-studio.genlayer.com/tx/0x4f008c3d21df35383f8eb90279014fc28999dd7967f1c40e3455076a0778aa81) |

Final V1 readback was `policies=2`, `intents=3`, `executions=1`. Coinbase evidence digest was `fa718f42ac396bbf90c5e7d82e599f68944fc3664726b159b3a9f00f4b6be96f` and its single-use capability was consumed. Kraken failed closed twice; it is not claimed as semantically verified on V1.

## V2 StudioNet lifecycle — 2026-09-10

Contract: `0x8040BBe332958394a579C00129942b40e8AFd3Eb`

RPC readback confirmed `name=IncidentGate`, `schema=semantic-circuit-breaker-v2`, and `version=2`. The repeated V1 Kraken `INVALID_MODEL_OUTPUT` was fixed by bounding the model output to exactly four JSON fields, no markdown, at most eight matched IDs, seven allowed dimensions, and a short reason.

| Step | Result | Transaction |
|---|---|---|
| Coinbase policy registration | Finalized | [`0xca38a470a000eb21148008d1f265cd25229d6a240313415da16c7e852e16195c`](https://explorer-studio.genlayer.com/tx/0xca38a470a000eb21148008d1f265cd25229d6a240313415da16c7e852e16195c) |
| Kraken policy registration | Finalized | [`0xd3ca7f845681e0a96f48805b88d1178d3530e31ea9b31d3532cbe4e0eee6d34b`](https://explorer-studio.genlayer.com/tx/0xd3ca7f845681e0a96f48805b88d1178d3530e31ea9b31d3532cbe4e0eee6d34b) |
| Wrong caller | Finalized rollback `AGENT_ONLY` | [`0xb063f3f6c576195fa697e6b2632927a827963c6da86019fcbd33e8b3db8c782b`](https://explorer-studio.genlayer.com/tx/0xb063f3f6c576195fa697e6b2632927a827963c6da86019fcbd33e8b3db8c782b) |
| Coinbase intent | Finalized | [`0xbfcbe883feac057aaf2ce5e535988ab5336e003a1c0439c9bf0b9746d56e5d75`](https://explorer-studio.genlayer.com/tx/0xbfcbe883feac057aaf2ce5e535988ab5336e003a1c0439c9bf0b9746d56e5d75) |
| Coinbase live assessment | Finalized `DOES_NOT_AFFECT_OPERATION` | [`0xecd8e1107030c70e71e8464b43dbb573e83a1e27431cffab9ede8696c5e60831`](https://explorer-studio.genlayer.com/tx/0xecd8e1107030c70e71e8464b43dbb573e83a1e27431cffab9ede8696c5e60831) |
| Coinbase capability consumption | Finalized `EXECUTED` | [`0x9ff5cc217a4b849fbf8047181e2257541d777f80e844135198595e994b7904a9`](https://explorer-studio.genlayer.com/tx/0x9ff5cc217a4b849fbf8047181e2257541d777f80e844135198595e994b7904a9) |
| Coinbase replay | Finalized rollback `AUTHORIZATION_NOT_ACTIVE` | [`0xea969b237c161908e05164eb4bf574650b41e7f1fdb6aa2b644260d8dae9ea6a`](https://explorer-studio.genlayer.com/tx/0xea969b237c161908e05164eb4bf574650b41e7f1fdb6aa2b644260d8dae9ea6a) |
| Kraken intent | Finalized | [`0x94a8bf08fb4711938cb18fd3b085f334999e4c3e49bd4be03fca6c99c9d33852`](https://explorer-studio.genlayer.com/tx/0x94a8bf08fb4711938cb18fd3b085f334999e4c3e49bd4be03fca6c99c9d33852) |
| Kraken live assessment | Finalized `DOES_NOT_AFFECT_OPERATION` | [`0x32f65f329e2c763633560dec336107454ed31fe02a5d74ea2a324cb788c432d3`](https://explorer-studio.genlayer.com/tx/0x32f65f329e2c763633560dec336107454ed31fe02a5d74ea2a324cb788c432d3) |
| Stale intent creation | Finalized | [`0xff214817c6105f6c1ca898103e468934dc7c1bb427a67330c8cd337276a54d91`](https://explorer-studio.genlayer.com/tx/0xff214817c6105f6c1ca898103e468934dc7c1bb427a67330c8cd337276a54d91) |
| Policy rotation | Finalized | [`0x30dc3a4e1ffb6f7ef4457bb4b9af8bf3aebf4500ac4db4b8450092617ffb0ca5`](https://explorer-studio.genlayer.com/tx/0x30dc3a4e1ffb6f7ef4457bb4b9af8bf3aebf4500ac4db4b8450092617ffb0ca5) |
| Stale assessment | Finalized rollback `STALE_POLICY_REVISION` | [`0xf27eccfdebe25c38df5860db3c575de68ca851dc1dadd70484c319caa1c3f864`](https://explorer-studio.genlayer.com/tx/0xf27eccfdebe25c38df5860db3c575de68ca851dc1dadd70484c319caa1c3f864) |

Authoritative V2 readback:

- Coinbase finished `EXECUTED`, with verdict `DOES_NOT_AFFECT_OPERATION`, evidence digest `fa718f42ac396bbf90c5e7d82e599f68944fc3664726b159b3a9f00f4b6be96f`, and its exact authorization consumed once.
- Kraken finished `AUTHORIZED`, with verdict `DOES_NOT_AFFECT_OPERATION`, evidence digest `e1492d01a7a72f05fa76d1cd8fe673b53c975de1c40ebeb2f35e3505b2afa2aa`. The live reason explicitly bound incident `yk6cd997vcwp` to enabled and unaffected Moonbeam/GLMR withdrawals.
- Final stats were `policies=2`, `intents=3`, `executions=1`.

The V2 suite proves two independent audited authorities, validator-refetched live evidence, exact operation binding, a real execution transition, replay rejection, caller authorization, and policy-revision invalidation. It does not claim that every possible validator disagreement, timeout, or external outage was observed live.

## V3 redirect-control correction

The pinned GenVM SDK defines `gl.nondet.web.Response` with only `status`, `headers`, and `body`; it exposes neither a final URL nor redirect history. V3 therefore removes the ineffective `response.url` branch and does not claim end-to-end redirect detection. It keeps hardcoded canonical HTTPS endpoints, exact Statuspage subject identity and schema binding, independent validator retrieval, and fail-closed handling. A raw 3xx response is rejected by the strict 2xx requirement. If the runtime follows a redirect internally, the contract cannot inspect its destination; this remains an explicit platform limitation until GenVM exposes a final URL or a no-follow option.

V3 is source-only until a new deployment and live lifecycle are recorded. The finalized transactions above remain evidence for immutable V2.

## V3 StudioNet finding and V4 correction

V3 was deployed at `0xd4eaf4F64E0f6B3Fa4bAf633DCbD8245044225fF`. Coinbase completed assessment, execution, and replay rejection. The first Kraken assessment finalized `MAJORITY_DISAGREE`; retrying the same pending intent finalized `AUTHORIZED` with evidence digest `e1492d01a7a72f05fa76d1cd8fe673b53c975de1c40ebeb2f35e3505b2afa2aa`. The Studio Explorer exposed a runner warning that the nondeterministic closure captured a pickled storage class. V4 fixes this by copying the three required policy fields into a plain dictionary before entering nondeterministic execution. V3 remains immutable and must not be represented as warning-free.

## V5 pre-deployment gate

V5 separates beneficiary agent and assessor roles, requires an on-chain scheduled ticket plus a 30-second minimum delay, bounds the assessment window, snapshots storage before nondeterministic execution, canonicalizes source ordering, and binds the authorization to the exact target contract, function selector, calldata digest and native call value. The pre-deployment gate passed on 2026-09-10: 45 local tests, GenVM lint and semantic validation, frontend ESLint, production build, and an independent adversarial review with no remaining Critical/High finding in scope. The linter reports the expected warning for `time.time()`, which is deliberately used by write methods for expiry enforcement. This remains source-level evidence until a fresh V5 address and StudioNet lifecycle are recorded.

## V5 StudioNet lifecycle — 2026-09-10

Contract: `0x5b07B271ff1B8d6eA39425B22538B13Ac3D2e8fb`

| Step | Result | Transaction |
|---|---|---|
| Coinbase policy registration | Finalized | [`0x0f1626e5720e9643c8ac8438c78f590c5f9ef610986ce245307b77c357b5ee08`](https://explorer-studio.genlayer.com/tx/0x0f1626e5720e9643c8ac8438c78f590c5f9ef610986ce245307b77c357b5ee08) |
| Kraken policy registration | Finalized | [`0x36b419f1854baa44ca556e3382af4c606e9feabef5c338affd1d34ed9b47ddeb`](https://explorer-studio.genlayer.com/tx/0x36b419f1854baa44ca556e3382af4c606e9feabef5c338affd1d34ed9b47ddeb) |
| Wrong caller creates intent | Finalized rollback `AGENT_ONLY` | [`0xb82d27518256412454bf044edabca3b6cad59d86c3d5fd4d7341f6f20244d071`](https://explorer-studio.genlayer.com/tx/0xb82d27518256412454bf044edabca3b6cad59d86c3d5fd4d7341f6f20244d071) |
| Coinbase intent creation | Finalized | [`0x509e133e142939d54e2a2a7a007b2af814ae1ff0a7410917c320f535e919e507`](https://explorer-studio.genlayer.com/tx/0x509e133e142939d54e2a2a7a007b2af814ae1ff0a7410917c320f535e919e507) |
| Coinbase ticket schedule | Finalized | [`0xdeac5e806f6154bd5a7719965385a0c8d19a1510e329f34ae9c6dd873f8824a9`](https://explorer-studio.genlayer.com/tx/0xdeac5e806f6154bd5a7719965385a0c8d19a1510e329f34ae9c6dd873f8824a9) |
| Coinbase live assessment | Finalized `DOES_NOT_AFFECT_OPERATION` | [`0x87d179b0beb57b42d78df47ce6e65e5833526d1b50a073d30aa41e0d714cf300`](https://explorer-studio.genlayer.com/tx/0x87d179b0beb57b42d78df47ce6e65e5833526d1b50a073d30aa41e0d714cf300) |
| Coinbase capability consumption | Finalized `EXECUTED` | [`0x7657ebf7e368487368c6a15e95db31e992f1f49eeb0ec47595d44169baff0ede`](https://explorer-studio.genlayer.com/tx/0x7657ebf7e368487368c6a15e95db31e992f1f49eeb0ec47595d44169baff0ede) |
| Coinbase replay | Finalized rollback `AUTHORIZATION_NOT_ACTIVE` | [`0x4948ed0aac1c22ac97f193d763e03f7ffec8955f917fe105c9658a448d09a535`](https://explorer-studio.genlayer.com/tx/0x4948ed0aac1c22ac97f193d763e03f7ffec8955f917fe105c9658a448d09a535) |
| Kraken intent creation | Finalized | [`0x31b4d000b18a471e8f55c65186beb9199998841e9d961dff8a1d496ee224e1d0`](https://explorer-studio.genlayer.com/tx/0x31b4d000b18a471e8f55c65186beb9199998841e9d961dff8a1d496ee224e1d0) |
| Kraken ticket schedule | Finalized | [`0x721395114d5612ffedc065d579c5d5fcde5a69af2aa83d0c2e9f10f616f22644`](https://explorer-studio.genlayer.com/tx/0x721395114d5612ffedc065d579c5d5fcde5a69af2aa83d0c2e9f10f616f22644) |
| Kraken live assessment | Finalized `DOES_NOT_AFFECT_OPERATION` | [`0xb0c8100e96dbadbff9be20f976e658d7ac541c2edb3959d8c02936f81bfef2bd`](https://explorer-studio.genlayer.com/tx/0xb0c8100e96dbadbff9be20f976e658d7ac541c2edb3959d8c02936f81bfef2bd) |
| Stale intent creation | Finalized | [`0x27bb2dcef3ffac538216012428932791dedfde8506c6e83b5fb8de59fb3fa150`](https://explorer-studio.genlayer.com/tx/0x27bb2dcef3ffac538216012428932791dedfde8506c6e83b5fb8de59fb3fa150) |
| Stale ticket schedule | Finalized | [`0x4dd225662f343da958b8052321994288ac055762c9670bd0d24233fe5c2fe695`](https://explorer-studio.genlayer.com/tx/0x4dd225662f343da958b8052321994288ac055762c9670bd0d24233fe5c2fe695) |
| Policy rotation | Finalized | [`0x42046693deafe911cd6d45f065273c9376f7438acd6d43cd28f6c451a6084a45`](https://explorer-studio.genlayer.com/tx/0x42046693deafe911cd6d45f065273c9376f7438acd6d43cd28f6c451a6084a45) |
| Stale assessment | Finalized rollback `STALE_POLICY_REVISION` | [`0xf9e00c2fe813bb0ed257c9d566f59cf0a926be769f36744f22c4705e4da03742`](https://explorer-studio.genlayer.com/tx/0xf9e00c2fe813bb0ed257c9d566f59cf0a926be769f36744f22c4705e4da03742) |

Final readback: Coinbase `EXECUTED` and consumed once; Kraken `AUTHORIZED`, with the current GLMR incident explicitly interpreted from its latest update as withdrawals enabled; stats `policies=2`, `intents=3`, `executions=1`. Both assessment receipts were inspected directly: leader and validator executions returned `SUCCESS` with empty stdout/stderr. The V3 pickled-storage warning did not recur.

## V6 pre-deployment gate and architecture correction

The first V6 design attempted a synchronous target-to-Gate view handshake. Three independent deployment pairs all rolled back during policy registration with `INVALID_GUARDED_TARGET`, so that boundary was not treated as reliable. Failed registration transactions include [`0x8856e561e5ee123a36925e36e369d7bdab07a67ade7af4bab6056e7391c8b460`](https://explorer-studio.genlayer.com/tx/0x8856e561e5ee123a36925e36e369d7bdab07a67ade7af4bab6056e7391c8b460), [`0x315384fe3870703e4b6064d314311eba80cd216b159802d2a1add9eb91484dea`](https://explorer-studio.genlayer.com/tx/0x315384fe3870703e4b6064d314311eba80cd216b159802d2a1add9eb91484dea), and [`0xbd85f9955cd22a1910e8c4efad1f737109cb2dca31d64886ca614d47c4644628`](https://explorer-studio.genlayer.com/tx/0xbd85f9955cd22a1910e8c4efad1f737109cb2dca31d64886ca614d47c4644628). These are negative evidence, not successful V6 deployments.

The corrected V6 uses finalized messages only: Gate pins the target at construction, target binds Gate once, Gate queues exact operations, target applies each intent idempotently and stores a receipt, and target confirms back to Gate. Pause revisions invalidate older queued operations. A final red-team pass found that an asynchronously delayed message initially lacked target-side expiry enforcement; the message now carries `expires_at`, the target rejects expired delivery, and Gate rejects expired retries. Gate also exposes its constructor-pinned target in `get_stats`, allowing both sides of the pair to be verified before the irreversible target binding. On 2026-09-10, the corrected source passed 52 tests, both GenVM lint/semantic checks, frontend ESLint, and the production build. No Critical/High issue remained in the reviewed scope. These remain source-level claims until a fresh pair completes the two-contract lifecycle.

The first bound async pair (`GuardedTarget` `0xeAf792eC14045076068bBF0b69441142aBf3CD1F`, Gate `0x7EE4Bd8A59565880D446ad8b65d8e1E7261A0AE4`) proved registration, live Coinbase assessment, direct-target rejection, wrong-caller rejection, and digest-mutation rejection. Its queue transaction [`0x3820a24085c0f993c22b395030c246a8f580734d95f48d414a854ea4b755dc41`](https://explorer-studio.genlayer.com/tx/0x3820a24085c0f993c22b395030c246a8f580734d95f48d414a854ea4b755dc41) then exposed a runtime API error: the pinned runner provides `gl.get_contract_at`, not `gl.contract.get_at`. The pair is immutable and must not be presented as a successful end-to-end V6 deployment. Source was corrected at every emit site and must be redeployed as a new pair.

## V6 async StudioNet lifecycle — 2026-09-10

Final pair: IncidentGate `0xfDc30E43235cDA8caF3b544D59ef2a3bB00f0c2D`; GuardedTarget `0xD13875cd7330E052e71f0cfBB3938B3411Bbb571`; one-time binding [`0xc7602539fdad18b070127150d7a229df41bbea06bc42d2f5c3b73eaf42593708`](https://explorer-studio.genlayer.com/tx/0xc7602539fdad18b070127150d7a229df41bbea06bc42d2f5c3b73eaf42593708).

- Coinbase/Kraken policy registration: [`0x6e0dcbaf552921911b1e643f5b626b308a9e37a82680209c09ed1724cc21cc92`](https://explorer-studio.genlayer.com/tx/0x6e0dcbaf552921911b1e643f5b626b308a9e37a82680209c09ed1724cc21cc92), [`0xa37dc74485c966795e1c604582aa33703f68d1c94887ed5232794e864c175b5b`](https://explorer-studio.genlayer.com/tx/0xa37dc74485c966795e1c604582aa33703f68d1c94887ed5232794e864c175b5b).
- Direct target call rejected `INCIDENT_GATE_ONLY`: [`0x71a8520639f242d6386f2c5591339dafb9b2366ed8af4067e72b3eabb49a9c6f`](https://explorer-studio.genlayer.com/tx/0x71a8520639f242d6386f2c5591339dafb9b2366ed8af4067e72b3eabb49a9c6f).
- Wrong caller rejected `AGENT_ONLY`: [`0x8faf25ee4f6b53410408b87ec8486d0201b952e2e655240b54889a68eff72d74`](https://explorer-studio.genlayer.com/tx/0x8faf25ee4f6b53410408b87ec8486d0201b952e2e655240b54889a68eff72d74).
- Coinbase create/schedule/assessment: [`0x9ab6970b0d5e7212abaf449210532a50bc5084fcd6c1644a7385d91616a84e5d`](https://explorer-studio.genlayer.com/tx/0x9ab6970b0d5e7212abaf449210532a50bc5084fcd6c1644a7385d91616a84e5d), [`0x9b523c1105f4996a341947b9311735b3a704a526d731d19294fbfca150b5fa3e`](https://explorer-studio.genlayer.com/tx/0x9b523c1105f4996a341947b9311735b3a704a526d731d19294fbfca150b5fa3e), [`0x4875e41aa3a3ef2d4dee0776acdffdc1c0a391976065897fdb238a82e46a4d69`](https://explorer-studio.genlayer.com/tx/0x4875e41aa3a3ef2d4dee0776acdffdc1c0a391976065897fdb238a82e46a4d69).
- Mutated digest rejected: [`0x315f7a70d07eac73ac7abc6a2d146051ee18d7118fa7243fe91b85f2bf636e72`](https://explorer-studio.genlayer.com/tx/0x315f7a70d07eac73ac7abc6a2d146051ee18d7118fa7243fe91b85f2bf636e72).
- Finalized cross-contract queue: [`0x2b21b8f0ab23035cbc858ed4f3ac85a793a25fb7f8a2218f89318dd0732e4371`](https://explorer-studio.genlayer.com/tx/0x2b21b8f0ab23035cbc858ed4f3ac85a793a25fb7f8a2218f89318dd0732e4371).
- Coinbase post-state was `EXECUTED`, `consumed=true`. Target receipt operation digest `2766ea005b8bb14fba8405bf5d4d799cd2e59da42a4f329d1124ba0552ca74d7` matched Gate exactly; evidence digest was `fa718f42ac396bbf90c5e7d82e599f68944fc3664726b159b3a9f00f4b6be96f`.
- Initial Kraken assessment finalized `MAJORITY_DISAGREE` and committed no authorization. Retry of the same pending ticket finalized `AUTHORIZED`: [`0xa766fe09a46eaa88dc2a930fddc03766e16281464222f0dd79deeb920210c773`](https://explorer-studio.genlayer.com/tx/0xa766fe09a46eaa88dc2a930fddc03766e16281464222f0dd79deeb920210c773), evidence digest `c343afee6861d0c39a05e0a61e63843cdc2187b1bc4de5d126e0de76030889bf`.
- Executed capability replay rejected `AUTHORIZATION_NOT_ACTIVE`: [`0xf25c659f219bd523b5382e46edc4fdae5403e2c836cf8bc498f5813674993baf`](https://explorer-studio.genlayer.com/tx/0xf25c659f219bd523b5382e46edc4fdae5403e2c836cf8bc498f5813674993baf).
- Stale-policy create/schedule/rotate/rejected assessment: [`0xf32e17c379e431c1c5688bb83ea3f5edd9fd2784a0920aeac6cec6c1efd62435`](https://explorer-studio.genlayer.com/tx/0xf32e17c379e431c1c5688bb83ea3f5edd9fd2784a0920aeac6cec6c1efd62435), [`0x3c8a0894a50fd75f9dfea7aeda7077ec995b6ada8267c8c3a20c999acf33277f`](https://explorer-studio.genlayer.com/tx/0x3c8a0894a50fd75f9dfea7aeda7077ec995b6ada8267c8c3a20c999acf33277f), [`0x8cf9fb2b9f3899a5914424be4dda4ba8018cd0aed2c5ab8891b8db5f1a233517`](https://explorer-studio.genlayer.com/tx/0x8cf9fb2b9f3899a5914424be4dda4ba8018cd0aed2c5ab8891b8db5f1a233517), [`0x8bdcd82a93f31356c105d8c4ef8e161efeb6c9a7a53deab8dfbd6fb331b6de6f`](https://explorer-studio.genlayer.com/tx/0x8bdcd82a93f31356c105d8c4ef8e161efeb6c9a7a53deab8dfbd6fb331b6de6f) (`STALE_POLICY_REVISION`).

Final authoritative stats: `policies=2`, `intents=3`, `executions=1`, `target_revision=0`. This proves one complete live semantic judgment → deterministic authorization → finalized target mutation → target confirmation lifecycle, the second audited Kraken authority, and the adversarial rollbacks above. Delayed-expiry and pause-revision controls passed source-level tests but were not separately exercised as live transactions in this run.

Remaining submission evidence:

- exact network and chain ID;
- contract address and source commit;
- policy registration transaction;
- relevant-disclosure block transaction;
- fresh authorization transaction;
- execution and replay-rejection transactions;
- authoritative post-state readbacks;
- production frontend URL and configured address parity.

## V7 reviewed operation catalog — local release gate, 2026-09-11

V7 adds a contract-enforced catalog of 22 operation profiles across Coinbase and Kraken. Exchange-side BUY/SELL/TRADE uses the explicit `PLATFORM_INTERNAL` scope; DEPOSIT/WITHDRAW binds Ethereum, Base, Bitcoin, Solana, or Moonbeam. Registration normalizes the tuple and rejects any unlisted combination with `UNSUPPORTED_OPERATION_PROFILE` before writing policy state. The frontend mirrors this catalog with dependent selectors, but it is not the security boundary.

Fresh local verification completed against the V7 source:

- `python -m pytest -q`: 80 passed, including every catalog route and five adversarial near-miss profiles.
- `npm run lint`: exit 0.
- `npm run build`: exit 0; Next.js production build and TypeScript completed successfully.
- Deployment handshake: `version=7`, schema `autonomous-incident-gate-v7-catalog`.
- Authorization domains bumped to `IncidentGate:operation:v3` and `IncidentGate:authorization:v3`.

This is source-level evidence only. V6 StudioNet addresses above remain valid evidence for V6 behavior, but they are not V7 deployments. A fresh GuardedTarget/Gate pair, one-time binding, representative Coinbase and Kraken assessments, target execution, and adversarial rollbacks are still required before V7 is described as live-verified.

### V7 user deployment

- User-deployed IncidentGate V7: `0x6DE6B89544081114F893b3189c7b1Ac154824Ab4`
- GuardedTarget: `0x7E2F23BdbE60D61FB98022993202C23b2d0A77F6`
- User-submitted one-time binding transaction: [`0x3cb1589a56b8d064ba5142110bf0bf7427e59984ef5a0a976973ec34a43bb651`](https://explorer-studio.genlayer.com/tx/0x3cb1589a56b8d064ba5142110bf0bf7427e59984ef5a0a976973ec34a43bb651)

Independent readback confirmed the V7 handshake, constructor-pinned target, and reciprocal one-time binding. The V7 live suite then registered both policies and exercised direct-target rejection (`INCIDENT_GATE_ONLY`), wrong-caller rejection (`AGENT_ONLY`), and stale-policy rejection (`STALE_POLICY_REVISION`). Kraken's live assessment authorized the exact Moonbeam GLMR withdrawal and execution transaction [`0xbe26f636311c0e3645af39189218f59a0d439f7475b9ab22ecdea132c724c77c`](https://explorer-studio.genlayer.com/tx/0xbe26f636311c0e3645af39189218f59a0d439f7475b9ab22ecdea132c724c77c) finalized with Gate readback `EXECUTED`, `consumed=true` after GuardedTarget confirmation.

Coinbase's V7 assessment failed closed with `INVALID_INCIDENT_LIFECYCLE`. Root-cause inspection of the official unresolved-incident feed showed Statuspage timestamps such as `2026-09-10T18:01:30.830-07:00`; V7 accepted only `Z`. This is an availability defect in the Coinbase adapter, not an authorization bypass. V7 must not be submitted as a complete two-adapter release.

## V8 ISO-offset compatibility — local release gate, 2026-09-11

V8 accepts strictly validated ISO-8601 `Z` and `±HH:MM` timestamps, normalizes both to UTC, then applies the existing lifecycle ordering checks. It retains the 22-route catalog and all V7 authorization domains and execution controls.

- `python -m pytest -q`: 82 passed, including exact current Coinbase offset shape and UTC-equivalence tests.
- `npm run lint`: exit 0.
- `npm run build`: exit 0, including TypeScript and static production rendering.
- Handshake: `version=8`, schema `autonomous-incident-gate-v8-iso-offsets`.

At this release-gate stage V8 was not yet deployed; the frontend deliberately rejected the configured V7 address. The user subsequently deployed the fresh pair recorded below because the V7 target binding is immutable.

### V8 user deployment and binding

- User-deployed IncidentGate V8: `0x11086a66FeDBEdC879C95701d0eF33C3F18Eb277`
- Fresh GuardedTarget: `0x5Bb7E1b9f476404bcbCBC290e30CF7Dda73bBd43`
- User-submitted one-time binding: [`0x730659b2f916d3b67ecde8cf139c5c08fb29d92704667ba24dc7713d9e055bbc`](https://explorer-studio.genlayer.com/tx/0x730659b2f916d3b67ecde8cf139c5c08fb29d92704667ba24dc7713d9e055bbc)

Independent StudioNet readback confirmed the V8 handshake, Gate constructor target, target implementation identity, and reciprocal binding. The binding transaction is `FINALIZED`, targets the published GuardedTarget, and was signed by its recorded owner `0x5591ad55A861925bf04880104aa70076bAE87C91`. Initial state was clean: zero policies, intents, executions, and target operations. The frontend is configured to this exact pair; the completed live verification follows.

### V8 fail-fast StudioNet lifecycle

The live suite ran the V7 regression and previously unverified path first. Only after Coinbase completed did it run the previously passing Kraken and adversarial cases.

- Coinbase policy/create/schedule: [`0xaec0b973619bb48017341773e4653992e365d56ba39a33ad7612336000adfe2c`](https://explorer-studio.genlayer.com/tx/0xaec0b973619bb48017341773e4653992e365d56ba39a33ad7612336000adfe2c), [`0x2f2b8a9ad8ee0d2671dbd3aab952a6afe298e7900f64d843a326120a1d4d6f0f`](https://explorer-studio.genlayer.com/tx/0x2f2b8a9ad8ee0d2671dbd3aab952a6afe298e7900f64d843a326120a1d4d6f0f), [`0x3081b83c87076bc5a208440a081d7b36abdbee6a1c3a9fbcd09a2b5458cf3cec`](https://explorer-studio.genlayer.com/tx/0x3081b83c87076bc5a208440a081d7b36abdbee6a1c3a9fbcd09a2b5458cf3cec).
- Coinbase live assessment: [`0x0f8bc5c97453657306586f744648d3d23508f83fd9d9b20395e5703e6170a1e6`](https://explorer-studio.genlayer.com/tx/0x0f8bc5c97453657306586f744648d3d23508f83fd9d9b20395e5703e6170a1e6); the official offset timestamps parsed successfully and verdict was `DOES_NOT_AFFECT_OPERATION`.
- Mutated authorization rejected: [`0xac9fae8b314fea7c330494f36b4006b2d58453dab88bdeec5f4cbd2a1c458585`](https://explorer-studio.genlayer.com/tx/0xac9fae8b314fea7c330494f36b4006b2d58453dab88bdeec5f4cbd2a1c458585) (`AUTHORIZATION_DIGEST_MISMATCH`).
- Coinbase exact execution: [`0x2a0ac0760c1e85c5684bcf5fc3ebe8c9e6ecd560133df6b05bc19d52e58744c2`](https://explorer-studio.genlayer.com/tx/0x2a0ac0760c1e85c5684bcf5fc3ebe8c9e6ecd560133df6b05bc19d52e58744c2); final Gate state `EXECUTED`, `consumed=true`. GuardedTarget receipt exists and its operation digest matches Gate exactly.
- Direct target bypass rejected: [`0x84794192ad1c1fefb5b904a768f000c5c66e30237c4bd38015e6aaedced03df4`](https://explorer-studio.genlayer.com/tx/0x84794192ad1c1fefb5b904a768f000c5c66e30237c4bd38015e6aaedced03df4) (`INCIDENT_GATE_ONLY`).
- Wrong caller rejected: [`0x47270e14e835661e15fb39119f0117e200b6c63591e2ea72a3cd0af2d1869268`](https://explorer-studio.genlayer.com/tx/0x47270e14e835661e15fb39119f0117e200b6c63591e2ea72a3cd0af2d1869268) (`AGENT_ONLY`).
- Kraken policy/create/schedule/assessment: [`0x06d4c054c90283fb1dd3896faab9449e19002f172fd2d1f02b5450e76b32ad48`](https://explorer-studio.genlayer.com/tx/0x06d4c054c90283fb1dd3896faab9449e19002f172fd2d1f02b5450e76b32ad48), [`0xf5ad2b07270dfa973bfb4e9910ace3c27a8a4ad5180e3c489c4335e153243dbe`](https://explorer-studio.genlayer.com/tx/0xf5ad2b07270dfa973bfb4e9910ace3c27a8a4ad5180e3c489c4335e153243dbe), [`0x7540e571d2d453be1ff15ca92aac261a24d711e13ba2d0f04afdee619f8bec13`](https://explorer-studio.genlayer.com/tx/0x7540e571d2d453be1ff15ca92aac261a24d711e13ba2d0f04afdee619f8bec13), [`0x3b48ee0f8f73e614744e8b776156c3c070456f4adac33bc3161288e80a834fdb`](https://explorer-studio.genlayer.com/tx/0x3b48ee0f8f73e614744e8b776156c3c070456f4adac33bc3161288e80a834fdb); final state `AUTHORIZED`.
- Stale-policy assessment rejected: [`0xbfe7e1e25d158e56854f81fc8418efbe68d8ec14327a43581e869ea30df20c4e`](https://explorer-studio.genlayer.com/tx/0xbfe7e1e25d158e56854f81fc8418efbe68d8ec14327a43581e869ea30df20c4e) (`STALE_POLICY_REVISION`).
- Consumed Coinbase capability replay rejected: [`0x6d46e16480bb0f12d6f685ed0f33c9120883ff04c8a07a927431e94626f8f84e`](https://explorer-studio.genlayer.com/tx/0x6d46e16480bb0f12d6f685ed0f33c9120883ff04c8a07a927431e94626f8f84e) (`AUTHORIZATION_NOT_ACTIVE`).

Final V8 stats: `policies=2`, `intents=3`, `executions=1`; GuardedTarget operation count is one. This proves the formerly failing Coinbase offset case, semantic consensus, exact cross-contract execution, reciprocal confirmation, replay resistance, the second Kraken authority, and the selected adversarial rollbacks on the user-deployed V8 pair.

### V8 additional live hardening

- Unlisted Coinbase `ETHEREUM/USDC/BUY` policy rejected: [`0x0bd9e64bec82682427248822d828a084d3cdea7daac63492b2f1ccc13526987e`](https://explorer-studio.genlayer.com/tx/0x0bd9e64bec82682427248822d828a084d3cdea7daac63492b2f1ccc13526987e) (`UNSUPPORTED_OPERATION_PROFILE`).
- Policy/create/schedule/assessment for a 30-second Kraken authorization: [`0x62cd8cd353addf2c35b658ccfdb38104fc91b61cccce086e08b0c8e89a9c0548`](https://explorer-studio.genlayer.com/tx/0x62cd8cd353addf2c35b658ccfdb38104fc91b61cccce086e08b0c8e89a9c0548), [`0x6f5ead9c08c89785f58cf425e178ba06a72d2fc1fb4b1635d1c823159c180bee`](https://explorer-studio.genlayer.com/tx/0x6f5ead9c08c89785f58cf425e178ba06a72d2fc1fb4b1635d1c823159c180bee), [`0xc03773d288ffc2f4a843a47aa148b0f1ce222a067448fe1458a949b153384b08`](https://explorer-studio.genlayer.com/tx/0xc03773d288ffc2f4a843a47aa148b0f1ce222a067448fe1458a949b153384b08), [`0x83b4d6b2301eaa153a1bff0960762535fc88e516aba4d88deddb4b3896ad5bdb`](https://explorer-studio.genlayer.com/tx/0x83b4d6b2301eaa153a1bff0960762535fc88e516aba4d88deddb4b3896ad5bdb).
- Same-agent nonce replay rejected: [`0x1600b564120734d9585b8481d21cc8d0a5185bd95468e8dbf70dee22a518c4db`](https://explorer-studio.genlayer.com/tx/0x1600b564120734d9585b8481d21cc8d0a5185bd95468e8dbf70dee22a518c4db) (`NONCE_ALREADY_USED`).
- Execution after the authorization boundary rejected: [`0x7499cbf655903339c9950840eb32354b2c8472d178cee6f39ab89d9071b8b59e`](https://explorer-studio.genlayer.com/tx/0x7499cbf655903339c9950840eb32354b2c8472d178cee6f39ab89d9071b8b59e) (`AUTHORIZATION_NOT_ACTIVE`); readback remained `AUTHORIZED`, `consumed=false`, proving no execution occurred.

### V8 owner-control verification

The GuardedTarget owner `0x5591ad55A861925bf04880104aa70076bAE87C91` completed the remaining owner-only checks:

- Emergency pause enabled: [`0x6d1cc02d72e062fe3526e4023bbfc4fe1152b5f7a2a02cdefe3cac5586f40f45`](https://explorer-studio.genlayer.com/tx/0x6d1cc02d72e062fe3526e4023bbfc4fe1152b5f7a2a02cdefe3cac5586f40f45) (`set_paused(true)`, finalized success).
- Emergency pause disabled: [`0xcd9826bc5653e99bfb6538fe1ff435d16ddff1f296eafe2f79506bfb11057de6`](https://explorer-studio.genlayer.com/tx/0xcd9826bc5653e99bfb6538fe1ff435d16ddff1f296eafe2f79506bfb11057de6) (`set_paused(false)`, finalized success; one later validator was idle after quorum and did not affect the accepted execution).
- A second attempt to bind the already-bound target: [`0xe85fa9bab4edb0f4ad276c8049fafb33d8b8a47c9f6a86815f660dabc0eb6cde`](https://explorer-studio.genlayer.com/tx/0xe85fa9bab4edb0f4ad276c8049fafb33d8b8a47c9f6a86815f660dabc0eb6cde) (finalized rollback `INCIDENT_GATE_ALREADY_BOUND`).

Independent post-state readback confirmed `paused=false`, GuardedTarget `pause_revision=2`, and Gate `target_revision=2`. The target remains bound to the published V8 Gate, with operation count one; Gate remains at one confirmed execution. This completes pause/unpause propagation and immutable one-time binding evidence on the user-deployed V8 pair.
