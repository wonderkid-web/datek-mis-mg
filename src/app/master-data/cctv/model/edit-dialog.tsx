
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
import { updateCctvModel } from '@/lib/cctvModelService';
import { toast } from 'sonner';
import { CctvModel } from '@prisma/client';

interface EditModelDialogProps {
  model: CctvModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModelDialog({ model, open, onOpenChange }: EditModelDialogProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (model) {
      setValue(model.value);
    }
  }, [model]);

  const mutation = useMutation({
    mutationFn: (updatedModel: { id: number; value: string }) => updateCctvModel(updatedModel.id, { value: updatedModel.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvModels'] });
      toast.success('Model updated successfully!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Model with this name already exists.');
      } else {
        toast.error('Failed to update model.');
      }
    },
  });

  const handleSubmit = () => {
    if (!model) return;
    if (!value) {
      toast.error('Model name cannot be empty.');
      return;
    }
    mutation.mutate({ id: model.id, value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit CCTV Model</DialogTitle>
          <DialogDescription>
            Edit the CCTV model. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Model Name
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
