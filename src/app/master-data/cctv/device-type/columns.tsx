
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CctvDeviceType } from '@prisma/client';

interface ColumnsProps {
  handleDelete: (id: number) => void;
  handleEdit: (deviceType: CctvDeviceType) => void;
}

export const columns = ({ handleDelete, handleEdit }: ColumnsProps): ColumnDef<CctvDeviceType>[] => [
  {
    accessorKey: 'id',
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: 'value',
    header: 'Device Type Name',
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const deviceType = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(deviceType)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(deviceType.id)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
