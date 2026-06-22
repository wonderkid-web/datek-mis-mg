"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  GripVertical,
  Layers3,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Route,
  Sparkles,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  DeskGroupFormDialog,
  FloorFormDialog,
  FloorZoneFormDialog,
  SeatManagementDialog,
  type DeskGroupFormValues,
  type FloorZoneFormValues,
  type FloorFormValues,
  type OfficeMapSelectableUser,
  type SeatDraft,
} from "@/components/office-map/OfficeMapDialogs";
import { UserAssetSheet } from "@/components/office-map/UserAssetSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  OfficeDeskGroup,
  OfficeFloor,
  OfficeFloorZone,
  OfficeSeat,
} from "@/lib/types";

type OfficeMapResponse = {
  floors: OfficeFloor[];
  users: OfficeMapSelectableUser[];
};

type LayoutEntityKind = "desk-group" | "floor-zone";

type LayoutDraft = {
  gridColumn: number;
  gridRow: number;
  columnSpan: number;
  rowSpan: number;
};

type LayoutRect = LayoutDraft & {
  id: number;
  key: string;
  kind: LayoutEntityKind;
};

type ActiveLayoutInteraction = {
  key: string;
  kind: LayoutEntityKind;
  mode: "move" | "resize-width" | "resize-height";
  initialRect: LayoutRect;
  latestRect: LayoutRect;
  otherRects: LayoutRect[];
  maxColumns: number;
  minColumnSpan: number;
  startClientX: number;
  startClientY: number;
  cellWidth: number;
  initialOverlapArea: number;
};

const OFFICE_MAP_GRID_GAP = 16;
const OFFICE_MAP_GRID_ROW_HEIGHT = 88;

const withAlpha = (color: string | null | undefined, alphaHex: string) => {
  if (!color) {
    return undefined;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return `${color}${alphaHex}`;
  }

  return color;
};

const getSeatLabel = (seat: Pick<OfficeSeat, "label" | "side" | "position">) => {
  const customLabel = seat.label?.trim();
  if (customLabel) {
    return customLabel;
  }

  return `${seat.side === "TOP" ? "Atas" : "Bawah"} #${seat.position}`;
};

async function requestOfficeMap<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>
) {
  const response = await fetch("/api/office-map", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Terjadi kesalahan saat memproses office map.");
  }

  return payload as T;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getLayoutKey = (kind: LayoutEntityKind, id: number) => `${kind}:${id}`;

const getDeskGroupRowSpan = (
  layoutKind: OfficeDeskGroup["layoutKind"] | DeskGroupFormValues["layoutKind"]
) => (layoutKind === "DOUBLE" ? 3 : 2);

const getDeskGroupMinColumnSpan = (maxColumns: number) =>
  Math.min(maxColumns, Math.max(3, Math.ceil(maxColumns / 4)));

const rectsIntersect = (left: LayoutRect, right: LayoutRect) =>
  left.gridColumn < right.gridColumn + right.columnSpan &&
  left.gridColumn + left.columnSpan > right.gridColumn &&
  left.gridRow < right.gridRow + right.rowSpan &&
  left.gridRow + left.rowSpan > right.gridRow;

const getOverlapArea = (left: LayoutRect, right: LayoutRect) => {
  const overlapColumns = Math.max(
    0,
    Math.min(left.gridColumn + left.columnSpan, right.gridColumn + right.columnSpan) -
      Math.max(left.gridColumn, right.gridColumn)
  );
  const overlapRows = Math.max(
    0,
    Math.min(left.gridRow + left.rowSpan, right.gridRow + right.rowSpan) -
      Math.max(left.gridRow, right.gridRow)
  );

  return overlapColumns * overlapRows;
};

const getTotalOverlapArea = (rect: LayoutRect, otherRects: LayoutRect[]) =>
  otherRects.reduce((total, otherRect) => total + getOverlapArea(rect, otherRect), 0);

const findFirstAvailableRect = (
  rect: LayoutRect,
  occupiedRects: LayoutRect[],
  maxColumns: number
) => {
  const columnSpan = Math.min(rect.columnSpan, maxColumns);

  for (let gridRow = 1; gridRow <= 500; gridRow += 1) {
    for (
      let gridColumn = 1;
      gridColumn <= maxColumns - columnSpan + 1;
      gridColumn += 1
    ) {
      const candidate = { ...rect, gridColumn, gridRow, columnSpan };

      if (!occupiedRects.some((occupied) => rectsIntersect(candidate, occupied))) {
        return candidate;
      }
    }
  }

  return { ...rect, gridColumn: 1, gridRow: 501, columnSpan };
};

const findNearestAvailableRect = (
  rect: LayoutRect,
  occupiedRects: LayoutRect[],
  maxColumns: number
) => {
  const columnSpan = clamp(rect.columnSpan, 1, maxColumns);
  const normalizedRect = {
    ...rect,
    columnSpan,
    gridColumn: clamp(
      rect.gridColumn,
      1,
      Math.max(1, maxColumns - columnSpan + 1)
    ),
    gridRow: Math.max(1, rect.gridRow),
  };

  if (
    !occupiedRects.some((occupied) =>
      rectsIntersect(normalizedRect, occupied)
    )
  ) {
    return normalizedRect;
  }

  const lastOccupiedRow = occupiedRects.reduce(
    (lastRow, occupied) =>
      Math.max(lastRow, occupied.gridRow + occupied.rowSpan - 1),
    1
  );
  const maxSearchRow = Math.max(
    normalizedRect.gridRow + 24,
    lastOccupiedRow + normalizedRect.rowSpan + 4
  );
  let nearestRect: LayoutRect | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let gridRow = 1; gridRow <= maxSearchRow; gridRow += 1) {
    for (
      let gridColumn = 1;
      gridColumn <= maxColumns - normalizedRect.columnSpan + 1;
      gridColumn += 1
    ) {
      const candidate = { ...normalizedRect, gridColumn, gridRow };

      if (occupiedRects.some((occupied) => rectsIntersect(candidate, occupied))) {
        continue;
      }

      const distance =
        Math.abs(gridColumn - normalizedRect.gridColumn) +
        Math.abs(gridRow - normalizedRect.gridRow);

      if (distance < nearestDistance) {
        nearestRect = candidate;
        nearestDistance = distance;
      }
    }
  }

  return (
    nearestRect ??
    findFirstAvailableRect(normalizedRect, occupiedRects, maxColumns)
  );
};

const isSameRect = (left: LayoutRect, right: LayoutRect) =>
  left.gridColumn === right.gridColumn &&
  left.gridRow === right.gridRow &&
  left.columnSpan === right.columnSpan &&
  left.rowSpan === right.rowSpan;

const buildDeskGroupRect = (
  deskGroup: OfficeDeskGroup,
  draft?: LayoutDraft,
  maxColumns?: number
): LayoutRect => {
  const rawColumnSpan = draft?.columnSpan ?? deskGroup.columnSpan;
  const columnSpan = maxColumns
    ? clamp(
        rawColumnSpan,
        getDeskGroupMinColumnSpan(maxColumns),
        maxColumns
      )
    : rawColumnSpan;
  const rawGridColumn = draft?.gridColumn ?? deskGroup.gridColumn;

  return {
    id: deskGroup.id,
    key: getLayoutKey("desk-group", deskGroup.id),
    kind: "desk-group",
    gridColumn: maxColumns
      ? clamp(rawGridColumn, 1, maxColumns - columnSpan + 1)
      : rawGridColumn,
    gridRow: Math.max(1, draft?.gridRow ?? deskGroup.gridRow),
    columnSpan,
    rowSpan: getDeskGroupRowSpan(deskGroup.layoutKind),
  };
};

const buildFloorZoneRect = (
  zone: OfficeFloorZone,
  draft: LayoutDraft | undefined,
  maxColumns: number
): LayoutRect => ({
  id: zone.id,
  key: getLayoutKey("floor-zone", zone.id),
  kind: "floor-zone",
  gridColumn: 1,
  gridRow: Math.max(1, draft?.gridRow ?? zone.gridRow),
  columnSpan: maxColumns,
  rowSpan: draft?.rowSpan ?? zone.rowSpan,
});

const buildFloorLayoutRects = (
  floor: OfficeFloor,
  drafts: Record<string, LayoutDraft>
) => [
  ...floor.zones.map((zone) =>
    buildFloorZoneRect(
      zone,
      drafts[getLayoutKey("floor-zone", zone.id)],
      floor.canvasColumns
    )
  ),
  ...floor.deskGroups.map((deskGroup) =>
    buildDeskGroupRect(
      deskGroup,
      drafts[getLayoutKey("desk-group", deskGroup.id)],
      floor.canvasColumns
    )
  ),
];

const buildCollisionFreeLayoutDrafts = (floor: OfficeFloor) => {
  const occupiedRects: LayoutRect[] = [];
  const drafts: Record<string, LayoutDraft> = {};
  const placeRect = (rect: LayoutRect) => {
    const placedRect = occupiedRects.some((occupied) =>
      rectsIntersect(rect, occupied)
    )
      ? findFirstAvailableRect(rect, occupiedRects, floor.canvasColumns)
      : rect;

    occupiedRects.push(placedRect);
    drafts[placedRect.key] = {
      gridColumn: placedRect.gridColumn,
      gridRow: placedRect.gridRow,
      columnSpan: placedRect.columnSpan,
      rowSpan: placedRect.rowSpan,
    };
  };

  [...floor.zones]
    .sort(
      (left, right) => left.sortOrder - right.sortOrder || left.id - right.id
    )
    .forEach((zone) =>
      placeRect(buildFloorZoneRect(zone, undefined, floor.canvasColumns))
    );

  [...floor.deskGroups]
    .sort(
      (left, right) => left.sortOrder - right.sortOrder || left.id - right.id
    )
    .forEach((deskGroup) =>
      placeRect(
        buildDeskGroupRect(deskGroup, undefined, floor.canvasColumns)
      )
    );

  return drafts;
};

const updateDeskGroupLayout = (
  deskGroup: OfficeDeskGroup,
  draft: LayoutDraft
) =>
  requestOfficeMap("PATCH", {
    entity: "desk-group",
    id: deskGroup.id,
    name: deskGroup.name,
    department: deskGroup.department,
    departmentColor: deskGroup.departmentColor,
    layoutKind: deskGroup.layoutKind,
    gridColumn: draft.gridColumn,
    gridRow: draft.gridRow,
    columnSpan: draft.columnSpan,
    seatsPerSide: deskGroup.seatsPerSide,
    sortOrder: deskGroup.sortOrder,
    notes: deskGroup.notes,
  });

const updateFloorZoneLayout = (zone: OfficeFloorZone, draft: LayoutDraft) =>
  requestOfficeMap("PATCH", {
    entity: "floor-zone",
    id: zone.id,
    name: zone.name,
    color: zone.color,
    gridColumn: draft.gridColumn,
    gridRow: draft.gridRow,
    columnSpan: draft.columnSpan,
    rowSpan: draft.rowSpan,
    sortOrder: zone.sortOrder,
    notes: zone.notes,
  });

function SeatBadge({
  seat,
  onClick,
}: {
  seat: OfficeSeat;
  onClick: (seat: OfficeSeat) => void;
}) {
  const userName = seat.user?.namaLengkap ?? "Kosong";
  const seatLabel = getSeatLabel(seat);
  const initial = userName.charAt(0).toUpperCase();

  if (!seat.user) {
    return (
      <div
        className="flex min-w-[9rem] shrink-0 flex-col gap-1 rounded-xl border border-dashed border-slate-300 bg-white/65 px-3 py-2 text-left"
        title={seatLabel}
      >
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {seatLabel}
        </span>
        <span className="truncate text-sm font-medium text-slate-400">
          Kosong
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(seat)}
      className="flex w-full min-w-[9rem] items-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-left text-slate-900 transition-colors hover:bg-amber-200"
      title={`Lihat detail ${userName} (${seatLabel})`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xs font-semibold">
        {initial}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800/80">
          {seatLabel}
        </span>
        <span className="truncate text-xs font-medium">{userName}</span>
      </span>
    </button>
  );
}

function DeskGroupCard({
  deskGroup,
  isAdmin,
  isLayoutMode,
  isActiveInteraction,
  onEdit,
  onDelete,
  onManageSeats,
  onViewSeat,
  onStartMove,
  onStartResize,
}: {
  deskGroup: OfficeDeskGroup;
  isAdmin: boolean;
  isLayoutMode: boolean;
  isActiveInteraction: boolean;
  onEdit: (deskGroup: OfficeDeskGroup) => void;
  onDelete: (deskGroup: OfficeDeskGroup) => void;
  onManageSeats: (deskGroup: OfficeDeskGroup) => void;
  onViewSeat: (seat: OfficeSeat) => void;
  onStartMove?: (event: ReactPointerEvent<HTMLElement>) => void;
  onStartResize?: (event: ReactPointerEvent<HTMLElement>) => void;
}) {
  const departmentLabel = deskGroup.department ?? "Tanpa Department";
  const orderedSeats = [...deskGroup.seats].sort((left, right) => {
    if (left.side !== right.side) {
      return left.side === "TOP" ? -1 : 1;
    }

    return left.position - right.position;
  });
  const topSeats = orderedSeats.filter((seat) => seat.side === "TOP");
  const bottomSeats = orderedSeats.filter((seat) => seat.side === "BOTTOM");
  const seatColumns = Math.max(topSeats.length, bottomSeats.length, 1);
  const occupiedSeats = deskGroup.seats.filter((seat) => seat.user);

  if (isLayoutMode) {
    return (
      <div
        className={cn(
          "office-map-layout-tile h-full cursor-grab select-none overflow-hidden rounded-2xl border border-sky-300 bg-white/95 p-4 shadow-sm",
          isActiveInteraction && "cursor-grabbing ring-2 ring-sky-500 shadow-xl"
        )}
        style={{
          background: `linear-gradient(145deg, ${withAlpha(
            deskGroup.departmentColor,
            "30"
          ) ?? "#e0f2fe"} 0%, rgba(255,255,255,0.98) 70%)`,
        }}
      >
        <button
          type="button"
          aria-label={`Geser cluster ${deskGroup.name}`}
          onPointerDown={onStartMove}
          className={cn(
            "flex h-full w-full min-w-0 cursor-grab flex-col justify-between gap-3 text-left",
            isActiveInteraction && "cursor-grabbing"
          )}
        >
          <div className="flex min-w-0 items-start gap-2">
            <GripVertical className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-semibold text-slate-950"
                title={deskGroup.name}
              >
                {deskGroup.name}
              </p>
              <p
                className="truncate text-xs text-slate-600"
                title={departmentLabel}
              >
                {departmentLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-white/80">
              {occupiedSeats.length}/{deskGroup.seats.length} terisi
            </Badge>
            <span className="text-slate-500">Tarik untuk memindahkan</span>
          </div>
        </button>
        <button
          type="button"
          className="office-map-resize-handle office-map-resize-handle-east"
          aria-label={`Ubah lebar ${deskGroup.name}`}
          onPointerDown={onStartResize}
        />
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "office-map-layout-item flex h-full min-w-0 flex-col gap-0 overflow-hidden border-slate-200/80 py-0 shadow-sm",
        isActiveInteraction && "ring-2 ring-sky-400 shadow-lg"
      )}
      style={{
        background: `linear-gradient(180deg, ${withAlpha(
          deskGroup.departmentColor,
          "22"
        ) ?? "#e0f2fe"} 0%, rgba(255,255,255,0.96) 100%)`,
      }}
    >
      <CardHeader className="min-w-0 shrink-0 p-3 pb-1">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <CardTitle
              className="min-w-0 flex-1 truncate text-sm text-slate-950"
              title={deskGroup.name}
            >
              {deskGroup.name}
            </CardTitle>
            {isAdmin ? (
              <div className="office-map-cluster-actions flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageSeats(deskGroup)}
                >
                  <UsersRound data-icon="inline-start" />
                  <span className="office-map-action-label">Seat</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(deskGroup)}
                >
                  <PencilLine data-icon="inline-start" />
                  <span className="office-map-action-label">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(deskGroup)}
                >
                  <Trash2 data-icon="inline-start" />
                  <span className="office-map-action-label">Hapus</span>
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <Badge
              variant="secondary"
              className="min-w-0 flex-1 overflow-hidden"
              title={departmentLabel}
              style={{
                backgroundColor:
                  withAlpha(deskGroup.departmentColor, "26") ?? "#e2e8f0",
                color: deskGroup.departmentColor ?? "#0f172a",
              }}
            >
              <span
                className="block truncate"
                style={{ maxWidth: "100%" }}
              >
                {departmentLabel}
              </span>
            </Badge>
            <Badge variant="outline" className="shrink-0 bg-white/70">
              {occupiedSeats.length}/{deskGroup.seats.length} terisi
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-3 pt-1">
        {orderedSeats.length > 0 ? (
          <div className="flex h-full flex-col gap-3 overflow-hidden">
            {topSeats.length > 0 ? (
              <div
                className="grid max-w-full gap-3 overflow-x-auto px-1 pb-1"
                style={{
                  gridTemplateColumns: `repeat(${seatColumns}, minmax(10.5rem, 1fr))`,
                }}
              >
                {topSeats.map((seat) => (
                  <SeatBadge key={seat.id} seat={seat} onClick={onViewSeat} />
                ))}
              </div>
            ) : null}
            {topSeats.length > 0 && bottomSeats.length > 0 ? (
              <div className="flex items-center px-1 py-1">
                <div className="h-px w-full rounded-full bg-slate-300/80" />
              </div>
            ) : null}
            {bottomSeats.length > 0 ? (
              <div
                className="grid max-w-full gap-3 overflow-x-auto px-1 pb-1"
                style={{
                  gridTemplateColumns: `repeat(${seatColumns}, minmax(10.5rem, 1fr))`,
                }}
              >
                {bottomSeats.map((seat) => (
                  <SeatBadge key={seat.id} seat={seat} onClick={onViewSeat} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex h-10 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/55 px-3 text-center text-xs text-slate-500">
            Belum ada seat di cluster ini
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FloorZoneCard({
  zone,
  isAdmin,
  isLayoutMode,
  isActiveInteraction,
  onEdit,
  onDelete,
  onStartMove,
  onStartResize,
}: {
  zone: OfficeFloorZone;
  isAdmin: boolean;
  isLayoutMode: boolean;
  isActiveInteraction: boolean;
  onEdit: (zone: OfficeFloorZone) => void;
  onDelete: (zone: OfficeFloorZone) => void;
  onStartMove?: (event: ReactPointerEvent<HTMLElement>) => void;
  onStartResize?: (event: ReactPointerEvent<HTMLElement>) => void;
}) {
  const zoneColor = zone.color ?? "#94a3b8";

  if (isLayoutMode) {
    return (
      <div
        className={cn(
          "office-map-layout-tile h-full cursor-grab select-none overflow-hidden rounded-2xl border border-dashed border-slate-400 p-4",
          isActiveInteraction && "cursor-grabbing ring-2 ring-sky-500 shadow-xl"
        )}
        style={{
          background: `repeating-linear-gradient(135deg, ${withAlpha(
            zoneColor,
            "22"
          ) ?? "#e2e8f0"} 0, ${withAlpha(zoneColor, "22") ?? "#e2e8f0"} 12px, rgba(255,255,255,0.82) 12px, rgba(255,255,255,0.82) 24px)`,
        }}
      >
        <button
          type="button"
          aria-label={`Geser jalur ${zone.name}`}
          onPointerDown={onStartMove}
          className={cn(
            "flex h-full w-full min-w-0 cursor-grab items-start gap-2 text-left",
            isActiveInteraction && "cursor-grabbing"
          )}
        >
          <GripVertical className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
          <div className="min-w-0">
            <p
              className="truncate font-semibold text-slate-950"
              title={zone.name}
            >
              {zone.name}
            </p>
            <p className="text-xs text-slate-600">Jalur lalu lalang</p>
          </div>
        </button>
        <button
          type="button"
          className="office-map-resize-handle office-map-resize-handle-south"
          aria-label={`Ubah tinggi ${zone.name}`}
          onPointerDown={onStartResize}
        />
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "office-map-layout-item h-full gap-0 border-dashed border-slate-300/90 py-0 shadow-none",
        isActiveInteraction && "ring-2 ring-sky-400"
      )}
      style={{
        background: `repeating-linear-gradient(135deg, ${withAlpha(
          zoneColor,
          "18"
        ) ?? "#e2e8f0"} 0, ${withAlpha(zoneColor, "18") ?? "#e2e8f0"} 12px, rgba(255,255,255,0.65) 12px, rgba(255,255,255,0.65) 24px)`,
      }}
    >
      <CardContent className="flex h-full min-w-0 items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Route className="h-4 w-4 shrink-0 text-slate-600" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {zone.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {zone.notes ?? "Jalur lalu lalang"}
            </p>
          </div>
        </div>
        {isAdmin ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(zone)}>
              <PencilLine data-icon="inline-start" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(zone)}>
              <Trash2 data-icon="inline-start" />
              Hapus
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function OfficeMapSkeleton() {
  return (
    <div className="container mx-auto flex flex-col gap-6 py-6 sm:py-8">
      <Skeleton className="h-28 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
      <Skeleton className="h-[520px] rounded-3xl" />
    </div>
  );
}

export default function OfficeMapPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "administrator";
  const queryClient = useQueryClient();
  const [isFloorChanging, startFloorTransition] = useTransition();
  const canvasGridRef = useRef<HTMLDivElement | null>(null);
  const activeLayoutInteractionRef = useRef<ActiveLayoutInteraction | null>(null);

  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const [layoutDrafts, setLayoutDrafts] = useState<Record<string, LayoutDraft>>(
    {}
  );
  const [activeLayoutKey, setActiveLayoutKey] = useState<string | null>(null);
  const [floorDialogOpen, setFloorDialogOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<OfficeFloor | null>(null);
  const [deskGroupDialogOpen, setDeskGroupDialogOpen] = useState(false);
  const [editingDeskGroup, setEditingDeskGroup] = useState<OfficeDeskGroup | null>(null);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<OfficeFloorZone | null>(null);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [managingDeskGroupId, setManagingDeskGroupId] = useState<number | null>(null);
  const [activeSeat, setActiveSeat] = useState<OfficeSeat | null>(null);
  const [assetSheetOpen, setAssetSheetOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<OfficeMapResponse>({
    queryKey: ["office-map"],
    queryFn: () => requestOfficeMap<OfficeMapResponse>("GET"),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!data?.floors.length) {
      setSelectedFloorId(null);
      return;
    }

    setSelectedFloorId((current) => {
      if (current && data.floors.some((floor) => floor.id === current)) {
        return current;
      }

      return data.floors[0].id;
    });
  }, [data]);

  useEffect(() => {
    setLayoutDrafts({});
    setActiveLayoutKey(null);
    activeLayoutInteractionRef.current = null;
  }, [selectedFloorId, data?.floors]);

  const floorMutation = useMutation({
    mutationFn: async (payload: {
      id?: number;
      values: FloorFormValues;
    }) =>
      requestOfficeMap(
        payload.id ? "PATCH" : "POST",
        payload.id
          ? { entity: "floor", id: payload.id, ...payload.values }
          : { entity: "floor", ...payload.values }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Data lantai berhasil disimpan.");
      setFloorDialogOpen(false);
      setEditingFloor(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deskGroupMutation = useMutation({
    mutationFn: async (payload: {
      id?: number;
      floorId: number;
      values: DeskGroupFormValues;
    }) =>
      requestOfficeMap(
        payload.id ? "PATCH" : "POST",
        payload.id
          ? { entity: "desk-group", id: payload.id, ...payload.values }
          : { entity: "desk-group", floorId: payload.floorId, ...payload.values }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Cluster meja berhasil disimpan.");
      setDeskGroupDialogOpen(false);
      setEditingDeskGroup(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const seatMutation = useMutation({
    mutationFn: async (drafts: SeatDraft[]) => {
      const selectedUserIds = drafts
        .map((draft) => draft.userId)
        .filter((value) => value !== "unassigned");
      const uniqueUserIds = new Set(selectedUserIds);

      if (selectedUserIds.length !== uniqueUserIds.size) {
        throw new Error("Satu user hanya boleh menempati satu seat.");
      }

      await Promise.all(
        drafts.map((draft) =>
          requestOfficeMap("PATCH", {
            entity: "seat",
            id: draft.id,
            userId: draft.userId === "unassigned" ? null : Number(draft.userId),
            label: draft.label,
          })
        )
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Seat assignment berhasil diperbarui.");
      setSeatDialogOpen(false);
      setManagingDeskGroupId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const zoneMutation = useMutation({
    mutationFn: async (payload: {
      id?: number;
      floorId: number;
      values: FloorZoneFormValues;
    }) =>
      requestOfficeMap(
        payload.id ? "PATCH" : "POST",
        payload.id
          ? { entity: "floor-zone", id: payload.id, ...payload.values }
          : { entity: "floor-zone", floorId: payload.floorId, ...payload.values }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Jalur berhasil disimpan.");
      setZoneDialogOpen(false);
      setEditingZone(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const layoutMutation = useMutation({
    mutationFn: async (payload: {
      key: string;
      kind: LayoutEntityKind;
      draft: LayoutDraft;
      deskGroup?: OfficeDeskGroup;
      zone?: OfficeFloorZone;
    }) => {
      if (payload.kind === "desk-group" && payload.deskGroup) {
        return updateDeskGroupLayout(payload.deskGroup, payload.draft);
      }

      if (payload.kind === "floor-zone" && payload.zone) {
        return updateFloorZoneLayout(payload.zone, payload.draft);
      }

      throw new Error("Payload layout editor tidak valid.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
    },
    onError: (error: Error, variables) => {
      setLayoutDrafts((current) => {
        const next = { ...current };
        delete next[variables.key];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.error(error.message);
    },
  });

  const autoArrangeMutation = useMutation({
    mutationFn: async (payload: {
      deskGroups: Array<{
        deskGroup: OfficeDeskGroup;
        draft: LayoutDraft;
      }>;
      zones: Array<{
        zone: OfficeFloorZone;
        draft: LayoutDraft;
      }>;
    }) => {
      await Promise.all(
        [
          ...payload.deskGroups.map(({ deskGroup, draft }) =>
            updateDeskGroupLayout(deskGroup, draft)
          ),
          ...payload.zones.map(({ zone, draft }) =>
            updateFloorZoneLayout(zone, draft)
          ),
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Layout berhasil dirapikan tanpa overlap.");
    },
    onError: (error: Error) => {
      setLayoutDrafts({});
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.error(error.message);
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: (floorId: number) =>
      requestOfficeMap("DELETE", { entity: "floor", id: floorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Lantai berhasil dihapus.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteDeskGroupMutation = useMutation({
    mutationFn: (deskGroupId: number) =>
      requestOfficeMap("DELETE", { entity: "desk-group", id: deskGroupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Cluster meja berhasil dihapus.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (zoneId: number) =>
      requestOfficeMap("DELETE", { entity: "floor-zone", id: zoneId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-map"] });
      toast.success("Jalur berhasil dihapus.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const floors = data?.floors ?? [];
  const users = data?.users ?? [];
  const selectedFloor =
    floors.find((floor) => floor.id === selectedFloorId) ?? floors[0] ?? null;
  const collisionFreeLayoutDrafts = selectedFloor
    ? buildCollisionFreeLayoutDrafts(selectedFloor)
    : {};
  const visibleLayoutDrafts = isLayoutMode
    ? layoutDrafts
    : collisionFreeLayoutDrafts;

  const occupiedSeats =
    selectedFloor?.deskGroups.reduce(
      (total, deskGroup) =>
        total + deskGroup.seats.filter((seat) => seat.userId !== null).length,
      0
    ) ?? 0;
  const totalSeats =
    selectedFloor?.deskGroups.reduce(
      (total, deskGroup) => total + deskGroup.seats.length,
      0
    ) ?? 0;
  const departmentEntries = selectedFloor
    ? Array.from(
        new Map(
          selectedFloor.deskGroups
            .filter((deskGroup) => deskGroup.department)
            .map((deskGroup) => [
              deskGroup.department,
              {
                name: deskGroup.department ?? "Tanpa Department",
                color: deskGroup.departmentColor ?? "#94a3b8",
              },
            ])
        ).values()
      )
    : [];
  const walkwayEntries = selectedFloor?.zones ?? [];
  const hasLayoutItems =
    (selectedFloor?.deskGroups.length ?? 0) > 0 || walkwayEntries.length > 0;
  const currentLayoutRects = selectedFloor
    ? buildFloorLayoutRects(selectedFloor, {})
    : [];
  const hasLayoutCollision = currentLayoutRects.some((rect, index) =>
    currentLayoutRects
      .slice(index + 1)
      .some((otherRect) => rectsIntersect(rect, otherRect))
  );

  const floorFormValue = editingFloor
    ? {
        name: editingFloor.name,
        description: editingFloor.description ?? "",
        sortOrder: editingFloor.sortOrder,
        canvasColumns: editingFloor.canvasColumns,
        isActive: editingFloor.isActive,
      }
    : null;

  const deskGroupFormValue = editingDeskGroup
    ? {
        name: editingDeskGroup.name,
        department: editingDeskGroup.department ?? "",
        departmentColor: editingDeskGroup.departmentColor ?? "#38bdf8",
        layoutKind: editingDeskGroup.layoutKind,
        gridColumn: editingDeskGroup.gridColumn,
        gridRow: editingDeskGroup.gridRow,
        columnSpan: editingDeskGroup.columnSpan,
        seatsPerSide: editingDeskGroup.seatsPerSide,
        sortOrder: editingDeskGroup.sortOrder,
        notes: editingDeskGroup.notes ?? "",
      }
    : null;
  const zoneFormValue = editingZone
    ? {
        name: editingZone.name,
        color: editingZone.color ?? "#94a3b8",
        gridColumn: editingZone.gridColumn,
        gridRow: editingZone.gridRow,
        columnSpan: editingZone.columnSpan,
        rowSpan: editingZone.rowSpan,
        sortOrder: editingZone.sortOrder,
        notes: editingZone.notes ?? "",
      }
    : null;
  const managingDeskGroup =
    selectedFloor?.deskGroups.find((deskGroup) => deskGroup.id === managingDeskGroupId) ??
    null;

  const startLayoutInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    payload: {
      kind: LayoutEntityKind;
      mode: ActiveLayoutInteraction["mode"];
      rect: LayoutRect;
      minColumnSpan: number;
    }
  ) => {
    if (
      !selectedFloor ||
      !isAdmin ||
      !isLayoutMode ||
      layoutMutation.isPending ||
      autoArrangeMutation.isPending ||
      !canvasGridRef.current
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const gridRect = canvasGridRef.current.getBoundingClientRect();
    const cellWidth =
      (gridRect.width -
        OFFICE_MAP_GRID_GAP * (selectedFloor.canvasColumns - 1)) /
      selectedFloor.canvasColumns;
    const initialColumnSpan = Math.min(
      payload.rect.columnSpan,
      selectedFloor.canvasColumns
    );
    const initialRect: LayoutRect = {
      ...payload.rect,
      columnSpan: initialColumnSpan,
      gridColumn: clamp(
        payload.rect.gridColumn,
        1,
        selectedFloor.canvasColumns - initialColumnSpan + 1
      ),
      gridRow: Math.max(1, payload.rect.gridRow),
    };
    const otherRects = buildFloorLayoutRects(selectedFloor, layoutDrafts).filter(
      (rect) => rect.key !== payload.rect.key
    );

    const interaction: ActiveLayoutInteraction = {
      key: payload.rect.key,
      kind: payload.kind,
      mode: payload.mode,
      initialRect,
      latestRect: initialRect,
      otherRects,
      maxColumns: selectedFloor.canvasColumns,
      minColumnSpan: Math.min(payload.minColumnSpan, selectedFloor.canvasColumns),
      startClientX: event.clientX,
      startClientY: event.clientY,
      cellWidth,
      initialOverlapArea: getTotalOverlapArea(initialRect, otherRects),
    };

    activeLayoutInteractionRef.current = interaction;
    setActiveLayoutKey(payload.rect.key);
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      payload.mode === "move"
        ? "grabbing"
        : payload.mode === "resize-width"
          ? "ew-resize"
          : "ns-resize";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentInteraction = activeLayoutInteractionRef.current;
      if (!currentInteraction) {
        return;
      }

      moveEvent.preventDefault();

      const columnDelta = Math.round(
        (moveEvent.clientX - currentInteraction.startClientX) /
          (currentInteraction.cellWidth + OFFICE_MAP_GRID_GAP)
      );
      const rowDelta = Math.round(
        (moveEvent.clientY - currentInteraction.startClientY) /
          (OFFICE_MAP_GRID_ROW_HEIGHT + OFFICE_MAP_GRID_GAP)
      );

      let nextRect = currentInteraction.initialRect;

      if (currentInteraction.mode === "move") {
        nextRect = {
          ...currentInteraction.initialRect,
          gridColumn: clamp(
            currentInteraction.initialRect.gridColumn + columnDelta,
            1,
            currentInteraction.maxColumns -
              currentInteraction.initialRect.columnSpan +
              1
          ),
          gridRow: Math.max(1, currentInteraction.initialRect.gridRow + rowDelta),
        };
      }

      if (currentInteraction.mode === "resize-width") {
        nextRect = {
          ...currentInteraction.initialRect,
          columnSpan: clamp(
            currentInteraction.initialRect.columnSpan + columnDelta,
            currentInteraction.minColumnSpan,
            currentInteraction.maxColumns -
              currentInteraction.initialRect.gridColumn +
              1
          ),
        };
      }

      if (currentInteraction.mode === "resize-height") {
        nextRect = {
          ...currentInteraction.initialRect,
          rowSpan: Math.max(
            1,
            currentInteraction.initialRect.rowSpan + rowDelta
          ),
        };
      }

      const nextOverlapArea = getTotalOverlapArea(
        nextRect,
        currentInteraction.otherRects
      );

      if (
        currentInteraction.mode !== "move" &&
        nextOverlapArea > 0 &&
        (currentInteraction.initialOverlapArea === 0 ||
          nextOverlapArea > currentInteraction.initialOverlapArea)
      ) {
        return;
      }

      if (isSameRect(nextRect, currentInteraction.latestRect)) {
        return;
      }

      currentInteraction.latestRect = nextRect;
      activeLayoutInteractionRef.current = currentInteraction;
      setLayoutDrafts((current) => ({
        ...current,
        [currentInteraction.key]: {
          gridColumn: nextRect.gridColumn,
          gridRow: nextRect.gridRow,
          columnSpan: nextRect.columnSpan,
          rowSpan: nextRect.rowSpan,
        },
      }));
    };

    const finishInteraction = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishInteraction);
      window.removeEventListener("pointercancel", finishInteraction);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      const currentInteraction = activeLayoutInteractionRef.current;
      activeLayoutInteractionRef.current = null;
      setActiveLayoutKey(null);

      if (
        !currentInteraction ||
        isSameRect(
          currentInteraction.initialRect,
          currentInteraction.latestRect
        )
      ) {
        return;
      }

      const finalRect =
        currentInteraction.mode === "move"
          ? findNearestAvailableRect(
              currentInteraction.latestRect,
              currentInteraction.otherRects,
              currentInteraction.maxColumns
            )
          : currentInteraction.latestRect;

      setLayoutDrafts((current) => ({
        ...current,
        [currentInteraction.key]: {
          gridColumn: finalRect.gridColumn,
          gridRow: finalRect.gridRow,
          columnSpan: finalRect.columnSpan,
          rowSpan: finalRect.rowSpan,
        },
      }));

      const draft: LayoutDraft = {
        gridColumn: finalRect.gridColumn,
        gridRow: finalRect.gridRow,
        columnSpan: finalRect.columnSpan,
        rowSpan: finalRect.rowSpan,
      };

      if (currentInteraction.kind === "desk-group") {
        const deskGroup = selectedFloor.deskGroups.find(
          (item) => item.id === currentInteraction.initialRect.id
        );

        if (!deskGroup) {
          return;
        }

        layoutMutation.mutate({
          key: currentInteraction.key,
          kind: "desk-group",
          draft,
          deskGroup,
        });

        return;
      }

      const zone = selectedFloor.zones.find(
        (item) => item.id === currentInteraction.initialRect.id
      );

      if (!zone) {
        return;
      }

      layoutMutation.mutate({
        key: currentInteraction.key,
        kind: "floor-zone",
        draft,
        zone,
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishInteraction);
    window.addEventListener("pointercancel", finishInteraction);
  };

  const handleAutoArrange = () => {
    if (!selectedFloor || autoArrangeMutation.isPending) {
      return;
    }

    const occupiedRects: LayoutRect[] = [];
    const nextDrafts: Record<string, LayoutDraft> = {};
    const zonePayloads: Array<{
      zone: OfficeFloorZone;
      draft: LayoutDraft;
    }> = [];
    const deskGroupPayloads: Array<{
      deskGroup: OfficeDeskGroup;
      draft: LayoutDraft;
    }> = [];

    [...selectedFloor.zones]
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder || left.id - right.id
      )
      .forEach((zone) => {
        const currentRect = buildFloorZoneRect(
          zone,
          undefined,
          selectedFloor.canvasColumns
        );
        const nextRect = occupiedRects.some((occupied) =>
          rectsIntersect(currentRect, occupied)
        )
          ? findFirstAvailableRect(
              currentRect,
              occupiedRects,
              selectedFloor.canvasColumns
            )
          : currentRect;
        occupiedRects.push(nextRect);

        const draft: LayoutDraft = {
          gridColumn: nextRect.gridColumn,
          gridRow: nextRect.gridRow,
          columnSpan: nextRect.columnSpan,
          rowSpan: nextRect.rowSpan,
        };
        nextDrafts[nextRect.key] = draft;

        if (
          zone.gridColumn !== draft.gridColumn ||
          zone.gridRow !== draft.gridRow ||
          zone.columnSpan !== draft.columnSpan ||
          zone.rowSpan !== draft.rowSpan
        ) {
          zonePayloads.push({ zone, draft });
        }
      });

    [...selectedFloor.deskGroups]
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder || left.id - right.id
      )
      .forEach((deskGroup) => {
        const currentRect = buildDeskGroupRect(
          deskGroup,
          undefined,
          selectedFloor.canvasColumns
        );
        const nextRect = findFirstAvailableRect(
          currentRect,
          occupiedRects,
          selectedFloor.canvasColumns
        );
        occupiedRects.push(nextRect);

        const draft: LayoutDraft = {
          gridColumn: nextRect.gridColumn,
          gridRow: nextRect.gridRow,
          columnSpan: nextRect.columnSpan,
          rowSpan: nextRect.rowSpan,
        };
        nextDrafts[nextRect.key] = draft;

        if (
          deskGroup.gridColumn !== draft.gridColumn ||
          deskGroup.gridRow !== draft.gridRow ||
          deskGroup.columnSpan !== draft.columnSpan
        ) {
          deskGroupPayloads.push({ deskGroup, draft });
        }
      });

    setLayoutDrafts((current) => ({ ...current, ...nextDrafts }));

    if (deskGroupPayloads.length === 0 && zonePayloads.length === 0) {
      toast.info("Layout sudah rapi.");
      return;
    }

    autoArrangeMutation.mutate({
      deskGroups: deskGroupPayloads,
      zones: zonePayloads,
    });
  };

  const handleOpenCreateFloor = () => {
    setEditingFloor(null);
    setFloorDialogOpen(true);
  };

  const handleOpenEditFloor = (floor: OfficeFloor) => {
    setEditingFloor(floor);
    setFloorDialogOpen(true);
  };

  const handleOpenCreateDeskGroup = () => {
    if (!selectedFloor) {
      toast.error("Buat atau pilih lantai terlebih dahulu.");
      return;
    }

    setEditingDeskGroup(null);
    setDeskGroupDialogOpen(true);
  };

  const handleOpenEditDeskGroup = (deskGroup: OfficeDeskGroup) => {
    setEditingDeskGroup(deskGroup);
    setDeskGroupDialogOpen(true);
  };

  const handleOpenCreateZone = () => {
    if (!selectedFloor) {
      toast.error("Buat atau pilih lantai terlebih dahulu.");
      return;
    }

    setEditingZone(null);
    setZoneDialogOpen(true);
  };

  const handleOpenEditZone = (zone: OfficeFloorZone) => {
    setEditingZone(zone);
    setZoneDialogOpen(true);
  };

  const handleOpenManageSeats = (deskGroup: OfficeDeskGroup) => {
    setManagingDeskGroupId(deskGroup.id);
    setSeatDialogOpen(true);
  };

  const handleOpenAssetSheet = (seat: OfficeSeat) => {
    setActiveSeat(seat);
    setAssetSheetOpen(true);
  };

  const handleDeleteFloor = (floor: OfficeFloor) => {
    if (!window.confirm(`Hapus ${floor.name}? Semua cluster di dalamnya ikut terhapus.`)) {
      return;
    }

    deleteFloorMutation.mutate(floor.id);
  };

  const handleDeleteDeskGroup = (deskGroup: OfficeDeskGroup) => {
    if (!window.confirm(`Hapus cluster ${deskGroup.name}?`)) {
      return;
    }

    deleteDeskGroupMutation.mutate(deskGroup.id);
  };

  const handleDeleteZone = (zone: OfficeFloorZone) => {
    if (!window.confirm(`Hapus jalur ${zone.name}?`)) {
      return;
    }

    deleteZoneMutation.mutate(zone.id);
  };

  if (isLoading) {
    return <OfficeMapSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-rose-200 bg-rose-50/70">
          <CardHeader>
            <CardTitle>Office map gagal dimuat</CardTitle>
            <CardDescription>
              Coba muat ulang data atau cek service office map yang baru ditambahkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto flex flex-col gap-6 py-6 sm:py-8">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-cyan-950 to-sky-700 text-white shadow-xl">
          <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="flex max-w-3xl flex-col gap-3">
                <Badge className="w-fit border-white/20 bg-white/10 text-white">
                  Office Layout
                </Badge>
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Map meja user per lantai
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-sky-50/85 sm:text-base">
                    Layout ini pakai grid sederhana: tiap cluster meja bisa diatur,
                    dipisah per lantai, ditandai per department, diberi jalur lalu
                    lalang, lalu user di tiap seat bisa diklik untuk melihat detail
                    aset yang sedang dipegang.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  Refresh
                </Button>
                {isAdmin ? (
                  <Button onClick={handleOpenCreateFloor}>
                    <Plus data-icon="inline-start" />
                    Tambah Lantai
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
                  Total Lantai
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {floors.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
                  Cluster Aktif
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {selectedFloor?.deskGroups.length ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
                  Seat Terisi
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {occupiedSeats}/{totalSeats}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {floors.length > 0 ? (
          <>
            <Tabs
              value={selectedFloor ? String(selectedFloor.id) : undefined}
              onValueChange={(value) =>
                startFloorTransition(() => setSelectedFloorId(Number(value)))
              }
            >
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <TabsList className="inline-flex h-auto min-w-full flex-nowrap justify-start gap-2 rounded-2xl bg-slate-100 p-2">
                    {floors.map((floor) => (
                      <TabsTrigger
                        key={floor.id}
                        value={String(floor.id)}
                        className="rounded-xl px-4 py-2"
                      >
                        {floor.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            </Tabs>

            {selectedFloor ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex flex-col gap-6">
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="flex flex-col gap-2">
                          <CardTitle className="text-slate-950">
                            {selectedFloor.name}
                          </CardTitle>
                          <CardDescription>
                            {selectedFloor.description ?? "Belum ada deskripsi lantai."}
                          </CardDescription>
                        </div>
                        {isAdmin ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant={isLayoutMode ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                setIsLayoutMode((current) => !current)
                              }
                            >
                              <GripVertical data-icon="inline-start" />
                              {isLayoutMode ? "Selesai Atur Layout" : "Atur Layout"}
                            </Button>
                            {isLayoutMode ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={autoArrangeMutation.isPending}
                                onClick={handleAutoArrange}
                              >
                                {autoArrangeMutation.isPending ? (
                                  <Loader2
                                    className="animate-spin"
                                    data-icon="inline-start"
                                  />
                                ) : (
                                  <Sparkles data-icon="inline-start" />
                                )}
                                Rapikan Otomatis
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditFloor(selectedFloor)}
                            >
                              <PencilLine data-icon="inline-start" />
                              Edit Lantai
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFloor(selectedFloor)}
                            >
                              <Trash2 data-icon="inline-start" />
                              Hapus Lantai
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleOpenCreateZone}
                            >
                              <Route data-icon="inline-start" />
                              Tambah Jalur
                            </Button>
                            <Button size="sm" onClick={handleOpenCreateDeskGroup}>
                              <Plus data-icon="inline-start" />
                              Tambah Cluster
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isAdmin && isLayoutMode ? (
                        <div className="mb-4 flex flex-col gap-1 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
                          <span className="font-medium">Mode penataan aktif</span>
                          <span>
                            Tarik seluruh tile secara bebas; saat dilepas item
                            akan snap ke ruang kosong terdekat. Handle kanan
                            mengubah lebar cluster, dan handle bawah mengubah
                            tinggi jalur.
                          </span>
                        </div>
                      ) : null}
                      {isAdmin && hasLayoutCollision ? (
                        <div className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center">
                          <span>
                            Ada layout lama yang bertabrakan dengan slot atau
                            jalur tetap.
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-amber-300 bg-white"
                            disabled={autoArrangeMutation.isPending}
                            onClick={handleAutoArrange}
                          >
                            <Sparkles data-icon="inline-start" />
                            Rapikan Sekarang
                          </Button>
                        </div>
                      ) : null}
                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle,_rgba(148,163,184,0.22)_1px,_transparent_1px)] p-4 [background-size:18px_18px]">
                        {hasLayoutItems ? (
                          <div
                            ref={canvasGridRef}
                            className="grid gap-4"
                            style={{
                              gridTemplateColumns: `repeat(${selectedFloor.canvasColumns}, minmax(0, 1fr))`,
                              gridAutoRows: `${OFFICE_MAP_GRID_ROW_HEIGHT}px`,
                              width: "100%",
                              minHeight: isLayoutMode ? "640px" : undefined,
                            }}
                          >
                            {walkwayEntries.map((zone) => {
                              const zoneKey = getLayoutKey("floor-zone", zone.id);
                              const zoneRect = buildFloorZoneRect(
                                zone,
                                visibleLayoutDrafts[zoneKey],
                                selectedFloor.canvasColumns
                              );

                              return (
                                <div
                                  key={zone.id}
                                  style={{
                                    gridColumn: `${zoneRect.gridColumn} / span ${zoneRect.columnSpan}`,
                                    gridRow: `${zoneRect.gridRow} / span ${zoneRect.rowSpan}`,
                                    zIndex: activeLayoutKey === zoneKey ? 50 : 1,
                                  }}
                                >
                                  <FloorZoneCard
                                    zone={zone}
                                    isAdmin={isAdmin}
                                    isLayoutMode={isLayoutMode}
                                    isActiveInteraction={activeLayoutKey === zoneKey}
                                    onEdit={handleOpenEditZone}
                                    onDelete={handleDeleteZone}
                                    onStartMove={(event) =>
                                      startLayoutInteraction(event, {
                                        kind: "floor-zone",
                                        mode: "move",
                                        rect: zoneRect,
                                        minColumnSpan: 1,
                                      })
                                    }
                                    onStartResize={(event) =>
                                      startLayoutInteraction(event, {
                                        kind: "floor-zone",
                                        mode: "resize-height",
                                        rect: zoneRect,
                                        minColumnSpan: 1,
                                      })
                                    }
                                  />
                                </div>
                              );
                            })}
                            {selectedFloor.deskGroups.map((deskGroup) => {
                              const deskGroupKey = getLayoutKey(
                                "desk-group",
                                deskGroup.id
                              );
                              const deskGroupRect = buildDeskGroupRect(
                                deskGroup,
                                visibleLayoutDrafts[deskGroupKey],
                                selectedFloor.canvasColumns
                              );

                              return (
                                <div
                                  key={deskGroup.id}
                                  className="office-map-grid-item"
                                  style={{
                                    gridColumn: `${deskGroupRect.gridColumn} / span ${deskGroupRect.columnSpan}`,
                                    gridRow: `${deskGroupRect.gridRow} / span ${deskGroupRect.rowSpan}`,
                                    zIndex: activeLayoutKey === deskGroupKey ? 50 : 2,
                                  }}
                                >
                                  <DeskGroupCard
                                    deskGroup={deskGroup}
                                    isAdmin={isAdmin}
                                    isLayoutMode={isLayoutMode}
                                    isActiveInteraction={
                                      activeLayoutKey === deskGroupKey
                                    }
                                    onEdit={handleOpenEditDeskGroup}
                                    onDelete={handleDeleteDeskGroup}
                                    onManageSeats={handleOpenManageSeats}
                                    onViewSeat={handleOpenAssetSheet}
                                    onStartMove={(event) =>
                                      startLayoutInteraction(event, {
                                        kind: "desk-group",
                                        mode: "move",
                                        rect: deskGroupRect,
                                        minColumnSpan:
                                          getDeskGroupMinColumnSpan(
                                            selectedFloor.canvasColumns
                                          ),
                                      })
                                    }
                                    onStartResize={(event) =>
                                      startLayoutInteraction(event, {
                                        kind: "desk-group",
                                        mode: "resize-width",
                                        rect: deskGroupRect,
                                        minColumnSpan:
                                          getDeskGroupMinColumnSpan(
                                            selectedFloor.canvasColumns
                                          ),
                                      })
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
                            <Layers3 className="h-8 w-8 text-slate-400" />
                            <div className="flex flex-col gap-1">
                              <p className="font-medium text-slate-900">
                                Belum ada cluster atau jalur di lantai ini
                              </p>
                              <p className="text-sm text-slate-500">
                                Tambahkan cluster meja, tandai jalur lalu lalang,
                                lalu atur user di setiap seat.
                              </p>
                            </div>
                            {isAdmin ? (
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={handleOpenCreateZone}
                                >
                                  <Route data-icon="inline-start" />
                                  Tambah Jalur
                                </Button>
                                <Button onClick={handleOpenCreateDeskGroup}>
                                  <Plus data-icon="inline-start" />
                                  Tambah Cluster
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-950">Legend Department</CardTitle>
                      <CardDescription>
                        Penandaan warna cluster per department pada lantai ini.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {departmentEntries.length > 0 ? (
                        departmentEntries.map((department) => (
                          <div
                            key={department.name}
                            className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <span
                                className="size-4 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: department.color }}
                              />
                              <span
                                className="min-w-0 flex-1 truncate font-medium text-slate-900"
                                title={department.name}
                              >
                                {department.name}
                              </span>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              Department
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                          Belum ada department yang ditandai di lantai ini.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-950">Jalur Lalu Lalang</CardTitle>
                      <CardDescription>
                        Area sirkulasi yang ditandai khusus pada lantai ini.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {walkwayEntries.length > 0 ? (
                        walkwayEntries.map((zone) => (
                          <div
                            key={zone.id}
                            className="rounded-2xl border px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="h-3 w-12 rounded-full border border-white shadow-sm"
                                style={{
                                  background: `repeating-linear-gradient(135deg, ${
                                    withAlpha(zone.color, "55") ?? "#cbd5e1"
                                  } 0, ${
                                    withAlpha(zone.color, "55") ?? "#cbd5e1"
                                  } 10px, rgba(255,255,255,0.7) 10px, rgba(255,255,255,0.7) 20px)`,
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate font-medium text-slate-900"
                                  title={zone.name}
                                >
                                  {zone.name}
                                </p>
                                <p className="truncate text-sm text-slate-500">
                                  {zone.notes ??
                                    `Grid ${zone.gridColumn},${zone.gridRow} • ${zone.columnSpan}x${zone.rowSpan}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                          Belum ada jalur yang ditandai di lantai ini.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-950">Ringkasan</CardTitle>
                      <CardDescription>
                        Snapshot cepat untuk area yang sedang dipilih.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div className="rounded-2xl border bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Grid lantai
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          {selectedFloor.canvasColumns} kolom
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Occupancy
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          {totalSeats > 0
                            ? `${Math.round((occupiedSeats / totalSeats) * 100)}%`
                            : "0%"}
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Jalur
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          {walkwayEntries.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Floor switch
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="h-4 w-4" />
                          {isFloorChanging ? "Memindahkan tampilan..." : "Tampilan lantai aktif"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <Card className="border-dashed border-slate-300 shadow-sm">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
              <Layers3 className="h-10 w-10 text-slate-400" />
              <div className="flex max-w-xl flex-col gap-2">
                <p className="text-lg font-semibold text-slate-950">
                  Belum ada lantai yang tersimpan
                </p>
                <p className="text-sm text-slate-500">
                  Mulai dari membuat lantai, lalu tambahkan cluster meja dan seat.
                  Setelah itu user bisa diklik untuk melihat aset yang mereka pegang.
                </p>
              </div>
              {isAdmin ? (
                <Button onClick={handleOpenCreateFloor}>
                  <Plus data-icon="inline-start" />
                  Tambah Lantai Pertama
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      <FloorFormDialog
        open={floorDialogOpen}
        onOpenChange={setFloorDialogOpen}
        initialValue={floorFormValue}
        onSave={async (values) => {
          await floorMutation.mutateAsync({
            id: editingFloor?.id,
            values,
          });
        }}
        isSaving={floorMutation.isPending}
      />

      <DeskGroupFormDialog
        open={deskGroupDialogOpen}
        onOpenChange={setDeskGroupDialogOpen}
        initialValue={deskGroupFormValue}
        onSave={async (values) => {
          if (!selectedFloor) {
            throw new Error("Pilih lantai terlebih dahulu.");
          }

          const editingKey = editingDeskGroup
            ? getLayoutKey("desk-group", editingDeskGroup.id)
            : null;
          const occupiedRects = buildFloorLayoutRects(
            selectedFloor,
            layoutDrafts
          ).filter((rect) => rect.key !== editingKey);
          const minColumnSpan = Math.min(
            getDeskGroupMinColumnSpan(selectedFloor.canvasColumns),
            selectedFloor.canvasColumns
          );
          const columnSpan = clamp(
            values.columnSpan,
            minColumnSpan,
            selectedFloor.canvasColumns
          );
          const requestedRect: LayoutRect = {
            id: editingDeskGroup?.id ?? -1,
            key: editingKey ?? "desk-group:new",
            kind: "desk-group",
            gridColumn: clamp(
              values.gridColumn,
              1,
              selectedFloor.canvasColumns - columnSpan + 1
            ),
            gridRow: Math.max(1, values.gridRow),
            columnSpan,
            rowSpan: getDeskGroupRowSpan(values.layoutKind),
          };
          const hasCollision = occupiedRects.some((rect) =>
            rectsIntersect(requestedRect, rect)
          );

          if (editingDeskGroup && hasCollision) {
            toast.error(
              "Posisi cluster bertabrakan dengan cluster atau jalur lain."
            );
            return;
          }

          const availableRect = hasCollision
            ? findFirstAvailableRect(
                requestedRect,
                occupiedRects,
                selectedFloor.canvasColumns
              )
            : requestedRect;
          const nextValues = {
            ...values,
            gridColumn: availableRect.gridColumn,
            gridRow: availableRect.gridRow,
            columnSpan: availableRect.columnSpan,
          };

          await deskGroupMutation.mutateAsync({
            id: editingDeskGroup?.id,
            floorId: editingDeskGroup?.floorId ?? selectedFloor.id,
            values: nextValues,
          });
        }}
        isSaving={deskGroupMutation.isPending}
      />

      <FloorZoneFormDialog
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        initialValue={zoneFormValue}
        onSave={async (values) => {
          if (!selectedFloor) {
            throw new Error("Pilih lantai terlebih dahulu.");
          }

          const editingKey = editingZone
            ? getLayoutKey("floor-zone", editingZone.id)
            : null;
          const occupiedRects = buildFloorLayoutRects(
            selectedFloor,
            layoutDrafts
          ).filter((rect) => rect.key !== editingKey);
          const requestedRect: LayoutRect = {
            id: editingZone?.id ?? -1,
            key: editingKey ?? "floor-zone:new",
            kind: "floor-zone",
            gridColumn: 1,
            gridRow: Math.max(1, values.gridRow),
            columnSpan: selectedFloor.canvasColumns,
            rowSpan: Math.max(1, values.rowSpan),
          };
          const hasCollision = occupiedRects.some((rect) =>
            rectsIntersect(requestedRect, rect)
          );

          if (editingZone && hasCollision) {
            toast.error(
              "Baris jalur masih ditempati cluster atau jalur lain."
            );
            return;
          }

          const availableRect = hasCollision
            ? findFirstAvailableRect(
                requestedRect,
                occupiedRects,
                selectedFloor.canvasColumns
              )
            : requestedRect;

          await zoneMutation.mutateAsync({
            id: editingZone?.id,
            floorId: editingZone?.floorId ?? selectedFloor.id,
            values: {
              ...values,
              gridColumn: 1,
              gridRow: availableRect.gridRow,
              columnSpan: selectedFloor.canvasColumns,
              rowSpan: availableRect.rowSpan,
            },
          });
        }}
        isSaving={zoneMutation.isPending}
      />

      <SeatManagementDialog
        open={seatDialogOpen}
        onOpenChange={(open) => {
          setSeatDialogOpen(open);
          if (!open) {
            setManagingDeskGroupId(null);
          }
        }}
        deskGroup={managingDeskGroup}
        users={users}
        onSave={async (drafts) => {
          await seatMutation.mutateAsync(drafts);
        }}
        isSaving={seatMutation.isPending}
      />

      <UserAssetSheet
        open={assetSheetOpen}
        onOpenChange={setAssetSheetOpen}
        seat={activeSeat}
      />
    </>
  );
}
