"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User } from "@/lib/types";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "@/lib/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<Omit<User, "id" | "createdAt">>({
    name: "",
    sbu: "",
    department: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [sbus] = useState<string[]>([
    "PT Intan Sejati Andalan - PKS",
    "PT Intan Sejati Andalan - Refinery",
    "PT Intan Sejati Andalan - KCP",
    "PT Intan Sejati Andalan - TC",
    "PT Intan Sejati Andalan - Biogas",
    "PT Intan Sejati Andalan - FOF",
    "PT Intan Sejati Andalan - Solvent",
    "PT Intan Sejati Andalan - SSL",
    "PT Berlian Inti Mekar Palembang",
    "PT Berlian Inti Mekar Rengat",
    "PT Berlian Inti Mekar Siak",
    "PT Dumai Paricipta Abadi",
    "PT Karya Mitra Andalan",
    "PT Karya Pratama NiagaJaya",
    "PT Mutiara Unggul Lestari",
    "PT Mahkota Group, Tbk",
    "PT Intan Sejati Andalan - HO",
    "PT Berlian Inti Mekar Palembang - HO",
    "PT Berlian Inti Mekar Rengat - HO",
    "PT Berlian Inti Mekar Siak - HO",
    "PT Dumai Paricipta Abadi - HO",
    "PT Karya Mitra Andalan - HO",
    "PT Karya Pratama NiagaJaya - HO",
    "PT Mutiara Unggul Lestari - HO",
  ]);

  const [namaDepartemen] = useState<string[]>([
    "IK Biogas",
    "Halal",
    "IK Fraksinasi",
    "IK Refinery",
    "IK KCP",
    "Refinery",
    "IK-K3",
    "IK-Lingkungan",
    "IK-Mutu",
    "Admin SBU",
    "Document Control",
    "Storage Tank",
    "ISO/SMK3/ISPO",
    "Estate",
    "IK Proses PKS",
    "AUD - Internal Audit",
    "MS - Management System",
    "MKT - Marketing",
    "CS - Corporate Secretariat",
    "ISO 37001:2016 (SMAP)",
    "SSL - Social, Secure & License",
    "FNC - Finance",
    "HCM - Human Capital Management",
    "ACC & TAX - Accounting & TAX",
    "MIS - Manajemen Information System",
    "MH - Material Handling",
  ]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const usersData = await getUsers();

    setUsers(usersData);
    setIsLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id!, form);
        toast.success("User updated successfully!");
      } else {
        await createUser(form);
        toast.success("User created successfully!");
      }
      // @ts-expect-error gatau-kenapa
      setForm({ name: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, sbu: user.sbu, department: user.department });
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      toast("Are you sure you want to delete this user?", {
        action: {
          label: "Delete",
          onClick: async () => {
            toast.promise(deleteUser(id), {
              loading: "Deleting user...",
              success: () => {
                fetchUsers();
                return "User deleted successfully!";
              },
              error: "Failed to delete user.",
            });
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => toast.dismiss(),
        },
      });
    },
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "sbu",
        header: "SBU",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(row.original)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(row.original.id!)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manage Users</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-4">
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="sbu"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    SBU
                  </label>
                  <Select
                    onValueChange={(value) => setForm({ ...form, sbu: value })}
                    value={form.sbu}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select SBU" />
                    </SelectTrigger>
                    <SelectContent>
                      {sbus.map((sbu) => (
                        <SelectItem key={sbu} value={sbu}>
                          {sbu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="department"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Department
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setForm({ ...form, department: value })
                    }
                    value={form.department}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {namaDepartemen.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit">
                {editingUser ? "Update User" : "Add User"}
              </Button>
              {editingUser && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    // @ts-expect-error gatau-kenapa
                    setForm({ name: "" });
                  }}
                  className="ml-4"
                >
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading users...</p>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  {[...Array(table.getPageCount()).keys()].map((pageIdx) => (
                    <Button
                      key={pageIdx}
                      variant={table.getState().pagination.pageIndex === pageIdx ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex(pageIdx)}
                    >
                      {pageIdx + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
