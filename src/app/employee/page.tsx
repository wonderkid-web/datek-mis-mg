"use client";

import { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddUserDialog } from "./add-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { getUsers, deleteUser } from "@/lib/userService";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  id: number;
  namaLengkap: string;
  email: string | null;
  departemen: string | null;
  jabatan: string | null;
  lokasiKantor: string | null;
  isActive: boolean;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const fetchedUsers = await getUsers();
      return fetchedUsers;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (idToDelete) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot the previous values
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      // Optimistically update to the new value
      queryClient.setQueryData<User[]>(["users"], (old) =>
        old ? old.filter((user) => user.id !== Number(idToDelete)) : []
      );

      return { previousUsers };
    },
    onSuccess: () => {
      toast.success("User deleted successfully!");
    },
    onError: (err, idToDelete, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(["users"], context?.previousUsers);
      console.error("An error occurred:", err);
      toast.error("Failed to delete user.");
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const openDeleteDialog = (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      deleteUserMutation.mutate(Number(userToDelete));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: User) => {
    router.push(`/employee/${user.id}`);
  };

  const filteredData =
    users?.filter(
      (user) =>
        user.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.departemen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.jabatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lokasiKantor?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
        <AddUserDialog
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
          }}
        />
      </div>
      <DataTable
        columns={columns({
          handleDelete: openDeleteDialog,
          handleEdit,
          // @ts-expect-error its okay
          handleView,
        })}
        data={filteredData}
        totalCount={filteredData.length}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setEditingUser(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the user as deleted and they will no longer
              be active in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
