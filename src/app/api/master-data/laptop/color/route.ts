import { createLaptopColor, getLaptopColors } from "@/lib/laptopColorService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const colors = await getLaptopColors();
    return NextResponse.json(colors);
  } catch (error) {
    console.error("Error fetching laptop colors:", error);
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

    const newColor = await createLaptopColor({ value });

    return NextResponse.json(newColor, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop color:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop color with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}