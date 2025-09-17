"use client";

import { useState, useEffect, FormEvent, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Select from "react-select";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

import {
  getPrinterRepetitiveMaintenances,
  createPrinterRepetitiveMaintenance,
  deletePrinterRepetitiveMaintenance,
  getNotesPrinter,
} from "@/lib/printerRepetitiveMaintenanceService";
import { getAssetAssignmentsPrinter } from "@/lib/assetAssignmentService";
import { getColumns } from "./columns";
import { DeleteRecordDialog } from "./delete-record-dialog";
import { EditRecordDialog } from "./edit-record-dialog";
import {
  AssetAssignment,
  AssetAssignmentPrinter,
  PrinterRepetitiveMaintenance,
} from "@/lib/types";
import { ExportActions } from "@/components/ExportActions";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function RepetitiveServicePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<PrinterRepetitiveMaintenance[]>([]);
  const [notes, setNotes] = useState<
    {
      catatan: string | null;
      nomorAsset: string;
    }[]
  >([]);
  const [assetAssignments, setAssetAssignments] = useState<
    AssetAssignmentPrinter[]
  >([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssetAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recordToDelete, setRecordToDelete] =
    useState<PrinterRepetitiveMaintenance | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] =
    useState<PrinterRepetitiveMaintenance | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Form state for PrinterRepetitiveMaintenance
  const [reportDate, setReportDate] = useState<string>("");
  const [assetAssignmentId, setAssetAssignmentId] = useState<number | null>(
    null
  );
  const [assetDetails, setAssetDetails] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [blackCount, setBlackCount] = useState<number | null>(null);
  const [yellowCount, setYellowCount] = useState<number | null>(null);
  const [magentaCount, setMagentaCount] = useState<number | null>(null);
  const [cyanCount, setCyanCount] = useState<number | null>(null);
  const [remarks, setRemarks] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedRecords, assignments, fetchedNotes] = await Promise.all([
        getPrinterRepetitiveMaintenances(),
        getAssetAssignmentsPrinter(),
        getNotesPrinter(),
      ]);
      setRecords(fetchedRecords);
      setNotes(fetchedNotes);

      // @ts-expect-error its okay
      setAssetAssignments(assignments);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableYears = useMemo(() => {
    const years = records
      .map((record) => {
        const date = new Date(record.reportDate);
        return Number.isNaN(date.getTime()) ? null : date.getFullYear().toString();
      })
      .filter((year): year is string => Boolean(year));
    const unique = Array.from(new Set(years));
    unique.sort((a, b) => Number(b) - Number(a));
    return unique;
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return records.filter((record) => {
      const date = new Date(record.reportDate);
      if (!Number.isNaN(date.getTime())) {
        if (selectedYear !== "all" && date.getFullYear().toString() !== selectedYear) {
          return false;
        }
        if (
          selectedMonth !== "all" &&
          (date.getMonth() + 1).toString() !== selectedMonth
        ) {
          return false;
        }
      }

      if (!query) return true;

      const corpus = [
        record.assetDetails ?? "",
        record.catatan ?? "",
        record.remarks ?? "",
        record.totalPages != null ? record.totalPages.toString() : "",
        record.blackCount != null ? record.blackCount.toString() : "",
        record.yellowCount != null ? record.yellowCount.toString() : "",
        record.magentaCount != null ? record.magentaCount.toString() : "",
        record.cyanCount != null ? record.cyanCount.toString() : "",
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(query);
    });
  }, [records, searchTerm, selectedYear, selectedMonth]);

  const handleAssetSelect = (assignmentIdStr: string) => {
    const id = parseInt(assignmentIdStr, 10);
    const assignment = assetAssignments.find((a) => a.id === id) || null;
    // @ts-expect-error its okay
    setSelectedAssignment(assignment);
    setAssetAssignmentId(id);
    if (assignment) {
      setAssetDetails(
        `Asset: ${assignment.asset?.namaAsset || "N/A"} - User: ${
        // @ts-expect-error its okay
        assignment.user?.namaLengkap || "N/A"
        }`
      );
    } else {
      setAssetDetails(null);
    }
  };

  const resetForm = () => {
    setReportDate("");
    setAssetAssignmentId(null);
    setAssetDetails(null);
    setTotalPages(null);
    setBlackCount(null);
    setYellowCount(null);
    setMagentaCount(null);
    setCyanCount(null);
    setRemarks(null);
    setSelectedAssignment(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!assetAssignmentId || !reportDate) {
      toast.warning("Please select a Serial Number and Report Date.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPrinterRepetitiveMaintenance({
        reportDate: new Date(reportDate),
        catatan: selectedAssignment?.catatan || "-",
        assetDetails: assetDetails,
        totalPages: totalPages,
        blackCount: blackCount,
        yellowCount: yellowCount,
        magentaCount: magentaCount,
        cyanCount: cyanCount,
        remarks: remarks,
      });
      toast.success("Repetitive maintenance record created successfully!");
      resetForm();
      fetchData();
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create record:", error);
      toast.error("Failed to save the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = useCallback((record: PrinterRepetitiveMaintenance) => {
    setRecordToEdit(record);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((record: PrinterRepetitiveMaintenance) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deletePrinterRepetitiveMaintenance(recordToDelete.id);
      toast.success("Repetitive maintenance record deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to delete record:", error);
      toast.error("Failed to delete the record.");
    } finally {
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const columns = useMemo(
    () => getColumns({ handleEditClick, handleDeleteClick }),
    [handleEditClick, handleDeleteClick]
  );

  const exportColumns = [
    { header: "Report Date", accessorKey: "reportDate" },
    { header: "Asset Details", accessorKey: "assetDetails" },
    { header: "Total Pages", accessorKey: "totalPages" },
    { header: "Notes", accessorKey: "catatan" },
    { header: "Black Count", accessorKey: "blackCount" },
    { header: "Yellow Count", accessorKey: "yellowCount" },
    { header: "Magenta Count", accessorKey: "magentaCount" },
    { header: "Cyan Count", accessorKey: "cyanCount" },
    { header: "Remarks", accessorKey: "remarks" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Repetitive Maintenance History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="container mx-auto py-10">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                  Repetitive Maintenance History
                </h1>
                <Skeleton className="h-10 w-1/3" />
              </div>
              <TableSkeleton />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <ExportActions
                  columns={exportColumns}
                  data={filteredRecords}
                  fileName="Repetitive_Maintenance_Records"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full sm:w-48"
                  />
                  <UiSelect value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[130px]">
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
                    <SelectTrigger className="w-[150px]">
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
                  {(session?.user as any)?.role === "administrator" && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      Create Repetitive
                    </Button>
                  )}
                </div>
              </div>
              <DataTable columns={columns} data={filteredRecords} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Repetitive Dialog */}
      {(session?.user as any)?.role === "administrator" && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Repetitive Maintenance Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportDate">Report Date</Label>
                  <Input
                    type="date"
                    id="reportDate"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="assetAssignmentId">Serial Number</Label>
                  <Select
                    options={assetAssignments.map((a) => ({
                      value: a.id.toString(),
                      label: `${a.asset?.nomorSeri}`,
                    }))}
                    onChange={(selectedOption) =>
                      handleAssetSelect(selectedOption?.value || "")
                    }
                    value={
                      assetAssignmentId
                        ? {
                          value: assetAssignmentId.toString(),
                          label: `${selectedAssignment?.asset?.nomorSeri} - ${selectedAssignment?.asset?.namaAsset} (${selectedAssignment?.user?.namaLengkap})`,
                        }
                        : null
                    }
                    placeholder="Select a Serial Number"
                    className="w-full"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Selected Printer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAssignment ? (
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">Brand:</TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.printerSpecs?.brandOption?.value ||
                              "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Brand:</TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.namaAsset || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Serial Number:</TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.nomorSeri || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Assigned User:</TableCell>
                          <TableCell>
                            {selectedAssignment.user?.namaLengkap || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Department:</TableCell>
                          <TableCell>
                            {selectedAssignment.user?.departemen || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Company:</TableCell>
                          <TableCell>
                            {selectedAssignment.user?.lokasiKantor || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <p>Select a printer asset number to see details.</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="totalPages">Total Pages</Label>
                  <Input
                    type="number"
                    id="totalPages"
                    value={totalPages ?? ""}
                    onChange={(e) =>
                      setTotalPages(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="blackCount">Black Count</Label>
                  <Input
                    type="number"
                    id="blackCount"
                    value={blackCount ?? ""}
                    onChange={(e) =>
                      setBlackCount(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="yellowCount">Yellow Count</Label>
                  <Input
                    type="number"
                    id="yellowCount"
                    value={yellowCount ?? ""}
                    onChange={(e) =>
                      setYellowCount(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="magentaCount">Magenta Count</Label>
                  <Input
                    type="number"
                    id="magentaCount"
                    value={magentaCount ?? ""}
                    onChange={(e) =>
                      setMagentaCount(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="cyanCount">Cyan Count</Label>
                  <Input
                    type="number"
                    id="cyanCount"
                    value={cyanCount ?? ""}
                    onChange={(e) =>
                      setCyanCount(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks ?? ""}
                  onChange={(e) => setRemarks(e.target.value.toUpperCase())}
                  className="w-full"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <DeleteRecordDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      <EditRecordDialog
        record={recordToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={fetchData}
      />
    </>
  );
}
