"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight, Check, ExternalLink, Fingerprint, LockKeyhole, Radio, RefreshCw, ShieldAlert, Sparkles, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { connectedWallet, connectWallet, contractAddress, disconnectWallet, explorerAddress, explorerTargetAddress, explorerTx, isConfigured, networkName, readContract, targetAddress, unwrap, watchWallet, writeContract } from "@/lib/genlayer";

type IntentState = { exists: boolean; policy_id?: string; assessor?: string; asset?: string; action?: string; chain_ref?: string; amount?: string; status?: string; verdict?: string; target_contract?: string; function_selector?: string; calldata_digest?: string; call_value?: string; operation_digest?: string; authorization_digest?: string; evidence_digest?: string; assessment_not_before?: string; assessment_deadline?: string; expires_at?: string; consumed?: boolean; reason?: string };
type Stats = { policies: string; intents: string; executions: string; target_revision?: string; guarded_target?: string };
type ContractVersion = { name?: string; version?: number; schema?: string };
const EXPECTED_SCHEMA = "autonomous-incident-gate-v8-iso-offsets";

type Route = { chain: string; asset: string; action: string };
const ADAPTERS = {
  COINBASE: { name: "Coinbase", source: "https://status.coinbase.com/api/v2/incidents/unresolved.json", pageId: "kr0djjh0jyy9", routes: [
    { chain: "PLATFORM_INTERNAL", asset: "USDC", action: "BUY" }, { chain: "PLATFORM_INTERNAL", asset: "USDC", action: "SELL" },
    { chain: "PLATFORM_INTERNAL", asset: "BTC", action: "BUY" }, { chain: "PLATFORM_INTERNAL", asset: "BTC", action: "SELL" },
    { chain: "PLATFORM_INTERNAL", asset: "ETH", action: "BUY" }, { chain: "PLATFORM_INTERNAL", asset: "ETH", action: "SELL" },
    { chain: "ETHEREUM", asset: "USDC", action: "DEPOSIT" }, { chain: "ETHEREUM", asset: "USDC", action: "WITHDRAW" },
    { chain: "BASE", asset: "USDC", action: "DEPOSIT" }, { chain: "BASE", asset: "USDC", action: "WITHDRAW" },
  ] satisfies Route[] },
  KRAKEN: { name: "Kraken", source: "https://status.kraken.com/api/v2/incidents/unresolved.json", pageId: "lfz25gyhcpjf", routes: [
    { chain: "PLATFORM_INTERNAL", asset: "BTC", action: "TRADE" }, { chain: "PLATFORM_INTERNAL", asset: "ETH", action: "TRADE" },
    { chain: "PLATFORM_INTERNAL", asset: "USDC", action: "TRADE" }, { chain: "PLATFORM_INTERNAL", asset: "GLMR", action: "TRADE" },
    { chain: "BITCOIN", asset: "BTC", action: "DEPOSIT" }, { chain: "BITCOIN", asset: "BTC", action: "WITHDRAW" },
    { chain: "ETHEREUM", asset: "USDC", action: "DEPOSIT" }, { chain: "ETHEREUM", asset: "USDC", action: "WITHDRAW" },
    { chain: "SOLANA", asset: "SOL", action: "DEPOSIT" }, { chain: "SOLANA", asset: "SOL", action: "WITHDRAW" },
    { chain: "MOONBEAM", asset: "GLMR", action: "DEPOSIT" }, { chain: "MOONBEAM", asset: "GLMR", action: "WITHDRAW" },
  ] satisfies Route[] },
} as const;
type AdapterId = keyof typeof ADAPTERS;
const routeKey = (route: Route) => `${route.chain}:${route.asset}:${route.action}`;
const policyKey = (adapter: AdapterId, route: Route) => `${adapter}-${route.chain}-${route.asset}-${route.action}`.toLowerCase().replaceAll("_", "-");
const unique = (values: string[]) => [...new Set(values)];
const ROUTE_COUNT = Object.values(ADAPTERS).reduce((total, adapter) => total + adapter.routes.length, 0);
const PROOFS = ["Judgment ≠ execution", "Fail closed by default", "Coinbase authority", "Kraken authority", "Expiry + nonce bound"];
const CONTROLS = ["Exact origin + path", "Page ID binding", "Incident lifecycle", "Validator refetch", "Evidence digest", "Fail-closed uncertainty"];
const FAQS = [
  ["What does IncidentGate actually do?", "It is an automatic safety gate placed between a treasury agent and an executor. Before an operation can change target state, IncidentGate checks whether current official incident disclosures materially affect that exact operation."],
  ["Can you give one concrete example?", "A bot wants to buy 1,000 USDC through a Coinbase policy. If Coinbase reports that USDC buys are unavailable, the operation is blocked. If the report says only sends are delayed while buys remain unaffected, a short-lived, one-use authorization may be issued."],
  ["Who would use this in the real world?", "DAO treasuries, market makers, payment schedulers, bridge operators, trading bots and AI agents that act continuously. It reduces the risk of automation blindly executing while an official service notice says the relevant action is impaired."],
  ["What role does GenLayer play?", "Validators independently retrieve the fixed Coinbase or Kraken status source and reach consensus on one narrow semantic question: does this unresolved disclosure affect the bound operation? Deterministic contract code—not the model—then enforces identity, amount, target, nonce, expiry and replay rules."],
  ["Does IncidentGate hold or move real funds?", "Not in this hackathon release. The live GuardedTarget proves an enforceable on-chain state transition and rejects bypasses, but it is not a production custody vault and it does not log in to Coinbase or Kraken. A separately audited treasury or trading executor can integrate behind the Gate."],
  ["What happens when evidence is missing or unclear?", "It fails closed. Source errors, malformed schemas, identity mismatch, ambiguous meaning, validator disagreement, expired authorization, stale policy or replay never produce a valid execution permission."],
] as const;
const short = (value: string) => value.length > 13 ? `${value.slice(0, 7)}…${value.slice(-4)}` : value;

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [adapterId, setAdapterId] = useState<AdapterId>("COINBASE");
  const [selectedRoute, setSelectedRoute] = useState("PLATFORM_INTERNAL:USDC:BUY");
  const [intentId, setIntentId] = useState("intent-demo-001");
  const [policyId, setPolicyId] = useState("coinbase-platform-internal-usdc-buy");
  const [amount, setAmount] = useState("1000");
  const [nonce, setNonce] = useState("nonce-demo-001");
  const [destination, setDestination] = useState("");
  const [agent, setAgent] = useState("");
  const targetContract = targetAddress();
  const [intent, setIntent] = useState<IntentState | null>(null);
  const [stats, setStats] = useState<Stats>({ policies: "0", intents: "0", executions: "0" });
  const [busy, setBusy] = useState("");
  const [deploymentReady, setDeploymentReady] = useState(false);
  const [notice, setNotice] = useState("Ready. Connect the registered treasury agent wallet.");
  const [txHash, setTxHash] = useState("");
  const [loadedId, setLoadedId] = useState("");
  const [readError, setReadError] = useState("");
  const [lastRead, setLastRead] = useState("");
  const readSequence = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      const sequence = ++readSequence.current;
      const [state, totals] = await Promise.all([readContract("get_intent", [intentId]), readContract("get_stats")]);
      if (!active) return;
      if (sequence !== readSequence.current) { timer = setTimeout(refresh, 5000); return; }
      const value = state.success ? unwrap<IntentState>(state.data) : null;
      if (value && typeof value.exists === "boolean") {
        setIntent(value); setLoadedId(intentId); setReadError("");
        setLastRead(new Date().toLocaleTimeString());
      } else { setLoadedId(""); setReadError(state.error || "Unable to read intent state. Retrying…"); }
      if (totals.success) { const value = unwrap<Stats>(totals.data); if (value) setStats(value); }
      timer = setTimeout(refresh, 5000);
    };
    void refresh();
    return () => { active = false; ++readSequence.current; clearTimeout(timer); };
  }, [intentId]);

  const verifyDeployment = useCallback(async () => {
    if (!isConfigured()) return false;
    const result = await readContract("get_contract_version");
    const version = result.success ? unwrap<ContractVersion>(result.data) : null;
    const valid = version?.name === "IncidentGate" && version.version === 8 && version.schema === EXPECTED_SCHEMA;
    setDeploymentReady(valid);
    return valid;
  }, []);

  useEffect(() => {
    if (!isConfigured()) return;
    let active = true;
    void readContract("get_contract_version").then(result => {
      if (!active) return;
      const version = result.success ? unwrap<ContractVersion>(result.data) : null;
      setDeploymentReady(version?.name === "IncidentGate" && version.version === 8 && version.schema === EXPECTED_SCHEMA);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void connectedWallet().then(address => { if (active) setWallet(address); });
    const unwatch = watchWallet(address => {
      setWallet(address);
      setNotice(address ? `Wallet switched to ${short(address)}.` : "Wallet disconnected. Connect another account to continue.");
      setTxHash("");
    });
    return () => { active = false; unwatch(); };
  }, []);

  const sync = useCallback(async () => {
    if (!isConfigured()) { setNotice("Preview mode — deploy the contract to enable live writes."); return; }
    setBusy("sync");
    const compatible = await verifyDeployment();
    if (!compatible) { setNotice("V8 deployment pending — configured address does not match the ISO-offset-compatible handshake."); setBusy(""); return; }
    const sequence = ++readSequence.current;
    const [stateResult, statsResult] = await Promise.all([readContract("get_intent", [intentId]), readContract("get_stats")]);
    if (sequence !== readSequence.current) { setBusy(""); return; }
    if (stateResult.success) { setIntent(unwrap<IntentState>(stateResult.data)); setLoadedId(intentId); setReadError(""); setLastRead(new Date().toLocaleTimeString()); }
    else { setLoadedId(""); setReadError(stateResult.error || "Readback failed."); }
    if (statsResult.success) setStats(unwrap<Stats>(statsResult.data) || stats);
    setNotice(stateResult.success ? "Authoritative state synchronized." : stateResult.error || "Readback failed.");
    setBusy("");
  }, [intentId, stats, verifyDeployment]);

  async function connect() {
    const result = await connectWallet();
    if (result.success) { const address = String(result.data); setWallet(address); setDestination(current => current || address); setNotice("Wallet connected. Owner assesses; the separate treasury agent creates, schedules and executes."); }
    else setNotice(result.error || "Wallet connection failed.");
  }

  async function disconnect() {
    await disconnectWallet();
    setWallet("");
    setDestination("");
    setAgent("");
    setTxHash("");
    setNotice("Wallet disconnected. Select Connect wallet to choose another account.");
  }

  async function transact(label: string, method: string, args: unknown[], address?: string) {
    if (!await verifyDeployment()) { setNotice("Write blocked: deploy and configure the V8 Gate before using this catalog."); return; }
    setBusy(label); setTxHash(""); setNotice(`${label} submitted. Waiting for consensus and execution…`);
    const result = await writeContract(method, args, address);
    if (result.hash) setTxHash(result.hash);
    setNotice(result.success ? `${label} finalized. Reading authoritative state…` : result.error || `${label} failed.`);
    setBusy("");
    if (result.success) await sync();
  }

  const status = loadedId !== intentId ? "SYNCING" : intent?.exists ? intent.status || "UNKNOWN" : "NO INTENT";
  const authorized = status === "AUTHORIZED";
  const queued = status === "EXECUTION_QUEUED";
  const blocked = status.startsWith("BLOCKED_") || status === "SOURCE_FAILURE" || status === "EXPIRED";
  const adapter = ADAPTERS[adapterId];
  const route = adapter.routes.find(item => routeKey(item) === selectedRoute) || adapter.routes[0];
  const scopes = unique(adapter.routes.map(item => item.chain));
  const assets = unique(adapter.routes.filter(item => item.chain === route.chain).map(item => item.asset));
  const actions = unique(adapter.routes.filter(item => item.chain === route.chain && item.asset === route.asset).map(item => item.action));
  const previewAction = intent?.exists ? intent.action || route.action : route.action;
  const previewAsset = intent?.exists ? intent.asset || route.asset : route.asset;
  const previewScope = intent?.exists ? intent.chain_ref || route.chain : route.chain;
  const previewAuthority = intent?.exists ? "Policy-bound" : adapter.name;

  function chooseRoute(next: Route) {
    setSelectedRoute(routeKey(next)); setPolicyId(policyKey(adapterId, next)); setIntent(null);
  }

  function selectAdapter(value: AdapterId) {
    const next = ADAPTERS[value];
    const nextRoute = next.routes[0];
    setAdapterId(value); setSelectedRoute(routeKey(nextRoute)); setPolicyId(policyKey(value, nextRoute)); setIntentId(`${value.toLowerCase()}-intent-001`); setNonce(`${value.toLowerCase()}-nonce-001`); setIntent(null);
  }

  return <main>
    <header className="site-header">
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="IncidentGate home"><Image src="/incidentgate-mark-v2.png" alt="" width={44} height={44} priority/><span>Incident<span className="brand-gate">Gate</span></span></a>
        <div className="nav-links"><a href="#top">Overview</a><a href="#how">How it works</a><a href="#console">Control room</a><a href="#evidence">Trust</a><a href="#faq">FAQ</a></div>
        <div className="wallet-session">{wallet ? <><button className="wallet wallet-address" onClick={connect} title="Open wallet account selector"><Wallet size={16}/>{short(wallet)}</button><button className="wallet disconnect" onClick={disconnect} aria-label="Disconnect wallet" title="Disconnect wallet"><X size={16}/><span>Disconnect</span></button></> : <button className="wallet" onClick={connect}><Wallet size={16}/>Connect wallet</button>}</div>
      </nav>
    </header>

    <section id="top" className="hero shell">
      <div className="eyebrow reveal r1"><span>AUTONOMOUS PROTOCOLS / 01</span><span className="live-dot">LIVE AUTHORITY</span></div>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="reveal r2">The door that<br/><em>thinks before</em><br/>funds move.</h1>
          <p className="lead reveal r3">A semantic authorization gateway for autonomous treasuries. GenLayer reads authoritative incident disclosures, judges their relevance to one exact operation, then deterministic code issues a one-time capability for the downstream executor.</p>
          <div className="hero-actions reveal r4"><a href="#console" className="primary">Open control room <ArrowRight size={18}/></a><a href="#how" className="ghost">How it works <ArrowDown size={17}/></a></div>
        </div>
        <div className="gate-stage reveal r3" aria-hidden="true">
          <div className="orbit orbit-a"/><div className="orbit orbit-b"/>
          <div className="gate-frame"><div className="gate-door"/><div className="scanner"/></div>
          <div className="signal signal-a"><Radio size={14}/> SOURCE VERIFIED</div>
          <div className="signal signal-b"><LockKeyhole size={14}/> SINGLE USE</div>
          <div className="signal signal-c">CONSENSUS<br/><b>05 / 05</b></div>
        </div>
      </div>
      <div className="proof-strip marquee reveal r5"><div className="marquee-track">{[0, 1].map(copy => <div className="marquee-group proof-group" aria-hidden={copy === 1} key={copy}>{PROOFS.map(item => <span key={item}>{item}<b/></span>)}</div>)}</div></div>
    </section>

    <section id="how" className="how shell">
      <div className="section-number">02 — SIGNAL PATH</div>
      <div className="section-head"><h2>From public disclosure<br/>to executable permission.</h2><p>IncidentGate never claims a platform is safe. It establishes whether the currently retrieved disclosure set contains a blocking condition for this exact intent.</p></div>
      <div className="steps">
        {[
          ["01", "Bind intent", "Agent, destination, network, asset, action, amount and nonce become one immutable operation."],
          ["02", "Retrieve", "Validators independently fetch the selected pre-audited Coinbase or Kraken unresolved-incident feed."],
          ["03", "Judge relevance", "GenLayer resolves the semantic relation. It never outputs ALLOW or BLOCK."],
          ["04", "Enforce", "Code consumes the capability once and emits the exact finalized operation to a Gate-only target."],
        ].map(([n,t,d]) => <article key={n}><span>{n}</span><div className="step-icon">{n === "01" ? <Fingerprint/> : n === "02" ? <Radio/> : n === "03" ? <Sparkles/> : <LockKeyhole/>}</div><h3>{t}</h3><p>{d}</p></article>)}
      </div>
    </section>

    <section id="console" className="console-shell">
      <div className="console shell">
        <header className="console-head"><div><div className="section-number">03 — CONTROL ROOM</div><h2>Run the gate.</h2></div><button className="sync" onClick={sync} disabled={!!busy}><RefreshCw size={15} className={busy === "sync" ? "spin" : ""}/> Sync state</button></header>
        <div className="operator-note"><Radio size={18}/><div><b>Operator signal</b><span>{notice}</span></div>{txHash && <a href={explorerTx(txHash)} target="_blank" rel="noreferrer">Transaction <ExternalLink size={13}/></a>}</div>
        <div className="console-grid">
          <div className="controls">
            <div className="card-label">ONE-TIME POLICY SETUP</div>
            <div className="catalog-head"><label className="adapter-picker">AUDITED AUTHORITY<select value={adapterId} onChange={e=>selectAdapter(e.target.value as AdapterId)}><option value="COINBASE">Coinbase Status · 10 reviewed routes</option><option value="KRAKEN">Kraken Status · 12 reviewed routes</option></select></label><span>{ROUTE_COUNT} CONTRACT-ENFORCED ROUTES</span></div>
            <div className="route-grid">
              <label>Execution scope<select value={route.chain} onChange={e=>{const next=adapter.routes.find(item=>item.chain===e.target.value)!; chooseRoute(next);}}>{scopes.map(value=><option key={value} value={value}>{value === "PLATFORM_INTERNAL" ? "Platform internal" : value}</option>)}</select></label>
              <label>Asset<select value={route.asset} onChange={e=>{const next=adapter.routes.find(item=>item.chain===route.chain&&item.asset===e.target.value)!; chooseRoute(next);}}>{assets.map(value=><option key={value}>{value}</option>)}</select></label>
              <label>Action<select value={route.action} onChange={e=>{const next=adapter.routes.find(item=>item.chain===route.chain&&item.asset===route.asset&&item.action===e.target.value)!; chooseRoute(next);}}>{actions.map(value=><option key={value}>{value}</option>)}</select></label>
            </div>
            <p className="scope-note">{route.chain === "PLATFORM_INTERNAL" ? "Internal scope: an exchange-side buy, sell or trade—not a blockchain network." : `Network-bound scope: ${route.action.toLowerCase()} ${route.asset} on ${route.chain}.`}</p>
            <div className="field-grid policy-setup">
              <label>Separate treasury agent<input value={agent} onChange={e=>setAgent(e.target.value)} placeholder="0x… agent must differ from owner"/></label>
              <label>Bound destination<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="0x…"/></label>
              <label>Reviewed GuardedTarget<input value={targetContract} readOnly aria-readonly="true"/></label>
            </div>
            <button className="execute setup" disabled={!!busy || !wallet || !agent || !destination || !/^0x[0-9a-fA-F]{40}$/.test(targetContract) || agent.toLowerCase() === wallet.toLowerCase()} onClick={()=>transact("Register policy", "register_policy", [policyId, agent, adapterId, adapter.source, adapter.pageId, adapter.name, destination, route.chain, route.asset, route.action, BigInt("1000000000000"), 300])}>0. Owner registers policy <Fingerprint size={17}/></button>
            <div className="card-label intent-label">TRANSACTION INTENT</div>
            <div className="field-grid">
              <label>Intent ID<input value={intentId} disabled={!!busy} onChange={e=>{setIntentId(e.target.value); setIntent(null); setLoadedId("");}}/></label>
              <label>Policy ID<input value={policyId} onChange={e=>setPolicyId(e.target.value)}/></label>
              <label>Amount / {route.asset} units<input inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
              <label>Replay nonce<input value={nonce} onChange={e=>setNonce(e.target.value)}/></label>
            </div>
            <div className="intent-preview"><div><span>Action</span><b>{previewAction} {previewAsset}</b></div><ArrowRight/><div><span>Authority / scope</span><b>{previewAuthority} / {previewScope === "PLATFORM_INTERNAL" ? "internal" : previewScope}</b></div></div>
            <div className="button-row">
              <button className="primary wide" disabled={!!busy || !wallet || !/^\d+$/.test(amount) || BigInt(amount) <= BigInt(0)} onClick={()=>transact("Create intent", "create_intent", [intentId, policyId, BigInt(amount), nonce])}>1. Agent creates intent <ArrowRight size={17}/></button>
              <button className="outline wide" disabled={!!busy || !intent?.exists || status !== "CREATED"} onClick={()=>transact("Schedule assessment", "schedule_assessment", [intentId, 300])}>2. Agent schedules assessment <LockKeyhole size={17}/></button>
            </div>
            <button className="outline execute" disabled={!!busy || !intent?.exists || status !== "ASSESSMENT_SCHEDULED"} onClick={()=>transact("Assess intent", "assess_intent", [intentId])}>3. Owner assesses after 30s <Sparkles size={17}/></button>
            <button className="execute" disabled={!!busy || (!authorized && !queued)} onClick={()=>transact(queued ? "Retry queued execution" : "Queue guarded operation", queued ? "retry_execution" : "execute_intent", queued ? [intentId] : [intentId, intent?.authorization_digest || ""])}>{queued ? "4. Retry exact queued message" : "4. Queue execution through Gate"} <LockKeyhole size={17}/></button>
          </div>
          <aside className={`verdict ${authorized ? "allow" : blocked ? "deny" : "idle"}`}>
            <div className="card-label">AUTHORITATIVE READBACK</div>
            <p>Intent: {intentId}<br/>{readError || (loadedId === intentId ? `Last read: ${lastRead} · refreshes every 5s` : "Reading selected intent…")}</p>
            <div className="verdict-mark">{authorized ? <Check/> : blocked ? <X/> : <ShieldAlert/>}</div>
            <span className="verdict-kicker">GATE AUTHORIZATION STATE</span>
            <h3>{status}</h3>
            <p>{intent?.reason || "Create or enter an intent ID to inspect its finalized on-chain state."}</p>
            <dl><div><dt>AI premise</dt><dd>{intent?.verdict || "UNASSESSED"}</dd></div><div><dt>Operation</dt><dd>{intent?.operation_digest ? short(intent.operation_digest) : "—"}</dd></div><div><dt>Evidence</dt><dd>{intent?.evidence_digest ? short(intent.evidence_digest) : "—"}</dd></div><div><dt>Capability</dt><dd>{intent?.authorization_digest ? short(intent.authorization_digest) : "—"}</dd></div><div><dt>Consumed</dt><dd>{intent?.consumed ? "YES" : "NO"}</dd></div></dl>
          </aside>
        </div>
      </div>
    </section>

    <section id="evidence" className="evidence shell">
      <div className="section-number">04 — TRUST BOUNDARY</div>
      <div className="evidence-grid"><div><h2>Two audited authorities.<br/>{ROUTE_COUNT} enforced routes.</h2><p>Coinbase and Kraken cover exchange-internal activity plus Ethereum, Base, Bitcoin, Solana and Moonbeam funding paths. Every combination is reviewed and enforced by V8; arbitrary assets, actions or networks revert before policy creation.</p><strong className="mvp-statement">Broad enough to prove utility. Narrow enough to audit.</strong></div><div className="source-stack">{Object.entries(ADAPTERS).map(([id,item])=><a className="source-card" href={item.source} target="_blank" rel="noreferrer" key={id}><span>AUDITED LIVE JSON · {id}</span><b>status.{item.name.toLowerCase()}.com</b><small>{item.routes.length} contract-approved routes</small><ExternalLink/></a>)}</div></div>
      <div className="boundary marquee"><div className="marquee-track boundary-track">{[0, 1].map(copy => <div className="marquee-group boundary-group" aria-hidden={copy === 1} key={copy}>{CONTROLS.map(item => <div key={item}><Check/> {item}</div>)}</div>)}</div></div>
    </section>

    <section id="faq" className="faq shell" aria-labelledby="faq-title">
      <div className="section-number">05 — PLAIN LANGUAGE</div>
      <div className="faq-heading"><h2 id="faq-title">Fair questions.<br/><em>Clear boundaries.</em></h2><p>What IncidentGate does, who it serves, and what this release deliberately does not claim.</p></div>
      <div className="faq-list">
        {FAQS.map(([question, answer], index) => <details className="faq-item" key={question} open={index === 0}>
          <summary><span>{question}</span><i aria-hidden="true"/></summary>
          <div className="faq-answer"><p>{answer}</p></div>
        </details>)}
      </div>
    </section>

    <footer className="footer shell"><div className="brand"><Image src="/incidentgate-mark-v2.png" alt="" width={38} height={38}/><span>Incident<span className="brand-gate">Gate</span></span></div><p>Built for Agent Tank · Autonomous Protocols</p><div><span className="footer-network"><i/> {deploymentReady ? networkName : "V8 DEPLOYMENT PENDING"}</span><span>{stats.policies} policies</span><span>{stats.intents} intents</span><span>{stats.executions} executions</span>{deploymentReady && <span className="contract-links"><a href={explorerAddress()} target="_blank" rel="noreferrer">IncidentGate V8 <ExternalLink size={12}/></a><a href={explorerTargetAddress()} target="_blank" rel="noreferrer">GuardedTarget <ExternalLink size={12}/></a></span>}</div><small>{deploymentReady ? `Gate ${short(contractAddress())} · Target ${short(targetContract)}` : EXPECTED_SCHEMA}</small></footer>
  </main>;
}
