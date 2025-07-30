"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAssignment } from "@/lib/assignmentService";
import { AssetAssignment } from "@prisma/client";
import { STATUSES } from "@/lib/constants";

interface ReturnAssignmentDialogProps {
  assignment: AssetAssignment;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ReturnAssignmentDialog({
  assignment,
  onSave,
  onOpenChange,
  open,
}: ReturnAssignmentDialogProps) {
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [kondisiSaatPengembalian, setKondisiSaatPengembalian] = useState("");

  useEffect(() => {
    if (assignment.tanggalPengembalian) {
      setTanggalPengembalian(assignment.tanggalPengembalian.toISOString().slice(0, 16));
    }
    if (assignment.kondisiSaatPengembalian) {
      setKondisiSaatPengembalian(assignment.kondisiSaatPengembalian);
    }
  }, [assignment]);

  const handleSubmit = async () => {
    try {
      await updateAssignment(assignment.id, {
        tanggalPengembalian: tanggalPengembalian ? new Date(tanggalPengembalian) : null,
        kondisiSaatPengembalian,
      });

      console.log("Assignment returned successfully");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            Mark this asset as returned. Fill in the return details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tanggalPengembalian" className="text-right">Return Date</Label>
            <Input
              id="tanggalPengembalian"
              type="datetime-local"
              value={tanggalPengembalian}
              onChange={(e) => setTanggalPengembalian(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kondisiSaatPengembalian" className="text-right">Condition on Return</Label>
            <Select onValueChange={setKondisiSaatPengembalian} value={kondisiSaatPengembalian}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status.type} value={status.description}>
                    {status.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
