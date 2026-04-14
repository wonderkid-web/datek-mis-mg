"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getUsers } from "@/lib/userService";
import {
  createSparepartMovement,
  getSparepartSourceOptions,
  updateSparepartMovement,
} from "@/lib/sparepartTrackerService";
import type {
  MasterDataOption,
  SparepartAdjustmentDirection,
  SparepartDeviceFamily,
  SparepartMovementType,
  SparepartMovementWithUser,
  SparepartPartType,
} from "@/lib/types";
import {
  SPAREPART_ADJUSTMENT_DIRECTION_OPTIONS,
  SPAREPART_DEVICE_FAMILY_OPTIONS,
  SPAREPART_MOVEMENT_TYPE_OPTIONS,
  SPAREPART_PART_TYPE_LABELS,
  SPAREPART_PART_TYPE_OPTIONS,
  getSparepartItemKey,
} from "@/lib/sparepartTrackerConfig";

interface SparepartTrackerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValue?: SparepartMovementWithUser | null;
  movements: SparepartMovementWithUser[];
}

interface SelectOption {
  value: string;
  label: string;
}

const selectStyles = {
  menu: (provided: Record<string, unknown>) => ({
    ...provided,
    zIndex: 9999,
  }),
};

const getStockDelta = (record: SparepartMovementWithUser) => {
  if (record.movementType === "MASUK") return record.quantity;
  if (record.movementType === "PAKAI") return -record.quantity;
  return record.adjustmentDirection === "DECREASE"
    ? -record.quantity
    : record.quantity;
};

export function SparepartTrackerForm({
  open,
  onOpenChange,
  defaultValue,
  movements,
}: SparepartTrackerFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(defaultValue);

  const [deviceFamily, setDeviceFamily] = useState<SparepartDeviceFamily | "">(
    ""
  );
  const [partType, setPartType] = useState<SparepartPartType | "">("");
  const [sourceOptionId, setSourceOptionId] = useState<number | null>(null);
  const [sourceOptionValue, setSourceOptionValue] = useState("");
  const [movementType, setMovementType] = useState<SparepartMovementType>("MASUK");
  const [adjustmentDirection, setAdjustmentDirection] =
    useState<SparepartAdjustmentDirection | "">("");
  const [quantity, setQuantity] = useState("");
  const [movedAt, setMovedAt] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [stockOwnerUserId, setStockOwnerUserId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const activeUsers = useMemo(
    () =>
      (users ?? [])
        .filter((user) => user.isActive)
        .map((user) => ({
          value: String(user.id),
          label: user.namaLengkap,
        })),
    [users]
  );

  const { data: sourceOptions } = useQuery<MasterDataOption[]>({
    queryKey: ["sparepart-source-options", deviceFamily, partType],
    queryFn: () =>
      getSparepartSourceOptions(
        deviceFamily as SparepartDeviceFamily,
        partType as SparepartPartType
      ),
    enabled: Boolean(deviceFamily && partType),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!defaultValue) {
      setDeviceFamily("");
      setPartType("");
      setSourceOptionId(null);
      setSourceOptionValue("");
      setMovementType("MASUK");
      setAdjustmentDirection("");
      setQuantity("");
      setMovedAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setUserId(null);
      setStockOwnerUserId(null);
      setNotes("");
      return;
    }

    setDeviceFamily(defaultValue.deviceFamily);
    setPartType(defaultValue.partType);
    setSourceOptionId(defaultValue.sourceOptionId);
    setSourceOptionValue(defaultValue.sourceOptionValue);
    setMovementType(defaultValue.movementType);
    setAdjustmentDirection(defaultValue.adjustmentDirection ?? "");
    setQuantity(String(defaultValue.quantity));
    setMovedAt(format(new Date(defaultValue.movedAt), "yyyy-MM-dd'T'HH:mm"));
    setUserId(defaultValue.userId ?? null);
    setStockOwnerUserId(defaultValue.stockOwnerUserId ?? null);
    setNotes(defaultValue.notes ?? "");
  }, [defaultValue, open]);

  const partTypeOptions = deviceFamily
    ? SPAREPART_PART_TYPE_OPTIONS[deviceFamily]
    : [];

  const sourceSelectOptions: SelectOption[] = (sourceOptions ?? []).map((option) => ({
    value: String(option.id),
    label: option.value,
  }));

  const selectedSourceOption =
    sourceSelectOptions.find((option) => Number(option.value) === sourceOptionId) ??
    (sourceOptionId !== null && sourceOptionValue
      ? { value: String(sourceOptionId), label: sourceOptionValue }
      : null);

  const selectedUserOption =
    activeUsers.find((option) => Number(option.value) === userId) ?? null;

  const selectedStockOwnerOption =
    activeUsers.find((option) => Number(option.value) === stockOwnerUserId) ?? null;

  const currentStock = useMemo(() => {
    if (!deviceFamily || !partType || sourceOptionId === null) {
      return 0;
    }

    return movements
      .filter(
        (record) =>
          getSparepartItemKey(
            record.deviceFamily,
            record.partType,
            record.sourceOptionId,
            record.stockOwnerUserId
          ) ===
          getSparepartItemKey(
            deviceFamily,
            partType,
            sourceOptionId,
            stockOwnerUserId
          )
      )
      .reduce((total, record) => total + getStockDelta(record), 0);
  }, [deviceFamily, movements, partType, sourceOptionId, stockOwnerUserId]);

  const canSubmit = useMemo(() => {
    const parsedQuantity = Number(quantity);

    return Boolean(
      deviceFamily &&
        partType &&
        sourceOptionId !== null &&
        sourceOptionValue &&
        movementType &&
        movedAt &&
        Number.isFinite(parsedQuantity) &&
        parsedQuantity > 0 &&
        (movementType === "ADJUSTMENT" || stockOwnerUserId) &&
        (movementType !== "PAKAI" || userId) &&
        (movementType !== "ADJUSTMENT" || adjustmentDirection)
    );
  }, [
    adjustmentDirection,
    deviceFamily,
    movedAt,
    movementType,
    partType,
    quantity,
    sourceOptionId,
    sourceOptionValue,
    stockOwnerUserId,
    userId,
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        deviceFamily: deviceFamily as SparepartDeviceFamily,
        partType: partType as SparepartPartType,
        sourceOptionId: sourceOptionId as number,
        sourceOptionValue,
        movementType,
        adjustmentDirection:
          movementType === "ADJUSTMENT"
            ? (adjustmentDirection as SparepartAdjustmentDirection)
            : null,
        quantity: Number(quantity),
        movedAt: new Date(movedAt).toISOString(),
        userId: movementType === "PAKAI" ? userId : null,
        stockOwnerUserId,
        sourceAssignmentId: null,
        notes,
      };

      if (isEditing && defaultValue) {
        return updateSparepartMovement(defaultValue.id, payload);
      }

      return createSparepartMovement(payload);
    },
    onSuccess: () => {
      toast.success(
        `Sparepart movement ${isEditing ? "updated" : "created"} successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ["sparepart-movements"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save sparepart movement.");
    },
  });

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.warning("Please fill all required fields.");
      return;
    }

    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Sparepart Movement" : "Create Sparepart Movement"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Device Family</Label>
            <UiSelect
              value={deviceFamily || undefined}
              onValueChange={(value) => {
                setDeviceFamily(value as SparepartDeviceFamily);
                setPartType("");
                setSourceOptionId(null);
                setSourceOptionValue("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device family" />
              </SelectTrigger>
              <SelectContent>
                {SPAREPART_DEVICE_FAMILY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>

          <div className="grid gap-2">
            <Label>Jenis Sparepart</Label>
            <UiSelect
              value={partType || undefined}
              onValueChange={(value) => {
                setPartType(value as SparepartPartType);
                setSourceOptionId(null);
                setSourceOptionValue("");
              }}
              disabled={!deviceFamily}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select part type" />
              </SelectTrigger>
              <SelectContent>
                {partTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>

          <div className="grid gap-2">
            <Label>List Sparepart</Label>
            <Select
              styles={selectStyles}
              value={selectedSourceOption}
              onChange={(option) => {
                setSourceOptionId(option ? Number(option.value) : null);
                setSourceOptionValue(option?.label ?? "");
              }}
              options={sourceSelectOptions}
              placeholder={partType ? `Select ${SPAREPART_PART_TYPE_LABELS[partType]}` : "Select part type first"}
              isClearable
              isDisabled={!partType}
            />
          </div>

          <div className="grid gap-2">
            <Label>Jenis Mutasi</Label>
            <UiSelect
              value={movementType}
              onValueChange={(value) => {
                const nextValue = value as SparepartMovementType;
                setMovementType(nextValue);

                if (nextValue !== "ADJUSTMENT") {
                  setAdjustmentDirection("");
                }

                if (nextValue !== "PAKAI") {
                  setUserId(null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select movement type" />
              </SelectTrigger>
              <SelectContent>
                {SPAREPART_MOVEMENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>

          {movementType === "ADJUSTMENT" ? (
            <div className="grid gap-2">
              <Label>Arah Adjustment</Label>
              <UiSelect
                value={adjustmentDirection || undefined}
                onValueChange={(value) =>
                  setAdjustmentDirection(value as SparepartAdjustmentDirection)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select adjustment direction" />
                </SelectTrigger>
                <SelectContent>
                  {SPAREPART_ADJUSTMENT_DIRECTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Input quantity"
            />
          </div>

          <div className="grid gap-2">
            <Label>Waktu Pindah</Label>
            <Input
              type="datetime-local"
              value={movedAt}
              onChange={(event) => setMovedAt(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              {movementType === "MASUK" ? "User Awal / Pemilik Stok" : "Stok Milik User"}
            </Label>
            <Select
              styles={selectStyles}
              value={selectedStockOwnerOption}
              onChange={(option) =>
                setStockOwnerUserId(option ? Number(option.value) : null)
              }
              options={activeUsers}
              placeholder="Pilih user pemilik stok sparepart"
              isClearable={movementType === "ADJUSTMENT"}
            />
            <p className="text-xs text-muted-foreground">
              Dipakai untuk mencatat sparepart ini berasal dari stok user siapa.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>User yang Pakai</Label>
            <Select
              styles={selectStyles}
              value={selectedUserOption}
              onChange={(option) => setUserId(option ? Number(option.value) : null)}
              options={activeUsers}
              placeholder={
                movementType === "PAKAI"
                  ? "Select employee"
                  : "Optional unless movement is Pakai"
              }
              isClearable
              isDisabled={movementType !== "PAKAI"}
            />
          </div>

          <div className="grid gap-2">
            <Label>Current Stock</Label>
            <Input disabled value={currentStock.toLocaleString("id-ID")} />
            <p className="text-xs text-muted-foreground">
              Stock dihitung otomatis dari seluruh mutasi sparepart yang sama.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
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
