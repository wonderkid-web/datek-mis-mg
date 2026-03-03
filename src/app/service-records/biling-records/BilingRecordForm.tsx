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
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers } from "@/lib/userService";
import { getPhoneAccounts } from "@/lib/phoneAccountService";
import { getTrunks } from "@/lib/trunkService";
import { getPstns } from "@/lib/pstnService";
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
type TrunkOption = Awaited<ReturnType<typeof getTrunks>>[number];
type PstnOption = Awaited<ReturnType<typeof getPstns>>[number];

const DURATION_PATTERN = /^\d{1,2}:[0-5]\d:[0-5]\d$/;

const sanitizeDurationInput = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const splitDuration = (value: string | undefined) => {
  if (!value) return { hours: "", minutes: "", seconds: "" };

  const [hoursRaw, minutesRaw, secondsRaw] = value.split(":");
  if (!hoursRaw || !minutesRaw || !secondsRaw) {
    return { hours: "", minutes: "", seconds: "" };
  }

  const hours = sanitizeDurationInput(hoursRaw, 2);
  const minutes = sanitizeDurationInput(minutesRaw, 2);
  const seconds = sanitizeDurationInput(secondsRaw, 2);

  if (!hours || !minutes || !seconds) {
    return { hours: "", minutes: "", seconds: "" };
  }

  return {
    hours: String(Number(hours)),
    minutes: String(Math.min(Number(minutes), 59)),
    seconds: String(Math.min(Number(seconds), 59)),
  };
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

const buildPrefixedSelectValue = (
  prefix: "trunk" | "pstn",
  value: number | null | undefined
) => (value === null || value === undefined ? "" : `${prefix}:${value}`);

const parsePrefixedSelectValue = (
  prefix: "trunk" | "pstn",
  value: string
) => {
  if (!value) return null;
  const normalized = value.startsWith(`${prefix}:`) ? value.slice(prefix.length + 1) : value;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
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
  const { data: trunks } = useQuery<TrunkOption[]>({
    queryKey: ["trunkOptions"],
    queryFn: () => getTrunks(),
  });
  const { data: pstns } = useQuery<PstnOption[]>({
    queryKey: ["pstnOptions"],
    queryFn: () => getPstns(),
  });

  const [callDate, setCallDate] = useState<Date | null>(
    defaultValue?.callDate ? new Date(defaultValue.callDate) : null
  );
  const [userId, setUserId] = useState<number | null>(defaultValue?.userId ?? null);
  const [extension, setExtension] = useState(defaultValue?.extension?.toString() ?? "");
  const [dial, setDial] = useState(defaultValue?.dial ?? "");
  const [durationHours, setDurationHours] = useState(
    splitDuration(defaultValue?.duration).hours
  );
  const [durationMinutes, setDurationMinutes] = useState(
    splitDuration(defaultValue?.duration).minutes
  );
  const [durationSeconds, setDurationSeconds] = useState(
    splitDuration(defaultValue?.duration).seconds
  );
  const [trunk, setTrunk] = useState(buildPrefixedSelectValue("trunk", defaultValue?.trunk));
  const [pstn, setPstn] = useState(buildPrefixedSelectValue("pstn", defaultValue?.pstn));
  const [cost, setCost] = useState(normalizeCostDigits(defaultValue?.cost));

  useEffect(() => {
    if (open) {
      setCallDate(defaultValue?.callDate ? new Date(defaultValue.callDate) : null);
      setUserId(defaultValue?.userId ?? null);
      setExtension(defaultValue?.extension?.toString() ?? "");
      setDial(defaultValue?.dial ?? "");
      const durationParts = splitDuration(defaultValue?.duration);
      setDurationHours(durationParts.hours);
      setDurationMinutes(durationParts.minutes);
      setDurationSeconds(durationParts.seconds);
      setTrunk(buildPrefixedSelectValue("trunk", defaultValue?.trunk));
      setPstn(buildPrefixedSelectValue("pstn", defaultValue?.pstn));
      setCost(normalizeCostDigits(defaultValue?.cost));
      return;
    }

    setCallDate(null);
    setUserId(null);
    setExtension("");
    setDial("");
    setDurationHours("");
    setDurationMinutes("");
    setDurationSeconds("");
    setTrunk("");
    setPstn("");
    setCost("");
  }, [open, defaultValue]);

  const duration = useMemo(() => {
    if (!durationHours || !durationMinutes || !durationSeconds) {
      return "";
    }

    const hours = String(Number(durationHours)).padStart(2, "0");
    const minutes = String(Number(durationMinutes)).padStart(2, "0");
    const seconds = String(Number(durationSeconds)).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }, [durationHours, durationMinutes, durationSeconds]);

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

  const selectedTrunk = useMemo(() => {
    const numericTrunk = parsePrefixedSelectValue("trunk", trunk);
    if (numericTrunk === null) return null;
    return trunks?.find((item) => item.nomorLine === numericTrunk) ?? null;
  }, [trunks, trunk]);

  const selectedPstn = useMemo(() => {
    const numericPstn = parsePrefixedSelectValue("pstn", pstn);
    if (numericPstn === null) return null;
    return pstns?.find((item) => item.pstnCode === numericPstn) ?? null;
  }, [pstns, pstn]);

  const trunkOptions = useMemo(() => {
    const options = trunks ?? [];
    if (!isEditing || trunk === "") return options;

    const hasCurrentValue = options.some(
      (item) => buildPrefixedSelectValue("trunk", item.nomorLine) === trunk
    );
    if (hasCurrentValue) return options;

    const fallbackNomorLine = parsePrefixedSelectValue("trunk", trunk);
    if (fallbackNomorLine === null) return options;

    return [
      {
        id: -1,
        nomorLine: fallbackNomorLine,
        company: "",
        extension: 0,
      },
      ...options,
    ];
  }, [trunks, isEditing, trunk]);

  const pstnOptions = useMemo(() => {
    const options = pstns ?? [];
    if (!isEditing || pstn === "") return options;

    const hasCurrentValue = options.some(
      (item) => buildPrefixedSelectValue("pstn", item.pstnCode) === pstn
    );
    if (hasCurrentValue) return options;

    const fallbackPstnCode = parsePrefixedSelectValue("pstn", pstn);
    if (fallbackPstnCode === null) return options;

    return [
      {
        id: -1,
        pstnCode: fallbackPstnCode,
        pstnName: "",
      },
      ...options,
    ];
  }, [pstns, isEditing, pstn]);

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
          userId !== null &&
          extension.trim() !== "" &&
          dial.trim() !== "" &&
          duration.trim() !== "" &&
          trunk !== "" &&
          pstn !== "" &&
          cost !== ""
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

    const hasValidTrunk = isEditing
      ? parsePrefixedSelectValue("trunk", trunk) !== null
      : Boolean(selectedTrunk);
    const hasValidPstn = isEditing
      ? parsePrefixedSelectValue("pstn", pstn) !== null
      : Boolean(selectedPstn);

    if (!hasValidTrunk || !hasValidPstn) {
      toast.warning("Please select valid Trunk and PSTN options.");
      return;
    }

    const extensionNumber = Number(extension);
    const trunkNumber = parsePrefixedSelectValue("trunk", trunk);
    const pstnNumber = parsePrefixedSelectValue("pstn", pstn);
    const costNumber = Number(cost);

    if (
      !Number.isFinite(extensionNumber) ||
      trunkNumber === null ||
      pstnNumber === null ||
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
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                value={durationHours}
                onChange={(event) =>
                  setDurationHours(sanitizeDurationInput(event.target.value, 2))
                }
                placeholder="Jam"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={durationMinutes}
                onChange={(event) => {
                  const nextValue = sanitizeDurationInput(event.target.value, 2);
                  if (!nextValue) {
                    setDurationMinutes("");
                    return;
                  }
                  setDurationMinutes(String(Math.min(Number(nextValue), 59)));
                }}
                placeholder="Menit"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={durationSeconds}
                onChange={(event) => {
                  const nextValue = sanitizeDurationInput(event.target.value, 2);
                  if (!nextValue) {
                    setDurationSeconds("");
                    return;
                  }
                  setDurationSeconds(String(Math.min(Number(nextValue), 59)));
                }}
                placeholder="Detik"
              />
            </div>
            <p className="text-xs text-muted-foreground">Format tersimpan otomatis jadi HH:MM:SS.</p>
          </div>

          <div className="grid gap-2">
            <Label>TRUNK (Nomor Line)</Label>
            <UiSelect value={trunk === "" ? undefined : trunk} onValueChange={setTrunk}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih nomor line trunk">
                  {parsePrefixedSelectValue("trunk", trunk) ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {trunkOptions.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={buildPrefixedSelectValue("trunk", item.nomorLine)}
                  >
                    {item.nomorLine}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Trunk Company</Label>
                <Input value={selectedTrunk?.company ?? ""} disabled />
              </div>
            <div className="grid gap-2">
              <Label>Trunk Extension</Label>
              <Input value={selectedTrunk ? String(selectedTrunk.extension) : ""} disabled />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>PSTN (Code)</Label>
            <UiSelect value={pstn === "" ? undefined : pstn} onValueChange={setPstn}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih PSTN code">
                  {parsePrefixedSelectValue("pstn", pstn) ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pstnOptions.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={buildPrefixedSelectValue("pstn", item.pstnCode)}
                  >
                    {item.pstnCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>

          <div className="grid gap-2">
            <Label>PSTN Name</Label>
            <Input value={selectedPstn?.pstnName ?? ""} disabled />
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
