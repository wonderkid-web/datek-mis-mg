import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Observer Agent API is healthy",
    server_time: new Date().toISOString(),
  });
}

