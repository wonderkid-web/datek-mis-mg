"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangeFilterPopover } from "@/components/filters/DateRangeFilterPopover";
import type { DateBasisOption } from "@/components/filters/DateRangeFilter";
import {
  formatDateRangeLabel,
  isDateRangeFilterActive,
  type DateRangeFilterValue,
} from "@/lib/dateRangeFilter";

interface AssetsToolbarProps {
  idPrefix: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  dateFilter: DateRangeFilterValue;
  onDateFilterChange: (value: DateRangeFilterValue) => void;
  dateOptions: DateBasisOption[];
  /** Jumlah baris setelah filter diterapkan. */
  resultCount: number;
  /** Jumlah baris sebelum filter diterapkan. */
  totalCount: number;
  /** Tombol aksi di sisi kanan (export, assign, dsb). */
  actions?: ReactNode;
}

function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background py-1 pl-3 pr-1 text-xs shadow-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="truncate font-medium">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Hapus filter ${label}`}
        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export function AssetsToolbar({
  idPrefix,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  dateFilter,
  onDateFilterChange,
  dateOptions,
  resultCount,
  totalCount,
  actions,
}: AssetsToolbarProps) {
  const isDateActive = isDateRangeFilterActive(dateFilter);
  const hasActiveFilter = isDateActive || Boolean(searchTerm);
  const dateBasisLabel =
    dateOptions.find((option) => option.value === dateFilter.basis)?.label ??
    "Tanggal";

  const resetAll = () => {
    onSearchChange("");
    onDateFilterChange({ ...dateFilter, from: "", to: "" });
  };

  return (
    <div className="mb-6 rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[280px] lg:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <DateRangeFilterPopover
            idPrefix={idPrefix}
            value={dateFilter}
            onChange={onDateFilterChange}
            options={dateOptions}
            className="w-full sm:w-[240px]"
          />
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {actions}
          </div>
        ) : null}
      </div>

      {hasActiveFilter ? (
        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Filter aktif:</span>

          {searchTerm ? (
            <FilterChip
              label="Pencarian"
              value={searchTerm}
              onRemove={() => onSearchChange("")}
            />
          ) : null}

          {isDateActive ? (
            <FilterChip
              label={dateBasisLabel}
              value={formatDateRangeLabel(dateFilter)}
              onRemove={() =>
                onDateFilterChange({ ...dateFilter, from: "", to: "" })
              }
            />
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={resetAll}
          >
            Hapus semua
          </Button>

          <span className="ml-auto text-xs text-muted-foreground">
            Menampilkan {resultCount} dari {totalCount} data
          </span>
        </div>
      ) : null}
    </div>
  );
}
