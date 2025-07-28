import { updatePort, deletePort } from "@/lib/portService";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedPort = await updatePort(id, { name });

    return NextResponse.json(updatedPort);
  } catch (error: any) {
    console.error("Error updating port:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Port not found." }, { status: 404 });
    } else if (error.code === 'P2002') {
      return NextResponse.json({ error: `Port '${error.meta?.target}' already exists.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await deletePort(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting port:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Port not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
