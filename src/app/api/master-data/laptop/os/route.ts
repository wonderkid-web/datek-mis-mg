import { getOs, createOs } from "@/lib/osService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const osOptions = await getOs();
    return NextResponse.json(osOptions);
  } catch (error) {
    console.error("Error fetching OS options:", error);
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

    const newOsOption = await createOs({ name });

    return NextResponse.json(newOsOption, { status: 201 });
  } catch (error: any) {
    console.error("Error creating OS option:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `OS option '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}