"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import ReactSelect from "react-select";

import { ProblemSequenceWithIsp } from "@/lib/types";
import { SBU_OPTIONS } from "@/lib/constants";
import { getIsps } from "@/lib/ispService";
import {
  createProblemSequence,
  updateProblemSequence,
  getNextProblemSequenceTicketNumber,
} from "@/lib/problemSequenceService";
import { Isp } from "@prisma/client";

interface ProblemSequenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValue?: ProblemSequenceWithIsp | null;
}

const selectStyles = {
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
  }),
};

const formatSla = (start?: Date | null, end?: Date | null) => {
  if (!start || !end) return "";
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export function ProblemSequenceForm({ open, onOpenChange, defaultValue }: ProblemSequenceFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(defaultValue);
  const { data: isps } = useQuery<Isp[]>({ queryKey: ["isps"], queryFn: getIsps });
  const { data: nextTicket } = useQuery({
    queryKey: ["problemSequence", "next-ticket"],
    queryFn: getNextProblemSequenceTicketNumber,
    enabled: !isEditing,
  });

  const [sbu, setSbu] = useState<string>(defaultValue?.sbu ?? "");
  const [ispId, setIspId] = useState<number | null>(defaultValue?.ispId ?? null);
  const [ticketNumber, setTicketNumber] = useState<string>(defaultValue?.ticketNumber ?? "");
  const [pic, setPic] = useState<string>(defaultValue?.pic ?? "");
  const [dateDown, setDateDown] = useState<Date | null>(defaultValue?.dateDown ? new Date(defaultValue.dateDown) : null);
  const [dateDoneUp, setDateDoneUp] = useState<Date | null>(defaultValue?.dateDoneUp ? new Date(defaultValue.dateDoneUp) : null);
  const [issue, setIssue] = useState(defaultValue?.issue ?? "");
  const [trouble, setTrouble] = useState(defaultValue?.trouble ?? "");
  const [solved, setSolved] = useState(defaultValue?.solved ?? "");

  useEffect(() => {
    if (open) {
      setSbu(defaultValue?.sbu ?? "");
      setIspId(defaultValue?.ispId ?? null);
      setTicketNumber(defaultValue?.ticketNumber ?? "");
      setPic(defaultValue?.pic ?? "");
      setDateDown(defaultValue?.dateDown ? new Date(defaultValue.dateDown) : null);
      setDateDoneUp(defaultValue?.dateDoneUp ? new Date(defaultValue.dateDoneUp) : null);
      setIssue(defaultValue?.issue ?? "");
      setTrouble(defaultValue?.trouble ?? "");
      setSolved(defaultValue?.solved ?? "");
    } else {
      setSbu("");
      setIspId(null);
      setTicketNumber("");
      setPic("");
      setDateDown(null);
      setDateDoneUp(null);
      setIssue("");
      setTrouble("");
      setSolved("");
    }
  }, [open, defaultValue]);

  useEffect(() => {
    if (!isEditing && nextTicket) {
      setTicketNumber(nextTicket);
    }
  }, [isEditing, nextTicket]);

  useEffect(() => {
    if (!ispId) {
      setPic("");
      return;
    }
    const currentIsp = isps?.find((isp) => isp.id === ispId);
    if (currentIsp) {
      setPic(currentIsp.hpNoc);
    }
  }, [ispId, isps]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing && defaultValue) {
        return updateProblemSequence(defaultValue.id, payload);
      }
      return createProblemSequence(payload);
    },
    onSuccess: () => {
      toast.success(`Problem ${defaultValue ? "updated" : "created"} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["problem-sequences"] });
      queryClient.invalidateQueries({ queryKey: ["problemSequence", "next-ticket"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save problem ticket.");
    },
  });

  const canSubmit = useMemo(() => {
    return Boolean(
      sbu && ispId && pic && dateDown && dateDoneUp && issue && trouble && solved
    );
  }, [sbu, ispId, pic, dateDown, dateDoneUp, issue, trouble, solved]);

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.warning("Please fill all fields.");
      return;
    }

    const payload: any = {
      sbu,
      ispId: ispId!,
      pic,
      dateDown: dateDown?.toISOString(),
      dateDoneUp: dateDoneUp?.toISOString(),
      issue,
      trouble,
      solved,
    };

    if (isEditing && ticketNumber) {
      payload.ticketNumber = ticketNumber;
    }

    mutation.mutate(payload);
  };

  const selectedIsp = isps?.find((isp) => isp.id === ispId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{defaultValue ? "Edit Problem Ticket" : "Create Problem Ticket"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>No Tiket</Label>
            <Input value={ticketNumber} disabled placeholder="MG/MIS/0001" />
          </div>
          <div className="grid gap-2">
            <Label>SBU</Label>
            <ReactSelect
              styles={selectStyles}
              value={sbu ? { value: sbu, label: sbu.replace(/_/g, " ") } : null}
              onChange={(option) => setSbu(option?.value ?? "")}
              options={SBU_OPTIONS.map((value) => ({ value, label: value.replace(/_/g, " ") }))}
              placeholder="Select SBU"
            />
          </div>
          <div className="grid gap-2">
            <Label>ISP</Label>
            <UiSelect value={ispId ? String(ispId) : undefined} onValueChange={(value) => setIspId(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select ISP" />
              </SelectTrigger>
              <SelectContent>
                {isps?.map((isp) => (
                  <SelectItem key={isp.id} value={String(isp.id)}>
                    {isp.isp}
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>
          <div className="grid gap-2">
            <Label>PIC</Label>
            <Input value={pic} disabled placeholder="PIC from HP NOC" />
            <p className="text-xs text-muted-foreground">Auto-filled from ISP HP NOC: {selectedIsp?.hpNoc ?? "-"}</p>
          </div>
          <div className="grid gap-2">
            <Label>Date Down</Label>
            <Input type="datetime-local" value={dateDown ? format(dateDown, "yyyy-MM-dd'T'HH:mm") : ""} onChange={(event) => setDateDown(event.target.value ? new Date(event.target.value) : null)} />
          </div>
          <div className="grid gap-2">
            <Label>Done Up</Label>
            <Input type="datetime-local" value={dateDoneUp ? format(dateDoneUp, "yyyy-MM-dd'T'HH:mm") : ""} onChange={(event) => setDateDoneUp(event.target.value ? new Date(event.target.value) : null)} />
          </div>
          <div className="grid gap-2">
            <Label>Issue</Label>
            <Textarea value={issue} onChange={(event) => setIssue(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Trouble</Label>
            <Textarea value={trouble} onChange={(event) => setTrouble(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Solved</Label>
            <Textarea value={solved} onChange={(event) => setSolved(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>SLA</Label>
            <Input disabled value={formatSla(dateDown, dateDoneUp)} />
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
