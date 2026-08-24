import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { ensureStream, go2rtcEndpoint } from "@/lib/cctvStream";

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
  } catch {
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

  const upstream = await fetch(
    // video=h264 memaksa keluaran H.264; go2rtc transcode sendiri kalau kamera masih H.265.
    go2rtcEndpoint("/api/stream.mp4", { src: name, video: "h264" }),
    // Ikut membatalkan koneksi ke go2rtc begitu penonton menutup tab.
    { signal: request.signal, cache: "no-store" }
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { message: "Kamera tidak merespons" },
      { status: 502 }
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
