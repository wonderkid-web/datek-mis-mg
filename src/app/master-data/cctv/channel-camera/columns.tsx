
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CctvChannelCamera } from '@prisma/client';

interface ColumnsProps {
  handleDelete: (id: number) => void;
  handleEdit: (channelCamera: CctvChannelCamera) => void;
}

export const columns = ({ handleDelete, handleEdit }: ColumnsProps): ColumnDef<CctvChannelCamera>[] => [
  {
    accessorKey: 'id',
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: 'lokasi',
    header: 'Location',
  },
  {
    accessorKey: 'sbu',
    header: 'SBU',
    cell: ({ row }) => row.original.sbu.replace(/_/g, " ")
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const channelCamera = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(channelCamera)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(channelCamera.id)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
