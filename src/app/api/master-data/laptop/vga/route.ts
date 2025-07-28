import { getVgas, createVga } from "@/lib/vgaService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vgas = await getVgas();
    return NextResponse.json(vgas);
  } catch (error) {
    console.error("Error fetching vgas:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newVga = await createVga({ name });

    return NextResponse.json(newVga, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vga:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `VGA '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}