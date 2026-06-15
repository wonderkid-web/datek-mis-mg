import { NextRequest, NextResponse } from "next/server";

import {
  deleteIspSlaRecord,
  getIspSlaRecordById,
  updateIspSlaRecord,
  type IspSlaRecordInput,
} from "@/lib/ispSlaRecordService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number.parseInt(idParam, 10);
    const record = await getIspSlaRecordById(id);

    if (!record) {
      return NextResponse.json({ error: "SLA record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Failed to fetch SLA record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number.parseInt(idParam, 10);
    const data: Partial<IspSlaRecordInput> = await request.json();
    const record = await updateIspSlaRecord(id, data);
    return NextResponse.json(record);
  } catch (error) {
    console.error("Failed to update SLA record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number.parseInt(idParam, 10);
    await deleteIspSlaRecord(id);
    return NextResponse.json({ message: "SLA record deleted successfully" });
  } catch (error) {
    console.error("Failed to delete SLA record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
