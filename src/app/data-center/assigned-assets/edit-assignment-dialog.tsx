"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AssetAssignment, Asset, User } from "@prisma/client";
import { updateAssignment } from "@/lib/assignmentService";
import { getUsers } from "@/lib/userService";
import { getAssets } from "@/lib/assetService";

interface EditAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  assignment: AssetAssignment;
}

export function EditAssignmentDialog({ isOpen, onClose, onSave, assignment }: EditAssignmentDialogProps) {
  const [formData, setFormData] = useState<Partial<AssetAssignment>>(assignment);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setFormData(assignment);
  }, [assignment]);

  useEffect(() => {
    const fetchData = async () => {
      setUsers(await getUsers());
      setAssets(await getAssets());
    };
    fetchData();
  }, []);

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await updateAssignment(assignment.id, {
        assetId: formData.assetId,
        userId: formData.userId,
        catatan: formData.catatan,
      });
      onSave();
    } catch (error) {
      console.error("Failed to update assignment:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assetId" className="text-right">Asset</Label>
            <Select onValueChange={(value) => handleSelectChange("assetId", value)} value={formData.assetId?.toString() || ""}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.namaAsset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userId" className="text-right">User</Label>
            <Select onValueChange={(value) => handleSelectChange("userId", value)} value={formData.userId?.toString() || ""}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.namaLengkap} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="catatan" className="text-right">Notes</Label>
            <Textarea id="catatan" name="catatan" value={formData.catatan || ""} onChange={handleTextareaChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
