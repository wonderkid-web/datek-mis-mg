import { getPowers, createPower } from "@/lib/powerService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const powers = await getPowers();
    return NextResponse.json(powers);
  } catch (error) {
    console.error("Error fetching powers:", error);
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

    const newPower = await createPower({ name });

    return NextResponse.json(newPower, { status: 201 });
  } catch (error: any) {
    console.error("Error creating power:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Power '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}