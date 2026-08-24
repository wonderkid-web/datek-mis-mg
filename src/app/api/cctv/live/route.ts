import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { listLiveCameras } from "@/lib/cctvStream";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cameras = await listLiveCameras();
  return NextResponse.json(cameras);
}
