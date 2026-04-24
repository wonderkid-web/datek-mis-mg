"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import ReactSelect from "react-select";
import { toast } from "sonner";

import { ExportActions } from "@/components/ExportActions";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DeleteSparepartMovementDialog } from "./DeleteSparepartMovementDialog";
import { SparepartTrackerForm } from "./SparepartTrackerForm";
import { getColumns } from "./columns";
import type { SparepartMovementWithUser } from "@/lib/types";
import { deleteSparepartMovement, getSparepartMovements } from "@/lib/sparepartTrackerService";
import {
  SPAREPART_DEVICE_FAMILY_OPTIONS,
  SPAREPART_MOVEMENT_TYPE_OPTIONS,
  SPAREPART_PART_TYPE_LABELS,
  getSparepartItemKey,
} from "@/lib/sparepartTrackerConfig";

const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getStockDelta = (record: SparepartMovementWithUser) => {
  if (record.movementType === "MASUK") return record.quantity;
  if (record.movementType === "PAKAI") return -record.quantity;
  return record.adjustmentDirection === "DECREASE"
    ? -record.quantity
    : record.quantity;
};

const getMovementLabel = (record: SparepartMovementWithUser) => {
  if (record.movementType === "ADJUSTMENT") {
    return record.adjustmentDirection === "DECREASE"
      ? "Adjustment -"
      : "Adjustment +";
  }

  return record.movementType === "MASUK" ? "Masuk" : "Pakai";
};

const buildStockMap = (rows: SparepartMovementWithUser[]) => {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const key = getSparepartItemKey(
      row.deviceFamily,
      row.partType,
      row.sourceOptionId,
      row.stockOwnerUserId
    );
    accumulator[key] = (accumulator[key] ?? 0) + getStockDelta(row);
    return accumulator;
  }, {});
};

type OwnerOption = {
  value: string;
  label: string;
  userId: number | null;
};

type RecipientSummary = {
  key: string;
  userName: string;
  quantity: number;
  lastMovedAt: Date;
};

type SparepartVisualizationItem = {
  key: string;
  deviceFamily: SparepartMovementWithUser["deviceFamily"];
  partType: SparepartMovementWithUser["partType"];
  sourceOptionId: number;
  sourceOptionValue: string;
  stockOwnerUserId: number | null;
  totalMasuk: number;
  totalTransferred: number;
  currentStock: number;
  totalMovements: number;
  lastMovedAt: Date;
  recipients: RecipientSummary[];
  history: SparepartMovementWithUser[];
};

const GENERAL_POOL_KEY = "general";
const GENERAL_POOL_LABEL = "General Pool";
const selectStyles = {
  menu: (provided: Record<string, unknown>) => ({
    ...provided,
    zIndex: 50,
  }),
};

const getOwnerSelectionKey = (userId?: number | null) =>
  userId === null || userId === undefined ? GENERAL_POOL_KEY : `user:${userId}`;

const buildVisualizationItems = (rows: SparepartMovementWithUser[]) => {
  const itemMap = new Map<
    string,
    {
      item: SparepartVisualizationItem;
      recipientsMap: Map<string, RecipientSummary>;
    }
  >();

  rows.forEach((row) => {
    const itemKey = getSparepartItemKey(
      row.deviceFamily,
      row.partType,
      row.sourceOptionId,
      row.stockOwnerUserId
    );

    const existing =
      itemMap.get(itemKey) ??
      {
        item: {
          key: itemKey,
          deviceFamily: row.deviceFamily,
          partType: row.partType,
          sourceOptionId: row.sourceOptionId,
          sourceOptionValue: row.sourceOptionValue,
          stockOwnerUserId: row.stockOwnerUserId ?? null,
          totalMasuk: 0,
          totalTransferred: 0,
          currentStock: 0,
          totalMovements: 0,
          lastMovedAt: new Date(row.movedAt),
          recipients: [],
          history: [],
        },
        recipientsMap: new Map<string, RecipientSummary>(),
      };

    existing.item.totalMovements += 1;
    existing.item.currentStock += getStockDelta(row);
    existing.item.history.push(row);

    const movedAt = new Date(row.movedAt);
    if (movedAt.getTime() > existing.item.lastMovedAt.getTime()) {
      existing.item.lastMovedAt = movedAt;
    }

    if (row.movementType === "MASUK") {
      existing.item.totalMasuk += row.quantity;
    }

    if (row.movementType === "PAKAI") {
      existing.item.totalTransferred += row.quantity;
      const recipientKey = row.userId ? `user:${row.userId}` : "unknown";
      const currentRecipient =
        existing.recipientsMap.get(recipientKey) ?? {
          key: recipientKey,
          userName: row.user?.namaLengkap ?? "Unknown User",
          quantity: 0,
          lastMovedAt: movedAt,
        };

      currentRecipient.quantity += row.quantity;
      if (movedAt.getTime() > currentRecipient.lastMovedAt.getTime()) {
        currentRecipient.lastMovedAt = movedAt;
      }
      existing.recipientsMap.set(recipientKey, currentRecipient);
    }

    itemMap.set(itemKey, existing);
  });

  return Array.from(itemMap.values())
    .map(({ item, recipientsMap }) => ({
      ...item,
      history: [...item.history].sort(
        (left, right) =>
          new Date(right.movedAt).getTime() - new Date(left.movedAt).getTime()
      ),
      recipients: Array.from(recipientsMap.values()).sort(
        (left, right) => right.quantity - left.quantity
      ),
    }))
    .sort(
      (left, right) =>
        right.lastMovedAt.getTime() - left.lastMovedAt.getTime() ||
        left.sourceOptionValue.localeCompare(right.sourceOptionValue, "id")
    );
};

const exportColumns = [
  { header: "Device", accessorKey: "deviceFamily" },
  { header: "Jenis Sparepart", accessorKey: "partType" },
  { header: "Sparepart", accessorKey: "sourceOptionValue" },
  { header: "Mutasi", accessorKey: "movementType" },
  { header: "Qty", accessorKey: "quantity" },
  { header: "Waktu Pindah", accessorKey: "movedAt" },
  { header: "Pemilik Stok", accessorKey: "stockOwner.namaLengkap" },
  { header: "User Pakai", accessorKey: "user.namaLengkap" },
  { header: "Notes", accessorKey: "notes" },
];

export default function SparepartTrackerPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<SparepartMovementWithUser[]>({
    queryKey: ["sparepart-movements"],
    queryFn: () => getSparepartMovements({ include: { user: true } }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSparepartMovement,
    onSuccess: () => {
      toast.success("Sparepart movement deleted.");
      queryClient.invalidateQueries({ queryKey: ["sparepart-movements"] });
    },
    onError: () => {
      toast.error("Failed to delete sparepart movement.");
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<SparepartMovementWithUser | null>(null);
  const [recordToDelete, setRecordToDelete] =
    useState<SparepartMovementWithUser | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedFamily, setSelectedFamily] = useState("all");
  const [selectedMovementType, setSelectedMovementType] = useState("all");
  const [selectedOwnerKey, setSelectedOwnerKey] = useState("");
  const [selectedVisualizationFamily, setSelectedVisualizationFamily] = useState("");
  const [selectedVisualizationPartType, setSelectedVisualizationPartType] = useState("");
  const [selectedVisualizationItemKey, setSelectedVisualizationItemKey] = useState("");

  const stockByItemKey = useMemo(() => buildStockMap(data ?? []), [data]);

  const ownerOptions = useMemo<OwnerOption[]>(() => {
    const ownerMap = new Map<string, OwnerOption>();

    (data ?? []).forEach((record) => {
      const key = getOwnerSelectionKey(record.stockOwnerUserId);
      if (ownerMap.has(key)) {
        return;
      }

      ownerMap.set(key, {
        value: key,
        label: record.stockOwner?.namaLengkap ?? GENERAL_POOL_LABEL,
        userId: record.stockOwnerUserId ?? null,
      });
    });

    return Array.from(ownerMap.values()).sort((left, right) => {
      if (left.value === GENERAL_POOL_KEY) return 1;
      if (right.value === GENERAL_POOL_KEY) return -1;
      return left.label.localeCompare(right.label, "id");
    });
  }, [data]);

  useEffect(() => {
    if (!ownerOptions.length) {
      if (selectedOwnerKey) {
        setSelectedOwnerKey("");
      }
      return;
    }

    const isCurrentOwnerStillValid = ownerOptions.some(
      (option) => option.value === selectedOwnerKey
    );
    if (!selectedOwnerKey || !isCurrentOwnerStillValid) {
      setSelectedOwnerKey(ownerOptions[0].value);
    }
  }, [ownerOptions, selectedOwnerKey]);

  const selectedOwnerOption = useMemo(
    () =>
      ownerOptions.find((option) => option.value === selectedOwnerKey) ?? null,
    [ownerOptions, selectedOwnerKey]
  );

  const ownerMovements = useMemo(
    () =>
      (data ?? []).filter(
        (record) => getOwnerSelectionKey(record.stockOwnerUserId) === selectedOwnerKey
      ),
    [data, selectedOwnerKey]
  );

  const visualizationItems = useMemo(
    () => buildVisualizationItems(ownerMovements),
    [ownerMovements]
  );

  const visualizationFamilies = useMemo(() => {
    const familyMap = new Map<
      string,
      { family: string; totalAvailable: number; totalTransferred: number; totalItems: number }
    >();

    visualizationItems.forEach((item) => {
      const current =
        familyMap.get(item.deviceFamily) ??
        {
          family: item.deviceFamily,
          totalAvailable: 0,
          totalTransferred: 0,
          totalItems: 0,
        };

      current.totalAvailable += item.currentStock;
      current.totalTransferred += item.totalTransferred;
      current.totalItems += 1;
      familyMap.set(item.deviceFamily, current);
    });

    return Array.from(familyMap.values());
  }, [visualizationItems]);

  useEffect(() => {
    if (!visualizationFamilies.length) {
      if (selectedVisualizationFamily) {
        setSelectedVisualizationFamily("");
      }
      return;
    }

    const isCurrentFamilyStillValid = visualizationFamilies.some(
      (family) => family.family === selectedVisualizationFamily
    );
    if (!selectedVisualizationFamily || !isCurrentFamilyStillValid) {
      setSelectedVisualizationFamily(visualizationFamilies[0].family);
    }
  }, [selectedVisualizationFamily, visualizationFamilies]);

  const visualizationPartTypes = useMemo(() => {
    const filteredByFamily = visualizationItems.filter(
      (item) => item.deviceFamily === selectedVisualizationFamily
    );

    return Array.from(new Set(filteredByFamily.map((item) => item.partType)));
  }, [selectedVisualizationFamily, visualizationItems]);

  useEffect(() => {
    if (!visualizationPartTypes.length) {
      if (selectedVisualizationPartType) {
        setSelectedVisualizationPartType("");
      }
      return;
    }

    if (
      !selectedVisualizationPartType ||
      !visualizationPartTypes.includes(
        selectedVisualizationPartType as SparepartMovementWithUser["partType"]
      )
    ) {
      setSelectedVisualizationPartType(visualizationPartTypes[0]);
    }
  }, [selectedVisualizationPartType, visualizationPartTypes]);

  const filteredVisualizationItems = useMemo(
    () =>
      visualizationItems.filter(
        (item) =>
          item.deviceFamily === selectedVisualizationFamily &&
          item.partType === selectedVisualizationPartType
      ),
    [selectedVisualizationFamily, selectedVisualizationPartType, visualizationItems]
  );

  useEffect(() => {
    if (!filteredVisualizationItems.length) {
      if (selectedVisualizationItemKey) {
        setSelectedVisualizationItemKey("");
      }
      return;
    }

    const isCurrentItemStillValid = filteredVisualizationItems.some(
      (item) => item.key === selectedVisualizationItemKey
    );
    if (!selectedVisualizationItemKey || !isCurrentItemStillValid) {
      setSelectedVisualizationItemKey(filteredVisualizationItems[0].key);
    }
  }, [filteredVisualizationItems, selectedVisualizationItemKey]);

  const selectedVisualizationItem = useMemo(
    () =>
      filteredVisualizationItems.find(
        (item) => item.key === selectedVisualizationItemKey
      ) ?? null,
    [filteredVisualizationItems, selectedVisualizationItemKey]
  );

  const visualizationSummaryCards = useMemo(() => {
    const totalAvailable = visualizationItems.reduce(
      (total, item) => total + item.currentStock,
      0
    );
    const totalTransferred = visualizationItems.reduce(
      (total, item) => total + item.totalTransferred,
      0
    );

    return [
      { label: "Pool Aktif", value: visualizationItems.length },
      { label: "Family Aktif", value: visualizationFamilies.length },
      { label: "Stock Tersedia", value: totalAvailable },
      { label: "Sudah Di-over", value: totalTransferred },
    ];
  }, [visualizationFamilies.length, visualizationItems]);

  const selectedFamilySummary = useMemo(
    () =>
      visualizationFamilies.find(
        (family) => family.family === selectedVisualizationFamily
      ) ?? null,
    [selectedVisualizationFamily, visualizationFamilies]
  );

  const selectedVisualizationFamilyLabel =
    SPAREPART_DEVICE_FAMILY_OPTIONS.find(
      (option) => option.value === selectedVisualizationFamily
    )?.label ?? selectedVisualizationFamily;
  const selectedVisualizationPartTypeLabel = selectedVisualizationPartType
    ? SPAREPART_PART_TYPE_LABELS[
        selectedVisualizationPartType as SparepartMovementWithUser["partType"]
      ]
    : "-";

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((record) => {
      if (selectedFamily !== "all" && record.deviceFamily !== selectedFamily) {
        return false;
      }

      if (
        selectedMovementType !== "all" &&
        record.movementType !== selectedMovementType
      ) {
        return false;
      }

      const movedAt = new Date(record.movedAt);
      if (!Number.isNaN(movedAt.getTime())) {
        if (
          selectedYear !== "all" &&
          movedAt.getFullYear().toString() !== selectedYear
        ) {
          return false;
        }
        if (
          selectedMonth !== "all" &&
          (movedAt.getMonth() + 1).toString() !== selectedMonth
        ) {
          return false;
        }
      }

      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;

      const corpus = [
        record.sourceOptionValue,
        SPAREPART_PART_TYPE_LABELS[record.partType],
        record.deviceFamily,
        record.stockOwner?.namaLengkap ?? "",
        record.user?.namaLengkap ?? "",
        record.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(query);
    });
  }, [
    data,
    searchTerm,
    selectedFamily,
    selectedMonth,
    selectedMovementType,
    selectedYear,
  ]);

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        (data ?? [])
          .map((record) => new Date(record.movedAt).getFullYear())
          .filter((year) => !Number.isNaN(year))
          .map((year) => String(year))
      )
    );

    return years.sort((left, right) => Number(right) - Number(left));
  }, [data]);

  const detailMovements = useMemo(() => {
    if (!detailKey || !data) return [];

    return data
      .filter(
        (record) =>
          getSparepartItemKey(
            record.deviceFamily,
            record.partType,
            record.sourceOptionId,
            record.stockOwnerUserId
          ) === detailKey
      )
      .sort(
        (left, right) =>
          new Date(right.movedAt).getTime() - new Date(left.movedAt).getTime()
      );
  }, [data, detailKey]);

  const detailSummary = useMemo(() => {
    if (!detailMovements.length || !detailKey) return null;

    const latestUsage = detailMovements.find((record) => record.movementType === "PAKAI");
    const totalUsage = detailMovements
      .filter((record) => record.movementType === "PAKAI")
      .reduce((total, record) => total + record.quantity, 0);

    return {
      sourceOptionValue: detailMovements[0].sourceOptionValue,
      deviceFamily: detailMovements[0].deviceFamily,
      partType: detailMovements[0].partType,
      stockOwner: detailMovements[0].stockOwner?.namaLengkap ?? "General Pool",
      currentStock: stockByItemKey[detailKey] ?? 0,
      totalMovements: detailMovements.length,
      totalUsage,
      lastMovedAt: detailMovements[0].movedAt,
      lastUser: latestUsage?.user?.namaLengkap ?? "-",
    };
  }, [detailKey, detailMovements, stockByItemKey]);

  const summaryCards = useMemo(() => {
    const distinctItems = Object.keys(stockByItemKey).length;
    const totalStock = Object.values(stockByItemKey).reduce(
      (total, value) => total + value,
      0
    );
    const totalUsage = (data ?? [])
      .filter((record) => record.movementType === "PAKAI")
      .reduce((total, record) => total + record.quantity, 0);

    return [
      { label: "Total Mutasi", value: (data ?? []).length },
      { label: "Pool Sparepart", value: distinctItems },
      { label: "Total Stock", value: totalStock },
      { label: "Total Usage", value: totalUsage },
    ];
  }, [data, stockByItemKey]);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (record) => {
          setEditingRecord(record);
          setIsFormOpen(true);
        },
        onDelete: (record) => {
          setRecordToDelete(record);
          setIsDeleteOpen(true);
        },
        stockByItemKey,
      }),
    [stockByItemKey]
  );

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    deleteMutation.mutate(recordToDelete.id);
    setIsDeleteOpen(false);
    setRecordToDelete(null);
  };

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        Failed to load sparepart tracker data.
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-10">
      <SparepartTrackerForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingRecord(null);
          }
        }}
        defaultValue={editingRecord}
        movements={data ?? []}
      />

      <DeleteSparepartMovementDialog
        record={recordToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        open={Boolean(detailKey)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailKey(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sparepart Detail & History</DialogTitle>
          </DialogHeader>
          {detailSummary ? (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: "Sparepart", value: detailSummary.sourceOptionValue },
                      {
                        label: "Device Family",
                        value:
                          SPAREPART_DEVICE_FAMILY_OPTIONS.find(
                            (option) => option.value === detailSummary.deviceFamily
                          )?.label ?? detailSummary.deviceFamily,
                      },
                      {
                        label: "Jenis Sparepart",
                        value: SPAREPART_PART_TYPE_LABELS[detailSummary.partType],
                      },
                      {
                        label: "Pemilik Stok",
                        value: detailSummary.stockOwner,
                      },
                      {
                        label: "Current Stock",
                        value: detailSummary.currentStock.toLocaleString("id-ID"),
                      },
                      {
                        label: "Total Usage",
                        value: detailSummary.totalUsage.toLocaleString("id-ID"),
                      },
                      { label: "Last User", value: detailSummary.lastUser },
                      {
                        label: "Last Movement",
                        value: new Date(detailSummary.lastMovedAt).toLocaleString("id-ID"),
                      },
                      {
                        label: "Total Mutations",
                        value: detailSummary.totalMovements.toLocaleString("id-ID"),
                      },
                    ].map((item) => (
                      <tr key={item.label} className="border-b last:border-b-0">
                        <td className="w-1/3 px-4 py-3 font-semibold align-top">
                          {item.label}
                        </td>
                        <td className="px-4 py-3">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Mutasi</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead>Pemilik Stok</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailMovements.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.movedAt).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{getMovementLabel(record)}</TableCell>
                        <TableCell className="text-center">
                          {record.quantity.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{record.stockOwner?.namaLengkap ?? "General Pool"}</TableCell>
                        <TableCell>{record.user?.namaLengkap ?? "-"}</TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">
                {card.value.toLocaleString("id-ID")}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Visualisasi Pemilik Sparepart</CardTitle>
            <CardDescription>
              Pilih pemilik stok, lalu drill down ke family dan jenis sparepart untuk lihat stock tersedia dan riwayat over ke user lain.
            </CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <ReactSelect
              instanceId="sparepart-owner-select"
              styles={selectStyles}
              value={selectedOwnerOption}
              onChange={(option) => setSelectedOwnerKey(option?.value ?? "")}
              options={ownerOptions}
              placeholder="Pilih pemilik stok"
              isDisabled={!ownerOptions.length}
              isClearable={false}
              classNamePrefix="react-select"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!ownerOptions.length ? (
            <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada sparepart movement yang punya pemilik stok.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {visualizationSummaryCards.map((card) => (
                  <div key={card.label} className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-sm text-muted-foreground">{card.label}</div>
                    <div className="mt-2 text-2xl font-semibold">
                      {card.value.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Pilih Family</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Filter pool berdasarkan device family yang punya stok aktif.
                        </p>
                      </div>
                      <Badge variant="outline">
                        {visualizationFamilies.length.toLocaleString("id-ID")} family
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visualizationFamilies.map((family) => {
                        const isActive = family.family === selectedVisualizationFamily;
                        const label =
                          SPAREPART_DEVICE_FAMILY_OPTIONS.find(
                            (option) => option.value === family.family
                          )?.label ?? family.family;

                        return (
                          <Button
                            key={family.family}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedVisualizationFamily(family.family)}
                            className="h-auto gap-2 px-4 py-2"
                          >
                            <span>{label}</span>
                            <span className={isActive ? "text-primary-foreground/75" : "text-muted-foreground"}>
                              {family.totalItems.toLocaleString("id-ID")}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {visualizationPartTypes.length ? (
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Pilih Jenis Sparepart</div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Jenis yang muncul mengikuti family yang sedang dipilih.
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {visualizationPartTypes.length.toLocaleString("id-ID")} jenis
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visualizationPartTypes.map((partType) => (
                          <Button
                            key={partType}
                            variant={
                              partType === selectedVisualizationPartType
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedVisualizationPartType(partType)}
                            className="h-auto px-4 py-2"
                          >
                            {SPAREPART_PART_TYPE_LABELS[partType]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <aside className="rounded-2xl border bg-emerald-50/40 p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                        Konteks Pemilik
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                        {selectedOwnerOption?.label ?? GENERAL_POOL_LABEL}
                      </h3>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-200 dark:hover:bg-emerald-400/15">
                      Active
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-xl border bg-white/80 p-3 dark:border-emerald-900/50 dark:bg-slate-950/40">
                      <div className="text-xs text-muted-foreground">Family aktif</div>
                      <div className="mt-1 font-semibold text-slate-950 dark:text-slate-50">{selectedVisualizationFamilyLabel || "-"}</div>
                    </div>
                    <div className="rounded-xl border bg-white/80 p-3 dark:border-emerald-900/50 dark:bg-slate-950/40">
                      <div className="text-xs text-muted-foreground">Jenis aktif</div>
                      <div className="mt-1 font-semibold text-slate-950 dark:text-slate-50">{selectedVisualizationPartTypeLabel}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Stock family</div>
                      <div className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                        {(selectedFamilySummary?.totalAvailable ?? 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Pool family</div>
                      <div className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                        {(selectedFamilySummary?.totalItems ?? 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-emerald-100 bg-white/80 p-3 dark:border-emerald-900/50 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Sudah di-over</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {(selectedFamilySummary?.totalTransferred ?? 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
                      <div
                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                        style={{
                          width: `${
                            selectedFamilySummary &&
                            selectedFamilySummary.totalAvailable + selectedFamilySummary.totalTransferred > 0
                              ? Math.min(
                                  100,
                                  Math.max(
                                    6,
                                    (selectedFamilySummary.totalTransferred /
                                      (selectedFamilySummary.totalAvailable +
                                        selectedFamilySummary.totalTransferred)) *
                                      100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </aside>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Pool Sparepart</div>
                  {filteredVisualizationItems.length ? (
                    <div className="grid gap-3">
                      {filteredVisualizationItems.map((item) => {
                        const isActive = item.key === selectedVisualizationItemKey;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setSelectedVisualizationItemKey(item.key)}
                            className={`rounded-xl border p-4 text-left transition ${
                              isActive
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border bg-background hover:border-primary/40"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold">{item.sourceOptionValue}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  {SPAREPART_PART_TYPE_LABELS[item.partType]} ·{" "}
                                  {SPAREPART_DEVICE_FAMILY_OPTIONS.find(
                                    (option) => option.value === item.deviceFamily
                                  )?.label ?? item.deviceFamily}
                                </div>
                              </div>
                              <Badge variant={item.currentStock > 0 ? "default" : "secondary"}>
                                Tersedia {item.currentStock.toLocaleString("id-ID")}
                              </Badge>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <div>
                                <div className="text-xs text-muted-foreground">Total Masuk</div>
                                <div className="text-lg font-semibold">
                                  {item.totalMasuk.toLocaleString("id-ID")}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Sudah Di-over</div>
                                <div className="text-lg font-semibold">
                                  {item.totalTransferred.toLocaleString("id-ID")}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Penerima</div>
                                <div className="text-lg font-semibold">
                                  {item.recipients.length.toLocaleString("id-ID")}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                      Tidak ada sparepart untuk family dan jenis yang dipilih.
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">Detail Visualisasi</div>
                  {selectedVisualizationItem ? (
                    <div className="space-y-4 rounded-xl border p-4">
                      <div>
                        <div className="text-xl font-semibold">
                          {selectedVisualizationItem.sourceOptionValue}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Pemilik stok:{" "}
                          {ownerOptions.find(
                            (option) => option.value === selectedOwnerKey
                          )?.label ?? GENERAL_POOL_LABEL}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted/30 p-3">
                          <div className="text-xs text-muted-foreground">
                            Qty Tersedia
                          </div>
                          <div className="text-2xl font-semibold">
                            {selectedVisualizationItem.currentStock.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-3">
                          <div className="text-xs text-muted-foreground">
                            Qty Sudah Di-over
                          </div>
                          <div className="text-2xl font-semibold">
                            {selectedVisualizationItem.totalTransferred.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-3">
                          <div className="text-xs text-muted-foreground">
                            Total Masuk
                          </div>
                          <div className="text-2xl font-semibold">
                            {selectedVisualizationItem.totalMasuk.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-3">
                          <div className="text-xs text-muted-foreground">
                            Update Terakhir
                          </div>
                          <div className="text-sm font-medium">
                            {selectedVisualizationItem.lastMovedAt.toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium">
                          Sudah Di-over ke Siapa Saja
                        </div>
                        {selectedVisualizationItem.recipients.length ? (
                          <div className="space-y-2">
                            {selectedVisualizationItem.recipients.map((recipient) => (
                              <div
                                key={recipient.key}
                                className="flex items-center justify-between rounded-lg border px-3 py-2"
                              >
                                <div>
                                  <div className="font-medium">{recipient.userName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Terakhir:{" "}
                                    {recipient.lastMovedAt.toLocaleString("id-ID")}
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  {recipient.quantity.toLocaleString("id-ID")} qty
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                            Belum pernah diover ke user lain.
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium">Riwayat Mutasi</div>
                        <div className="overflow-x-auto rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Mutasi</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead>User Tujuan</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedVisualizationItem.history.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>
                                    {new Date(record.movedAt).toLocaleString("id-ID")}
                                  </TableCell>
                                  <TableCell>{getMovementLabel(record)}</TableCell>
                                  <TableCell className="text-center">
                                    {record.quantity.toLocaleString("id-ID")}
                                  </TableCell>
                                  <TableCell>{record.user?.namaLengkap ?? "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                      Pilih salah satu sparepart untuk lihat visualisasi detail.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Sparepart Tracker</CardTitle>
            <CardDescription>
              Track stock and usage history for laptop, Intel NUC, and PC spareparts.
            </CardDescription>
          </div>
          {isAdmin ? (
            <Button onClick={() => setIsFormOpen(true)}>Create Movement</Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <ExportActions
                  columns={exportColumns}
                  data={filteredData}
                  fileName="Sparepart_Tracker"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-48"
                  />
                  <UiSelect value={selectedFamily} onValueChange={setSelectedFamily}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Device</SelectItem>
                      {SPAREPART_DEVICE_FAMILY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </UiSelect>
                  <UiSelect
                    value={selectedMovementType}
                    onValueChange={setSelectedMovementType}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Mutasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Mutations</SelectItem>
                      {SPAREPART_MOVEMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </UiSelect>
                  <UiSelect value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </UiSelect>
                  <UiSelect value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </UiSelect>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={filteredData}
                onRowClick={(record) =>
                  setDetailKey(
                    getSparepartItemKey(
                      record.deviceFamily,
                      record.partType,
                      record.sourceOptionId,
                      record.stockOwnerUserId
                    )
                  )
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
