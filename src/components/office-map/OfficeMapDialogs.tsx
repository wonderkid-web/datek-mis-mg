"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { DEPARTMENTS } from "@/lib/constants";
import type { OfficeDeskGroup } from "@/lib/types";

export type OfficeMapSelectableUser = {
  id: number;
  namaLengkap: string;
  departemen: string | null;
  jabatan: string | null;
  lokasiKantor: string | null;
  isActive: boolean;
};

export type FloorFormValues = {
  name: string;
  description: string;
  sortOrder: number;
  canvasColumns: number;
  isActive: boolean;
};

export type DeskGroupFormValues = {
  name: string;
  department: string;
  departmentColor: string;
  layoutKind: "DOUBLE" | "SINGLE_TOP" | "SINGLE_BOTTOM";
  gridColumn: number;
  gridRow: number;
  columnSpan: number;
  seatsPerSide: number;
  sortOrder: number;
  notes: string;
};

export type FloorZoneFormValues = {
  name: string;
  color: string;
  gridColumn: number;
  gridRow: number;
  columnSpan: number;
  rowSpan: number;
  sortOrder: number;
  notes: string;
};

export type SeatDraft = {
  id: number;
  side: "TOP" | "BOTTOM";
  position: number;
  userId: string;
  label: string;
};

type SeatUserOption = {
  value: string;
  label: string;
  user?: OfficeMapSelectableUser;
};

type DepartmentOption = {
  value: string;
  label: string;
};

type LayoutOption = {
  value: "DOUBLE" | "SINGLE_TOP" | "SINGLE_BOTTOM";
  label: string;
  description: string;
};

const defaultFloorValues: FloorFormValues = {
  name: "",
  description: "",
  sortOrder: 0,
  canvasColumns: 12,
  isActive: true,
};

const defaultDeskGroupValues: DeskGroupFormValues = {
  name: "",
  department: "",
  departmentColor: "#38bdf8",
  layoutKind: "DOUBLE",
  gridColumn: 1,
  gridRow: 1,
  columnSpan: 4,
  seatsPerSide: 2,
  sortOrder: 0,
  notes: "",
};

const defaultFloorZoneValues: FloorZoneFormValues = {
  name: "",
  color: "#94a3b8",
  gridColumn: 1,
  gridRow: 1,
  columnSpan: 2,
  rowSpan: 1,
  sortOrder: 0,
  notes: "",
};

const deskLayoutOptions: LayoutOption[] = [
  {
    value: "DOUBLE",
    label: "2 sisi",
    description: "Seat ada di sisi atas dan bawah meja.",
  },
  {
    value: "SINGLE_TOP",
    label: "1 sisi atas",
    description: "Seat hanya ada di sisi atas meja.",
  },
  {
    value: "SINGLE_BOTTOM",
    label: "1 sisi bawah",
    description: "Seat hanya ada di sisi bawah meja.",
  },
];

const dialogSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 40,
    borderRadius: 10,
    borderColor: state.isFocused ? "#0f172a" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 1px #0f172a" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#0f172a" : "#94a3b8",
    },
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#e2e8f0"
      : state.isFocused
        ? "#f8fafc"
        : "#ffffff",
    color: "#0f172a",
  }),
};

const buildSeatDrafts = (deskGroup: OfficeDeskGroup | null) => {
  if (!deskGroup) {
    return [] as SeatDraft[];
  }

  return [...deskGroup.seats]
    .sort((left, right) => {
      if (left.side !== right.side) {
        return left.side === "TOP" ? -1 : 1;
      }

      return left.position - right.position;
    })
    .map((seat) => ({
      id: seat.id,
      side: seat.side,
      position: seat.position,
      userId: seat.userId ? String(seat.userId) : "unassigned",
      label: seat.label ?? "",
    }));
};

interface FloorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: FloorFormValues | null;
  onSave: (values: FloorFormValues) => Promise<void> | void;
  isSaving?: boolean;
}

export function FloorFormDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
  isSaving = false,
}: FloorFormDialogProps) {
  const [values, setValues] = useState<FloorFormValues>(
    initialValue ?? defaultFloorValues
  );

  useEffect(() => {
    setValues(initialValue ?? defaultFloorValues);
  }, [initialValue, open]);

  const handleSave = async () => {
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {initialValue ? "Edit Lantai" : "Tambah Lantai"}
          </DialogTitle>
          <DialogDescription>
            Atur lantai dan jumlah kolom grid yang akan dipakai canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="floor-name">Nama Lantai</Label>
            <Input
              id="floor-name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Lantai 1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="floor-description">Deskripsi</Label>
            <Input
              id="floor-description"
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Area operasional utama"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="floor-sort-order">Urutan</Label>
              <Input
                id="floor-sort-order"
                type="number"
                min={0}
                value={values.sortOrder}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="floor-columns">Kolom Grid</Label>
              <Input
                id="floor-columns"
                type="number"
                min={4}
                max={24}
                value={values.canvasColumns}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    canvasColumns: Number(event.target.value || 12),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
            <Checkbox
              id="floor-active"
              checked={values.isActive}
              onCheckedChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  isActive: Boolean(checked),
                }))
              }
            />
            <Label htmlFor="floor-active">Lantai aktif</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeskGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: DeskGroupFormValues | null;
  onSave: (values: DeskGroupFormValues) => Promise<void> | void;
  isSaving?: boolean;
}

export function DeskGroupFormDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
  isSaving = false,
}: DeskGroupFormDialogProps) {
  const [values, setValues] = useState<DeskGroupFormValues>(
    initialValue ?? defaultDeskGroupValues
  );
  const dialogContentRef = useRef<HTMLDivElement | null>(null);

  const departmentOptions = useMemo<DepartmentOption[]>(() => {
    const baseOptions = DEPARTMENTS.map((department) => ({
      value: department,
      label: department,
    }));

    const trimmedDepartment = values.department.trim();
    if (!trimmedDepartment) {
      return baseOptions;
    }

    const hasMatch = baseOptions.some(
      (option) => option.value === trimmedDepartment
    );

    return hasMatch
      ? baseOptions
      : [{ value: trimmedDepartment, label: trimmedDepartment }, ...baseOptions];
  }, [values.department]);

  useEffect(() => {
    setValues(initialValue ?? defaultDeskGroupValues);
  }, [initialValue, open]);

  const handleSave = async () => {
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={dialogContentRef} className="overflow-visible sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialValue ? "Edit Cluster Meja" : "Tambah Cluster Meja"}
          </DialogTitle>
          <DialogDescription>
            Posisi cluster diatur dengan grid baris/kolom supaya layout lantai
            tetap sederhana dan mudah dipindah.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="desk-name">Nama Cluster</Label>
            <Input
              id="desk-name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Finance Pod A"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="grid gap-2">
              <Label htmlFor="desk-department">Department</Label>
              <Select
                inputId="desk-department"
                options={departmentOptions}
                isSearchable
                isClearable
                isDisabled={isSaving}
                menuPortalTarget={dialogContentRef.current ?? undefined}
                menuPosition="fixed"
                className="text-sm"
                classNamePrefix="desk-department-select"
                placeholder="Pilih atau cari department..."
                value={
                  departmentOptions.find(
                    (option) => option.value === values.department
                  ) ?? null
                }
                onChange={(option) =>
                  setValues((current) => ({
                    ...current,
                    department: option?.value ?? "",
                  }))
                }
                filterOption={(option, rawInput) =>
                  option.label.toLowerCase().includes(rawInput.trim().toLowerCase())
                }
                styles={dialogSelectStyles}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desk-color">Warna Department</Label>
              <Input
                id="desk-color"
                type="color"
                value={values.departmentColor}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    departmentColor: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desk-layout-kind">Layout Meja</Label>
            <Select
              inputId="desk-layout-kind"
              options={deskLayoutOptions}
              isSearchable={false}
              isClearable={false}
              isDisabled={isSaving}
              menuPortalTarget={dialogContentRef.current ?? undefined}
              menuPosition="fixed"
              className="text-sm"
              classNamePrefix="desk-layout-select"
              value={
                deskLayoutOptions.find(
                  (option) => option.value === values.layoutKind
                ) ?? deskLayoutOptions[0]
              }
              onChange={(option) =>
                setValues((current) => ({
                  ...current,
                  layoutKind: option?.value ?? "DOUBLE",
                }))
              }
              formatOptionLabel={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {option.description}
                  </span>
                </div>
              )}
              styles={dialogSelectStyles}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="desk-grid-column">Grid Column</Label>
              <Input
                id="desk-grid-column"
                type="number"
                min={1}
                value={values.gridColumn}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    gridColumn: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desk-grid-row">Grid Row</Label>
              <Input
                id="desk-grid-row"
                type="number"
                min={1}
                value={values.gridRow}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    gridRow: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desk-column-span">Lebar Grid</Label>
              <Input
                id="desk-column-span"
                type="number"
                min={1}
                value={values.columnSpan}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    columnSpan: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="desk-seats-side">Seat per Sisi</Label>
              <Input
                id="desk-seats-side"
                type="number"
                min={1}
                max={12}
                value={values.seatsPerSide}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    seatsPerSide: Number(event.target.value || 2),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desk-sort-order">Urutan</Label>
              <Input
                id="desk-sort-order"
                type="number"
                min={0}
                value={values.sortOrder}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desk-notes">Catatan</Label>
              <Input
                id="desk-notes"
                value={values.notes}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Dekat jendela"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SeatManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deskGroup: OfficeDeskGroup | null;
  users: OfficeMapSelectableUser[];
  onSave: (drafts: SeatDraft[]) => Promise<void> | void;
  isSaving?: boolean;
}

interface FloorZoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: FloorZoneFormValues | null;
  onSave: (values: FloorZoneFormValues) => Promise<void> | void;
  isSaving?: boolean;
}

export function FloorZoneFormDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
  isSaving = false,
}: FloorZoneFormDialogProps) {
  const [values, setValues] = useState<FloorZoneFormValues>(
    initialValue ?? defaultFloorZoneValues
  );

  useEffect(() => {
    setValues(initialValue ?? defaultFloorZoneValues);
  }, [initialValue, open]);

  const handleSave = async () => {
    await onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialValue ? "Edit Jalur" : "Tambah Jalur"}
          </DialogTitle>
          <DialogDescription>
            Jalur selalu memenuhi lebar lantai dan menjadi baris khusus yang
            tidak dapat ditempati cluster.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="zone-name">Nama Jalur</Label>
            <Input
              id="zone-name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Jalur Utama"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="grid gap-2">
              <Label htmlFor="zone-notes">Catatan</Label>
              <Input
                id="zone-notes"
                value={values.notes}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Akses ke pantry"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zone-color">Warna Jalur</Label>
              <Input
                id="zone-color"
                type="color"
                value={values.color}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="zone-grid-row">Baris Grid</Label>
              <Input
                id="zone-grid-row"
                type="number"
                min={1}
                value={values.gridRow}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    gridRow: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zone-sort-order">Urutan</Label>
              <Input
                id="zone-sort-order"
                type="number"
                min={0}
                value={values.sortOrder}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zone-row-span">Tinggi Grid</Label>
              <Input
                id="zone-row-span"
                type="number"
                min={1}
                value={values.rowSpan}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    rowSpan: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Simpan Jalur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SeatManagementDialog({
  open,
  onOpenChange,
  deskGroup,
  users,
  onSave,
  isSaving = false,
}: SeatManagementDialogProps) {
  const [drafts, setDrafts] = useState<SeatDraft[]>(buildSeatDrafts(deskGroup));
  const dialogContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDrafts(buildSeatDrafts(deskGroup));
  }, [deskGroup, open]);

  const userOptions = useMemo<SeatUserOption[]>(
    () => [
      {
        value: "unassigned",
        label: "Kosong",
      },
      ...users.map((user) => ({
        value: String(user.id),
        label: [
          user.namaLengkap,
          user.departemen,
          user.lokasiKantor,
        ]
          .filter(Boolean)
          .join(" - "),
        user,
      })),
    ],
    [users]
  );

  const handleDraftChange = (
    seatId: number,
    patch: Partial<Pick<SeatDraft, "userId" | "label">>
  ) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === seatId ? { ...draft, ...patch } : draft
      )
    );
  };

  const handleSave = async () => {
    await onSave(drafts);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        className="max-h-[90vh] overflow-visible sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Kelola Seat</DialogTitle>
          <DialogDescription>
            {deskGroup
              ? `Atur assignment seat untuk ${deskGroup.name}.`
              : "Pilih cluster meja terlebih dahulu."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[62vh] gap-4 overflow-y-auto py-2 pr-1">
          <div className="grid gap-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[120px_minmax(0,1fr)_180px]"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {draft.side === "TOP" ? "Atas" : "Bawah"} #{draft.position}
                  </p>
                  <p className="text-xs text-slate-500">
                    Seat ID {draft.id}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>User</Label>
                  <Select
                    inputId={`seat-user-${draft.id}`}
                    options={userOptions}
                    isSearchable
                    isClearable={false}
                    isDisabled={isSaving}
                    menuPortalTarget={dialogContentRef.current ?? undefined}
                    menuPosition="fixed"
                    className="text-sm"
                    classNamePrefix="seat-user-select"
                    placeholder="Cari user..."
                    value={
                      userOptions.find((option) => option.value === draft.userId) ??
                      userOptions[0]
                    }
                    onChange={(option) =>
                      handleDraftChange(draft.id, {
                        userId: option?.value ?? "unassigned",
                      })
                    }
                    filterOption={(option, rawInput) => {
                      const query = rawInput.trim().toLowerCase();
                      if (!query) {
                        return true;
                      }

                      const haystack = [
                        option.data.label,
                        option.data.user?.namaLengkap,
                        option.data.user?.departemen,
                        option.data.user?.jabatan,
                        option.data.user?.lokasiKantor,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                      return haystack.includes(query);
                    }}
                    formatOptionLabel={(option) =>
                      option.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {option.user.namaLengkap}
                          </span>
                          <span className="text-xs text-slate-500">
                            {[option.user.departemen, option.user.lokasiKantor]
                              .filter(Boolean)
                              .join(" - ") || "Tanpa detail tambahan"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">{option.label}</span>
                      )
                    }
                    styles={dialogSelectStyles}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Label Seat</Label>
                  <Input
                    value={draft.label}
                    onChange={(event) =>
                      handleDraftChange(draft.id, {
                        label: event.target.value,
                      })
                    }
                    placeholder="Opsional"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Simpan Seat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
