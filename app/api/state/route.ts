import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const client = createClient({ chain: studionet });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const method = url.searchParams.get("method") || "";
  const id = url.searchParams.get("id") || "";
  if (!["get_contract_version", "get_stats", "get_intent"].includes(method) ||
      (method === "get_intent" && (!id || id.length > 128))) {
    return Response.json({ success: false, error: "Invalid read request." }, { status: 400 });
  }
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return Response.json({ success: false, error: "Deployment is not configured." }, { status: 503 });
  }
  try {
    const data = await client.readContract({ address: address as `0x${string}`, functionName: method, args: method === "get_intent" ? [id] : [] });
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "StudioNet read unavailable." }, { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" } });
  }
}
