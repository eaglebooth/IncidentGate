import ast
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "contracts" / "incident_gate.py").read_text(encoding="utf-8")


def test_contract_is_valid_python_and_pins_runner():
    ast.parse(SOURCE)
    lines = SOURCE.splitlines()
    assert lines[0] == "# v0.2.16"
    assert "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" in lines[1]


def test_intelligence_is_on_critical_path_but_does_not_authorize_directly():
    assert "gl.nondet.web.get" in SOURCE
    assert "gl.nondet.exec_prompt" in SOURCE
    assert "gl.vm.run_nondet_unsafe" in SOURCE
    prompt = SOURCE.split('prompt = """', 1)[1].split('"""', 1)[0]
    assert "AFFECTS_OPERATION" in prompt
    assert "ALLOW" not in prompt and "BLOCK" not in prompt
    assert "EXACTLY four keys" in prompt
    assert "at most 8 source incident IDs" in prompt


def test_two_live_authorities_and_subjects_are_exactly_bound():
    assert '"COINBASE": ("https://status.coinbase.com/api/v2/incidents/unresolved.json"' in SOURCE
    assert '"KRAKEN": ("https://status.kraken.com/api/v2/incidents/unresolved.json"' in SOURCE
    assert '"kr0djjh0jyy9", "Coinbase"' in SOURCE
    assert '"lfz25gyhcpjf", "Kraken"' in SOURCE
    assert "any(clean == adapter[0] for adapter in ADAPTERS.values())" in SOURCE
    assert 'if not adapter or (url, page_id, page_name) != (adapter[0], adapter[2], adapter[3])' in SOURCE
    assert "SUBJECT_IDENTITY_MISMATCH" in SOURCE


def test_reviewed_operation_catalog_is_enforced_before_storage():
    register = SOURCE.split("def register_policy", 1)[1].split("def rotate_policy", 1)[0]
    assert "OPERATION_CATALOG" in SOURCE
    assert "PLATFORM_INTERNAL:USDC:BUY" in SOURCE
    assert "MOONBEAM:GLMR:WITHDRAW" in SOURCE
    assert "UNSUPPORTED_OPERATION_PROFILE" in register
    assert register.index("UNSUPPORTED_OPERATION_PROFILE") < register.index("self.policies[pid]")
    assert '"version": 8' in SOURCE
    assert "autonomous-incident-gate-v8-iso-offsets" in SOURCE


def test_nondeterministic_fetch_uses_plain_storage_snapshot():
    assess = SOURCE.split("def assess_intent", 1)[1].split("def execute_intent", 1)[0]
    assert '_fetch_feed(source)' in assess
    assert '_fetch_feed(policy)' not in assess
    assert 'source = {"authority_url": str(policy.authority_url)' in assess


def test_positive_state_requires_every_gate():
    assess = SOURCE.split("def assess_intent", 1)[1].split("def execute_intent", 1)[0]
    assert 'normalized["verdict"] != "DOES_NOT_AFFECT_OPERATION"' in assess
    assert 'intent.status = "AUTHORIZED"' in assess
    assert assess.index('normalized["verdict"] != "DOES_NOT_AFFECT_OPERATION"') < assess.index('intent.status = "AUTHORIZED"')
    assert 'intent.status = "BLOCKED_INCIDENT"' in assess
    assert 'intent.status = "BLOCKED_UNCERTAIN"' in assess


def test_execution_is_single_use_fresh_and_revision_bound():
    authorization = SOURCE.split("def execute_intent", 1)[1].split("def _emit_execution", 1)[0]
    confirm = SOURCE.split("def confirm_execution", 1)[1].split("def get_contract_version", 1)[0]
    for marker in ("intent.expires_at", "policy.revision", "intent.authorization_digest"):
        assert marker in authorization
    assert "GUARDED_TARGET_ONLY" in confirm and "AUTHORIZATION_DIGEST_MISMATCH" in confirm
    assert confirm.index("intent.consumed = True") < confirm.index('intent.status = "EXECUTED"')
    assert "gl.get_contract_at(Address(self.guarded_target)).emit" in SOURCE
    assert "gl.contract.get_at" not in SOURCE


def test_exact_call_and_delayed_assessment_are_bound():
    create = SOURCE.split("def create_intent", 1)[1].split("def schedule_assessment", 1)[0]
    schedule = SOURCE.split("def schedule_assessment", 1)[1].split("def assess_intent", 1)[0]
    assess = SOURCE.split("def assess_intent", 1)[1].split("def execute_intent", 1)[0]
    for marker in ("target_contract", "function_selector", "calldata_digest", "call_value"):
        assert marker in create
    assert "ASSESSMENT_DELAY" in schedule
    assert "ASSESSMENT_TOO_EARLY" in assess
    assert 'item not in source_ids' in assess


def test_no_false_safety_marketing_in_contract():
    lowered = SOURCE.lower()
    assert "platform is safe" in lowered
    assert '"safe"' not in lowered
    assert "exploit-free" in lowered
