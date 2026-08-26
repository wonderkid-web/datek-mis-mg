import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildRtspUrl, streamNameFor } from "@/lib/cctvStream";

/**
 * Penyediaan kredensial CCTV untuk instance go2rtc yang berjalan DI DALAM
 * jaringan kamera. Server datek online tidak bisa menjangkau kamera karena
 * terhalang segmentasi VLAN, jadi arah koneksinya dibalik: mesin lokal yang
 * menarik data dari sini.
 *
 * Endpoint ini menyiarkan password kamera, jadi cakupannya sengaja dibatasi
 * per subnet — satu token bocor hanya membuka satu lokasi.
 */

export type ProvisionScope = {
  name: string;
  token: string;
  /** Prefix /24, contoh "192.168.9". Kamera cocok bila IP-nya diawali prefix ini. */
  subnets: string[];
};

export type ProvisionedCamera = {
  assetId: number;
  streamName: string;
  nama: string;
  sbu: string;
  ipAddress: string;
  brand: string | null;
  rtspUrl: string;
};

/**
 * Dibaca dari env CCTV_PROVISION_TOKENS, berisi JSON:
 *   [{"name":"kpn","token":"…","subnets":["192.168.9","192.168.11"]}]
 */
export function loadScopes(): ProvisionScope[] {
  const raw = process.env.CCTV_PROVISION_TOKENS;
  if (!raw?.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[cctv] CCTV_PROVISION_TOKENS bukan JSON yang valid");
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry): ProvisionScope[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const { name, token, subnets } = entry as Record<string, unknown>;
    if (typeof name !== "string" || typeof token !== "string" || !token) return [];
    if (!Array.isArray(subnets) || subnets.some((s) => typeof s !== "string")) return [];
    return [{ name, token, subnets: subnets as string[] }];
  });
}

/** Perbandingan tahan-timing supaya token tidak bisa ditebak bertahap. */
function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function resolveScope(token: string | null): ProvisionScope | null {
  if (!token) return null;
  return loadScopes().find((s) => tokenMatches(token, s.token)) ?? null;
}

/** Kamera dianggap masuk cakupan bila IP-nya berada di salah satu subnet /24. */
function inScope(ip: string, subnets: string[]): boolean {
  return subnets.some((prefix) => ip.startsWith(prefix.endsWith(".") ? prefix : `${prefix}.`));
}

export async function listCamerasForScope(
  scope: ProvisionScope
): Promise<ProvisionedCamera[]> {
  const specs = await prisma.cctvSpecs.findMany({
    where: { NOT: [{ username: null }, { password: null }] },
    select: {
      assetId: true,
      ipAddress: true,
      username: true,
      password: true,
      sbu: true,
      asset: { select: { namaAsset: true } },
      brand: { select: { value: true } },
      channelCamera: { select: { lokasi: true } },
    },
  });

  return specs
    .filter((s) => inScope(s.ipAddress, scope.subnets))
    .flatMap((s) => {
      const rtspUrl = buildRtspUrl(s);
      if (!rtspUrl) return [];

      const lokasi = s.channelCamera?.lokasi?.trim();
      const nama =
        lokasi || (s.asset?.namaAsset ?? "").split(/\s+-\s+https?:\/\//)[0].trim() || "Kamera";

      return [
        {
          assetId: s.assetId,
          streamName: streamNameFor(s.assetId),
          nama,
          sbu: s.sbu,
          ipAddress: s.ipAddress,
          brand: s.brand?.value ?? null,
          rtspUrl,
        },
      ];
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));
}

/** Escape untuk YAML double-quoted: URL RTSP mengandung ":" dan "@". */
function yamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Menghasilkan go2rtc.yaml siap pakai. Sumber kedua (ffmpeg) diperlukan karena
 * parameter video=h264 hanya menegosiasi codec dan tidak memicu transcode,
 * sehingga kamera H.265 gagal tanpa fallback ini.
 */
export function toGo2rtcYaml(cameras: ProvisionedCamera[]): string {
  const lines = [
    "# Dibuat otomatis oleh datek — JANGAN di-commit, berisi kredensial kamera.",
    "api:",
    '  listen: ":1984"',
    "",
    "streams:",
  ];

  for (const cam of cameras) {
    lines.push(`  # ${cam.nama} — ${cam.sbu} (${cam.brand ?? "?"})`);
    lines.push(`  ${cam.streamName}:`);
    lines.push(`    - ${yamlString(cam.rtspUrl)}`);
    lines.push(`    - ${yamlString(`ffmpeg:${cam.streamName}#video=h264`)}`);
  }

  return lines.join("\n") + "\n";
}
