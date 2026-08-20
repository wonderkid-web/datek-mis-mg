"use client";

import { useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDateRangeLabel,
  isDateRangeFilterActive,
  type DateRangeFilterValue,
} from "@/lib/dateRangeFilter";
import { cn } from "@/lib/utils";
import type { DateBasisOption } from "./DateRangeFilter";

interface DateRangeFilterPopoverProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  /** Bila hanya satu opsi, dropdown basis tanggal disembunyikan. */
  options: DateBasisOption[];
  idPrefix: string;
  className?: string;
}

const toInputDate = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const buildPresets = () => {
  const today = new Date();

  const lastDays = (days: number) => {
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    return { from: toInputDate(start), to: toInputDate(today) };
  };

  return [
    { label: "7 hari terakhir", range: lastDays(7) },
    { label: "30 hari terakhir", range: lastDays(30) },
    {
      label: "Bulan ini",
      range: {
        from: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toInputDate(today),
      },
    },
    {
      label: "Tahun ini",
      range: {
        from: toInputDate(new Date(today.getFullYear(), 0, 1)),
        to: toInputDate(today),
      },
    },
  ];
};

export function DateRangeFilterPopover({
  value,
  onChange,
  options,
  idPrefix,
  className,
}: DateRangeFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const isActive = isDateRangeFilterActive(value);
  const basisLabel =
    options.find((option) => option.value === value.basis)?.label ??
    options[0]?.label ??
    "Tanggal";
  const presets = buildPresets();

  const isPresetActive = (range: { from: string; to: string }) =>
    value.from === range.from && value.to === range.to;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 justify-between gap-2 font-normal",
            isActive && "border-primary/40 bg-primary/5 text-foreground",
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarRange className="text-muted-foreground" />
            <span className="truncate">
              {isActive ? formatDateRangeLabel(value) : "Filter Tanggal"}
            </span>
          </span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Filter Tanggal</p>
          <p className="text-xs text-muted-foreground">
            Saring data berdasarkan {basisLabel.toLowerCase()}.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3">
          {options.length > 1 ? (
            <div className="grid gap-1.5">
              <Label
                htmlFor={`${idPrefix}-date-basis`}
                className="text-xs text-muted-foreground"
              >
                Basis Tanggal
              </Label>
              <Select
                value={value.basis}
                onValueChange={(basis) => onChange({ ...value, basis })}
              >
                <SelectTrigger
                  id={`${idPrefix}-date-basis`}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant={isPresetActive(preset.range) ? "secondary" : "outline"}
                size="sm"
                className="justify-center font-normal"
                onClick={() => onChange({ ...value, ...preset.range })}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label
                htmlFor={`${idPrefix}-date-from`}
                className="text-xs text-muted-foreground"
              >
                Dari
              </Label>
              <Input
                id={`${idPrefix}-date-from`}
                type="date"
                value={value.from}
                max={value.to || undefined}
                onChange={(event) =>
                  onChange({ ...value, from: event.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor={`${idPrefix}-date-to`}
                className="text-xs text-muted-foreground"
              >
                Sampai
              </Label>
              <Input
                id={`${idPrefix}-date-to`}
                type="date"
                value={value.to}
                min={value.from || undefined}
                onChange={(event) =>
                  onChange({ ...value, to: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!isActive}
            onClick={() => onChange({ ...value, from: "", to: "" })}
          >
            Reset
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Terapkan
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
