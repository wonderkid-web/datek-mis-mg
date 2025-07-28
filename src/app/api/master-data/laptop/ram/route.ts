import { getRams, createRam } from "@/lib/ramService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ramOptions = await getRams();
    return NextResponse.json(ramOptions);
  } catch (error) {
    console.error("Error fetching RAM options:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body; // Use 'name' as per MasterDataItem

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newRamOption = await createRam({ name });

    return NextResponse.json(newRamOption, { status: 201 });
  } catch (error: any) {
    console.error("Error creating RAM option:", error);
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ error: `RAM option with value '${name}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}