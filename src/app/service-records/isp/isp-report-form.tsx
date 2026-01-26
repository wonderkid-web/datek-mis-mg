"use client";

import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { IspReport, Isp, BandwidthType } from "@prisma/client";
import { IspClient } from "@/app/master-data/isp/page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect from "react-select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createIspReport, updateIspReport } from "@/lib/ispReportService";
import { getIsps } from "@/lib/ispService";
import { SBU_OPTIONS } from "@/lib/constants";

interface IspReportFormProps {
  onSave: () => void;
  initialData?: Partial<IspReport>;
}

export function IspReportForm({ onSave, initialData = {} }: IspReportFormProps) {
  const [formData, setFormData] = useState<Partial<IspReport & { reportDate: Date | undefined }>>({
    ...initialData,
    reportDate: initialData.reportDate ? new Date(initialData.reportDate) : undefined,
  });
  const queryClient = useQueryClient();

  const { data: ispsData, isLoading: isLoadingIsps } = useQuery<IspClient[]>({
    queryKey: ["isps"],
    queryFn: getIsps,
  });

  const mutation = useMutation({
    mutationFn: (data: Omit<IspReport, "id" | "createdAt" | "updatedAt">) => {
      if (initialData.id) {
        return updateIspReport(initialData.id, data);
      }
      return createIspReport(data);
    },
    onSuccess: () => {
      toast.success(`ISP report ${initialData.id ? "updated" : "added"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["ispReports"] });
      onSave();
      // Clear form only if adding new, not editing
      if (!initialData.id) {
        setFormData({ reportDate: undefined });
      }
    },
    onError: (error) => {
      toast.error(`Failed to ${initialData.id ? "update" : "add"} report: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.reportDate || !formData.sbu || !formData.ispId || !formData.bandwidth || !formData.downloadSpeed || !formData.uploadSpeed) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    const { id, createdAt, updatedAt, ...restOfFormData } = formData;

    mutation.mutate({
        ...restOfFormData,
        reportDate: formData.reportDate,
        downloadSpeed: Number(formData.downloadSpeed),
        uploadSpeed: Number(formData.uploadSpeed),
        ispId: Number(formData.ispId),
        bandwidth: formData.bandwidth as BandwidthType,
    } as Omit<IspReport, "id" | "createdAt" | "updatedAt">);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const sbuDropdownOptions = SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") }));
  const ispDropdownOptions = useMemo(() => {
    return ispsData?.map(isp => ({ value: isp.id, label: isp.isp })) || [];
  }, [ispsData]);
  const bandwidthOptions = [
    { value: BandwidthType.BROADBAND, label: "Broadband" },
    { value: BandwidthType.DEDICATED, label: "Dedicated" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData.id ? "Edit ISP Report" : "Add New ISP Report"}</CardTitle>
        <CardDescription>Fill in the form to {initialData.id ? "edit" : "add"} an ISP report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative pb-8">
        <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
                <Label htmlFor="reportDate">Report Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.reportDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.reportDate ? format(formData.reportDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={formData.reportDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, reportDate: date || undefined }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="sbu">SBU</Label>
                <ReactSelect
                    options={sbuDropdownOptions}
                    onChange={(opt) => setFormData(prev => ({...prev, sbu: opt?.value}))}
                    placeholder="Select SBU"
                    name="sbu"
                    value={sbuDropdownOptions.find(opt => opt.value === formData.sbu) || null}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ispId">ISP</Label>
                <ReactSelect
                    options={ispDropdownOptions}
                    onChange={(opt) => setFormData(prev => ({...prev, ispId: Number(opt?.value)}))}
                    placeholder="Select ISP"
                    name="ispId"
                    isLoading={isLoadingIsps}
                    value={ispDropdownOptions.find(opt => opt.value === formData.ispId) || null}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bandwidth">Bandwidth</Label>
                <ReactSelect
                    options={bandwidthOptions}
                    onChange={(opt) => setFormData(prev => ({...prev, bandwidth: opt?.value as BandwidthType}))}
                    placeholder="Select Bandwidth Type"
                    name="bandwidth"
                    value={bandwidthOptions.find(opt => opt.value === formData.bandwidth) || null}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="downloadSpeed">Download (Mbps)</Label>
                <Input id="downloadSpeed" type="number" value={formData.downloadSpeed || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="uploadSpeed">Upload (Mbps)</Label>
                <Input id="uploadSpeed" type="number" value={formData.uploadSpeed || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <Input id="link" value={formData.link || ''} onChange={handleChange} placeholder="Enter link" />
            </div>
        </div>

        <Button onClick={handleSubmit} disabled={mutation.isPending} className="absolute right-6">
          {mutation.isPending ? (initialData.id ? "Updating..." : "Saving...") : (initialData.id ? "Update Report" : "Save Report")}
        </Button>
      </CardContent>
    </Card>
  );
}
