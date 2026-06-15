export const SLA_MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
] as const;

const PRIMARY_ISA_SBU = "PT_Intan_Sejati_Andalan";

export type DurationParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const sanitizeInteger = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const clampUnit = (value: number) => Math.max(0, Math.min(value, 59));

export const getSlaMonthLabel = (month: number) =>
  SLA_MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "-";

export const normalizeSlaSbuValue = (sbu: string) =>
  sbu.startsWith(`${PRIMARY_ISA_SBU}_`) ? PRIMARY_ISA_SBU : sbu;

export const formatSlaSbuLabel = (sbu: string) =>
  normalizeSlaSbuValue(sbu).replaceAll("_", " ");

export const buildSlaSbuOptions = (sbuOptions: string[]) => {
  const seen = new Set<string>();

  return sbuOptions
    .map((option) => normalizeSlaSbuValue(option))
    .filter((option) => {
      if (seen.has(option)) return false;
      seen.add(option);
      return true;
    })
    .map((option) => ({
      value: option,
      label: option.replaceAll("_", " "),
    }));
};

export const formatActualisation = (value: number) =>
  `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;

export const formatDurationSeconds = (totalSeconds: number) => {
  const safeTotal = Number.isFinite(totalSeconds) && totalSeconds > 0
    ? Math.floor(totalSeconds)
    : 0;
  const days = Math.floor(safeTotal / 86400);
  const hours = Math.floor((safeTotal % 86400) / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = safeTotal % 60;

  return `${days}d${hours}h${minutes}m${seconds}s`;
};

export const splitDurationSeconds = (
  totalSeconds: number | null | undefined
): DurationParts => {
  const safeTotal = Number.isFinite(totalSeconds) && Number(totalSeconds) >= 0
    ? Math.floor(Number(totalSeconds))
    : 0;

  return {
    days: String(Math.floor(safeTotal / 86400)),
    hours: String(Math.floor((safeTotal % 86400) / 3600)),
    minutes: String(Math.floor((safeTotal % 3600) / 60)),
    seconds: String(safeTotal % 60),
  };
};

export const sanitizeDurationDays = (value: string) => sanitizeInteger(value, 4);
export const sanitizeDurationHours = (value: string) => sanitizeInteger(value, 2);
export const sanitizeDurationMinutes = (value: string) => sanitizeInteger(value, 2);
export const sanitizeDurationSeconds = (value: string) => sanitizeInteger(value, 2);

export const durationPartsToSeconds = (parts: DurationParts) => {
  const days = Number(parts.days || "0");
  const hours = clampUnit(Number(parts.hours || "0"));
  const minutes = clampUnit(Number(parts.minutes || "0"));
  const seconds = clampUnit(Number(parts.seconds || "0"));

  if (![days, hours, minutes, seconds].every(Number.isFinite)) {
    return 0;
  }

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
};
