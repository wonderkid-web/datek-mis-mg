import { createLaptopProcessorOption, getLaptopProcessorOptions } from "@/lib/laptopProcessorService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const processors = await getLaptopProcessorOptions();
    return NextResponse.json(processors);
  } catch (error) {
    console.error("Error fetching laptop processors:", error);
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

    const newProcessor = await createLaptopProcessorOption({ value });

    return NextResponse.json(newProcessor, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop processor:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop processor with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}