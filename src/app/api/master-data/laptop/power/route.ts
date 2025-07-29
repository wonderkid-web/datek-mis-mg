import { createLaptopPowerOption, getLaptopPowerOptions } from "@/lib/laptopPowerService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const powers = await getLaptopPowerOptions();
    return NextResponse.json(powers);
  } catch (error) {
    console.error("Error fetching laptop powers:", error);
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

    const newPower = await createLaptopPowerOption({ value });

    return NextResponse.json(newPower, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop power:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop power with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}