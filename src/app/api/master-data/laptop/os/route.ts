import { createLaptopOsOption, getLaptopOsOptions } from "@/lib/laptopOsService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const osOptions = await getLaptopOsOptions();
    return NextResponse.json(osOptions);
  } catch (error) {
    console.error("Error fetching laptop OS options:", error);
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

    const newOsOption = await createLaptopOsOption({ value });

    return NextResponse.json(newOsOption, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop OS option:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop OS option with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}