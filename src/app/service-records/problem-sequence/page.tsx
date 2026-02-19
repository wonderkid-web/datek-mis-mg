"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProblemSequenceWithIsp } from "@/lib/types";
import { getProblemSequences, deleteProblemSequence } from "@/lib/problemSequenceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { getColumns } from "./columns";
import { ProblemSequenceForm } from "./ProblemSequenceForm";
import { DeleteProblemSequenceDialog } from "./DeleteProblemSequenceDialog";
import { ExportActions } from "@/components/ExportActions";
import { Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const getYears = (rows: ProblemSequenceWithIsp[]) => {
  const years = Array.from(
    new Set(
      rows
        .map((row) => new Date(row.dateDown).getFullYear())
        .filter((year) => !Number.isNaN(year))
    )
  );
  return years.sort((a, b) => b - a);
};

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

const exportColumns = [
  { header: "No Ticket", accessorKey: "ticketNumber" },
  { header: "SBU", accessorKey: "sbu" },
  { header: "ISP", accessorKey: "isp.isp" },
  { header: "PIC", accessorKey: "pic" },
  { header: "Date Down", accessorKey: "dateDown" },
  { header: "Done Up", accessorKey: "dateDoneUp" },
  { header: "Issue", accessorKey: "issue" },
  { header: "Trouble", accessorKey: "trouble" },
  { header: "Solved", accessorKey: "solved" },
];

export default function ProblemSequencePage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";

  const { data, isLoading, isError } = useQuery<ProblemSequenceWithIsp[]>({
    queryKey: ["problem-sequences"],
    queryFn: () => getProblemSequences({ include: { isp: true } }),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteProblemSequence,
    onSuccess: () => {
      toast.success("Problem ticket deleted.");
      queryClient.invalidateQueries({ queryKey: ["problem-sequences"] });
    },
    onError: () => {
      toast.error("Failed to delete problem ticket.");
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProblemSequenceWithIsp | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [recordToDelete, setRecordToDelete] = useState<ProblemSequenceWithIsp | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ProblemSequenceWithIsp | null>(null);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      const query = searchTerm.trim().toLowerCase();
      if (query) {
        const haystack = [row.ticketNumber, row.sbu, row.isp.isp, row.pic, row.issue, row.trouble, row.solved]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      const date = new Date(row.dateDown);
      if (!Number.isNaN(date.getTime())) {
        if (selectedYear !== "all" && date.getFullYear().toString() !== selectedYear) return false;
        if (selectedMonth !== "all" && (date.getMonth() + 1).toString() !== selectedMonth) return false;
      }

      return true;
    });
  }, [data, searchTerm, selectedYear, selectedMonth]);

  const years = useMemo(() => (data ? getYears(data) : []), [data]);

  const handleEdit = (record: ProblemSequenceWithIsp) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (record: ProblemSequenceWithIsp) => {
    setRecordToDelete(record);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteMutation.mutate(recordToDelete.id);
      setIsDeleteOpen(false);
      setRecordToDelete(null);
    }
  };

  if (isError) {
    return <div className="container mx-auto py-10">Failed to load problem sequences.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <ProblemSequenceForm open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingRecord(null);
        }
      }} defaultValue={editingRecord} />

      <DeleteProblemSequenceDialog
        record={recordToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
      />
      <Dialog open={Boolean(detailRecord)} onOpenChange={(open) => {
        if (!open) {
          setDetailRecord(null);
        }
      }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Problem Ticket Details</DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <div className="border rounded-lg">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "No Tiket", value: detailRecord.ticketNumber },
                    { label: "SBU", value: detailRecord.sbu.replaceAll("_", " ") },
                    { label: "ISP", value: detailRecord.isp.isp },
                    { label: "PIC (HP NOC)", value: detailRecord.pic },
                    { label: "Date Down", value: new Date(detailRecord.dateDown).toLocaleString("id-ID") },
                    { label: "Done Up", value: new Date(detailRecord.dateDoneUp).toLocaleString("id-ID") },
                    {
                      label: "SLA",
                      value: (() => {
                        const down = new Date(detailRecord.dateDown).getTime();
                        const up = new Date(detailRecord.dateDoneUp).getTime();
                        if (Number.isNaN(down) || Number.isNaN(up)) return "-";
                        const diffSec = Math.floor(Math.abs(up - down) / 1000);
                        const days = Math.floor(diffSec / 86400);
                        const hours = Math.floor((diffSec % 86400) / 3600);
                        const minutes = Math.floor((diffSec % 3600) / 60);
                        const seconds = diffSec % 60;
                        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
                      })(),
                    },
                    { label: "Issue", value: detailRecord.issue },
                    { label: "Trouble", value: detailRecord.trouble },
                    { label: "Solved", value: detailRecord.solved },
                  ].map((item) => (
                    <tr key={item.label} className="border-b last:border-b-0">
                      <td className="w-1/3 px-4 py-3 font-semibold align-top">{item.label}</td>
                      <td className="px-4 py-3 whitespace-pre-line">{item.value || "-"}</td>
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
            <CardTitle>Problem Sequence</CardTitle>
            <p className="text-sm text-muted-foreground">Trouble tickets for ISP outages.</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsFormOpen(true)}>Create Ticket</Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                <ExportActions columns={exportColumns} data={filteredData} fileName="Problem_Sequence" />
                <div className="flex flex-wrap gap-2 items-center">
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
