"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateIsp } from "@/lib/ispService";
import { IspClient } from "./page";
import ReactSelect from "react-select";
import { SBU_OPTIONS } from "@/lib/constants";
import { Isp } from "@prisma/client";

interface EditIspDialogProps {
  isp: IspClient | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditIspDialog({
  isp,
  isOpen,
  onOpenChange,
}: EditIspDialogProps) {
  const [formData, setFormData] = useState<Partial<IspClient>>({});

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isp) {
      setFormData(isp);
    }
  }, [isp]);
  
  const mutation = useMutation({
    mutationFn: (
      data: { id: number, ispData: Partial<Omit<Isp, "id" | "createdAt" | "updatedAt">> }
    ) => {
      return updateIsp(data.id, data.ispData);
    },
    onSuccess: () => {
      toast.success("ISP record updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["isps"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!isp) return;

    const { id, createdAt, updatedAt, ...rest } = formData;

    mutation.mutate({
      id: isp.id,
      ispData: {
        ...rest,
      },
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const sbuDropdownOptions = SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit ISP Record</DialogTitle>
          <DialogDescription>
            Update the details for the ISP record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
                {/* <div className="space-y-2">
                    <Label htmlFor="sbu">SBU</Label>
                    <ReactSelect
                        options={sbuDropdownOptions}
                        value={sbuDropdownOptions.find(opt => opt.value === formData.sbu)}
                        onChange={(opt) => setFormData(prev => ({...prev, sbu: opt?.value}))}
                        placeholder="Select SBU"
                        name="sbu"
                    />
                </div> */}
                <div className="space-y-2">
                    <Label htmlFor="isp">ISP</Label>
                    <Input id="isp" value={formData.isp || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="asNumber">AS Number</Label>
                    <Input id="asNumber" value={formData.asNumber || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={formData.address || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maps">Maps</Label>
                    <Input id="maps" value={formData.maps || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pop">POP</Label>
                    <Input id="pop" value={formData.pop || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="transmisi">Transmisi</Label>
                    <Input id="transmisi" value={formData.transmisi || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productService">Product Service</Label>
                    <Input id="productService" value={formData.productService || ''} onChange={handleChange} />
                </div>
                {/* <div className="space-y-2">
                    <Label htmlFor="bandwidth">Bandwidth</Label>
                    <Input id="bandwidth" value={formData.bandwidth || ''} onChange={handleChange} />
                </div> */}
                <div className="space-y-2">
                    <Label htmlFor="ipPublic">IP Public</Label>
                    <Input id="ipPublic" value={formData.ipPublic || ''} onChange={handleChange} />
                </div>
                {/* <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" value={formData.price || ''} onChange={handleChange} />
                </div> */}
                <div className="space-y-2">
                    <Label htmlFor="sla">SLA</Label>
                    <Input id="sla" value={formData.sla || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="picNoc">PIC NOC</Label>
                    <Input id="picNoc" value={formData.picNoc || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hpNoc">HP NOC</Label>
                    <Input id="hpNoc" value={formData.hpNoc || ''} onChange={handleChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="prtg">PRTG</Label>
                    <Input id="prtg" value={formData.prtg || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={formData.username || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="text" value={formData.password || ''} onChange={handleChange} />
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
