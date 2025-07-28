import { updateMicrosoftOffice, deleteMicrosoftOffice } from "@/lib/microsoftOfficeService";
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

    const updatedMicrosoftOffice = await updateMicrosoftOffice(id, { name });

    return NextResponse.json(updatedMicrosoftOffice);
  } catch (error: any) {
    console.error("Error updating Microsoft Office:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Microsoft Office not found." }, { status: 404 });
    } else if (error.code === 'P2002') {
      return NextResponse.json({ error: `Microsoft Office '${error.meta?.target}' already exists.` }, { status: 409 });
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
    await deleteMicrosoftOffice(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting Microsoft Office:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Microsoft Office not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
