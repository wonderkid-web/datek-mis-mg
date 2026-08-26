import { NextRequest, NextResponse } from "next/server";
import { parseBearerToken, getRequestIp } from "@/app/api/agent/_shared";
import {
  listCamerasForScope,
  loadScopes,
  resolveScope,
  toGo2rtcYaml,
} from "@/lib/cctvProvision";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/cctv/provision
 *
 * Dipakai oleh instance go2rtc / web lokal yang berjalan DI DALAM jaringan
 * kamera. Server datek online tidak bisa menjangkau kamera (VLAN terpisah),
 * jadi mesin lokal yang menarik kredensialnya dari sini.
 *
 * Auth : Authorization: Bearer <token dari CCTV_PROVISION_TOKENS>
 * Query: ?format=go2rtc  -> go2rtc.yaml siap pakai (default: json)
 *
 * Respons berisi password kamera, jadi tiap token hanya membuka subnet
 * yang dicakupnya.
 */
export async function GET(req: NextRequest) {
  const scopes = loadScopes();

  // Tanpa konfigurasi, endpoint ditutup — bukan dibiarkan terbuka.
  if (scopes.length === 0) {
    console.error("[cctv] CCTV_PROVISION_TOKENS belum diset; provisioning ditolak");
    return NextResponse.json(
      { message: "Server misconfigured: CCTV_PROVISION_TOKENS is not set" },
      { status: 401 }
    );
  }

  const scope = resolveScope(parseBearerToken(req));

  if (!scope) {
    console.warn(`[cctv] provisioning ditolak dari IP ${getRequestIp(req) ?? "tidak diketahui"}`);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cameras = await listCamerasForScope(scope);

  console.info(
    `[cctv] provisioning "${scope.name}" -> ${cameras.length} kamera dari subnet ${scope.subnets.join(", ")}`
  );

  if (req.nextUrl.searchParams.get("format") === "go2rtc") {
    return new NextResponse(toGo2rtcYaml(cameras), {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    {
      scope: scope.name,
      subnets: scope.subnets,
      generatedAt: new Date().toISOString(),
      count: cameras.length,
      cameras,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
