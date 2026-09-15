# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }
import genlayer as gl
from genlayer.types import *

import json
import typing


COINBASE_URL = "https://status.coinbase.com/api/v2/incidents/unresolved.json"
KRAKEN_URL = "https://status.kraken.com/api/v2/incidents/unresolved.json"
PAGE_IDS = ("kr0djjh0jyy9", "lfz25gyhcpjf")
PAGE_NAMES = ("Coinbase", "Kraken")


def _source(index: int) -> tuple[str, str, str]:
    if index == 0:
        return COINBASE_URL, PAGE_IDS[0], PAGE_NAMES[0]
    if index == 1:
        return KRAKEN_URL, PAGE_IDS[1], PAGE_NAMES[1]
    raise gl.vm.UserError("INVALID_SOURCE_INDEX")


class StudioNextProbe(gl.contract.Contract):
    last_result: str

    def __init__(self):
        self.last_result = "NOT_RUN"

    @gl.public.write
    def probe_get(self, source_index: int) -> str:
        url, page_id, page_name = _source(source_index)

        def fetch() -> str:
            response = gl.nondet.web.get(url)
            if response.status < 200 or response.status >= 300 or response.body is None:
                return "HTTP_NOT_2XX"
            parsed = json.loads(response.body.decode("utf-8"))
            page = parsed.get("page", {})
            return "BOUND" if page.get("id") == page_id and page.get("name") == page_name else "IDENTITY_MISMATCH"

        self.last_result = gl.eq_principle.strict_eq(fetch)
        return self.last_result

    @gl.public.write
    def probe_render(self, source_index: int) -> str:
        url, page_id, page_name = _source(source_index)

        def fetch() -> str:
            text = gl.nondet.web.render(url, mode="text")
            try:
                page = json.loads(text).get("page", {})
                return "BOUND" if page.get("id") == page_id and page.get("name") == page_name else "IDENTITY_MISMATCH"
            except Exception:
                return "NOT_JSON"

        self.last_result = gl.eq_principle.strict_eq(fetch)
        return self.last_result

    @gl.public.write
    def probe_llm(self) -> str:
        def ask() -> str:
            answer = gl.nondet.exec_prompt(
                'Return exactly {"verdict":"UNCERTAIN"} as JSON, with no other fields.',
                response_format="json",
            )
            return "VALID" if isinstance(answer, dict) and answer.get("verdict") == "UNCERTAIN" else "INVALID"

        self.last_result = gl.eq_principle.strict_eq(ask)
        return self.last_result

    @gl.public.write
    def probe_custom_validator(self) -> str:
        def leader() -> str:
            return "BOUND"

        def validator(result: typing.Any) -> bool:
            return isinstance(result, gl.vm.Return) and result.calldata == "BOUND"

        self.last_result = gl.vm.run_nondet(leader, validator)
        return self.last_result

    @gl.public.view
    def get_last_result(self) -> str:
        return self.last_result
