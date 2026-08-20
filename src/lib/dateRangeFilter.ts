export type DateRangeFilterValue = {
  /** Field tanggal yang dipakai sebagai dasar filter. */
  basis: string;
  /** Format input date native: yyyy-mm-dd. */
  from: string;
  to: string;
};

export const createDateRangeFilter = (basis: string): DateRangeFilterValue => ({
  basis,
  from: "",
  to: "",
});

export const isDateRangeFilterActive = (filter: DateRangeFilterValue) =>
  Boolean(filter.from || filter.to);

/** yyyy-mm-dd dibaca sebagai tanggal lokal, bukan UTC. */
const parseInputDate = (value: string, endOfDay: boolean) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
};

/**
 * Cek apakah sebuah tanggal masuk rentang filter (inklusif di kedua ujung).
 * Record tanpa tanggal dianggap tidak lolos selama filter aktif.
 */
export function matchesDateRange(
  value: Date | string | null | undefined,
  filter: DateRangeFilterValue
) {
  if (!isDateRangeFilterActive(filter)) {
    return true;
  }

  if (!value) {
    return false;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (filter.from) {
    const start = parseInputDate(filter.from, false);
    if (start && date.getTime() < start.getTime()) {
      return false;
    }
  }

  if (filter.to) {
    const end = parseInputDate(filter.to, true);
    if (end && date.getTime() > end.getTime()) {
      return false;
    }
  }

  return true;
}

/** Tampilkan yyyy-mm-dd sebagai "01 Jan 2026". */
export const formatInputDateLabel = (value: string) => {
  const date = parseInputDate(value, false);
  if (!date) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** Ringkasan rentang untuk ditampilkan di tombol/chip filter. */
export const formatDateRangeLabel = (filter: DateRangeFilterValue) => {
  if (filter.from && filter.to) {
    return `${formatInputDateLabel(filter.from)} - ${formatInputDateLabel(
      filter.to
    )}`;
  }

  if (filter.from) {
    return `Dari ${formatInputDateLabel(filter.from)}`;
  }

  if (filter.to) {
    return `Sampai ${formatInputDateLabel(filter.to)}`;
  }

  return "";
};
