import importlib.util
import json
import sys
import types
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "contracts" / "guarded_target.py"
OWNER = "0x" + "1" * 40
GATE = "0x" + "2" * 40
OUTSIDER = "0x" + "3" * 40
DESTINATION = "0x" + "4" * 40
AGENT = "0x" + "5" * 40
TARGET = "0x" + "6" * 40


class UserError(Exception):
    pass


class Decorator:
    def __call__(self, value):
        return value


class TreeMap(dict):
    @classmethod
    def __class_getitem__(cls, _item):
        return cls


sender = types.SimpleNamespace(as_hex=OWNER)
authorization = {"valid": True, "agent": AGENT, "operation_digest": "a" * 64, "destination": DESTINATION,
                 "chain_ref": "ETHEREUM", "asset": "USDC", "action": "BUY", "amount": "100", "target_revision": "0"}


class FakeGateView:
    def get_execution_authorization(self, *_args):
        return json.dumps(authorization)


class FakeEmitter:
    calls = []
    def confirm_execution(self, *args):
        self.calls.append(args)
    def sync_target_revision(self, *args):
        self.calls.append(("sync_target_revision", *args))


class FakeProxy:
    def view(self):
        return FakeGateView()
    def emit(self, **_kwargs):
        return FakeEmitter()


fake_gl = types.SimpleNamespace(contract=types.SimpleNamespace(Contract=object), storage=types.SimpleNamespace(TreeMap=TreeMap), public=types.SimpleNamespace(write=Decorator(), view=Decorator()),
                                vm=types.SimpleNamespace(UserError=UserError),
                                message=types.SimpleNamespace(sender_address=sender, contract_address=types.SimpleNamespace(as_hex=TARGET)),
                                get_contract_at=lambda _address: FakeProxy())
fake_module = types.ModuleType("genlayer")
fake_module.gl = fake_gl
fake_module.u256 = int
fake_module.contract = fake_gl.contract
fake_module.storage = fake_gl.storage
fake_module.public = fake_gl.public
fake_module.vm = fake_gl.vm
fake_module.message = fake_gl.message
fake_module.get_contract_at = fake_gl.get_contract_at
fake_gl.u256 = int
fake_module.bigint = int
fake_module.TreeMap = TreeMap
fake_module.Address = lambda value: value
fake_types = types.ModuleType("genlayer.types")
fake_types.bigint = int
fake_types.u256 = int
fake_types.Address = lambda value: value
sys.modules["genlayer.types"] = fake_types
sys.modules["genlayer"] = fake_module
spec = importlib.util.spec_from_file_location("guarded_target_runtime", SOURCE)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)
module.time.time = lambda: 1_800_000_000


def target():
    sender.as_hex = OWNER
    value = module.GuardedTarget()
    value.applied, value.receipts, value.volume = TreeMap(), TreeMap(), TreeMap()
    value.bind_incident_gate(GATE)
    return value


def apply(value, intent="intent-001"):
    sender.as_hex = GATE
    value.apply_authorized(intent, "b" * 64, "a" * 64, AGENT, DESTINATION, "ETHEREUM", "USDC", "BUY", 100, 0, 1_800_000_300)


def test_only_gate_can_apply_and_duplicate_is_idempotent():
    value = target()
    sender.as_hex = OUTSIDER
    with pytest.raises(UserError, match="INCIDENT_GATE_ONLY"):
        value.apply_authorized("intent-001", "b" * 64, "a" * 64, AGENT, DESTINATION, "ETHEREUM", "USDC", "BUY", 100, 0, 1_800_000_300)
    apply(value)
    receipt = value.get_receipt("intent-001")
    assert receipt["exists"] and receipt["amount"] == "100"
    assert value.volume["ETHEREUM:USDC:BUY"] == 100
    assert FakeEmitter.calls[-1] == ("intent-001", "b" * 64)
    apply(value)
    assert value.operation_count == 1


def test_pause_is_owner_only_and_blocks_gate_execution():
    value = target()
    sender.as_hex = OUTSIDER
    with pytest.raises(UserError, match="OWNER_ONLY"):
        value.set_paused(True)
    sender.as_hex = OWNER
    value.set_paused(True)
    sender.as_hex = GATE
    with pytest.raises(UserError, match="TARGET_PAUSED"):
        apply(value)
    sender.as_hex = OWNER
    value.set_paused(False)
    sender.as_hex = GATE
    with pytest.raises(UserError, match="TARGET_REVISION_STALE"):
        value.apply_authorized("intent-new", "b" * 64, "a" * 64, AGENT, DESTINATION, "ETHEREUM", "USDC", "BUY", 100, 0, 1_800_000_300)


def test_confirmation_can_be_reemitted_without_reapplying_target():
    value = target(); apply(value)
    count = value.operation_count
    value.retry_confirmation("intent-001")
    assert value.operation_count == count
    assert len(FakeEmitter.calls) >= 2


@pytest.mark.parametrize("digest,destination,amount", [("bad", DESTINATION, 100), ("a" * 64, "0x1234", 100), ("a" * 64, DESTINATION, 0)])
def test_malformed_gate_message_is_rejected(digest, destination, amount):
    target_value = target(); sender.as_hex = GATE
    with pytest.raises(UserError, match="INVALID_OPERATION"):
        target_value.apply_authorized("intent-001", "b" * 64, digest, AGENT, destination, "ETHEREUM", "USDC", "BUY", amount, 0, 1_800_000_300)


def test_expired_message_is_rejected_by_target_even_after_gate_queued_it():
    value = target(); sender.as_hex = GATE
    with pytest.raises(UserError, match="TARGET_AUTHORIZATION_EXPIRED"):
        value.apply_authorized("intent-expired", "b" * 64, "a" * 64, AGENT, DESTINATION,
                               "ETHEREUM", "USDC", "BUY", 100, 0, 1_800_000_000)
    assert value.operation_count == 0
