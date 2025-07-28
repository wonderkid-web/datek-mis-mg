import { getProcessors, createProcessor } from "@/lib/processorService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const processors = await getProcessors();
    return NextResponse.json(processors);
  } catch (error) {
    console.error("Error fetching processors:", error);
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

    const newProcessor = await createProcessor({ name });

    return NextResponse.json(newProcessor, { status: 201 });
  } catch (error: any) {
    console.error("Error creating processor:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `Processor '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}