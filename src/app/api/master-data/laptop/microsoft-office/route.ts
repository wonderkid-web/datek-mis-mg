import { createLaptopMicrosoftOffice, getLaptopMicrosoftOffices } from "@/lib/laptopMicrosoftOfficeService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const microsoftOffices = await getLaptopMicrosoftOffices();
    return NextResponse.json(microsoftOffices);
  } catch (error) {
    console.error("Error fetching laptop Microsoft Offices:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { value } = body;

    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    const newMicrosoftOffice = await createLaptopMicrosoftOffice({ value });

    return NextResponse.json(newMicrosoftOffice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop Microsoft Office:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop Microsoft Office with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}