# Studio Next assessment probe

`IncidentGate` V9 passes policy registration, intent creation and scheduling on Studio Next, but both Coinbase and Kraken `assess_intent` return `exit_code 1`. That receipt alone does not identify the failing primitive. Do not change the production contract based on it.

Deploy **only** `contracts/studio_next_probe.py` at `https://studio-next.genlayer.com/contracts`, Normal (Full Consensus), chain ID `61997`. No constructor arguments. This probe neither holds funds nor calls IncidentGate.

Run these methods, one transaction each, and record the transaction hash and finalized execution result:

1. `probe_custom_validator()` — originally reproduced the obsolete `run_nondet_unsafe` failure; source now uses `run_nondet` for future deployments.
2. `probe_llm()` — isolates `exec_prompt(response_format="json")`.
3. `probe_get(0)` and `probe_get(1)` — Coinbase/Kraken raw HTTP and exact page binding.
4. `probe_render(0)` and `probe_render(1)` — Coinbase/Kraken browser text rendering.

Interpret only a `FINALIZED` transaction with successful GenVM execution and a successful validator result as a pass. `exit_code 1`, timeout, or consensus disagreement is a failure, even if the transaction status is `ACCEPTED` or `FINALIZED`. Do not treat `probe_render` as a replacement security control for raw HTTP: render does not expose response status or final redirect URL.

This contract is diagnostic only. Its deployment is **not** the hackathon IncidentGate deployment. After the failing boundary is identified, fix and re-test the production contract, then the user deploys a fresh production pair if its code changed.

## Recorded result

- Deployed probe: `0x18313097aA686bf4d897b6841ca32c96525Fa65D`.
- Obsolete custom call: `0x7b3bd659b8dba27d30e698d195c750f775556a16fbff54c4b971120ba17c3927` — finalized contract error `exit_code 1`.
- Kraken `strict_eq` + raw `web.get`: `0x27df23b03c7af62068393353a1789ece943a145b8a13a3daf7bc6fa3c4f724a9` — finalized success, `BOUND`.
- Isolated `exec_prompt`: `0xd57b415b0dc8d60169088a9fa218f750ce5346c4e0472b7870d00be8ad353f73` — finalized success, `VALID`.
- Coinbase `strict_eq` + raw `web.get`: `0xadbeab391e752d3d2f2144e92eb0ad4ccc9376f28488d848225d20d6e9e46448` — finalized success, `BOUND`.

Conclusion: Studio Next web access, both authority bindings, and LLM execution work. V9 failed because it called the removed SDK method `run_nondet_unsafe`; V10 uses `run_nondet`.
