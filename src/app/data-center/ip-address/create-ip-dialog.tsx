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
import { formatMacAddress, isValidMacAddress } from "@/lib/utils";

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
  // Enforce pattern: AAA.BB/BBB.CC.D/D D D
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;
  if (len <= 3) return digits;

  const A = digits.slice(0, 3);
  let rest = digits.slice(3);

  // Decide B length: 2 or 3 depending on remaining to allow CC (2) and D (1-3)
  let bLen: number;
  if (rest.length <= 2) bLen = rest.length; // partial B
  else if (rest.length >= 6) bLen = 3; // enough left for CC + D(3)
  else bLen = 2; // keep room for CC (2) and some for D

  const B = rest.slice(0, bLen);
  rest = rest.slice(bLen);
  if (rest.length === 0) return `${A}.${B}`;

  // C must be up to 2 (exactly 2 when enough digits)
  const cLen = Math.min(2, rest.length);
  const C = rest.slice(0, cLen);
  rest = rest.slice(cLen);
  if (rest.length === 0) return `${A}.${B}.${C}`;

  // D up to 3
  const D = rest.slice(0, 3);
  return `${A}.${B}.${C}.${D}`;
};

export function CreateIpDialog({ isOpen, onClose, onSaved }: CreateIpDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [ip, setIp] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [assetAssignmentId, setAssetAssignmentId] = useState<string | null>(null);
  const [macWlan, setMacWlan] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      try {
        const u = await getUsers();
        setUsers(u);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!userId) {
        setAssignments([]);
        setLoadingAssignments(false);
        return;
      }
      setLoadingAssignments(true);
      try {
        const all = await getAssignments();
        setAssignments(all.filter((a) => a.userId.toString() === userId));
      } finally {
        setLoadingAssignments(false);
      }
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
    setMacWlan("");
  };

  const handleSave = async () => {
    if (!userId) return toast.error("User is required");
    if (!ip || !isValidIPv4(ip)) return toast.error("Invalid IPv4 address");
    if (!connection) return toast.error("Connection is required");
    if (!status) return toast.error("Status is required");
    if (!role) return toast.error("Role is required");
    let formattedMac: string | null = null;
    if (status !== "EMPLOYEE") {
      if (!macWlan) return toast.error("MAC WLAN is required for non-employee status");
      formattedMac = formatMacAddress(macWlan);
      if (!isValidMacAddress(formattedMac)) {
        return toast.error("MAC WLAN must follow the format XX:XX:XX:XX:XX:XX");
      }
    }
    try {
      await createIpAddress({
        userId: parseInt(userId),
        ip,
        connection,
        status,
        role,
        assetAssignmentId: status === "EMPLOYEE" ? (assetAssignmentId ? parseInt(assetAssignmentId) : null) : null,
        macWlan: formattedMac,
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
  const showMacInput = status !== null && status !== "EMPLOYEE";

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
              isLoading={loadingUsers}
              loadingMessage={() => "Loading users..."}
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
              onChange={(opt) => {
                const nextStatus = (opt?.value as Status) || null;
                setStatus(nextStatus);
                if (nextStatus !== "EMPLOYEE") {
                  setAssetAssignmentId(null);
                }
                setMacWlan("");
              }}
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
                isLoading={loadingAssignments}
                loadingMessage={() => "Loading assets..."}
                isClearable
                isSearchable
                isDisabled={!userId}
                noOptionsMessage={() => (loadingAssignments ? " " : "No assets found")}
              />
            </div>
          )}
          {showMacInput && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">MAC WLAN</Label>
              <Input
                className="col-span-3 font-mono"
                placeholder="XX:XX:XX:XX:XX:XX"
                value={macWlan}
                onChange={(e) => setMacWlan(formatMacAddress(e.target.value))}
                maxLength={17}
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
