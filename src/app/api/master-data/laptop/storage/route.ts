import { createLaptopStorageOption, getLaptopStorageOptions } from "@/lib/laptopStorageService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const storages = await getLaptopStorageOptions();
    return NextResponse.json(storages);
  } catch (error) {
    console.error("Error fetching laptop storages:", error);
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

    const newStorage = await createLaptopStorageOption({ value });

    return NextResponse.json(newStorage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating laptop storage:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Laptop storage with this value already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}