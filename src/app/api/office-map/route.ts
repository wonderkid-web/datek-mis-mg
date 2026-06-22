import { NextResponse } from "next/server";

import {
  createOfficeDeskGroup,
  createOfficeFloor,
  createOfficeFloorZone,
  deleteOfficeDeskGroup,
  deleteOfficeFloor,
  deleteOfficeFloorZone,
  getOfficeMapData,
  updateOfficeDeskGroup,
  updateOfficeFloor,
  updateOfficeFloorZone,
  updateOfficeSeat,
} from "@/lib/officeMapService";

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getErrorResponse = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return NextResponse.json(
      { error: "Data unik bentrok. User mungkin sudah punya seat lain." },
      { status: 409 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
};

export async function GET() {
  try {
    const result = await getOfficeMapData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch office map:", error);
    return getErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.entity === "floor") {
      const floor = await createOfficeFloor({
        name: String(body.name ?? ""),
        description: body.description ?? null,
        sortOrder: toNumber(body.sortOrder) ?? 0,
        canvasColumns: toNumber(body.canvasColumns) ?? 12,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      });

      return NextResponse.json(floor, { status: 201 });
    }

    if (body.entity === "desk-group") {
      const floorId = toNumber(body.floorId);
      if (!floorId) {
        return NextResponse.json(
          { error: "floorId wajib diisi." },
          { status: 400 }
        );
      }

      const deskGroup = await createOfficeDeskGroup({
        floorId,
        name: String(body.name ?? ""),
        department: body.department ?? null,
        departmentColor: body.departmentColor ?? null,
        layoutKind: body.layoutKind ?? null,
        gridColumn: toNumber(body.gridColumn) ?? 1,
        gridRow: toNumber(body.gridRow) ?? 1,
        columnSpan: toNumber(body.columnSpan) ?? 4,
        seatsPerSide: toNumber(body.seatsPerSide) ?? 2,
        sortOrder: toNumber(body.sortOrder) ?? 0,
        notes: body.notes ?? null,
      });

      return NextResponse.json(deskGroup, { status: 201 });
    }

    if (body.entity === "floor-zone") {
      const floorId = toNumber(body.floorId);
      if (!floorId) {
        return NextResponse.json(
          { error: "floorId wajib diisi." },
          { status: 400 }
        );
      }

      const zone = await createOfficeFloorZone({
        floorId,
        name: String(body.name ?? ""),
        color: body.color ?? null,
        gridColumn: toNumber(body.gridColumn) ?? 1,
        gridRow: toNumber(body.gridRow) ?? 1,
        columnSpan: toNumber(body.columnSpan) ?? 2,
        rowSpan: toNumber(body.rowSpan) ?? 1,
        sortOrder: toNumber(body.sortOrder) ?? 0,
        notes: body.notes ?? null,
      });

      return NextResponse.json(zone, { status: 201 });
    }

    return NextResponse.json(
      { error: "Entity tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to create office map entity:", error);
    return getErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body.entity === "floor") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const floor = await updateOfficeFloor(id, {
        name: String(body.name ?? ""),
        description: body.description ?? null,
        sortOrder: toNumber(body.sortOrder) ?? 0,
        canvasColumns: toNumber(body.canvasColumns) ?? 12,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      });

      return NextResponse.json(floor);
    }

    if (body.entity === "desk-group") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const deskGroup = await updateOfficeDeskGroup(id, {
        name: String(body.name ?? ""),
        department: body.department ?? null,
        departmentColor: body.departmentColor ?? null,
        layoutKind: body.layoutKind ?? null,
        gridColumn: toNumber(body.gridColumn) ?? 1,
        gridRow: toNumber(body.gridRow) ?? 1,
        columnSpan: toNumber(body.columnSpan) ?? 4,
        seatsPerSide: toNumber(body.seatsPerSide) ?? 2,
        sortOrder: toNumber(body.sortOrder) ?? 0,
        notes: body.notes ?? null,
      });

      return NextResponse.json(deskGroup);
    }

    if (body.entity === "floor-zone") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const zone = await updateOfficeFloorZone(id, {
        name: String(body.name ?? ""),
        color: body.color ?? null,
        gridColumn: toNumber(body.gridColumn) ?? 1,
        gridRow: toNumber(body.gridRow) ?? 1,
        columnSpan: toNumber(body.columnSpan) ?? 2,
        rowSpan: toNumber(body.rowSpan) ?? 1,
        sortOrder: toNumber(body.sortOrder) ?? 0,
        notes: body.notes ?? null,
      });

      return NextResponse.json(zone);
    }

    if (body.entity === "seat") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const seat = await updateOfficeSeat(id, {
        userId:
          body.userId === null || body.userId === ""
            ? null
            : toNumber(body.userId),
        label: body.label ?? null,
      });

      return NextResponse.json(seat);
    }

    return NextResponse.json(
      { error: "Entity tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update office map entity:", error);
    return getErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    if (body.entity === "floor") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const floor = await deleteOfficeFloor(id);
      return NextResponse.json(floor);
    }

    if (body.entity === "desk-group") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const deskGroup = await deleteOfficeDeskGroup(id);
      return NextResponse.json(deskGroup);
    }

    if (body.entity === "floor-zone") {
      const id = toNumber(body.id);
      if (!id) {
        return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
      }

      const zone = await deleteOfficeFloorZone(id);
      return NextResponse.json(zone);
    }

    return NextResponse.json(
      { error: "Entity tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to delete office map entity:", error);
    return getErrorResponse(error);
  }
}
