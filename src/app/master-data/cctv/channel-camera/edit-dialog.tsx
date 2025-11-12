
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCctvChannelCamera } from '@/lib/cctvChannelCameraService';
import { toast } from 'sonner';
import { CctvChannelCamera, Sbu } from '@prisma/client';
import { SBU_OPTIONS } from '@/lib/constants';

interface EditChannelCameraDialogProps {
  channelCamera: CctvChannelCamera | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditChannelCameraDialog({ channelCamera, open, onOpenChange }: EditChannelCameraDialogProps) {
  const queryClient = useQueryClient();
  const [lokasi, setLokasi] = useState('');
  const [sbu, setSbu] = useState<Sbu | ''>('');

  useEffect(() => {
    if (channelCamera) {
      setLokasi(channelCamera.lokasi);
      setSbu(channelCamera.sbu as Sbu);
    }
  }, [channelCamera]);

  const mutation = useMutation({
    mutationFn: (updatedData: { id: number; lokasi: string; sbu: Sbu }) => updateCctvChannelCamera(updatedData.id, { lokasi: updatedData.lokasi, sbu: updatedData.sbu }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvChannelCameras'] });
      toast.success('Channel camera updated successfully!');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update channel camera.');
    },
  });

  const handleSubmit = () => {
    if (!channelCamera) return;
    if (!lokasi || !sbu) {
      toast.error('Location and SBU cannot be empty.');
      return;
    }
    mutation.mutate({ id: channelCamera.id, lokasi, sbu });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit CCTV Channel Camera</DialogTitle>
          <DialogDescription>
            Edit the CCTV channel camera. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lokasi" className="text-right">
              Location
            </Label>
            <Input
              id="lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sbu" className="text-right">
              SBU
            </Label>
            <Select onValueChange={(value) => setSbu(value as Sbu)} value={sbu}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an SBU" />
              </SelectTrigger>
              <SelectContent>
                {SBU_OPTIONS.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
