"use client";

import { useEffect, useState } from "react";
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

  const namaDepartemen = [
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
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const usersData = await getUsers();

    setUsers(usersData);
    setIsLoading(false);
  };

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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, sbu: user.sbu, department: user.department });
  };

  const handleDelete = async (id: string) => {
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
  };

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SBU</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={index % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.sbu}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          onClick={() => handleEdit(user)}
                          className="text-primary p-0 h-auto"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDelete(user.id!)}
                          className="ml-4 text-red-600 p-0 h-auto"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
