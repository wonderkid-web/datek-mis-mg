"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "react-select";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

import {
  getPrinterRepetitiveMaintenances,
  createPrinterRepetitiveMaintenance,
  updatePrinterRepetitiveMaintenance,
  deletePrinterRepetitiveMaintenance,
} from "@/lib/printerRepetitiveMaintenanceService";
import { getAssetAssignments } from "@/lib/assetAssignmentService";
import { getColumns } from "./columns";
import { DeleteRecordDialog } from "./delete-record-dialog";
import { EditRecordDialog } from "./edit-record-dialog";
import { AssetAssignment, PrinterRepetitiveMaintenance } from "@/lib/types";

export default function RepetitiveServicePage() {
  const [records, setRecords] = useState<PrinterRepetitiveMaintenance[]>([]);
  const [assetAssignments, setAssetAssignments] = useState<AssetAssignment[]>(
    []
  );
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
      const [fetchedRecords, assignments] = await Promise.all([
        getPrinterRepetitiveMaintenances(),
        getAssetAssignments(),
      ]);
      setRecords(fetchedRecords);
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

  const handleAssetSelect = (assignmentIdStr: string) => {
    const id = parseInt(assignmentIdStr, 10);
    const assignment = assetAssignments.find((a) => a.id === id) || null;
    setSelectedAssignment(assignment);
    setAssetAssignmentId(id);
    if (assignment) {
      setAssetDetails(
        `Asset: ${assignment.asset?.namaAsset || "N/A"} - User: ${assignment.user?.namaLengkap || "N/A"}`
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
      toast.warning("Please select an Asset Number and Report Date.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPrinterRepetitiveMaintenance({
        reportDate: new Date(reportDate),
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
    } catch (error) {
      console.error("Failed to create record:", error);
      toast.error("Failed to save the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (record: PrinterRepetitiveMaintenance) => {
    setRecordToEdit(record);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (record: PrinterRepetitiveMaintenance) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

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
    [assetAssignments] // Dependency array, re-create columns if assetAssignments change
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Repetitive Maintenance Record</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Label htmlFor="assetAssignmentId">
                    Asset Number (Printer)
                  </Label>
                  <Select
                    options={assetAssignments
                      .filter((asset) => asset.asset?.categoryId === 3)
                      .map((a) => ({
                        value: a.id.toString(),
                        label: `${a.nomorAsset}`,
                      }))}
                    onChange={(selectedOption) =>
                      handleAssetSelect(selectedOption?.value || "")
                    }
                    value={
                      assetAssignmentId
                        ? {
                            value: assetAssignmentId.toString(),
                            label: `${selectedAssignment?.nomorAsset} - ${selectedAssignment?.asset?.namaAsset} (${selectedAssignment?.user?.namaLengkap})`,
                          }
                        : null
                    }
                    placeholder="Select a Printer Asset Number"
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
                          <TableCell className="font-semibold">
                            Asset Name:
                          </TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.namaAsset || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Serial Number:
                          </TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.nomorSeri || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Assigned User:
                          </TableCell>
                          <TableCell>
                            {selectedAssignment.user?.namaLengkap || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Department:
                          </TableCell>
                          <TableCell>
                            {selectedAssignment.user?.departemen || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            Company:
                          </TableCell>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repetitive Maintenance History</CardTitle>
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
            <DataTable columns={columns} data={records} />
          )}
        </CardContent>
      </Card>

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
