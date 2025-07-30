import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const licenseOptions = await prisma.laptopLicenseOption.findMany();
    return NextResponse.json(licenseOptions);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch license options", _error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { value } = await request.json();
    const newLicenseOption = await prisma.laptopLicenseOption.create({
      data: { value },
    });
    return NextResponse.json(newLicenseOption, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create license option", _error }, { status: 500 });
  }
}
