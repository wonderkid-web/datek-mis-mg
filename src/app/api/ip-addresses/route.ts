import { NextRequest, NextResponse } from "next/server";
import { getPaginatedIpAddresses } from "@/lib/ipAddressService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const q = searchParams.get("q") || undefined;
    const company = searchParams.get("company") || undefined;
    const connection = searchParams.get("connection") || undefined;
    const status = searchParams.get("status") || undefined;
    const role = searchParams.get("role") || undefined;

    const result = await getPaginatedIpAddresses({
      page,
      pageSize,
      q,
      company,
      connection: connection as any,
      status: status as any,
      role: role as any,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch paginated ip addresses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

