
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCctvDeviceType } from '@/lib/cctvDeviceTypeService';
import { toast } from 'sonner';
import { CctvDeviceType } from '@prisma/client';

interface EditDeviceTypeDialogProps {
  deviceType: CctvDeviceType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDeviceTypeDialog({ deviceType, open, onOpenChange }: EditDeviceTypeDialogProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (deviceType) {
      setValue(deviceType.value);
    }
  }, [deviceType]);

  const mutation = useMutation({
    mutationFn: (updatedDeviceType: { id: number; value: string }) => updateCctvDeviceType(updatedDeviceType.id, { value: updatedDeviceType.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvDeviceTypes'] });
      toast.success('Device type updated successfully!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Device type with this name already exists.');
      } else {
        toast.error('Failed to update device type.');
      }
    },
  });

  const handleSubmit = () => {
    if (!deviceType) return;
    if (!value) {
      toast.error('Device type name cannot be empty.');
      return;
    }
    mutation.mutate({ id: deviceType.id, value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit CCTV Device Type</DialogTitle>
          <DialogDescription>
            Edit the CCTV device type. Click save when {"you're"} done.
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
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
