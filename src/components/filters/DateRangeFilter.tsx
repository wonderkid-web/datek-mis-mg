"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isDateRangeFilterActive,
  type DateRangeFilterValue,
} from "@/lib/dateRangeFilter";
import { cn } from "@/lib/utils";

export interface DateBasisOption {
  value: string;
  label: string;
}

interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  /** Bila hanya satu opsi, dropdown basis tanggal disembunyikan. */
  options: DateBasisOption[];
  idPrefix: string;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  options,
  idPrefix,
  className,
}: DateRangeFilterProps) {
  const isActive = isDateRangeFilterActive(value);
  const singleOption = options.length <= 1;

  return (
    <div className={cn("flex flex-wrap items-end gap-2", className)}>
      {singleOption ? null : (
        <div className="grid gap-1">
          <Label
            htmlFor={`${idPrefix}-date-basis`}
            className="text-xs text-muted-foreground"
          >
            Filter Date
          </Label>
          <Select
            value={value.basis}
            onValueChange={(basis) => onChange({ ...value, basis })}
          >
            <SelectTrigger id={`${idPrefix}-date-basis`} className="w-[190px]">
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
      )}

      <div className="grid gap-1">
        <Label
          htmlFor={`${idPrefix}-date-from`}
          className="text-xs text-muted-foreground"
        >
          {singleOption ? `${options[0]?.label ?? "Date"} dari` : "Dari"}
        </Label>
        <Input
          id={`${idPrefix}-date-from`}
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
          className="w-[165px]"
        />
      </div>

      <div className="grid gap-1">
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
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          className="w-[165px]"
        />
      </div>

      {isActive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...value, from: "", to: "" })}
        >
          Reset
        </Button>
      ) : null}
    </div>
  );
}
