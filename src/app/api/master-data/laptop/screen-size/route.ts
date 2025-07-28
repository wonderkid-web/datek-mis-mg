import { getScreenSizes, createScreenSize } from "@/lib/screenSizeService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const screenSizes = await getScreenSizes();
    return NextResponse.json(screenSizes);
  } catch (error) {
    console.error("Error fetching screen sizes:", error);
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

    const newScreenSize = await createScreenSize({ name });

    return NextResponse.json(newScreenSize, { status: 201 });
  } catch (error: any) {
    console.error("Error creating screen size:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Screen size '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}