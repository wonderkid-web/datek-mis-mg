import { getColors, createColor } from "@/lib/colorService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const colors = await getColors();
    return NextResponse.json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
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

    const newColor = await createColor({ name });

    return NextResponse.json(newColor, { status: 201 });
  } catch (error: any) {
    console.error("Error creating color:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Color '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}