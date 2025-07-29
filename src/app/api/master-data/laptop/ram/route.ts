import { createLaptopRamOption, getLaptopRamOptions } from "@/lib/laptopRamService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ramOptions = await getLaptopRamOptions();
    return NextResponse.json(ramOptions);
  } catch (error) {
    console.error("Error fetching laptop RAM options:", error);
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

    const newRamOption = await createLaptopRamOption({ value });

    return NextResponse.json(newRamOption, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop RAM option:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop RAM option with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}