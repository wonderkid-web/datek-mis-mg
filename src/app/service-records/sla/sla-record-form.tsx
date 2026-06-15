"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Isp } from "@prisma/client";
import ReactSelect from "react-select";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SBU_OPTIONS } from "@/lib/constants";
import {
  createIspSlaRecord,
  updateIspSlaRecord,
  type IspSlaRecordInput,
} from "@/lib/ispSlaRecordService";
import { getIsps } from "@/lib/ispService";
import {
  SLA_MONTH_OPTIONS,
  buildSlaSbuOptions,
  durationPartsToSeconds,
  formatDurationSeconds,
  normalizeSlaSbuValue,
  sanitizeDurationDays,
  sanitizeDurationHours,
  sanitizeDurationMinutes,
  sanitizeDurationSeconds,
  splitDurationSeconds,
  type DurationParts,
} from "@/lib/ispSlaUtils";

import { IspSlaRecordWithIsp } from "./types";

interface SlaRecordFormProps {
  onSave: () => void;
  initialData?: Partial<IspSlaRecordWithIsp>;
}

type DurationKey = keyof DurationParts;
type DurationGroupKey = "uptime" | "downtime";

type SlaRecordFormState = {
  sbu?: string;
  month?: number;
  year: string;
  ispId?: number;
  contract: string;
  actualisation: string;
  remarks: string;
  uptime: DurationParts;
  downtime: DurationParts;
};

const EMPTY_DURATION_PARTS: DurationParts = {
  days: "0",
  hours: "0",
  minutes: "0",
  seconds: "0",
};

const getCurrentYear = () => new Date().getFullYear().toString();

const buildFormState = (
  initialData?: Partial<IspSlaRecordWithIsp>
): SlaRecordFormState => ({
  sbu: initialData?.sbu ? normalizeSlaSbuValue(initialData.sbu) : undefined,
  month: initialData?.month ?? undefined,
  year: initialData?.year ? String(initialData.year) : getCurrentYear(),
  ispId: initialData?.ispId ?? undefined,
  contract: initialData?.contract ?? "",
  actualisation:
    initialData?.actualisation !== undefined && initialData.actualisation !== null
      ? String(initialData.actualisation)
      : "",
  remarks: initialData?.remarks ?? "",
  uptime: initialData?.uptimeSeconds !== undefined
    ? splitDurationSeconds(initialData.uptimeSeconds)
    : { ...EMPTY_DURATION_PARTS },
  downtime: initialData?.downtimeSeconds !== undefined
    ? splitDurationSeconds(initialData.downtimeSeconds)
    : { ...EMPTY_DURATION_PARTS },
});

const clampDurationUnit = (value: string) => {
  if (!value) return "0";
  return String(Math.min(Number(value), 59));
};

type DurationInputGroupProps = {
  label: string;
  value: DurationParts;
  preview: string;
  onChange: (part: DurationKey, nextValue: string) => void;
  onBlur: (part: Exclude<DurationKey, "days">) => void;
};

function DurationInputGroup({
  label,
  value,
  preview,
  onChange,
  onBlur,
}: DurationInputGroupProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{preview}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`${label}-days`}>Hari</Label>
          <Input
            id={`${label}-days`}
            inputMode="numeric"
            value={value.days}
            onChange={(event) => onChange("days", sanitizeDurationDays(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${label}-hours`}>Jam</Label>
          <Input
            id={`${label}-hours`}
            inputMode="numeric"
            value={value.hours}
            onChange={(event) => onChange("hours", sanitizeDurationHours(event.target.value))}
            onBlur={() => onBlur("hours")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${label}-minutes`}>Menit</Label>
          <Input
            id={`${label}-minutes`}
            inputMode="numeric"
            value={value.minutes}
            onChange={(event) => onChange("minutes", sanitizeDurationMinutes(event.target.value))}
            onBlur={() => onBlur("minutes")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${label}-seconds`}>Detik</Label>
          <Input
            id={`${label}-seconds`}
            inputMode="numeric"
            value={value.seconds}
            onChange={(event) => onChange("seconds", sanitizeDurationSeconds(event.target.value))}
            onBlur={() => onBlur("seconds")}
          />
        </div>
      </div>
    </div>
  );
}

export function SlaRecordForm({ onSave, initialData }: SlaRecordFormProps) {
  const isEditing = Boolean(initialData?.id);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SlaRecordFormState>(() =>
    buildFormState(initialData)
  );

  useEffect(() => {
    setFormData(buildFormState(initialData));
  }, [
    initialData?.id,
    initialData?.updatedAt,
    initialData?.ispId,
    initialData?.actualisation,
    initialData?.uptimeSeconds,
    initialData?.downtimeSeconds,
    initialData?.remarks,
    initialData?.month,
    initialData?.year,
    initialData?.contract,
    initialData?.sbu,
  ]);

  const { data: ispsData, isLoading: isLoadingIsps } = useQuery<Isp[]>({
    queryKey: ["isps"],
    queryFn: getIsps,
  });

  const selectedIsp = useMemo(
    () => ispsData?.find((isp) => isp.id === formData.ispId) ?? null,
    [ispsData, formData.ispId]
  );

  useEffect(() => {
    if (!selectedIsp) return;
    if (formData.contract === selectedIsp.sla) return;

    setFormData((prev) => ({
      ...prev,
      contract: selectedIsp.sla,
    }));
  }, [selectedIsp, formData.contract]);

  const mutation = useMutation({
    mutationFn: (payload: IspSlaRecordInput) => {
      if (initialData?.id) {
        return updateIspSlaRecord(initialData.id, payload);
      }
      return createIspSlaRecord(payload);
    },
    onSuccess: () => {
      toast.success(`Data SLA ${isEditing ? "berhasil diperbarui" : "berhasil ditambahkan"}.`);
      queryClient.invalidateQueries({ queryKey: ["ispSlaRecords"] });
      onSave();

      if (!isEditing) {
        setFormData(buildFormState(undefined));
      }
    },
    onError: (error) => {
      toast.error(
        `Gagal ${isEditing ? "memperbarui" : "menambahkan"} data SLA: ${error.message}`
      );
    },
  });

  const sbuOptions = useMemo(() => buildSlaSbuOptions(SBU_OPTIONS), []);

  const ispOptions = useMemo(
    () =>
      (ispsData ?? []).map((isp: Isp) => ({
        value: isp.id,
        label: isp.isp,
        contract: isp.sla,
      })),
    [ispsData]
  );

  const uptimePreview = useMemo(
    () => formatDurationSeconds(durationPartsToSeconds(formData.uptime)),
    [formData.uptime]
  );

  const downtimePreview = useMemo(
    () => formatDurationSeconds(durationPartsToSeconds(formData.downtime)),
    [formData.downtime]
  );

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDurationChange = (
    group: DurationGroupKey,
    part: DurationKey,
    nextValue: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [part]: nextValue,
      },
    }));
  };

  const handleDurationBlur = (
    group: DurationGroupKey,
    part: Exclude<DurationKey, "days">
  ) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [part]: clampDurationUnit(prev[group][part]),
      },
    }));
  };

  const handleSubmit = () => {
    const year = Number(formData.year);
    const actualisation = Number(formData.actualisation);

    if (!formData.sbu || !formData.month || !formData.ispId) {
      toast.error("SBU, bulan, tahun, dan ISP wajib diisi.");
      return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 9999) {
      toast.error("Tahun harus valid.");
      return;
    }

    if (!Number.isFinite(actualisation) || actualisation < 0 || actualisation > 100) {
      toast.error("Actualisation harus di antara 0 sampai 100.");
      return;
    }

    mutation.mutate({
      sbu: formData.sbu,
      month: formData.month,
      year,
      ispId: formData.ispId,
      actualisation,
      uptimeSeconds: durationPartsToSeconds(formData.uptime),
      downtimeSeconds: durationPartsToSeconds(formData.downtime),
      remarks: formData.remarks,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Data SLA" : "Tambah Data SLA"}</CardTitle>
        <CardDescription>
          Isi data actualisation, uptime, dan downtime bulanan ISP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              min="2000"
              max="9999"
              value={formData.year}
              onChange={handleTextChange}
              placeholder="Contoh: 2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <ReactSelect
              options={SLA_MONTH_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Pilih Bulan"
              value={
                SLA_MONTH_OPTIONS.find((option) => option.value === formData.month)
                  ? {
                      value: formData.month!,
                      label: SLA_MONTH_OPTIONS.find(
                        (option) => option.value === formData.month
                      )!.label,
                    }
                  : null
              }
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  month: option?.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sbu">SBU</Label>
            <ReactSelect
              options={sbuOptions}
              placeholder="Pilih SBU"
              value={sbuOptions.find((option) => option.value === formData.sbu) ?? null}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  sbu: option?.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ispId">ISP</Label>
            <ReactSelect
              options={ispOptions}
              isLoading={isLoadingIsps}
              placeholder="Pilih ISP"
              value={ispOptions.find((option) => option.value === formData.ispId) ?? null}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  ispId: option?.value,
                  contract: option?.contract ?? "",
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract">Contract</Label>
            <Input
              id="contract"
              value={formData.contract}
              readOnly
              placeholder="Otomatis dari master ISP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualisation">Actualisation (%)</Label>
            <Input
              id="actualisation"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.actualisation}
              onChange={handleTextChange}
              placeholder="Contoh: 82"
            />
          </div>
        </div>

        <DurationInputGroup
          label="Uptime"
          value={formData.uptime}
          preview={uptimePreview}
          onChange={(part, nextValue) => handleDurationChange("uptime", part, nextValue)}
          onBlur={(part) => handleDurationBlur("uptime", part)}
        />

        <DurationInputGroup
          label="Downtime"
          value={formData.downtime}
          preview={downtimePreview}
          onChange={(part, nextValue) => handleDurationChange("downtime", part, nextValue)}
          onBlur={(part) => handleDurationBlur("downtime", part)}
        />

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={handleTextChange}
            placeholder="Tulis catatan tambahan jika diperlukan"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending
              ? isEditing
                ? "Updating..."
                : "Saving..."
              : isEditing
                ? "Update SLA"
                : "Save SLA"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
