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
import Select from "react-select";
import { Textarea } from "@/components/ui/textarea";
import { createAssignment } from "@/lib/assignmentService";
import { getUsers } from "@/lib/userService";
import { getAssets } from "@/lib/assetService";
import { User, Asset } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AssignAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentTab: string;
  laptopCategoryId: number | null;
  intelNucCategoryId: number | null;
  printerCategoryId: number | null;
}

export function AssignAssetDialog({
  isOpen,
  onClose,
  onSave,
  currentTab,
  laptopCategoryId,
  intelNucCategoryId,
  printerCategoryId,
}: AssignAssetDialogProps) {
  const queryClient = useQueryClient();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nomorAsset, setNomorAsset] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setUsers(await getUsers());

      let fetchedAssets: Asset[] = [];
      if (currentTab === "all-assets") {
        const allCategoryIds : number[] = [];
        if (laptopCategoryId) allCategoryIds.push(laptopCategoryId);
        if (intelNucCategoryId) allCategoryIds.push(intelNucCategoryId);
        
        // Fetch all assets and then filter by categoryId for laptop/intel-nuc
        const allFetchedAssets = await getAssets();
        fetchedAssets = allFetchedAssets.filter(asset => allCategoryIds.includes(asset.categoryId));

      } else if (currentTab === "printer-assets") {
        if (printerCategoryId) {
          fetchedAssets = await getAssets(printerCategoryId);
        }
      }
      setAssets(fetchedAssets);
    };
    fetchData();
  }, [currentTab, laptopCategoryId, intelNucCategoryId, printerCategoryId]);

  const handleSubmit = async () => {
    try {
      await createAssignment({
        assetId: parseInt(assetId!),
        userId: parseInt(userId!),
        nomorAsset,
        catatan,
      });
      onSave();
      onClose();
      // Clear form
      setAssetId(null);
      setUserId(null);
      setNomorAsset("");
      setCatatan("");
      queryClient.invalidateQueries({ queryKey: ["allAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["printerAssignments"] });
      toast.success("Assignment created successfully!");
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Failed to create assignment.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign an asset to a user. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nomorAsset" className="text-right">Asset Number</Label>
            <Input id="nomorAsset" value={nomorAsset} onChange={(e) => setNomorAsset(e.target.value.toUpperCase())} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset" className="text-right">Serial Number</Label>
            <Select
              options={assets.map((asset) => ({
                value: asset.id.toString(),
                label: `${asset.nomorSeri} - ${asset.namaAsset}`,
              }))}
              value={
                assetId
                  ? {
                      value: assetId,
                      label: `${assets.find((a) => a.id.toString() === assetId)?.nomorSeri} - ${assets.find((a) => a.id.toString() === assetId)?.namaAsset}`,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setAssetId(selectedOption ? selectedOption.value : null)
              }
              placeholder="Select Asset"
              isClearable
              isSearchable
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">User</Label>
            <Select
              options={users.map((user) => ({
                value: user.id.toString(),
                label: `${user.namaLengkap} (${user.email})`,
              }))}
              value={
                userId
                  ? {
                      value: userId,
                      label: `${users.find((u) => u.id.toString() === userId)?.namaLengkap} (${users.find((u) => u.id.toString() === userId)?.email})`,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setUserId(selectedOption ? selectedOption.value : null)
              }
              placeholder="Select User"
              isClearable
              isSearchable
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="catatan" className="text-right">Notes</Label>
            <Textarea id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
