
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
import { createCctvBrand } from '@/lib/cctvBrandService';
import { toast } from 'sonner';

export function AddBrandDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const mutation = useMutation({
    mutationFn: createCctvBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvBrands'] });
      toast.success('Brand created successfully!');
      setOpen(false);
      setValue('');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Brand with this name already exists.');
      } else {
        toast.error('Failed to create brand.');
      }
    },
  });

  const handleSubmit = () => {
    if (!value) {
      toast.error('Brand name cannot be empty.');
      return;
    }
    mutation.mutate({ value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Brand</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New CCTV Brand</DialogTitle>
          <DialogDescription>
            Add a new CCTV brand. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Brand Name
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
