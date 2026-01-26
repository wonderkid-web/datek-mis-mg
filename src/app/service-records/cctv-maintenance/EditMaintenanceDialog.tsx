"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateCctvRepetitiveMaintenance } from "@/lib/cctvRepetitiveMaintenanceService";
import { MaintenanceWithDetails } from "./columns";
import { CCTVStatus } from "@prisma/client";

interface EditMaintenanceDialogProps {
  maintenance: MaintenanceWithDetails | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditMaintenanceDialog({
  maintenance,
  isOpen,
  onOpenChange,
}: EditMaintenanceDialogProps) {
  const [periode, setPeriode] = useState("");
  const [status, setStatus] = useState<string>("");
  const [remarks, setRemarks] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (maintenance) {
      setPeriode(new Date(maintenance.periode).toISOString().split("T")[0]);
      setStatus(maintenance.status);
      setRemarks(maintenance.remarks || "");
    }
  }, [maintenance]);

  const mutation = useMutation({
    mutationFn: (
      data: Parameters<typeof updateCctvRepetitiveMaintenance>[1] & { id: number }
    ) => {
      const { id, ...updateData } = data;
      return updateCctvRepetitiveMaintenance(id, updateData);
    },
    onSuccess: () => {
      toast.success("Maintenance record updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["cctvRepetitiveMaintenances"] });
      queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] }); // Invalidate asset list
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!maintenance) return;

    if (status !== "GOOD" && !remarks) {
      toast.error("Remarks are required if status is not GOOD.");
      return;
    }

    mutation.mutate({
      id: maintenance.id,
      periode: new Date(periode),
      status: status as CCTVStatus,
      remarks,
      assetId: maintenance.channelCamera?.cctvSpecs?.[0]?.asset.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Maintenance Record</DialogTitle>
          <DialogDescription>
            Update the details for the maintenance record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="periode">Tanggal Pengecekan</Label>
            <Input
              id="periode"
              type="date"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger>
                <SelectValue placeholder="Select New Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">GOOD</SelectItem>
                <SelectItem value="TROUBLE">TROUBLE</SelectItem>
                <SelectItem value="BROKEN">BROKEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status && status !== "GOOD" && (
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Required)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any remarks here..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
