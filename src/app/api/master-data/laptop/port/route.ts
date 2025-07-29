import { createLaptopPortOption, getLaptopPortOptions } from "@/lib/laptopPortService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ports = await getLaptopPortOptions();
    return NextResponse.json(ports);
  } catch (error) {
    console.error("Error fetching laptop ports:", error);
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

    const newPort = await createLaptopPortOption({ value });

    return NextResponse.json(newPort, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop port:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop port with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}