import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { describeFailure, ensureStream, fetchFromGo2rtc } from "@/lib/cctvStream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Meneruskan fragmented-MP4 dari go2rtc ke browser.
 * Kredensial kamera berhenti di server ini — browser hanya melihat /api/cctv/live/<id>/stream.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const assetId = Number((await params).assetId);
  if (!Number.isInteger(assetId)) {
    return NextResponse.json({ message: "assetId tidak valid" }, { status: 400 });
  }

  let name: string | null;
  try {
    name = await ensureStream(assetId);
  } catch (err) {
    console.error(`[cctv] go2rtc tidak terjangkau (asset ${assetId}):`, err);
    return NextResponse.json(
      { message: "Tidak bisa menghubungi go2rtc" },
      { status: 502 }
    );
  }

  if (!name) {
    return NextResponse.json(
      { message: "Kamera tidak ditemukan atau kredensialnya belum lengkap" },
      { status: 404 }
    );
  }

  const result = await fetchFromGo2rtc(
    "/api/stream.mp4",
    // video=h264 memaksa keluaran H.264; go2rtc transcode sendiri kalau kamera masih H.265.
    { src: name, video: "h264" },
    // Ikut membatalkan koneksi ke go2rtc begitu penonton menutup tab.
    { signal: request.signal, cache: "no-store" }
  );

  if ("failure" in result) {
    // Detail ini biasanya pesan ffmpeg atau RTSP dari go2rtc — kunci untuk diagnosis.
    console.error(
      `[cctv] stream gagal (asset ${assetId}, stream ${name}, HTTP ${result.failure.status}): ${result.failure.detail}`
    );
    return NextResponse.json(
      {
        message: describeFailure(result.failure.detail),
        go2rtcStatus: result.failure.status,
        detail: result.failure.detail,
      },
      { status: 502 }
    );
  }

  return new NextResponse(result.response.body, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
