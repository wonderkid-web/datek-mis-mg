"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser } from "@/lib/userService";
import { COMPANIES, DEPARTMENTS } from "@/lib/constants";

interface AddUserDialogProps {
  onSave: () => void;
}

export function AddUserDialog({ onSave }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  // const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [lokasiKantor, setLokasiKantor] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async () => {
    try {
      await createUser({
        // nik,
        namaLengkap,
        email,
        departemen,
        jabatan,
        lokasiKantor,
        isActive,
      });

      console.log("User added successfully");
      onSave();
      setOpen(false);
      // Clear form
      setNamaLengkap("");
      setEmail("");
      setDepartemen("");
      setJabatan("");
      setLokasiKantor("");
      setIsActive(true);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to the list. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nik" className="text-right">NIK</Label>
            <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} className="col-span-3" required />
          </div> */}
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
             <SelectTrigger className="col-span-3 w-full">
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
             <Label htmlFor="jabatan" className="text-right">
              Position
            </Label>
            <Select onValueChange={setJabatan} value={jabatan}>
           <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select Office Location" />
              </SelectTrigger>
              <SelectContent>
                {["HOLDING", "SBU"].map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Input id="jabatan" value={jabatan} onChange={(e) => setJabatan(e.target.value)} className="col-span-3" /> */}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lokasiKantor" className="text-right">Corporate</Label>
            <Select  onValueChange={setLokasiKantor} value={lokasiKantor}>
              <SelectTrigger className="col-span-3 w-full">
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
          <Button type="submit" onClick={handleSubmit}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}