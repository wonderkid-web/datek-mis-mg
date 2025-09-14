"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getUsers } from "@/lib/userService";
import { getAssignments } from "@/lib/assignmentService";
import { createIpAddress } from "@/lib/ipAddressService";
import type { User } from "@prisma/client";
import type { AssetAssignment } from "@prisma/client";
import { toast } from "sonner";

interface CreateIpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Connection = "WIFI" | "ETHERNET";
type Status = "EMPLOYEE" | "GUEST_LAPTOP" | "GUEST_PHONE";
type Role = "LIST" | "FULL_ACCESS";

const connectionOptions = [
  { value: "WIFI", label: "WIFI" },
  { value: "ETHERNET", label: "ETHERNET" },
];
const statusOptions = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "GUEST_LAPTOP", label: "Guest Laptop" },
  { value: "GUEST_PHONE", label: "Guest Phone" },
];
const roleOptions = [
  { value: "LIST", label: "List" },
  { value: "FULL_ACCESS", label: "Full Access" },
];

const isValidIPv4 = (ip: string) => {
  const regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return regex.test(ip);
};

const formatIPv4Input = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const parts: string[] = [];
  let idx = 0;
  for (let octetIdx = 0; octetIdx < 4 && idx < digits.length; octetIdx++) {
    const remainingOctets = 4 - octetIdx;
    const remainingDigits = digits.length - idx;

    let take = 1;
    if (remainingOctets === 1) {
      take = Math.min(3, remainingDigits);
    } else if (remainingOctets === 2) {
      // Prefer stable human-readable splits for last two octets
      // RD>=6 -> 3+3, RD in [3..5] -> 2+(RD-2), RD<=2 -> 1+(RD-1)
      if (remainingDigits >= 6) take = 3;
      else if (remainingDigits >= 3) take = 2;
      else take = 1;
    } else {
      // 3 or 4 octets left: take as much as possible but leave at least 1 for each remaining
      take = Math.min(3, Math.max(1, remainingDigits - (remainingOctets - 1)));
    }

    parts.push(digits.slice(idx, idx + take));
    idx += take;
  }
  return parts.join(".");
};

export function CreateIpDialog({ isOpen, onClose, onSaved }: CreateIpDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [ip, setIp] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [assetAssignmentId, setAssetAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getUsers();
      setUsers(u);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!userId) {
        setAssignments([]);
        return;
      }
      const all = await getAssignments();
      setAssignments(all.filter((a) => a.userId.toString() === userId));
    })();
  }, [userId]);

  const userOptions = useMemo(
    () => users.map((u) => ({ value: String(u.id), label: u.namaLengkap })),
    [users]
  );

  const assignmentOptions = useMemo(() => {
    return assignments.map((a) => ({
      value: String(a.id),
      // @ts-expect-error this is exist btw!
      label: `${a.nomorAsset || "-"} • ${a.asset?.namaAsset || "Asset"} • ${a.asset?.nomorSeri || "SN"}`,
    }));
  }, [assignments]);

  const reset = () => {
    setUserId(null);
    setIp("");
    setConnection(null);
    setStatus(null);
    setRole(null);
    setAssetAssignmentId(null);
  };

  const handleSave = async () => {
    if (!userId) return toast.error("User is required");
    if (!ip || !isValidIPv4(ip)) return toast.error("Invalid IPv4 address");
    if (!connection) return toast.error("Connection is required");
    if (!status) return toast.error("Status is required");
    if (!role) return toast.error("Role is required");
    try {
      await createIpAddress({
        userId: parseInt(userId),
        ip,
        connection,
        status,
        role,
        assetAssignmentId: status === "EMPLOYEE" ? (assetAssignmentId ? parseInt(assetAssignmentId) : null) : null,
      });
      toast.success("IP Address created");
      reset();
      onSaved();
      onClose();
    } catch (e: any) {
      const msg = e?.message || "Failed to create IP Address";
      toast.error(msg.includes("Unique constraint") ? "IP already exists" : msg);
    }
  };

  const showAsset = status === "EMPLOYEE";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create IP Address</DialogTitle>
          <DialogDescription>Tambah data IP Address baru</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">User</Label>
            <Select
              className="col-span-3"
              options={userOptions}
              value={userOptions.find((o) => o.value === userId) || null}
              onChange={(opt) => setUserId(opt ? String(opt.value) : null)}
              placeholder="Select user"
              isClearable
              isSearchable
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">IP Address</Label>
            <Input
              className="col-span-3 font-mono"
              placeholder="e.g. 192.168.0.10"
              inputMode="numeric"
              value={ip}
              onChange={(e) => setIp(formatIPv4Input(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Connection</Label>
            <Select
              className="col-span-3"
              options={connectionOptions}
              value={connection ? connectionOptions.find((o) => o.value === connection) || null : null}
              onChange={(opt) => setConnection((opt?.value as Connection) || null)}
              placeholder="Select connection"
              isClearable
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <Select
              className="col-span-3"
              options={statusOptions}
              value={status ? statusOptions.find((o) => o.value === status) || null : null}
              onChange={(opt) => setStatus((opt?.value as Status) || null)}
              placeholder="Select status"
              isClearable
            />
          </div>
          {showAsset && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Asset</Label>
              <Select
                className="col-span-3"
                options={assignmentOptions}
                value={assignmentOptions.find((o) => o.value === assetAssignmentId) || null}
                onChange={(opt) => setAssetAssignmentId(opt ? String(opt.value) : null)}
                placeholder="Select user's asset"
                isClearable
                isSearchable
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <Select
              className="col-span-3"
              options={roleOptions}
              value={role ? roleOptions.find((o) => o.value === role) || null : null}
              onChange={(opt) => setRole((opt?.value as Role) || null)}
              placeholder="Select role"
              isClearable
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
