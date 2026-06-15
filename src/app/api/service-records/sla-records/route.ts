import { NextRequest, NextResponse } from "next/server";

import {
  createIspSlaRecord,
  getIspSlaRecords,
  type IspSlaRecordInput,
} from "@/lib/ispSlaRecordService";

export async function GET() {
  try {
    const records = await getIspSlaRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error("Failed to fetch SLA records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: IspSlaRecordInput = await request.json();
    const record = await createIspSlaRecord(data);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Failed to create SLA record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
