"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { ExportActions } from "@/components/ExportActions";
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

  const stockByItemKey = useMemo(() => buildStockMap(data ?? []), [data]);

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
