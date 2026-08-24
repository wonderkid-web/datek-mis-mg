import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { ensureStream, go2rtcEndpoint } from "@/lib/cctvStream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Satu frame JPEG — dipakai untuk thumbnail grid, jauh lebih murah daripada video. */
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
    return NextResponse.json({ message: "Tidak bisa menghubungi go2rtc" }, { status: 502 });
  }

  if (!name) {
    return NextResponse.json({ message: "Kamera tidak ditemukan" }, { status: 404 });
  }

  const upstream = await fetch(go2rtcEndpoint("/api/frame.jpeg", { src: name }), {
    signal: request.signal,
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "Kamera tidak merespons" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store",
    },
  });
}
