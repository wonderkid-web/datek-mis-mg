import { createLaptopTypeOption, getLaptopTypeOptions } from "@/lib/laptopTypeService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const types = await getLaptopTypeOptions();
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching laptop types:", error);
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

    const newType = await createLaptopTypeOption({ value });

    return NextResponse.json(newType, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop type:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop type with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}