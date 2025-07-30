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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssignment } from "@/lib/assignmentService";
import { getUsers } from "@/lib/userService";
import { getAssets } from "@/lib/assetService"; // Assuming you have a getAssets function
import { User, Asset } from "@prisma/client";

interface AddAssignmentDialogProps {
  onSave: () => void;
}

export function AddAssignmentDialog({ onSave }: AddAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nomorAsset, setNomorAsset] = useState(""); // New state for nomorAsset
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState("");
  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [kondisiSaatPeminjaman, setKondisiSaatPeminjaman] = useState("");
  const [kondisiSaatPengembalian, setKondisiSaatPengembalian] = useState("");
  const [catatan, setCatatan] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setUsers(await getUsers());
      setAssets(await getAssets()); // Fetch assets
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      await createAssignment({
        assetId: parseInt(assetId!),
        userId: parseInt(userId!),
        nomorAsset, // Pass nomorAsset here
        tanggalPeminjaman: new Date(tanggalPeminjaman),
        tanggalPengembalian: tanggalPengembalian ? new Date(tanggalPengembalian) : null,
        kondisiSaatPeminjaman,
        kondisiSaatPengembalian,
        catatan,
      });

      console.log("Assignment added successfully");
      onSave();
      setOpen(false);
      // Clear form
      setAssetId(null);
      setUserId(null);
      setNomorAsset(""); // Clear nomorAsset
      setTanggalPeminjaman("");
      setTanggalPengembalian("");
      setKondisiSaatPeminjaman("");
      setKondisiSaatPengembalian("");
      setCatatan("");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Assignment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Assignment</DialogTitle>
          <DialogDescription>
            Assign an asset to a user. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset" className="text-right">Asset</Label>
            <Select onValueChange={setAssetId} value={assetId || ""}>
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
            <Label htmlFor="nomorAsset" className="text-right">Asset Number</Label>
            <Input id="nomorAsset" value={nomorAsset} onChange={(e) => setNomorAsset(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">User</Label>
            <Select onValueChange={setUserId} value={userId || ""}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.namaLengkap} ({user.nik})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
