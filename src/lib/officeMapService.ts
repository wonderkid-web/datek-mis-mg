"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";

const OFFICE_MAP_TAG = "office-map";
const OFFICE_MAP_PATHS = ["/data-center", "/data-center/office-map"];
const OFFICE_SEAT_SIDES = ["TOP", "BOTTOM"] as const;
const OFFICE_DESK_LAYOUT_KINDS = [
  "DOUBLE",
  "SINGLE_TOP",
  "SINGLE_BOTTOM",
] as const;

type OfficeMapUserSelect = {
  id: true;
  namaLengkap: true;
  email: true;
  departemen: true;
  jabatan: true;
  lokasiKantor: true;
  isActive: true;
};

const officeMapUserSelect: OfficeMapUserSelect = {
  id: true,
  namaLengkap: true,
  email: true,
  departemen: true,
  jabatan: true,
  lokasiKantor: true,
  isActive: true,
};

const officeSeatUserSelect = {
  ...officeMapUserSelect,
  assetAssignments: {
    orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
    select: {
      id: true,
      nomorAsset: true,
      catatan: true,
      asset: {
        select: {
          id: true,
          namaAsset: true,
          nomorSeri: true,
          statusAsset: true,
          category: {
            select: {
              id: true,
              nama: true,
              slug: true,
            },
          },
        },
      },
    },
  },
};

const officeFloorInclude = {
  zones: {
    orderBy: [
      { sortOrder: "asc" as const },
      { gridRow: "asc" as const },
      { gridColumn: "asc" as const },
      { id: "asc" as const },
    ],
  },
  deskGroups: {
    orderBy: [
      { sortOrder: "asc" as const },
      { gridRow: "asc" as const },
      { gridColumn: "asc" as const },
      { id: "asc" as const },
    ],
    include: {
      seats: {
        orderBy: [{ position: "asc" as const }, { id: "asc" as const }],
        include: {
          user: {
            select: officeSeatUserSelect,
          },
        },
      },
    },
  },
};

const revalidateOfficeMap = () => {
  revalidateTag(OFFICE_MAP_TAG);
  OFFICE_MAP_PATHS.forEach((path) => revalidatePath(path));
};

const normalizeNullableString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeSeatCount = (value?: number) => {
  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.min(12, Math.max(1, Math.floor(value as number)));
};

const normalizePositiveInt = (value: number | undefined, fallback: number) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value as number));
};

const normalizeDeskLayoutKind = (
  value?: string | null
): (typeof OFFICE_DESK_LAYOUT_KINDS)[number] => {
  if (value && OFFICE_DESK_LAYOUT_KINDS.includes(value as (typeof OFFICE_DESK_LAYOUT_KINDS)[number])) {
    return value as (typeof OFFICE_DESK_LAYOUT_KINDS)[number];
  }

  return "DOUBLE";
};

const getEnabledSeatSides = (
  layoutKind: (typeof OFFICE_DESK_LAYOUT_KINDS)[number]
) => {
  if (layoutKind === "SINGLE_TOP") {
    return ["TOP"] as const;
  }

  if (layoutKind === "SINGLE_BOTTOM") {
    return ["BOTTOM"] as const;
  }

  return OFFICE_SEAT_SIDES;
};

const buildFloorSlugBase = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "floor";

const ensureUniqueFloorSlug = async (name: string, excludeId?: number) => {
  const baseSlug = buildFloorSlugBase(name);
  let nextSlug = baseSlug;
  let counter = 2;

  while (true) {
    const existingFloor = await prisma.officeFloor.findFirst({
      where: {
        slug: nextSlug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existingFloor) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const createDeskGroupSeats = async (
  tx: Prisma.TransactionClient,
  deskGroupId: number,
  seatsPerSide: number,
  layoutKind: (typeof OFFICE_DESK_LAYOUT_KINDS)[number]
) => {
  const data = getEnabledSeatSides(layoutKind).flatMap((side) =>
    Array.from({ length: seatsPerSide }, (_, index) => ({
      deskGroupId,
      side,
      position: index + 1,
    }))
  );

  await tx.officeSeat.createMany({ data });
};

const syncDeskGroupSeats = async (
  tx: Prisma.TransactionClient,
  deskGroupId: number,
  seatsPerSide: number,
  layoutKind: (typeof OFFICE_DESK_LAYOUT_KINDS)[number]
) => {
  for (const side of OFFICE_SEAT_SIDES) {
    // @ts-expect-error its okay
    const sideEnabled = getEnabledSeatSides(layoutKind).includes(side!);
    const seats = await tx.officeSeat.findMany({
      where: { deskGroupId, side },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: {
        id: true,
        position: true,
        userId: true,
      },
    });

    const occupiedSeatsToRemove = seats.filter((seat) => {
      const exceedsLimit = seat.position > seatsPerSide;
      const disabledSide = !sideEnabled;
      return seat.userId !== null && (exceedsLimit || disabledSide);
    });

    if (occupiedSeatsToRemove.length > 0) {
      throw new Error(
        "Kapasitas kursi tidak bisa dikurangi karena masih ada user pada seat yang akan dihapus."
      );
    }

    const extraSeatIds = seats
      .filter((seat) => seat.position > seatsPerSide || !sideEnabled)
      .map((seat) => seat.id);

    if (extraSeatIds.length > 0) {
      await tx.officeSeat.deleteMany({
        where: { id: { in: extraSeatIds } },
      });
    }

    if (!sideEnabled) {
      continue;
    }

    const existingPositions = new Set(
      seats
        .filter((seat) => seat.position <= seatsPerSide)
        .map((seat) => seat.position)
    );

    const missingPositions = Array.from({ length: seatsPerSide }, (_, index) => index + 1)
      .filter((position) => !existingPositions.has(position));

    if (missingPositions.length > 0) {
      await tx.officeSeat.createMany({
        data: missingPositions.map((position) => ({
          deskGroupId,
          side,
          position,
        })),
      });
    }
  }
};

export const getOfficeMapData = async () => {
  const [floors, users] = await Promise.all([
    prisma.officeFloor.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: officeFloorInclude,
    }),
    prisma.user.findMany({
      orderBy: [{ namaLengkap: "asc" }],
      select: officeMapUserSelect,
    }),
  ]);

  return { floors, users };
};

export const createOfficeFloor = async (input: {
  name: string;
  description?: string | null;
  sortOrder?: number;
  canvasColumns?: number;
  isActive?: boolean;
}) => {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama lantai wajib diisi.");
  }

  const slug = await ensureUniqueFloorSlug(name);

  const floor = await prisma.officeFloor.create({
    data: {
      name,
      slug,
      description: normalizeNullableString(input.description),
      sortOrder: input.sortOrder ?? 0,
      canvasColumns: normalizePositiveInt(input.canvasColumns, 12),
      isActive: input.isActive ?? true,
    },
  });

  revalidateOfficeMap();
  return floor;
};

export const updateOfficeFloor = async (
  id: number,
  input: {
    name: string;
    description?: string | null;
    sortOrder?: number;
    canvasColumns?: number;
    isActive?: boolean;
  }
) => {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama lantai wajib diisi.");
  }

  const slug = await ensureUniqueFloorSlug(name, id);

  const floor = await prisma.officeFloor.update({
    where: { id },
    data: {
      name,
      slug,
      description: normalizeNullableString(input.description),
      sortOrder: input.sortOrder ?? 0,
      canvasColumns: normalizePositiveInt(input.canvasColumns, 12),
      isActive: input.isActive ?? true,
    },
  });

  revalidateOfficeMap();
  return floor;
};

export const deleteOfficeFloor = async (id: number) => {
  const floor = await prisma.officeFloor.delete({
    where: { id },
  });

  revalidateOfficeMap();
  return floor;
};

export const createOfficeDeskGroup = async (input: {
  floorId: number;
  name: string;
  department?: string | null;
  departmentColor?: string | null;
  layoutKind?: string | null;
  gridColumn?: number;
  gridRow?: number;
  columnSpan?: number;
  seatsPerSide?: number;
  sortOrder?: number;
  notes?: string | null;
}) => {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama kelompok meja wajib diisi.");
  }

  const seatsPerSide = normalizeSeatCount(input.seatsPerSide);
  const layoutKind = normalizeDeskLayoutKind(input.layoutKind);

  const deskGroup = await prisma.$transaction(async (tx) => {
    const createdDeskGroup = await tx.officeDeskGroup.create({
      data: {
        floorId: input.floorId,
        name,
        department: normalizeNullableString(input.department),
        departmentColor: normalizeNullableString(input.departmentColor) ?? "#38bdf8",
        layoutKind,
        gridColumn: normalizePositiveInt(input.gridColumn, 1),
        gridRow: normalizePositiveInt(input.gridRow, 1),
        columnSpan: normalizePositiveInt(input.columnSpan, 4),
        seatsPerSide,
        sortOrder: input.sortOrder ?? 0,
        notes: normalizeNullableString(input.notes),
      },
    });

    await createDeskGroupSeats(tx, createdDeskGroup.id, seatsPerSide, layoutKind);

    return createdDeskGroup;
  });

  revalidateOfficeMap();
  return deskGroup;
};

export const updateOfficeDeskGroup = async (
  id: number,
  input: {
    name: string;
    department?: string | null;
    departmentColor?: string | null;
    layoutKind?: string | null;
    gridColumn?: number;
    gridRow?: number;
    columnSpan?: number;
    seatsPerSide?: number;
    sortOrder?: number;
    notes?: string | null;
  }
) => {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama kelompok meja wajib diisi.");
  }

  const seatsPerSide = normalizeSeatCount(input.seatsPerSide);
  const layoutKind = normalizeDeskLayoutKind(input.layoutKind);

  const deskGroup = await prisma.$transaction(async (tx) => {
    const updatedDeskGroup = await tx.officeDeskGroup.update({
      where: { id },
      data: {
        name,
        department: normalizeNullableString(input.department),
        departmentColor: normalizeNullableString(input.departmentColor) ?? "#38bdf8",
        layoutKind,
        gridColumn: normalizePositiveInt(input.gridColumn, 1),
        gridRow: normalizePositiveInt(input.gridRow, 1),
        columnSpan: normalizePositiveInt(input.columnSpan, 4),
        seatsPerSide,
        sortOrder: input.sortOrder ?? 0,
        notes: normalizeNullableString(input.notes),
      },
    });

    await syncDeskGroupSeats(tx, id, seatsPerSide, layoutKind);

    return updatedDeskGroup;
  });

  revalidateOfficeMap();
  return deskGroup;
};

export const deleteOfficeDeskGroup = async (id: number) => {
  const deskGroup = await prisma.officeDeskGroup.delete({
    where: { id },
  });

  revalidateOfficeMap();
  return deskGroup;
};

export const createOfficeFloorZone = async (input: {
  floorId: number;
  name: string;
  color?: string | null;
  gridColumn?: number;
  gridRow?: number;
  columnSpan?: number;
  rowSpan?: number;
  sortOrder?: number;
  notes?: string | null;
}) => {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama jalur wajib diisi.");
  }

  const zone = await prisma.officeFloorZone.create({
    data: {
      floorId: input.floorId,
      name,
      color: normalizeNullableString(input.color) ?? "#94a3b8",
      gridColumn: normalizePositiveInt(input.gridColumn, 1),
      gridRow: normalizePositiveInt(input.gridRow, 1),
      columnSpan: normalizePositiveInt(input.columnSpan, 2),
      rowSpan: normalizePositiveInt(input.rowSpan, 1),
      sortOrder: input.sortOrder ?? 0,
      notes: normalizeNullableString(input.notes),
    },
  });

  revalidateOfficeMap();
  return zone;
};

export const updateOfficeFloorZone = async (
  id: number,
  input: {
    name: string;
    color?: string | null;
    gridColumn?: number;
    gridRow?: number;
    columnSpan?: number;
    rowSpan?: number;
    sortOrder?: number;
    notes?: string | null;
  }
) => {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama jalur wajib diisi.");
  }

  const zone = await prisma.officeFloorZone.update({
    where: { id },
    data: {
      name,
      color: normalizeNullableString(input.color) ?? "#94a3b8",
      gridColumn: normalizePositiveInt(input.gridColumn, 1),
      gridRow: normalizePositiveInt(input.gridRow, 1),
      columnSpan: normalizePositiveInt(input.columnSpan, 2),
      rowSpan: normalizePositiveInt(input.rowSpan, 1),
      sortOrder: input.sortOrder ?? 0,
      notes: normalizeNullableString(input.notes),
    },
  });

  revalidateOfficeMap();
  return zone;
};

export const deleteOfficeFloorZone = async (id: number) => {
  const zone = await prisma.officeFloorZone.delete({
    where: { id },
  });

  revalidateOfficeMap();
  return zone;
};

export const updateOfficeSeat = async (
  id: number,
  input: {
    userId?: number | null;
    label?: string | null;
  }
) => {
  const seat = await prisma.officeSeat.update({
    where: { id },
    data: {
      userId:
        input.userId === undefined
          ? undefined
          : input.userId === null
            ? null
            : input.userId,
      label:
        input.label === undefined
          ? undefined
          : normalizeNullableString(input.label),
    },
  });

  revalidateOfficeMap();
  return seat;
};
