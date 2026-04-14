import type {
  SparepartAdjustmentDirection,
  SparepartDeviceFamily,
  SparepartMovementType,
  SparepartPartType,
} from "@/lib/types";

type OptionLike<T extends string> = {
  value: T;
  label: string;
};

export const SPAREPART_DEVICE_FAMILY_OPTIONS: OptionLike<SparepartDeviceFamily>[] = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "INTEL_NUC", label: "Intel NUC" },
  { value: "PC", label: "PC" },
];

export const SPAREPART_PART_TYPE_LABELS: Record<SparepartPartType, string> = {
  BRAND: "Brand",
  TYPE: "Type",
  PROCESSOR: "Processor",
  RAM: "RAM",
  STORAGE: "Storage",
  OS: "Operating System",
  POWER: "Power",
  LICENSE: "License",
  MICROSOFT_OFFICE: "Microsoft Office",
  COLOR: "Color",
  GRAPHIC: "Graphic",
  VGA: "VGA",
  MONITOR: "Monitor",
  MOTHERBOARD: "Mother Board",
  UPS: "UPS",
};

export const SPAREPART_PART_TYPE_OPTIONS: Record<
  SparepartDeviceFamily,
  OptionLike<SparepartPartType>[]
> = {
  LAPTOP: [
    { value: "BRAND", label: SPAREPART_PART_TYPE_LABELS.BRAND },
    { value: "TYPE", label: SPAREPART_PART_TYPE_LABELS.TYPE },
    { value: "PROCESSOR", label: SPAREPART_PART_TYPE_LABELS.PROCESSOR },
    { value: "RAM", label: SPAREPART_PART_TYPE_LABELS.RAM },
    { value: "STORAGE", label: SPAREPART_PART_TYPE_LABELS.STORAGE },
    { value: "OS", label: SPAREPART_PART_TYPE_LABELS.OS },
    { value: "POWER", label: SPAREPART_PART_TYPE_LABELS.POWER },
    { value: "LICENSE", label: SPAREPART_PART_TYPE_LABELS.LICENSE },
    {
      value: "MICROSOFT_OFFICE",
      label: SPAREPART_PART_TYPE_LABELS.MICROSOFT_OFFICE,
    },
    { value: "COLOR", label: SPAREPART_PART_TYPE_LABELS.COLOR },
    { value: "GRAPHIC", label: SPAREPART_PART_TYPE_LABELS.GRAPHIC },
    { value: "VGA", label: SPAREPART_PART_TYPE_LABELS.VGA },
  ],
  INTEL_NUC: [
    { value: "BRAND", label: SPAREPART_PART_TYPE_LABELS.BRAND },
    { value: "TYPE", label: SPAREPART_PART_TYPE_LABELS.TYPE },
    { value: "PROCESSOR", label: SPAREPART_PART_TYPE_LABELS.PROCESSOR },
    { value: "RAM", label: SPAREPART_PART_TYPE_LABELS.RAM },
    { value: "STORAGE", label: SPAREPART_PART_TYPE_LABELS.STORAGE },
    { value: "OS", label: SPAREPART_PART_TYPE_LABELS.OS },
    { value: "POWER", label: SPAREPART_PART_TYPE_LABELS.POWER },
    { value: "LICENSE", label: SPAREPART_PART_TYPE_LABELS.LICENSE },
    {
      value: "MICROSOFT_OFFICE",
      label: SPAREPART_PART_TYPE_LABELS.MICROSOFT_OFFICE,
    },
    { value: "COLOR", label: SPAREPART_PART_TYPE_LABELS.COLOR },
    { value: "GRAPHIC", label: SPAREPART_PART_TYPE_LABELS.GRAPHIC },
    { value: "VGA", label: SPAREPART_PART_TYPE_LABELS.VGA },
  ],
  PC: [
    { value: "BRAND", label: SPAREPART_PART_TYPE_LABELS.BRAND },
    { value: "PROCESSOR", label: SPAREPART_PART_TYPE_LABELS.PROCESSOR },
    { value: "RAM", label: SPAREPART_PART_TYPE_LABELS.RAM },
    { value: "STORAGE", label: SPAREPART_PART_TYPE_LABELS.STORAGE },
    { value: "OS", label: SPAREPART_PART_TYPE_LABELS.OS },
    { value: "POWER", label: SPAREPART_PART_TYPE_LABELS.POWER },
    { value: "LICENSE", label: SPAREPART_PART_TYPE_LABELS.LICENSE },
    {
      value: "MICROSOFT_OFFICE",
      label: SPAREPART_PART_TYPE_LABELS.MICROSOFT_OFFICE,
    },
    { value: "COLOR", label: SPAREPART_PART_TYPE_LABELS.COLOR },
    { value: "GRAPHIC", label: SPAREPART_PART_TYPE_LABELS.GRAPHIC },
    { value: "MONITOR", label: SPAREPART_PART_TYPE_LABELS.MONITOR },
    {
      value: "MOTHERBOARD",
      label: SPAREPART_PART_TYPE_LABELS.MOTHERBOARD,
    },
    { value: "UPS", label: SPAREPART_PART_TYPE_LABELS.UPS },
  ],
};

export const SPAREPART_MOVEMENT_TYPE_OPTIONS: OptionLike<SparepartMovementType>[] =
  [
    { value: "MASUK", label: "Masuk" },
    { value: "PAKAI", label: "Pakai" },
    { value: "ADJUSTMENT", label: "Adjustment" },
  ];

export const SPAREPART_ADJUSTMENT_DIRECTION_OPTIONS: OptionLike<SparepartAdjustmentDirection>[] =
  [
    { value: "INCREASE", label: "Tambah Stock" },
    { value: "DECREASE", label: "Kurangi Stock" },
  ];

export const getSparepartItemKey = (
  deviceFamily: SparepartDeviceFamily,
  partType: SparepartPartType,
  sourceOptionId: number,
  stockOwnerUserId?: number | null
) => `${deviceFamily}:${partType}:${sourceOptionId}:${stockOwnerUserId ?? "general"}`;
