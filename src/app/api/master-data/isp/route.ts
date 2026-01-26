import { NextRequest, NextResponse } from "next/server";
import { getIsps, createIsp } from "@/lib/ispService";
import { Isp } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const isps = await getIsps();
    return NextResponse.json(isps);
  } catch (error) {
    console.error("Failed to fetch ISPs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Omit<Isp, "id" | "createdAt" | "updatedAt"> = await request.json();
    const newIsp = await createIsp(data);
    return NextResponse.json(newIsp, { status: 201 });
  } catch (error) {
    console.error("Failed to create ISP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
