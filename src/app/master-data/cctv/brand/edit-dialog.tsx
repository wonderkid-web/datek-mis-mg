
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
import { updateCctvBrand } from '@/lib/cctvBrandService';
import { toast } from 'sonner';
import { CctvBrand } from '@prisma/client';

interface EditBrandDialogProps {
  brand: CctvBrand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBrandDialog({ brand, open, onOpenChange }: EditBrandDialogProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (brand) {
      setValue(brand.value);
    }
  }, [brand]);

  const mutation = useMutation({
    mutationFn: (updatedBrand: { id: number; value: string }) => updateCctvBrand(updatedBrand.id, { value: updatedBrand.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctvBrands'] });
      toast.success('Brand updated successfully!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Brand with this name already exists.');
      } else {
        toast.error('Failed to update brand.');
      }
    },
  });

  const handleSubmit = () => {
    if (!brand) return;
    if (!value) {
      toast.error('Brand name cannot be empty.');
      return;
    }
    mutation.mutate({ id: brand.id, value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit CCTV Brand</DialogTitle>
          <DialogDescription>
            Edit the CCTV brand. Click save when {"you're"} done.
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
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
