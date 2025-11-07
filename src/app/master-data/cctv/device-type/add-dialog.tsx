
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCctvDeviceType } from '@/lib/cctvDeviceTypeService';
import { toast } from 'sonner';

export function AddDeviceTypeDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const mutation = useMutation({
    mutationFn: createCctvDeviceType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvDeviceTypes'] });
      toast.success('Device type created successfully!');
      setOpen(false);
      setValue('');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Device type with this name already exists.');
      } else {
        toast.error('Failed to create device type.');
      }
    },
  });

  const handleSubmit = () => {
    if (!value) {
      toast.error('Device type name cannot be empty.');
      return;
    }
    mutation.mutate({ value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Device Type</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New CCTV Device Type</DialogTitle>
          <DialogDescription>
            Add a new CCTV device type. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Device Type Name
            </Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
              required
            />
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
