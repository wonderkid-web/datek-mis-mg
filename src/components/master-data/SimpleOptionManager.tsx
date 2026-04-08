"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimpleOption {
  id: number;
  value: string;
}

interface SimpleOptionManagerProps<T extends SimpleOption> {
  title: string;
  searchPlaceholder: string;
  addLabel: string;
  queryKey: string;
  getOptions: () => Promise<T[]>;
  createOption: (data: { value: string }) => Promise<T>;
  updateOption: (id: number, data: { value: string }) => Promise<T>;
  deleteOption: (id: number) => Promise<void>;
}

export function SimpleOptionManager<T extends SimpleOption>({
  title,
  searchPlaceholder,
  addLabel,
  queryKey,
  getOptions,
  createOption,
  updateOption,
  deleteOption,
}: SimpleOptionManagerProps<T>) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [value, setValue] = useState("");
  const [editingOption, setEditingOption] = useState<T | null>(null);
  const [deletingOption, setDeletingOption] = useState<T | null>(null);

  const { data: options = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: getOptions,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isAddOpen) {
      setValue("");
    }
  }, [isAddOpen]);

  useEffect(() => {
    if (editingOption) {
      setValue(editingOption.value);
    }
  }, [editingOption]);

  const refreshOptions = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  const createMutation = useMutation({
    mutationFn: createOption,
    onSuccess: () => {
      refreshOptions();
      setIsAddOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { value: string } }) =>
      updateOption(id, data),
    onSuccess: () => {
      refreshOptions();
      setIsEditOpen(false);
      setEditingOption(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOption,
    onSuccess: () => {
      refreshOptions();
      setIsDeleteOpen(false);
      setDeletingOption(null);
    },
  });

  const filteredOptions = options.filter((option) =>
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<T>[] = [
    {
      accessorKey: "id",
      header: () => <div className="text-center">No</div>,
      cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const option = row.original;

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingOption(option);
                setIsEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeletingOption(option);
                setIsDeleteOpen(true);
              }}
            >
              <Trash className="h-4 w-4 text-red-600" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{addLabel}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{addLabel}</DialogTitle>
                <DialogDescription>
                  Tambahkan data baru lalu simpan perubahan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`${queryKey}-new-value`} className="text-right">
                    Value
                  </Label>
                  <Input
                    id={`${queryKey}-new-value`}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => createMutation.mutate({ value })}
                  disabled={createMutation.isPending || !value.trim()}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          columns={columns}
          data={filteredOptions}
          totalCount={filteredOptions.length}
        />

        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              setEditingOption(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit {title}</DialogTitle>
              <DialogDescription>
                Ubah nilai data master sesuai kebutuhan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`${queryKey}-edit-value`} className="text-right">
                  Value
                </Label>
                <Input
                  id={`${queryKey}-edit-value`}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  if (!editingOption) {
                    return;
                  }
                  updateMutation.mutate({
                    id: editingOption.id,
                    data: { value },
                  });
                }}
                disabled={updateMutation.isPending || !value.trim()}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete data?</AlertDialogTitle>
              <AlertDialogDescription>
                Data master yang dihapus tidak bisa dipulihkan otomatis.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingOption) {
                    deleteMutation.mutate(deletingOption.id);
                  }
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading ? <div className="mt-4 text-sm text-muted-foreground">Loading...</div> : null}
      </CardContent>
    </Card>
  );
}
