import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { value } = await request.json();
    const updatedLicenseOption = await prisma.laptopLicenseOption.update({
      // @ts-expect-error its okay
      where: { id },
      data: { value },
    });
    return NextResponse.json(updatedLicenseOption);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update license option",_error }, { status: 500 });
  }
}

export async function DELETE(
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.laptopLicenseOption.update({
      // @ts-expect-error its okay
      where: { id },
      // @ts-expect-error its okay
      data: { isDeleted: true, deletedAt: new Date() },
    });
    return NextResponse.json({ message: "License option deleted successfully" }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete license option", _error }, { status: 500 });
  }
}
