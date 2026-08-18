// app/api/dashboard/records/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardRecords,
  isDashboardRecordType,
} from "@/lib/dashboardRecordsService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!isDashboardRecordType(type)) {
      return NextResponse.json(
        { error: "Unknown record type" },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : undefined;

    const result = await getDashboardRecords({
      type,
      page,
      pageSize,
      search,
      days,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch dashboard records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
