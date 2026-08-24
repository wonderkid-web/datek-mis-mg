import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { describeFailure, ensureStream, fetchFromGo2rtc } from "@/lib/cctvStream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Satu frame JPEG — dipakai untuk thumbnail, jauh lebih murah daripada video. */
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
    return NextResponse.json({ message: "Tidak bisa menghubungi go2rtc" }, { status: 502 });
  }

  if (!name) {
    return NextResponse.json({ message: "Kamera tidak ditemukan" }, { status: 404 });
  }

  const result = await fetchFromGo2rtc(
    "/api/frame.jpeg",
    { src: name },
    { signal: request.signal, cache: "no-store" }
  );

  if ("failure" in result) {
    console.error(
      `[cctv] snapshot gagal (asset ${assetId}, HTTP ${result.failure.status}): ${result.failure.detail}`
    );
    return NextResponse.json(
      { message: describeFailure(result.failure.detail), detail: result.failure.detail },
      { status: 502 }
    );
  }

  return new NextResponse(result.response.body, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
  });
}
