# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }
import genlayer as gl
from genlayer.types import *

import json
import time


def _address(value: str) -> str:
    clean = str(value or "").strip().lower()
    if len(clean) != 42 or not clean.startswith("0x") or clean == "0x" + "0" * 40:
        return ""
    return clean if all(c in "0123456789abcdef" for c in clean[2:]) else ""


class GuardedTarget(gl.contract.Contract):
    owner: str
    incident_gate: str
    paused: bool
    applied: gl.storage.TreeMap[str, bool]
    receipts: gl.storage.TreeMap[str, str]
    volume: gl.storage.TreeMap[str, u256]
    operation_count: u256
    pause_revision: u256

    def __init__(self):
        self.owner = gl.message.sender_address.as_hex.lower()
        self.incident_gate = ""
        self.paused = False
        self.operation_count = u256(0)
        self.pause_revision = u256(0)

    @gl.public.write
    def set_paused(self, paused: bool) -> None:
        if gl.message.sender_address.as_hex.lower() != self.owner:
            raise gl.vm.UserError("OWNER_ONLY")
        self.paused = bool(paused)
        self.pause_revision += u256(1)
        if self.incident_gate:
            gl.contract.get_at(Address(self.incident_gate)).emit(on="finalized").sync_target_revision(int(self.pause_revision))

    @gl.public.write
    def apply_authorized(self, intent_id: str, authorization_digest: str, operation_digest: str, agent: str,
                         destination: str, chain_ref: str, asset: str, action: str, amount: int,
                         target_revision: int, expires_at: int) -> None:
        if gl.message.sender_address.as_hex.lower() != self.incident_gate:
            raise gl.vm.UserError("INCIDENT_GATE_ONLY")
        if intent_id in self.applied:
            receipt = json.loads(self.receipts[intent_id])
            gl.contract.get_at(Address(self.incident_gate)).emit(on="finalized").confirm_execution(
                intent_id, str(receipt["authorization_digest"]))
            return
        if self.paused:
            raise gl.vm.UserError("TARGET_PAUSED")
        if int(target_revision) != int(self.pause_revision):
            raise gl.vm.UserError("TARGET_REVISION_STALE")
        if int(time.time()) >= int(expires_at):
            raise gl.vm.UserError("TARGET_AUTHORIZATION_EXPIRED")
        if len(authorization_digest) != 64 or len(operation_digest) != 64 or amount <= 0 or not _address(agent) or not _address(destination):
            raise gl.vm.UserError("INVALID_OPERATION")
        key = chain_ref + ":" + asset + ":" + action
        self.applied[intent_id] = True
        current = int(self.volume[key]) if key in self.volume else 0
        self.volume[key] = u256(current + int(amount))
        self.receipts[intent_id] = json.dumps({"operation_digest": operation_digest, "authorization_digest": authorization_digest, "destination": destination,
            "chain_ref": chain_ref, "asset": asset, "action": action, "amount": str(amount)},
            sort_keys=True, separators=(",", ":"))
        self.operation_count += u256(1)
        gl.contract.get_at(Address(self.incident_gate)).emit(on="finalized").confirm_execution(intent_id, authorization_digest)

    @gl.public.write
    def retry_confirmation(self, intent_id: str) -> None:
        if intent_id not in self.applied:
            raise gl.vm.UserError("TARGET_RECEIPT_NOT_FOUND")
        receipt = json.loads(self.receipts[intent_id])
        gl.contract.get_at(Address(self.incident_gate)).emit(on="finalized").confirm_execution(
            intent_id, str(receipt["authorization_digest"]))

    @gl.public.view
    def get_receipt(self, intent_id: str) -> dict:
        if intent_id not in self.applied:
            return {"exists": False}
        result = json.loads(self.receipts[intent_id])
        result["exists"] = True
        return result

    @gl.public.view
    def get_status(self) -> str:
        return json.dumps({"implementation_id": "IncidentGate:GuardedTarget:v1", "owner": self.owner,
            "incident_gate": self.incident_gate, "paused": self.paused, "pause_revision": str(self.pause_revision),
            "operation_count": str(self.operation_count)}, sort_keys=True, separators=(",", ":"))

    @gl.public.write
    def bind_incident_gate(self, incident_gate: str) -> None:
        if gl.message.sender_address.as_hex.lower() != self.owner:
            raise gl.vm.UserError("OWNER_ONLY")
        if self.incident_gate:
            raise gl.vm.UserError("INCIDENT_GATE_ALREADY_BOUND")
        gate = _address(incident_gate)
        if not gate:
            raise gl.vm.UserError("INVALID_INCIDENT_GATE")
        self.incident_gate = gate
