
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const id = (await params).id;

  try {

    if (id === undefined || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: Number(id) },
      include: {
        cctvSpecs: {
          include: {
            brand: true,
            model: true,
            deviceType: true,
            channelCamera: true,
          },
        },
        category: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
