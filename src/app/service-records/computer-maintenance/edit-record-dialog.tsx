"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { updateComputerMaintenance } from "@/lib/computerMaintenanceService";
import {
  AssetAssignmentWithDetails,
  ComputerMaintenanceWithDetails,
} from "@/lib/types";

interface EditRecordDialogProps {
  record: ComputerMaintenanceWithDetails | null;
  assetAssignments: AssetAssignmentWithDetails[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const connectionOptions = [
  { value: "WIFI", label: "WIFI" },
  { value: "ETHERNET", label: "ETHERNET" },
];

const toInputDate = (value?: Date | string | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export function EditRecordDialog({
  record,
  assetAssignments,
  open,
  onOpenChange,
  onSave,
}: EditRecordDialogProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!record) {
      resetForm();
      return;
    }

    setPeriode(toInputDate(record.periode));
    setAssetAssignmentId(record.assetAssignmentId);
    setConnection(record.connection);
    setStorageSystemC(record.storageSystemC ?? "");
    setStorageDataD(record.storageDataD ?? "");
    setHealth(record.health ?? "");
    setCpuFan(record.cpuFan ?? "");
    setTemperature(
      record.temperature !== null && record.temperature !== undefined
        ? String(record.temperature)
        : ""
    );
    setWindowsUpdate(toInputDate(record.windowsUpdate));
    setRemarks(record.remarks ?? "");
  }, [record]);

  const resetForm = () => {
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
  };

  const selectedAssignment = useMemo(
    () =>
      assetAssignmentId
        ? assetAssignments.find((assignment) => assignment.id === assetAssignmentId) ||
          null
        : null,
    [assetAssignmentId, assetAssignments]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!record) return;
    if (!assetAssignmentId) {
      toast.warning("Please select an asset number.");
      return;
    }
    if (!periode) {
      toast.warning("Please select a period date.");
      return;
    }
    if (!connection) {
      toast.warning("Please choose a connection type.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateComputerMaintenance(record.id, {
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
      toast.success("Maintenance record updated successfully!");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update maintenance record:", error);
      toast.error("Failed to update the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Computer Maintenance Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periode-edit">Period</Label>
              <Input
                id="periode-edit"
                type="date"
                value={periode}
                onChange={(event) => setPeriode(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="assetAssignment-edit">No Asset</Label>
              <Select
                inputId="assetAssignment-edit"
                options={assetAssignments.map((assignment) => ({
                  value: assignment.id,
                  label: `${assignment.nomorAsset} - ${assignment.user?.namaLengkap ?? "Unknown"}`,
                }))}
                value={
                  assetAssignmentId
                    ? {
                        value: assetAssignmentId,
                        label: `${selectedAssignment?.nomorAsset ?? ""} - ${
                          selectedAssignment?.user?.namaLengkap ?? "Unknown"
                        }`,
                      }
                    : null
                }
                onChange={(selected) =>
                  setAssetAssignmentId(selected ? Number(selected.value) : null)
                }
                classNamePrefix="react-select"
                placeholder="Select asset"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="connection-edit">Connection</Label>
              <Select
                inputId="connection-edit"
                // @ts-expect-error its okay
                options={connectionOptions}
                value={connection ? { value: connection, label: connection } : null}
                onChange={(selected) =>
                  setConnection((selected?.value as "WIFI" | "ETHERNET") || "")
                }
                classNamePrefix="react-select"
                placeholder="Select connection"
              />
            </div>
            <div>
              <Label htmlFor="temperature-edit">Temperature</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="temperature-edit"
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
              <Label htmlFor="storageSystemC-edit">Storage System C</Label>
              <Input
                id="storageSystemC-edit"
                value={storageSystemC}
                onChange={(event) => setStorageSystemC(event.target.value)}
                placeholder="e.g. 120 GB / 80 GB"
              />
            </div>
            <div>
              <Label htmlFor="storageDataD-edit">Storage Data D</Label>
              <Input
                id="storageDataD-edit"
                value={storageDataD}
                onChange={(event) => setStorageDataD(event.target.value)}
                placeholder="e.g. 500 GB / 400 GB"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="health-edit">Health</Label>
              <Input
                id="health-edit"
                value={health}
                onChange={(event) => setHealth(event.target.value)}
                placeholder="e.g. Good"
              />
            </div>
            <div>
              <Label htmlFor="cpuFan-edit">CPU Fan</Label>
              <Input
                id="cpuFan-edit"
                value={cpuFan}
                onChange={(event) => setCpuFan(event.target.value)}
                placeholder="e.g. Normal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="windowsUpdate-edit">Windows Update</Label>
              <Input
                id="windowsUpdate-edit"
                type="date"
                value={windowsUpdate}
                onChange={(event) => setWindowsUpdate(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="remarks-edit">Remarks</Label>
              <Textarea
                id="remarks-edit"
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
                      <TableCell>{selectedAssignment.asset?.namaAsset ?? "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Serial Number</TableCell>
                      <TableCell>{selectedAssignment.asset?.nomorSeri ?? "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Employee</TableCell>
                      <TableCell>{selectedAssignment.user?.namaLengkap ?? "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Department</TableCell>
                      <TableCell>{selectedAssignment.user?.departemen ?? "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Company</TableCell>
                      <TableCell>{selectedAssignment.user?.lokasiKantor ?? "-"}</TableCell>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
