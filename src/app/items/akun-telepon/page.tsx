"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactSelect from "react-select";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getUsers } from "@/lib/userService";
import { getCallOutgoingOptions } from "@/lib/callOutgoingService";
import {
  createPhoneAccount,
  deletePhoneAccount,
  getPhoneAccounts,
  updatePhoneAccount,
} from "@/lib/phoneAccountService";

type UserOption = {
  id: number;
  namaLengkap: string;
  lokasiKantor: string | null;
  departemen: string | null;
};

type PhoneAccountRow = Awaited<ReturnType<typeof getPhoneAccounts>>[number];
type CallOutgoingOption = Awaited<ReturnType<typeof getCallOutgoingOptions>>[number];

type FormPayload = {
  userId: number | null;
  extension: string;
  account: string;
  codeDial: string;
  deposit: string;
  callOutgoingId: number | null;
};

const formatRupiah = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const buildColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (row: PhoneAccountRow) => void;
  onDelete: (row: PhoneAccountRow) => void;
}): ColumnDef<PhoneAccountRow>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "user.namaLengkap",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nama User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.user.namaLengkap,
  },
  {
    accessorKey: "user.lokasiKantor",
    header: "Corporate",
    cell: ({ row }) => row.original.user.lokasiKantor || "-",
  },
  {
    accessorKey: "user.departemen",
    header: "Department",
    cell: ({ row }) => row.original.user.departemen || "-",
  },
  {
    accessorKey: "extension",
    header: "Extension",
  },
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "codeDial",
    header: "Code Dial",
  },
  {
    accessorKey: "deposit",
    header: "Deposit",
    cell: ({ row }) => formatRupiah(row.original.deposit),
  },
  {
    accessorKey: "callOutgoingOption.value",
    header: "Callout Value",
    cell: ({ row }) => row.original.callOutgoingOption?.value ?? "-",
  },
  {
    accessorKey: "callOutgoingOption.line",
    header: "Line",
    cell: ({ row }) => row.original.callOutgoingOption?.line ?? "-",
  },
  {
    accessorKey: "callOutgoingOption.company",
    header: "Company",
    cell: ({ row }) => row.original.callOutgoingOption?.company ?? "-",
  },
  {
    id: "actions",
    header: "Actions",
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

const hasRequiredFields = (payload: FormPayload) =>
  Boolean(
    payload.userId &&
      payload.extension &&
      payload.account &&
      payload.codeDial &&
      payload.deposit &&
      payload.callOutgoingId
  );

const toNumericPayload = (payload: FormPayload) => {
  const extension = Number(payload.extension);
  const account = Number(payload.account);
  const deposit = Number(payload.deposit);

  if (!Number.isFinite(extension) || !Number.isFinite(account) || !Number.isFinite(deposit)) {
    return null;
  }

  return {
    userId: payload.userId!,
    extension,
    account,
    codeDial: payload.codeDial.trim(),
    deposit,
    callOutgoingId: payload.callOutgoingId!,
  };
};

export default function AkunTeleponPage() {
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState<number | null>(null);
  const [extension, setExtension] = useState("");
  const [account, setAccount] = useState("");
  const [codeDial, setCodeDial] = useState("");
  const [deposit, setDeposit] = useState("");
  const [callOutgoingId, setCallOutgoingId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [recordToEdit, setRecordToEdit] = useState<PhoneAccountRow | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editExtension, setEditExtension] = useState("");
  const [editAccount, setEditAccount] = useState("");
  const [editCodeDial, setEditCodeDial] = useState("");
  const [editDeposit, setEditDeposit] = useState("");
  const [editCallOutgoingId, setEditCallOutgoingId] = useState<number | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<PhoneAccountRow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: users } = useQuery<UserOption[]>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  const { data: callOutgoingOptions } = useQuery<CallOutgoingOption[]>({
    queryKey: ["callOutgoingOptions"],
    queryFn: () => getCallOutgoingOptions(),
  });

  const { data: phoneAccounts, isLoading } = useQuery<PhoneAccountRow[]>({
    queryKey: ["phone-accounts"],
    queryFn: () => getPhoneAccounts(),
  });

  const selectedUser = useMemo(() => {
    return users?.find((item) => item.id === userId) ?? null;
  }, [users, userId]);

  const selectedCallout = useMemo(() => {
    return callOutgoingOptions?.find((item) => item.id === callOutgoingId) ?? null;
  }, [callOutgoingOptions, callOutgoingId]);

  const selectedEditUser = useMemo(() => {
    return users?.find((item) => item.id === editUserId) ?? null;
  }, [users, editUserId]);

  const selectedEditCallout = useMemo(() => {
    return callOutgoingOptions?.find((item) => item.id === editCallOutgoingId) ?? null;
  }, [callOutgoingOptions, editCallOutgoingId]);

  useEffect(() => {
    if (!callOutgoingId && callOutgoingOptions?.length) {
      const defaultOption = callOutgoingOptions.find((item) => item.value === 12);
      if (defaultOption) {
        setCallOutgoingId(defaultOption.id);
      }
    }
  }, [callOutgoingOptions, callOutgoingId]);

  const resetCreateForm = () => {
    setUserId(null);
    setExtension("");
    setAccount("");
    setCodeDial("");
    setDeposit("");
    setCallOutgoingId(null);
  };

  const createMutation = useMutation({
    mutationFn: createPhoneAccount,
    onSuccess: () => {
      toast.success("Akun Telepon berhasil disimpan.");
      resetCreateForm();
      queryClient.invalidateQueries({ queryKey: ["phone-accounts"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan Akun Telepon.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: Parameters<typeof updatePhoneAccount>[1] }) =>
      updatePhoneAccount(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Akun Telepon berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["phone-accounts"] });
      setIsEditDialogOpen(false);
      setRecordToEdit(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui Akun Telepon.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhoneAccount,
    onSuccess: () => {
      toast.success("Akun Telepon berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["phone-accounts"] });
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus Akun Telepon.");
    },
  });

  const handleCreateSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const form: FormPayload = {
      userId,
      extension,
      account,
      codeDial,
      deposit,
      callOutgoingId,
    };

    if (!hasRequiredFields(form)) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    const payload = toNumericPayload(form);
    if (!payload) {
      toast.error("Extension, Account, dan Deposit harus berupa angka valid.");
      return;
    }

    createMutation.mutate(payload);
  };

  const openEditDialog = (record: PhoneAccountRow) => {
    setRecordToEdit(record);
    setEditUserId(record.userId);
    setEditExtension(String(record.extension));
    setEditAccount(String(record.account));
    setEditCodeDial(record.codeDial);
    setEditDeposit(String(record.deposit));
    setEditCallOutgoingId(record.callOutgoingId);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!recordToEdit) return;

    const form: FormPayload = {
      userId: editUserId,
      extension: editExtension,
      account: editAccount,
      codeDial: editCodeDial,
      deposit: editDeposit,
      callOutgoingId: editCallOutgoingId,
    };

    if (!hasRequiredFields(form)) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    const payload = toNumericPayload(form);
    if (!payload) {
      toast.error("Extension, Account, dan Deposit harus berupa angka valid.");
      return;
    }

    updateMutation.mutate({
      id: recordToEdit.id,
      data: payload,
    });
  };

  const filteredPhoneAccounts = useMemo(() => {
    if (!phoneAccounts) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return phoneAccounts;

    return phoneAccounts.filter((row) =>
      [
        row.user.namaLengkap,
        row.user.lokasiKantor ?? "",
        row.user.departemen ?? "",
        String(row.extension),
        String(row.account),
        row.codeDial,
        String(row.deposit),
        String(row.callOutgoingOption?.value ?? ""),
        String(row.callOutgoingOption?.line ?? ""),
        row.callOutgoingOption?.company ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [phoneAccounts, searchTerm]);

  const columns = useMemo(
    () =>
      buildColumns({
        onEdit: openEditDialog,
        onDelete: (row) => {
          setRecordToDelete(row);
          setIsDeleteDialogOpen(true);
        },
      }),
    []
  );

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Akun Telepon</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="space-y-2">
              <Label>Nama User</Label>
              <ReactSelect
                options={(users ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.namaLengkap,
                }))}
                value={
                  selectedUser
                    ? { value: String(selectedUser.id), label: selectedUser.namaLengkap }
                    : null
                }
                onChange={(option) => setUserId(option ? Number(option.value) : null)}
                placeholder="Pilih user dari employee"
              />
            </div>

            <div className="space-y-2">
              <Label>Corporate</Label>
              <Input value={selectedUser?.lokasiKantor ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={selectedUser?.departemen ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extension">Extension</Label>
              <Input
                id="extension"
                type="number"
                value={extension}
                onChange={(event) => setExtension(event.target.value)}
                placeholder="Input extension"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Input
                id="account"
                type="number"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="Input account"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeDial">Code Dial</Label>
              <Input
                id="codeDial"
                value={codeDial}
                onChange={(event) => setCodeDial(event.target.value)}
                placeholder="*47*EXTACC##NOTUJUAN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit (Nominal Rupiah)</Label>
              <Input
                id="deposit"
                type="number"
                min={0}
                value={deposit}
                onChange={(event) => setDeposit(event.target.value)}
                placeholder="Input nominal rupiah"
              />
            </div>

            <div className="space-y-2">
              <Label>Callout Going</Label>
              <Select
                value={callOutgoingId ? String(callOutgoingId) : undefined}
                onValueChange={(value) => setCallOutgoingId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih value Callout Going" />
                </SelectTrigger>
                <SelectContent>
                  {(callOutgoingOptions ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Line</Label>
              <Input value={selectedCallout ? String(selectedCallout.line) : ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={selectedCallout?.company ?? ""} disabled />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Akun Telepon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Akun Telepon</CardTitle>
              <CardDescription>Daftar akun telepon yang sudah tersimpan.</CardDescription>
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search..."
                className="w-full sm:w-64"
              />
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Add Akun Telepon
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable columns={columns} data={filteredPhoneAccounts} />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setRecordToEdit(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Akun Telepon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama User</Label>
              <ReactSelect
                options={(users ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.namaLengkap,
                }))}
                value={
                  selectedEditUser
                    ? { value: String(selectedEditUser.id), label: selectedEditUser.namaLengkap }
                    : null
                }
                onChange={(option) => setEditUserId(option ? Number(option.value) : null)}
                placeholder="Pilih user dari employee"
              />
            </div>

            <div className="space-y-2">
              <Label>Corporate</Label>
              <Input value={selectedEditUser?.lokasiKantor ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={selectedEditUser?.departemen ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Extension</Label>
              <Input
                type="number"
                value={editExtension}
                onChange={(event) => setEditExtension(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Account</Label>
              <Input
                type="number"
                value={editAccount}
                onChange={(event) => setEditAccount(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Code Dial</Label>
              <Input
                value={editCodeDial}
                onChange={(event) => setEditCodeDial(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Deposit (Nominal Rupiah)</Label>
              <Input
                type="number"
                min={0}
                value={editDeposit}
                onChange={(event) => setEditDeposit(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Callout Going</Label>
              <Select
                value={editCallOutgoingId ? String(editCallOutgoingId) : undefined}
                onValueChange={(value) => setEditCallOutgoingId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih value Callout Going" />
                </SelectTrigger>
                <SelectContent>
                  {(callOutgoingOptions ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Line</Label>
              <Input value={selectedEditCallout ? String(selectedEditCallout.line) : ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={selectedEditCallout?.company ?? ""} disabled />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Akun Telepon?</AlertDialogTitle>
            <AlertDialogDescription>
              Data untuk user {recordToDelete?.user.namaLengkap ?? "-"} akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!recordToDelete) return;
                deleteMutation.mutate(recordToDelete.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
