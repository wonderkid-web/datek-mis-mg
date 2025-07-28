import { getPorts, createPort } from "@/lib/portService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ports = await getPorts();
    return NextResponse.json(ports);
  } catch (error) {
    console.error("Error fetching ports:", error);
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

    const newPort = await createPort({ name });

    return NextResponse.json(newPort, { status: 201 });
  } catch (error: any) {
    console.error("Error creating port:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Port '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}