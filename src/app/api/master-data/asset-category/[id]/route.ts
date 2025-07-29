import { updateAssetCategory, deleteAssetCategory } from "@/lib/assetCategoryService"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid asset category ID." }, { status: 400 })
    }

    const body = await request.json()
    const { nama } = body

    if (!nama) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updatedAssetCategory = await updateAssetCategory(id, { nama })
    return NextResponse.json(updatedAssetCategory)
  } catch (error: any) {
    console.error("Error updating asset category:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Asset category not found." }, { status: 404 })
    } else if (error.code === "P2002") {
      return NextResponse.json({ error: "Asset category with this name already exists." }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid asset category ID." }, { status: 400 })
    }

    await deleteAssetCategory(id)
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Error deleting asset category:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Asset category not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
