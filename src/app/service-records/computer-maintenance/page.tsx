"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Select from "react-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

import {
  getComputerMaintenances,
  createComputerMaintenance,
  deleteComputerMaintenance,
} from "@/lib/computerMaintenanceService";
import { getAssetAssignments } from "@/lib/assetAssignmentService";
import {
  AssetAssignmentWithDetails,
  ComputerMaintenanceWithDetails,
} from "@/lib/types";
import { ExportActions } from "@/components/ExportActions";
import { getColumns } from "./columns";
import { DeleteRecordDialog } from "./delete-record-dialog";
import { EditRecordDialog } from "./edit-record-dialog";

const connectionOptions = [
  { value: "WIFI", label: "WIFI" },
  { value: "ETHERNET", label: "ETHERNET" },
];

const exportColumns = [
  { header: "Period", accessorKey: "periode" },
  { header: "No Asset", accessorKey: "assetAssignment.nomorAsset" },
  { header: "Employee", accessorKey: "assetAssignment.user.namaLengkap" },
  { header: "Asset Name", accessorKey: "assetAssignment.asset.namaAsset" },
  { header: "Connection", accessorKey: "connection" },
  { header: "Storage System C", accessorKey: "storageSystemC" },
  { header: "Storage Data D", accessorKey: "storageDataD" },
  { header: "Health", accessorKey: "health" },
  { header: "CPU Fan", accessorKey: "cpuFan" },
  { header: "Temperature", accessorKey: "temperature" },
  { header: "Windows Update", accessorKey: "windowsUpdate" },
  { header: "Remarks", accessorKey: "remarks" },
];

export default function ComputerMaintenancePage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";

  const [records, setRecords] = useState<ComputerMaintenanceWithDetails[]>([]);
  const [assetAssignments, setAssetAssignments] = useState<
    AssetAssignmentWithDetails[]
  >([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssetAssignmentWithDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] =
    useState<ComputerMaintenanceWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] =
    useState<ComputerMaintenanceWithDetails | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [periode, setPeriode] = useState<string>("");
  const [assetAssignmentId, setAssetAssignmentId] = useState<number | null>(
    null
  );
  const [connection, setConnection] = useState<"WIFI" | "ETHERNET" | "">("");
  const [storageSystemC, setStorageSystemC] = useState<string>("");
  const [storageDataD, setStorageDataD] = useState<string>("");
  const [health, setHealth] = useState<string>("");
  const [cpuFan, setCpuFan] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("");
  const [windowsUpdate, setWindowsUpdate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedRecords, assignments] = await Promise.all([
        getComputerMaintenances(),
        getAssetAssignments(),
      ]);

      setRecords(fetchedRecords as ComputerMaintenanceWithDetails[]);
      setAssetAssignments(assignments as AssetAssignmentWithDetails[]);
    } catch (error) {
      console.error("Failed to fetch maintenance data:", error);
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssetSelect = useCallback(
    (selectedValue: number | null) => {
      if (!selectedValue) {
        setAssetAssignmentId(null);
        setSelectedAssignment(null);
        return;
      }

      setAssetAssignmentId(selectedValue);
      const assignment = assetAssignments.find((item) => item.id === selectedValue);
      setSelectedAssignment(assignment || null);
    },
    [assetAssignments]
  );

  const resetForm = useCallback(() => {
    setPeriode("");
    setAssetAssignmentId(null);
    setConnection("");
    setStorageSystemC("");
    setStorageDataD("");
    setHealth("");
    setCpuFan("");
    setTemperature("");
    setWindowsUpdate("");
    setRemarks("");
    setSelectedAssignment(null);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!assetAssignmentId) {
      toast.warning("Please select an asset number.");
      return;
    }
    if (!periode) {
      toast.warning("Please select a maintenance period.");
      return;
    }
    if (!connection) {
      toast.warning("Please select a connection type.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createComputerMaintenance({
        periode: new Date(periode),
        assetAssignmentId,
        connection,
        storageSystemC: storageSystemC || null,
        storageDataD: storageDataD || null,
        health: health || null,
        cpuFan: cpuFan || null,
        temperature: temperature ? parseFloat(temperature) : null,
        windowsUpdate: windowsUpdate ? new Date(windowsUpdate) : null,
        remarks: remarks || null,
      });
      toast.success("Maintenance record created successfully!");
      resetForm();
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create maintenance record:", error);
      toast.error("Failed to save the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = useCallback(
    (record: ComputerMaintenanceWithDetails) => {
      setRecordToEdit(record);
      setIsEditDialogOpen(true);
    },
    []
  );

  const handleDeleteClick = useCallback(
    (record: ComputerMaintenanceWithDetails) => {
      setRecordToDelete(record);
      setIsDeleteDialogOpen(true);
    },
    []
  );

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteComputerMaintenance(recordToDelete.id);
      toast.success("Maintenance record deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to delete maintenance record:", error);
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Computer Maintenance History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Computer Maintenance History</h2>
                <Skeleton className="h-10 w-32" />
              </div>
              <TableSkeleton />
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                {isAdmin && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create Maintenance
                  </Button>
                )}
                <ExportActions
                  columns={exportColumns}
                  data={records}
                  fileName="Computer_Maintenance"
                />
              </div>
              <DataTable columns={columns} data={records} />
            </>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Computer Maintenance</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periode">Period</Label>
                  <Input
                    id="periode"
                    type="date"
                    value={periode}
                    onChange={(event) => setPeriode(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="assetAssignment">No Asset</Label>
                  <Select
                    inputId="assetAssignment"
                    options={assetAssignments.map((assignment) => ({
                      value: assignment.id,
                      label: `${assignment.user?.namaLengkap ?? "Unknown"}`,
                    }))}
                    value={
                      assetAssignmentId
                        ? {
                            value: assetAssignmentId,
                            label: `${
                              selectedAssignment?.user?.namaLengkap ?? "Unknown"
                            }`,
                          }
                        : null
                    }
                    onChange={(option) =>
                      handleAssetSelect(option ? Number(option.value) : null)
                    }
                    classNamePrefix="react-select"
                    placeholder="Select asset"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="connection">Connection</Label>
                  <Select
                    inputId="connection"
                    // @ts-expect-error its okay
                    options={connectionOptions}
                    value={connection ? { value: connection, label: connection } : null}
                    onChange={(option) =>
                      setConnection((option?.value as "WIFI" | "ETHERNET") || "")
                    }
                    classNamePrefix="react-select"
                    placeholder="Select connection"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(event) => setTemperature(event.target.value)}
                    />
                    <span className="text-sm font-medium">°C</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storageSystemC">Storage System C</Label>
                  <Input
                    id="storageSystemC"
                    value={storageSystemC}
                    onChange={(event) => setStorageSystemC(event.target.value)}
                    placeholder="e.g. 120 GB / 80 GB"
                  />
                </div>
                <div>
                  <Label htmlFor="storageDataD">Storage Data D</Label>
                  <Input
                    id="storageDataD"
                    value={storageDataD}
                    onChange={(event) => setStorageDataD(event.target.value)}
                    placeholder="e.g. 500 GB / 400 GB"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health">Health</Label>
                  <Input
                    id="health"
                    value={health}
                    onChange={(event) => setHealth(event.target.value)}
                    placeholder="e.g. Good"
                  />
                </div>
                <div>
                  <Label htmlFor="cpuFan">CPU Fan</Label>
                  <Input
                    id="cpuFan"
                    value={cpuFan}
                    onChange={(event) => setCpuFan(event.target.value)}
                    placeholder="e.g. Normal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="windowsUpdate">Windows Update</Label>
                  <Input
                    id="windowsUpdate"
                    type="date"
                    value={windowsUpdate}
                    onChange={(event) => setWindowsUpdate(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Selected Asset Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAssignment ? (
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">Asset</TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.namaAsset ?? "-"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Serial Number</TableCell>
                          <TableCell>
                            {selectedAssignment.asset?.nomorSeri ?? "-"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Employee</TableCell>
                          <TableCell>
                            {selectedAssignment.user?.namaLengkap ?? "-"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Department</TableCell>
                          <TableCell>
                            {selectedAssignment.user?.departemen ?? "-"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Company</TableCell>
                          <TableCell>
                            {selectedAssignment.user?.lokasiKantor ?? "-"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select an asset to preview its details.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isAdmin && (
        <EditRecordDialog
          record={recordToEdit}
          assetAssignments={assetAssignments}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setRecordToEdit(null);
            }
          }}
          onSave={fetchData}
        />
      )}

      {isAdmin && (
        <DeleteRecordDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setRecordToDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
