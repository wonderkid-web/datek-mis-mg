import { NextRequest, NextResponse } from "next/server";
import { getIspById, updateIsp, deleteIsp } from "@/lib/ispService";
import { Isp } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const id = parseInt(paramsResolved.id, 10);
    const isp = await getIspById(id);
    if (!isp) {
      return NextResponse.json({ error: "ISP not found" }, { status: 404 });
    }
    return NextResponse.json(isp);
  } catch (error) {
    console.error("Failed to fetch ISP:", error);
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
    const data: Partial<Omit<Isp, "id" | "createdAt" | "updatedAt">> = await request.json();
    const updatedIsp = await updateIsp(id, data);
    return NextResponse.json(updatedIsp);
  } catch (error) {
    console.error("Failed to update ISP:", error);
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
    await deleteIsp(id);
    return NextResponse.json({ message: "ISP deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete ISP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
