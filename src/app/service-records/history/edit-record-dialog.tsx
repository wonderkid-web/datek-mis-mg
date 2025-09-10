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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceRecordWithDetails } from '@/lib/types';
import { updateServiceRecord } from '@/lib/serviceRecordService';
import { toast } from 'sonner';

interface EditRecordDialogProps {
  record: ServiceRecordWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const formatRupiah = (amount: number | string): string => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount.replace(/[^0-9,-]+/g, '').replace(',', '.'));
    }
    if (isNaN(amount)) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const parseRupiah = (rupiahString: string): number => {
    const cleanString = rupiahString.replace(/[^0-9]/g, '');
    return parseInt(cleanString, 10) || 0;
  };

export function EditRecordDialog({
  record,
  open,
  onOpenChange,
  onSave,
}: EditRecordDialogProps) {
  const [ticketHelpdesk, setTicketHelpdesk] = useState('');
  const [repairType, setRepairType] = useState<'SUPPLIER' | 'INTERNAL'>('INTERNAL');
  const [cost, setCost] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (record) {
      setTicketHelpdesk(record.ticketHelpdesk);
      setRepairType(record.repairType as 'SUPPLIER' | 'INTERNAL');
      setCost(formatRupiah(record.cost.toString()));
      setRemarks(record.remarks || '');
    }
  }, [record]);

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    setCost(formatRupiah(numericValue));
  };

  const handleSubmit = async () => {
    if (!record) return;

    try {
      await updateServiceRecord(record.id, {
        ticketHelpdesk,
        repairType,
        cost: parseRupiah(cost),
        remarks,
      });
      toast.success('Record updated successfully!');
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update service record:', error);
      toast.error('Failed to update the record.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
          <DialogDescription>
            Update the details for this service record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketHelpdesk-edit" className="text-right">
              Ticket
            </Label>
            <Input
              id="ticketHelpdesk-edit"
              value={ticketHelpdesk}
              onChange={(e) => setTicketHelpdesk(e.target.value.toUpperCase())}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repairType-edit" className="text-right">
              Type
            </Label>
            <Select
              onValueChange={(value: 'SUPPLIER' | 'INTERNAL') => setRepairType(value)}
              value={repairType}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPPLIER">SUPPLIER</SelectItem>
                <SelectItem value="INTERNAL">INTERNAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost-edit" className="text-right">
              Cost
            </Label>
            <Input
              id="cost-edit"
              value={cost}
              onChange={handleCostChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remarks-edit" className="text-right">
              Remarks
            </Label>
            <Textarea
              id="remarks-edit"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value.toUpperCase())}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
