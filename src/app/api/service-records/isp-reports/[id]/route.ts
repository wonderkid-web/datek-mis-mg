import { NextRequest, NextResponse } from "next/server";
import { getIspReportById, updateIspReport, deleteIspReport } from "@/lib/ispReportService";
import { IspReport } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const id = parseInt(paramsResolved.id, 10);
    const ispReport = await getIspReportById(id);
    if (!ispReport) {
      return NextResponse.json({ error: "ISP Report not found" }, { status: 404 });
    }
    return NextResponse.json(ispReport);
  } catch (error) {
    console.error("Failed to fetch ISP report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const id = parseInt(paramsResolved.id, 10);
    const data: Partial<Omit<IspReport, "id" | "createdAt" | "updatedAt">> = await request.json();
    const updatedIspReport = await updateIspReport(id, data);
    return NextResponse.json(updatedIspReport);
  } catch (error) {
    console.error("Failed to update ISP report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const id = parseInt(paramsResolved.id, 10);
    await deleteIspReport(id);
    return NextResponse.json({ message: "ISP report deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete ISP report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
