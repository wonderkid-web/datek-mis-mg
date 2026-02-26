"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  createCallOutgoingOption,
  deleteCallOutgoingOption,
  getCallOutgoingOptions,
  updateCallOutgoingOption,
} from "@/lib/callOutgoingService";
import {
  createCoGroupOption,
  deleteCoGroupOption,
  getCoGroupOptions,
  updateCoGroupOption,
} from "@/lib/coGroupService";

type OptionItem = {
  id: number;
  value: string;
};

type OptionType = "call-outgoing" | "co-group";

const buildColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (item: OptionItem) => void;
  onDelete: (item: OptionItem) => void;
}): ColumnDef<OptionItem>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
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
    cell: ({ row }) => <div>{row.original.value}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function CallOutgoingCoGroupPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const queryClient = useQueryClient();

  const [callSearch, setCallSearch] = useState("");
  const [coGroupSearch, setCoGroupSearch] = useState("");

  const [createDialogType, setCreateDialogType] = useState<OptionType | null>(null);
  const [createValue, setCreateValue] = useState("");

  const [editDialogType, setEditDialogType] = useState<OptionType | null>(null);
  const [editItem, setEditItem] = useState<OptionItem | null>(null);
  const [editValue, setEditValue] = useState("");

  const [deleteDialogType, setDeleteDialogType] = useState<OptionType | null>(null);
  const [deleteItem, setDeleteItem] = useState<OptionItem | null>(null);

  const { data: callOutgoingOptions } = useQuery({
    queryKey: ["callOutgoingOptions"],
    queryFn: getCallOutgoingOptions,
  });

  const { data: coGroupOptions } = useQuery({
    queryKey: ["coGroupOptions"],
    queryFn: getCoGroupOptions,
  });

  const createCallOutgoingMutation = useMutation({
    mutationFn: createCallOutgoingOption,
    onSuccess: () => {
      toast.success("Call Outgoing option created.");
      queryClient.invalidateQueries({ queryKey: ["callOutgoingOptions"] });
      setCreateDialogType(null);
      setCreateValue("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create option."),
  });

  const createCoGroupMutation = useMutation({
    mutationFn: createCoGroupOption,
    onSuccess: () => {
      toast.success("CO Group option created.");
      queryClient.invalidateQueries({ queryKey: ["coGroupOptions"] });
      setCreateDialogType(null);
      setCreateValue("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create option."),
  });

  const updateCallOutgoingMutation = useMutation({
    mutationFn: (payload: { id: number; value: string }) =>
      updateCallOutgoingOption(payload.id, { value: payload.value }),
    onSuccess: () => {
      toast.success("Call Outgoing option updated.");
      queryClient.invalidateQueries({ queryKey: ["callOutgoingOptions"] });
      setEditDialogType(null);
      setEditItem(null);
      setEditValue("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update option."),
  });

  const updateCoGroupMutation = useMutation({
    mutationFn: (payload: { id: number; value: string }) =>
      updateCoGroupOption(payload.id, { value: payload.value }),
    onSuccess: () => {
      toast.success("CO Group option updated.");
      queryClient.invalidateQueries({ queryKey: ["coGroupOptions"] });
      setEditDialogType(null);
      setEditItem(null);
      setEditValue("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update option."),
  });

  const deleteCallOutgoingMutation = useMutation({
    mutationFn: deleteCallOutgoingOption,
    onSuccess: () => {
      toast.success("Call Outgoing option deleted.");
      queryClient.invalidateQueries({ queryKey: ["callOutgoingOptions"] });
      setDeleteDialogType(null);
      setDeleteItem(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete option."),
  });

  const deleteCoGroupMutation = useMutation({
    mutationFn: deleteCoGroupOption,
    onSuccess: () => {
      toast.success("CO Group option deleted.");
      queryClient.invalidateQueries({ queryKey: ["coGroupOptions"] });
      setDeleteDialogType(null);
      setDeleteItem(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete option."),
  });

  const filteredCallOutgoing = useMemo(() => {
    const items = callOutgoingOptions ?? [];
    if (!callSearch.trim()) return items;
    const query = callSearch.trim().toLowerCase();
    return items.filter((item) => item.value.toLowerCase().includes(query));
  }, [callOutgoingOptions, callSearch]);

  const filteredCoGroup = useMemo(() => {
    const items = coGroupOptions ?? [];
    if (!coGroupSearch.trim()) return items;
    const query = coGroupSearch.trim().toLowerCase();
    return items.filter((item) => item.value.toLowerCase().includes(query));
  }, [coGroupOptions, coGroupSearch]);

  const createDialogTitle =
    createDialogType === "call-outgoing" ? "Add Call Outgoing" : "Add CO Group";
  const editDialogTitle =
    editDialogType === "call-outgoing" ? "Edit Call Outgoing" : "Edit CO Group";

  const handleCreateSubmit = () => {
    const value = createValue.trim();
    if (!value) {
      toast.error("Value is required.");
      return;
    }
    if (createDialogType === "call-outgoing") {
      createCallOutgoingMutation.mutate({ value });
      return;
    }
    if (createDialogType === "co-group") {
      createCoGroupMutation.mutate({ value });
    }
  };

  const handleEditSubmit = () => {
    if (!editItem) return;
    const value = editValue.trim();
    if (!value) {
      toast.error("Value is required.");
      return;
    }
    if (editDialogType === "call-outgoing") {
      updateCallOutgoingMutation.mutate({ id: editItem.id, value });
      return;
    }
    if (editDialogType === "co-group") {
      updateCoGroupMutation.mutate({ id: editItem.id, value });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteItem || !deleteDialogType) return;
    if (deleteDialogType === "call-outgoing") {
      deleteCallOutgoingMutation.mutate(deleteItem.id);
      return;
    }
    deleteCoGroupMutation.mutate(deleteItem.id);
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Master Data Call Outgoing & CO Group</CardTitle>
          <CardDescription>
            Kelola opsi Call Outgoing dan CO Group untuk kebutuhan Akun Telepon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Search Call Outgoing..."
                value={callSearch}
                onChange={(event) => setCallSearch(event.target.value)}
                className="max-w-sm"
              />
              {isAdmin && (
                <Button
                  onClick={() => {
                    setCreateDialogType("call-outgoing");
                    setCreateValue("");
                  }}
                >
                  Add Call Outgoing
                </Button>
              )}
            </div>
            <DataTable
              columns={buildColumns({
                onEdit: (item) => {
                  setEditDialogType("call-outgoing");
                  setEditItem(item);
                  setEditValue(item.value);
                },
                onDelete: (item) => {
                  setDeleteDialogType("call-outgoing");
                  setDeleteItem(item);
                },
              })}
              data={filteredCallOutgoing}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Search CO Group..."
                value={coGroupSearch}
                onChange={(event) => setCoGroupSearch(event.target.value)}
                className="max-w-sm"
              />
              {isAdmin && (
                <Button
                  onClick={() => {
                    setCreateDialogType("co-group");
                    setCreateValue("");
                  }}
                >
                  Add CO Group
                </Button>
              )}
            </div>
            <DataTable
              columns={buildColumns({
                onEdit: (item) => {
                  setEditDialogType("co-group");
                  setEditItem(item);
                  setEditValue(item.value);
                },
                onDelete: (item) => {
                  setDeleteDialogType("co-group");
                  setDeleteItem(item);
                },
              })}
              data={filteredCoGroup}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={createDialogType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogType(null);
            setCreateValue("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{createDialogTitle}</DialogTitle>
            <DialogDescription>Input value baru lalu simpan perubahan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-value">Value</Label>
              <Input
                id="create-value"
                value={createValue}
                onChange={(event) => setCreateValue(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogType !== null && editItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogType(null);
            setEditItem(null);
            setEditValue("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editDialogTitle}</DialogTitle>
            <DialogDescription>Perbarui value lalu simpan perubahan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogType(null);
                setEditItem(null);
                setEditValue("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogType !== null && deleteItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogType(null);
            setDeleteItem(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete option?</AlertDialogTitle>
            <AlertDialogDescription>
              Option <strong>{deleteItem?.value}</strong> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
