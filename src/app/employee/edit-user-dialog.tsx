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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@prisma/client";
import { updateUser } from "@/lib/userService";
import { COMPANIES, DEPARTMENTS } from "@/lib/constants";

interface EditUserDialogProps {
  user: User;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditUserDialog({ user, onSave, onOpenChange, open }: EditUserDialogProps) {
  const [nik, setNik] = useState(user.nik);
  const [namaLengkap, setNamaLengkap] = useState(user.namaLengkap);
  const [email, setEmail] = useState(user.email);
  const [departemen, setDepartemen] = useState(user.departemen || "");
  const [jabatan, setJabatan] = useState(user.jabatan || "");
  const [lokasiKantor, setLokasiKantor] = useState(user.lokasiKantor || "");
  const [isActive, setIsActive] = useState(user.isActive);

  useEffect(() => {
    setNik(user.nik);
    setNamaLengkap(user.namaLengkap);
    setEmail(user.email);
    setDepartemen(user.departemen || "");
    setJabatan(user.jabatan || "");
    setLokasiKantor(user.lokasiKantor || "");
    setIsActive(user.isActive);
  }, [user]);

  const handleSubmit = async () => {
    try {
      await updateUser(user.id, {
        nik,
        namaLengkap,
        email,
        departemen,
        jabatan,
        lokasiKantor,
        isActive,
      });

      console.log("User updated successfully");
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
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Edit the user details. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nik" className="text-right">NIK</Label>
            <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="namaLengkap" className="text-right">Full Name</Label>
            <Input id="namaLengkap" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departemen" className="text-right">Department</Label>
            <Select onValueChange={setDepartemen} value={departemen}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jabatan" className="text-right">Position</Label>
            <Input id="jabatan" value={jabatan} onChange={(e) => setJabatan(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lokasiKantor" className="text-right">Office Location</Label>
            <Select onValueChange={setLokasiKantor} value={lokasiKantor}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Office Location" />
              </SelectTrigger>
              <SelectContent>
                {COMPANIES.map((company) => (
                  <SelectItem key={company.type} value={company.description}>
                    {company.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">Active</Label>
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}