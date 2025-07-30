"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
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

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const users = await getUsers();
        {/* @ts-expect-error its okay */}
      setData(users.filter(user => !user.isDeleted)); // Filter out soft-deleted users
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteDialog = (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
          {/* @ts-expect-error its okay */}
        await deleteUser(userToDelete);
        fetchData(); // Refresh data
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: User) => {
    router.push(`/employee/${user.id}`);
  };

  const filteredData = data.filter((user) =>
    user.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.departemen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.jabatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lokasiKantor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
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
        <AddUserDialog onSave={fetchData} />
      </div>
        {/* @ts-expect-error its okay */}
      <DataTable columns={columns({ handleDelete: openDeleteDialog, handleEdit, handleView })} data={filteredData} totalCount={filteredData.length} />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onSave={() => {
            fetchData();
            setEditingUser(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the user as deleted and they will no longer be active in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
