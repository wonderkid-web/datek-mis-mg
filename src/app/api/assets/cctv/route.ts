import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await prisma.asset.findMany({
        where: {
            category: {
                slug: "cctv",
            },
        },
        select: {
            id: true,
            namaAsset: true,
            statusAsset: true,
            cctvSpecs: {
                select: {
                    ipAddress: true,
                    brand: {
                        select: {
                            value: true,
                        },
                    },
                    model: {
                        select: {
                            value: true,
                        },
                    },
                    channelCamera: {
                        select: {
                            sbu: true,
                            lokasi: true,
                        },
                    },
                },
            },
        },
    });

    return NextResponse.json(data)

}