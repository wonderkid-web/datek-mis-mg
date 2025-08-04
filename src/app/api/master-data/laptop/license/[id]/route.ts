import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { value } = await request.json();
    const updatedLicenseOption = await prisma.laptopLicenseOption.update({
      where: { id: Number(id) },
      data: { value },
    });
    return NextResponse.json(updatedLicenseOption);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update license option",_error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.laptopLicenseOption.update({
      where: { id: Number(id) },
      // @ts-expect-error itsoka: prisma does not support soft delete directly
      data: {  deletedAt: new Date() },
    });
    return NextResponse.json({ message: "License option deleted successfully" }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete license option", _error }, { status: 500 });
  }
}
