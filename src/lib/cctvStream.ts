import { prisma } from "@/lib/prisma";

/**
 * URL go2rtc yang dipakai server datek untuk mengambil stream kamera.
 * Server-side only — jangan pernah diekspos ke browser.
 */
const GO2RTC_URL = process.env.GO2RTC_URL ?? "http://127.0.0.1:1984";

/** "sub" = substream, jauh lebih ringan dan cukup untuk monitoring. */
const STREAM_QUALITY: StreamQuality =
  process.env.CCTV_STREAM_QUALITY === "main" ? "main" : "sub";

type StreamQuality = "main" | "sub";

export type LiveCamera = {
  assetId: number;
  nama: string;
  ipAddress: string;
  sbu: string;
  lokasi: string;
  brand: string | null;
};

/**
 * Path RTSP berbeda per brand. Dipisah ke sini supaya menambah brand baru
 * cukup satu baris, bukan menyebar di seluruh kode.
 *
 * CP Plus dan Hiview memakai firmware turunan Dahua, jadi pathnya identik.
 */
const RTSP_PATH_BY_BRAND: Record<string, (q: StreamQuality) => string> = {
  dahua: (q) => `/cam/realmonitor?channel=1&subtype=${q === "main" ? 0 : 1}`,
  "cp plus": (q) => `/cam/realmonitor?channel=1&subtype=${q === "main" ? 0 : 1}`,
  hiview: (q) => `/cam/realmonitor?channel=1&subtype=${q === "main" ? 0 : 1}`,
  hikvision: (q) => `/Streaming/Channels/${q === "main" ? 101 : 102}`,
  tiandy: (q) => (q === "main" ? "/main" : "/sub"),
  "tp-link": (q) => (q === "main" ? "/stream1" : "/stream2"),
};

/** Brand mayoritas dipakai sebagai fallback untuk brand yang belum dipetakan. */
const DEFAULT_RTSP_PATH = RTSP_PATH_BY_BRAND.dahua;

export function rtspPathFor(brand: string | null, quality: StreamQuality): string {
  const builder = RTSP_PATH_BY_BRAND[(brand ?? "").trim().toLowerCase()] ?? DEFAULT_RTSP_PATH;
  return builder(quality);
}

/**
 * Menyusun URL RTSP dari kredensial yang tersimpan di CctvSpecs.
 * Username dan password di-encode karena karakter seperti "@" dan "#"
 * merusak parsing URL — "#" dibaca sebagai fragment, "@" sebagai pemisah host.
 */
export function buildRtspUrl(spec: {
  ipAddress: string;
  username: string | null;
  password: string | null;
  brand?: { value: string } | null;
}): string | null {
  if (!spec.ipAddress || !spec.username || !spec.password) return null;

  const user = encodeURIComponent(spec.username);
  const pass = encodeURIComponent(spec.password);
  const path = rtspPathFor(spec.brand?.value ?? null, STREAM_QUALITY);

  return `rtsp://${user}:${pass}@${spec.ipAddress}:554${path}`;
}

export function streamNameFor(assetId: number): string {
  return `cctv-${assetId}`;
}

/**
 * namaAsset menyimpan lokasi dan link Google Drive dalam satu kolom
 * ("CH 4 - Weighbridge IN - https://drive.google.com/..."). Untuk judul tile
 * hanya bagian lokasinya yang relevan.
 */
function cleanName(namaAsset: string | undefined, lokasi: string): string {
  if (lokasi?.trim()) return lokasi.trim();
  return (namaAsset ?? "").split(/\s+-\s+https?:\/\//)[0].trim() || "Kamera";
}

/** Daftar kamera yang kredensialnya lengkap — tanpa membocorkan kredensialnya. */
export async function listLiveCameras(): Promise<LiveCamera[]> {
  const specs = await prisma.cctvSpecs.findMany({
    where: { NOT: [{ username: null }, { password: null }] },
    select: {
      assetId: true,
      ipAddress: true,
      sbu: true,
      asset: { select: { namaAsset: true } },
      brand: { select: { value: true } },
      channelCamera: { select: { lokasi: true } },
    },
  });

  return specs
    .map((s) => ({
      assetId: s.assetId,
      nama: cleanName(s.asset?.namaAsset, s.channelCamera?.lokasi ?? ""),
      ipAddress: s.ipAddress,
      sbu: s.sbu,
      lokasi: s.channelCamera?.lokasi ?? "",
      brand: s.brand?.value ?? null,
    }))
    .sort((a, b) => a.sbu.localeCompare(b.sbu) || a.nama.localeCompare(b.nama));
}

/**
 * Mendaftarkan kamera ke go2rtc kalau belum ada, lalu mengembalikan nama streamnya.
 * Stream bernama dipakai supaya banyak penonton berbagi satu koneksi RTSP ke kamera,
 * bukan membuka koneksi baru per tab.
 */
export async function ensureStream(assetId: number): Promise<string | null> {
  const spec = await prisma.cctvSpecs.findUnique({
    where: { assetId },
    select: {
      ipAddress: true,
      username: true,
      password: true,
      brand: { select: { value: true } },
    },
  });
  if (!spec) return null;

  const rtsp = buildRtspUrl(spec);
  if (!rtsp) return null;

  const name = streamNameFor(assetId);

  // Stream didaftarkan dengan DUA sumber:
  //   1. RTSP langsung — dipakai kalau kamera sudah H.264 (CP Plus, Hikvision).
  //   2. ffmpeg:<name>#video=h264 — fallback transcode untuk kamera H.265 (Dahua, Hiview, Tiandy).
  //
  // Parameter "video=h264" pada endpoint stream hanya MENEGOSIASI codec, tidak
  // memicu transcode. Tanpa sumber ffmpeg eksplisit, kamera H.265 gagal dengan
  // "codecs not matched: video:H265 => video:H264". go2rtc memilih sumber
  // pertama yang sanggup memenuhi codec yang diminta, jadi kamera H.264 tidak
  // pernah menyentuh ffmpeg dan tetap nol biaya CPU.
  const params = new URLSearchParams({ name });
  params.append("src", rtsp);
  params.append("src", `ffmpeg:${name}#video=h264`);

  const res = await fetch(`${GO2RTC_URL}/api/streams?${params.toString()}`, {
    method: "PUT",
    cache: "no-store",
  });

  // go2rtc membalas 4xx kalau stream dengan nama itu sudah terdaftar — bukan kegagalan.
  if (!res.ok && res.status !== 400 && res.status !== 409) {
    throw new Error(`go2rtc menolak pendaftaran stream (${res.status})`);
  }

  return name;
}

export function go2rtcEndpoint(path: string, params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${GO2RTC_URL}${path}?${qs}`;
}

export type Go2rtcFailure = { status: number; detail: string };

/**
 * Menerjemahkan pesan mentah go2rtc menjadi sebab yang bisa ditindaklanjuti.
 *
 * Saat sumber RTSP tak terjangkau, go2rtc juga melaporkan kegagalan ffmpeg
 * ("404 Not Found" pada pipeline transcode internal) sebagai akibat lanjutan.
 * Tanpa klasifikasi ini, kamera mati terlihat seperti kegagalan transcode.
 */
export function describeFailure(detail: string): string {
  if (/dial tcp .*(i\/o timeout|connection refused|no route to host)/i.test(detail)) {
    return "Kamera tidak dapat dijangkau dari jaringan server";
  }
  if (/401|unauthorized|auth/i.test(detail)) {
    return "Kredensial kamera ditolak";
  }
  if (/codecs not matched/i.test(detail)) {
    return "Format video kamera tidak didukung dan transcode gagal";
  }
  return "Kamera tidak merespons";
}

/**
 * Mengambil data dari go2rtc sambil mempertahankan alasan kegagalannya.
 * Tanpa ini, kegagalan transcode atau kamera tak terjangkau sama-sama tampil
 * sebagai "kamera tidak merespons" dan mustahil didiagnosis dari log.
 */
export async function fetchFromGo2rtc(
  path: string,
  params: Record<string, string>,
  init: RequestInit
): Promise<{ response: Response } | { failure: Go2rtcFailure }> {
  const url = go2rtcEndpoint(path, params);
  const response = await fetch(url, init);

  if (response.ok && response.body) return { response };

  // Body error go2rtc berisi pesan ffmpeg/RTSP yang sebenarnya.
  let detail = "";
  try {
    detail = (await response.text()).trim().slice(0, 400);
  } catch {
    detail = "(body tidak terbaca)";
  }

  return { failure: { status: response.status, detail: detail || "(body kosong)" } };
}
