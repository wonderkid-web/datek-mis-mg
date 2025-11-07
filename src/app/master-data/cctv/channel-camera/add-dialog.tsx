
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCctvChannelCamera } from '@/lib/cctvChannelCameraService';
import { toast } from 'sonner';
import { Sbu } from '@prisma/client';

export function AddChannelCameraDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [lokasi, setLokasi] = useState('');
  const [sbu, setSbu] = useState<Sbu | ''>('');

  const mutation = useMutation({
    mutationFn: createCctvChannelCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvChannelCameras'] });
      toast.success('Channel camera created successfully!');
      setOpen(false);
      setLokasi('');
      setSbu('');
    },
    onError: () => {
      toast.error('Failed to create channel camera.');
    },
  });

  const handleSubmit = () => {
    if (!lokasi || !sbu) {
      toast.error('Location and SBU cannot be empty.');
      return;
    }
    mutation.mutate({ lokasi, sbu });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Channel Camera</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New CCTV Channel Camera</DialogTitle>
          <DialogDescription>
            Add a new CCTV channel camera. Click save when {"you're"} done.
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
                {Object.values(Sbu).map((sbuValue) => (
                  <SelectItem key={sbuValue} value={sbuValue}>
                    {sbuValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
