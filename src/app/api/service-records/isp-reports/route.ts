import { NextRequest, NextResponse } from "next/server";
import { getIspReports, createIspReport } from "@/lib/ispReportService";
import { IspReport } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const ispReports = await getIspReports();
    return NextResponse.json(ispReports);
  } catch (error) {
    console.error("Failed to fetch ISP reports:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Omit<IspReport, "id" | "createdAt" | "updatedAt"> = await request.json();
    const newIspReport = await createIspReport(data);
    return NextResponse.json(newIspReport, { status: 201 });
  } catch (error) {
    console.error("Failed to create ISP report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
