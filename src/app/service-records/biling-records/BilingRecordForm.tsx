"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import ReactSelect from "react-select";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUsers } from "@/lib/userService";
import { getPhoneAccounts } from "@/lib/phoneAccountService";
import { createBilingRecord, updateBilingRecord } from "@/lib/bilingRecordService";
import { BilingRecordWithUser } from "@/lib/types";

interface BilingRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValue?: BilingRecordWithUser | null;
}

type UserOption = {
  id: number;
  namaLengkap: string;
};

type PhoneAccountWithDetails = Awaited<ReturnType<typeof getPhoneAccounts>>[number];

const DURATION_PATTERN = /^\d{1,2}:[0-5]\d:[0-5]\d$/;
const MAX_DURATION_DIGITS = 6;

const clampDurationUnit = (value: string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "00";
  return String(Math.min(Math.max(0, Math.trunc(numeric)), 59)).padStart(2, "0");
};

const formatDurationInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, MAX_DURATION_DIGITS);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${clampDurationUnit(digits.slice(0, -2))}:${clampDurationUnit(
      digits.slice(-2)
    )}`;
  }

  const hours = digits.slice(0, -4);
  const minutes = clampDurationUnit(digits.slice(-4, -2));
  const seconds = clampDurationUnit(digits.slice(-2));
  return `${hours}:${minutes}:${seconds}`;
};

const normalizeDuration = (value: string | undefined) => {
  if (!value) return "";
  return formatDurationInput(value);
};

const normalizeCostDigits = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return String(Math.max(0, Math.trunc(numeric)));
  }
  return String(value).replace(/\D/g, "");
};

const formatRupiahInput = (digits: string) => {
  if (!digits) return "";
  const numeric = Number(digits);
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

export function BilingRecordForm({
  open,
  onOpenChange,
  defaultValue,
}: BilingRecordFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(defaultValue);

  const { data: users } = useQuery<UserOption[]>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });
  const { data: phoneAccounts } = useQuery<PhoneAccountWithDetails[]>({
    queryKey: ["phone-accounts"],
    queryFn: () => getPhoneAccounts(),
  });

  const [callDate, setCallDate] = useState<Date | null>(
    defaultValue?.callDate ? new Date(defaultValue.callDate) : null
  );
  const [userId, setUserId] = useState<number | null>(defaultValue?.userId ?? null);
  const [extension, setExtension] = useState(defaultValue?.extension?.toString() ?? "");
  const [dial, setDial] = useState(defaultValue?.dial ?? "");
  const [duration, setDuration] = useState(normalizeDuration(defaultValue?.duration));
  const [trunk, setTrunk] = useState(defaultValue?.trunk?.toString() ?? "");
  const [pstn, setPstn] = useState(defaultValue?.pstn?.toString() ?? "");
  const [cost, setCost] = useState(normalizeCostDigits(defaultValue?.cost));

  useEffect(() => {
    if (open) {
      setCallDate(defaultValue?.callDate ? new Date(defaultValue.callDate) : null);
      setUserId(defaultValue?.userId ?? null);
      setExtension(defaultValue?.extension?.toString() ?? "");
      setDial(defaultValue?.dial ?? "");
      setDuration(normalizeDuration(defaultValue?.duration));
      setTrunk(defaultValue?.trunk?.toString() ?? "");
      setPstn(defaultValue?.pstn?.toString() ?? "");
      setCost(normalizeCostDigits(defaultValue?.cost));
      return;
    }

    setCallDate(null);
    setUserId(null);
    setExtension("");
    setDial("");
    setDuration("");
    setTrunk("");
    setPstn("");
    setCost("");
  }, [open, defaultValue]);

  const matchedPhoneAccount = useMemo(() => {
    if (!userId) return null;
    return (
      phoneAccounts?.find((account) => account.userId === userId) ?? null
    );
  }, [phoneAccounts, userId]);

  useEffect(() => {
    if (!open) return;
    if (!userId) {
      setExtension("");
      return;
    }
    if (matchedPhoneAccount) {
      setExtension(String(matchedPhoneAccount.extension));
      return;
    }
    if (!isEditing || userId !== defaultValue?.userId) {
      setExtension("");
    }
  }, [open, userId, matchedPhoneAccount, isEditing, defaultValue?.userId]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing && defaultValue) {
        return updateBilingRecord(defaultValue.id, payload);
      }
      return createBilingRecord(payload);
    },
    onSuccess: () => {
      toast.success(`Biling record ${isEditing ? "updated" : "created"} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["biling-records"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save biling record.");
    },
  });

  const canSubmit = useMemo(
    () =>
      Boolean(
        callDate &&
          userId &&
          extension &&
          dial &&
          duration &&
          trunk &&
          pstn &&
          cost
      ),
    [callDate, userId, extension, dial, duration, trunk, pstn, cost]
  );

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.warning("Please fill all fields.");
      return;
    }

    if (!DURATION_PATTERN.test(duration.trim())) {
      toast.warning("Duration format must be HH:MM:SS.");
      return;
    }

    const extensionNumber = Number(extension);
    const trunkNumber = Number(trunk);
    const pstnNumber = Number(pstn);
    const costNumber = Number(cost);

    if (
      !Number.isFinite(extensionNumber) ||
      !Number.isFinite(trunkNumber) ||
      !Number.isFinite(pstnNumber) ||
      !Number.isFinite(costNumber)
    ) {
      toast.warning("EXT, TRUNK, PSTN, and COST must be valid numbers.");
      return;
    }

    mutation.mutate({
      callDate: callDate?.toISOString(),
      userId: userId!,
      extension: extensionNumber,
      dial: dial.trim(),
      duration: duration.trim(),
      trunk: trunkNumber,
      pstn: pstnNumber,
      cost: costNumber,
    });
  };

  const selectedUser =
    users?.find((user) => user.id === userId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Biling Record" : "Create Biling Record"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={callDate ? format(callDate, "yyyy-MM-dd'T'HH:mm") : ""}
              onChange={(event) =>
                setCallDate(event.target.value ? new Date(event.target.value) : null)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Name</Label>
            <ReactSelect
              value={
                selectedUser
                  ? { value: String(selectedUser.id), label: selectedUser.namaLengkap }
                  : null
              }
              onChange={(option) => setUserId(option ? Number(option.value) : null)}
              options={(users ?? []).map((user) => ({
                value: String(user.id),
                label: user.namaLengkap,
              }))}
              placeholder="Select employee name"
            />
          </div>

          <div className="grid gap-2">
            <Label>EXT</Label>
            <Input value={extension} disabled placeholder="Auto from Akun Telepon" />
            {!matchedPhoneAccount && userId && (
              <p className="text-xs text-destructive">
                User ini belum punya data Akun Telepon.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>DIAL</Label>
            <Input
              value={dial}
              onChange={(event) => setDial(event.target.value)}
              placeholder="Input dial number"
            />
          </div>

          <div className="grid gap-2">
            <Label>DURATION</Label>
            <Input
              value={duration}
              onChange={(event) => setDuration(formatDurationInput(event.target.value))}
              placeholder="00:00:00"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>TRUNK</Label>
              <Input
                type="number"
                min={0}
                value={trunk}
                onChange={(event) => setTrunk(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>PSTN</Label>
              <Input
                type="number"
                min={0}
                value={pstn}
                onChange={(event) => setPstn(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>COST</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatRupiahInput(cost)}
                onChange={(event) =>
                  setCost(event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))
                }
                placeholder="Rp0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
