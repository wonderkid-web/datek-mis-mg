"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { BilingRecordWithUser } from "@/lib/types";
import { getBilingRecords, deleteBilingRecord } from "@/lib/bilingRecordService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { getColumns } from "./columns";
import { BilingRecordForm } from "./BilingRecordForm";
import { DeleteBilingRecordDialog } from "./DeleteBilingRecordDialog";
import { ExportActions } from "@/components/ExportActions";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const getYears = (rows: BilingRecordWithUser[]) => {
  const years = Array.from(
    new Set(
      rows
        .map((row) => new Date(row.callDate).getFullYear())
        .filter((year) => !Number.isNaN(year))
    )
  );
  return years.sort((a, b) => b - a);
};

const formatCost = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "-";
  return new Intl.NumberFormat("id-ID").format(numberValue);
};

const exportColumns = [
  {
    header: "Date",
    accessorKey: "callDate",
    accessorFn: (row: BilingRecordWithUser) =>
      new Date(row.callDate).toLocaleDateString("id-ID"),
  },
  {
    header: "Time",
    accessorKey: "time",
    accessorFn: (row: BilingRecordWithUser) =>
      new Date(row.callDate).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  { header: "Ext", accessorKey: "extension" },
  { header: "Name", accessorKey: "user.namaLengkap" },
  { header: "Dial", accessorKey: "dial" },
  { header: "Duration", accessorKey: "duration" },
  { header: "Trunk", accessorKey: "trunk" },
  { header: "PSTN", accessorKey: "pstn" },
  {
    header: "Cost",
    accessorKey: "cost",
    accessorFn: (row: BilingRecordWithUser) => formatCost(row.cost),
  },
];

export default function BilingRecordsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<BilingRecordWithUser[]>({
    queryKey: ["biling-records"],
    queryFn: () => getBilingRecords({ include: { user: true } }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBilingRecord,
    onSuccess: () => {
      toast.success("Biling record deleted.");
      queryClient.invalidateQueries({ queryKey: ["biling-records"] });
    },
    onError: () => {
      toast.error("Failed to delete biling record.");
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BilingRecordWithUser | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<BilingRecordWithUser | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<BilingRecordWithUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((row) => {
      const query = searchTerm.trim().toLowerCase();
      if (query) {
        const date = new Date(row.callDate);
        const haystack = [
          date.toLocaleDateString("id-ID"),
          date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          row.extension.toString(),
          row.user.namaLengkap,
          row.dial,
          row.duration,
          row.trunk.toString(),
          row.pstn.toString(),
          formatCost(row.cost),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      const date = new Date(row.callDate);
      if (!Number.isNaN(date.getTime())) {
        if (selectedYear !== "all" && date.getFullYear().toString() !== selectedYear) {
          return false;
        }
        if (selectedMonth !== "all" && (date.getMonth() + 1).toString() !== selectedMonth) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, selectedYear, selectedMonth]);

  const years = useMemo(() => (data ? getYears(data) : []), [data]);

  const handleEdit = (record: BilingRecordWithUser) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (record: BilingRecordWithUser) => {
    setRecordToDelete(record);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    deleteMutation.mutate(recordToDelete.id);
    setIsDeleteOpen(false);
    setRecordToDelete(null);
  };

  if (isError) {
    return <div className="container mx-auto py-10">Failed to load biling records.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <BilingRecordForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingRecord(null);
          }
        }}
        defaultValue={editingRecord}
      />

      <DeleteBilingRecordDialog
        record={recordToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        open={Boolean(detailRecord)}
        onOpenChange={(open) => {
          if (!open) setDetailRecord(null);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Biling Record Details</DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    {
                      label: "Date",
                      value: new Date(detailRecord.callDate).toLocaleDateString("id-ID"),
                    },
                    {
                      label: "Time",
                      value: new Date(detailRecord.callDate).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                    { label: "EXT", value: detailRecord.extension },
                    { label: "Name", value: detailRecord.user.namaLengkap },
                    { label: "Dial", value: detailRecord.dial },
                    { label: "Duration", value: detailRecord.duration },
                    { label: "Trunk", value: detailRecord.trunk },
                    { label: "PSTN", value: detailRecord.pstn },
                    { label: "Cost", value: formatCost(detailRecord.cost) },
                  ].map((item) => (
                    <tr key={item.label} className="border-b last:border-b-0">
                      <td className="w-1/3 px-4 py-3 align-top font-semibold">{item.label}</td>
                      <td className="px-4 py-3">{item.value || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Biling Records</CardTitle>
            <p className="text-sm text-muted-foreground">
              Telephone billing records from extension activity.
            </p>
          </div>
          {isAdmin && <Button onClick={() => setIsFormOpen(true)}>Create Record</Button>}
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
                  fileName="Biling_Records"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-48"
                  />
                  <UiSelect value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
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
                columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete })}
                data={filteredData}
                onRowClick={(record) => setDetailRecord(record)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
