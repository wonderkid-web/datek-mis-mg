import { getMicrosoftOffices, createMicrosoftOffice } from "@/lib/microsoftOfficeService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const microsoftOffices = await getMicrosoftOffices();
    return NextResponse.json(microsoftOffices);
  } catch (error) {
    console.error("Error fetching Microsoft Offices:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newMicrosoftOffice = await createMicrosoftOffice({ name });

    return NextResponse.json(newMicrosoftOffice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating Microsoft Office:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Microsoft Office '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}