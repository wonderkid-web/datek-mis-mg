"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Isp } from "@prisma/client";
import { useSession } from "next-auth/react";
import ReactSelect from "react-select";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { ExportActions } from "@/components/ExportActions";
import { SBU_OPTIONS } from "@/lib/constants";
import {
  deleteIspSlaRecord,
  getIspSlaRecords,
} from "@/lib/ispSlaRecordService";
import { getIsps } from "@/lib/ispService";
import {
  SLA_MONTH_OPTIONS,
  buildSlaSbuOptions,
  formatActualisation,
  formatDurationSeconds,
  formatSlaSbuLabel,
  getSlaMonthLabel,
  normalizeSlaSbuValue,
} from "@/lib/ispSlaUtils";

import { columns } from "./columns";
import { EditSlaRecordDialog } from "./edit-sla-record-dialog";
import { SlaRecordForm } from "./sla-record-form";
import { IspSlaRecordWithIsp } from "./types";
import { ViewSlaRecordDialog } from "./view-sla-record-dialog";

const currentYear = new Date().getFullYear();

const exportColumns = [
  {
    header: "SBU",
    accessorFn: (row: IspSlaRecordWithIsp) => formatSlaSbuLabel(row.sbu),
  },
  {
    header: "ISP",
    accessorFn: (row: IspSlaRecordWithIsp) => row.isp.isp,
  },
  {
    header: "Month",
    accessorFn: (row: IspSlaRecordWithIsp) => getSlaMonthLabel(row.month),
  },
  { header: "Year", accessorKey: "year" },
  { header: "Contract", accessorKey: "contract" },
  {
    header: "Actualisation",
    accessorFn: (row: IspSlaRecordWithIsp) => formatActualisation(row.actualisation),
  },
  {
    header: "Uptime",
    accessorFn: (row: IspSlaRecordWithIsp) => formatDurationSeconds(row.uptimeSeconds),
  },
  {
    header: "Downtime",
    accessorFn: (row: IspSlaRecordWithIsp) => formatDurationSeconds(row.downtimeSeconds),
  },
  { header: "Remarks", accessorKey: "remarks" },
];

export default function SlaPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IspSlaRecordWithIsp | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<IspSlaRecordWithIsp | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [recordToDeleteId, setRecordToDeleteId] = useState<number | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedIspId, setSelectedIspId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<IspSlaRecordWithIsp[]>({
    queryKey: ["ispSlaRecords"],
    queryFn: getIspSlaRecords,
  });

  const { data: ispsData } = useQuery<Isp[]>({
    queryKey: ["isps"],
    queryFn: getIsps,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIspSlaRecord,
    onSuccess: () => {
      toast.success("Data SLA berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["ispSlaRecords"] });
      setRecordToDeleteId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus data SLA.");
    },
  });

  const yearOptions = useMemo(() => {
    const years = new Set<number>([currentYear]);
    for (const record of data ?? []) {
      years.add(record.year);
    }

    return Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({ value: year, label: String(year) }));
  }, [data]);

  const sbuOptions = useMemo(() => buildSlaSbuOptions(SBU_OPTIONS), []);

  const ispOptions = useMemo(
    () => (ispsData ?? []).map((isp) => ({ value: isp.id, label: isp.isp })),
    [ispsData]
  );

  const filteredData = useMemo(() => {
    return (data ?? []).filter((record) => {
      if (selectedYear !== null && record.year !== selectedYear) return false;
      if (selectedMonth !== null && record.month !== selectedMonth) return false;
      if (
        selectedSbu !== null &&
        normalizeSlaSbuValue(record.sbu) !== selectedSbu
      ) {
        return false;
      }
      if (selectedIspId !== null && record.ispId !== selectedIspId) return false;
      return true;
    });
  }, [data, selectedYear, selectedMonth, selectedSbu, selectedIspId]);

  const hasActiveFilters =
    selectedYear !== null ||
    selectedMonth !== null ||
    selectedSbu !== null ||
    selectedIspId !== null;

  const handleView = (record: IspSlaRecordWithIsp) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleEdit = (record: IspSlaRecordWithIsp) => {
    setRecordToEdit(record);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setRecordToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (recordToDeleteId === null) return;
    deleteMutation.mutate(recordToDeleteId);
    setIsDeleteOpen(false);
  };

  const resetFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedSbu(null);
    setSelectedIspId(null);
  };

  if (isError) {
    return <div className="container mx-auto py-10">Error loading SLA data.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New SLA Record</DialogTitle>
          </DialogHeader>
          <SlaRecordForm onSave={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>SLA</CardTitle>
              <CardDescription>Data actualisation, uptime, dan downtime bulanan ISP.</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create SLA</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <ExportActions
                  columns={exportColumns}
                  data={filteredData}
                  fileName="SLA_ISP_Bulanan"
                />

                <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ReactSelect
                    options={yearOptions}
                    isClearable
                    placeholder="Pilih Tahun"
                    value={yearOptions.find((option) => option.value === selectedYear) ?? null}
                    onChange={(option) => setSelectedYear(option?.value ?? null)}
                  />
                  <ReactSelect
                    options={SLA_MONTH_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    isClearable
                    placeholder="Pilih Bulan"
                    value={
                      SLA_MONTH_OPTIONS.find((option) => option.value === selectedMonth)
                        ? {
                            value: selectedMonth!,
                            label: SLA_MONTH_OPTIONS.find(
                              (option) => option.value === selectedMonth
                            )!.label,
                          }
                        : null
                    }
                    onChange={(option) => setSelectedMonth(option?.value ?? null)}
                  />
                  <ReactSelect
                    options={sbuOptions}
                    isClearable
                    placeholder="Pilih SBU"
                    value={sbuOptions.find((option) => option.value === selectedSbu) ?? null}
                    onChange={(option) => setSelectedSbu(option?.value ?? null)}
                  />
                  <ReactSelect
                    options={ispOptions}
                    isClearable
                    placeholder="Pilih ISP"
                    value={ispOptions.find((option) => option.value === selectedIspId) ?? null}
                    onChange={(option) => setSelectedIspId(option?.value ?? null)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                </div>
              )}

              <DataTable
                columns={columns({
                  handleEdit,
                  handleDelete,
                  isAdmin,
                })}
                data={filteredData}
                onRowClick={handleView}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ViewSlaRecordDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        slaRecord={selectedRecord}
      />

      <EditSlaRecordDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        slaRecord={recordToEdit}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data SLA?</AlertDialogTitle>
            <AlertDialogDescription>
              Data yang dihapus tidak bisa dikembalikan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
