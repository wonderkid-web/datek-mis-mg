// app/api/assets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPaginatedAssets } from "@/lib/assetService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const namaAsset   = searchParams.get("namaAsset")   || undefined;
    const statusAsset = searchParams.get("statusAsset") || undefined;
    const lokasiFisik = searchParams.get("lokasiFisik") || undefined;
    const company = searchParams.get("company") || undefined;
    const homebase = searchParams.get("homebase") || undefined;

    const categoryId   = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!, 10)
      : undefined;

    // NEW: dukung slug
    const categorySlug = searchParams.get("categorySlug") || undefined;

    // OPTIONAL: dukung tipe berdasar adanya tabel spesifikasi
    // mis: 'laptop' | 'intel-nuc' | 'printer'
    const osValue    = searchParams.get("osValue") || undefined;
    const idleOnly   = searchParams.get("idleOnly") === "true" ? true : undefined;
    const assignedOnly = searchParams.get("assignedOnly") === "true" ? true : undefined;
    const unassignedOnly = searchParams.get("unassignedOnly") === "true" ? true : undefined;

    const result = await getPaginatedAssets({
      page,
      pageSize,
      namaAsset,
      statusAsset,
      lokasiFisik,
      company,
      homebase,
      categoryId,
      categorySlug,
      osValue,
      idleOnly,
      assignedOnly,
      unassignedOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch paginated assets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
