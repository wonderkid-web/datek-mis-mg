'use client';

import { useEffect, useState } from 'react';
import { Department } from '@/lib/types';
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '@/lib/departmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<Omit<Department, 'id' | 'createdAt'>>({ name: '' });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    const departmentsData = await getDepartments();
    setDepartments(departmentsData);
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id!, form);
        toast.success('Department updated successfully!');
      } else {
        await createDepartment(form);
        toast.success('Department created successfully!');
      }
      setForm({ name: '' });
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setForm({ name: department.name });
  };

  const handleDelete = async (id: string) => {
    toast('Are you sure you want to delete this department?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          toast.promise(deleteDepartment(id), {
            loading: 'Deleting department...',
            success: () => {
              fetchDepartments();
              return 'Department deleted successfully!';
            },
            error: 'Failed to delete department.',
          });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.dismiss(),
      },
    });
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Manage Departments</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                <Input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <Button type="submit">{editingDepartment ? 'Update Department' : 'Add Department'}</Button>
              {editingDepartment && (
                <Button type="button" onClick={() => { setEditingDepartment(null); setForm({ name: '' }); }} className="ml-4">Cancel</Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading departments...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department, index) => (
                    <TableRow key={department.id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>
                        <Button variant="link" onClick={() => handleEdit(department)} className="text-primary p-0 h-auto">Edit</Button>
                        <Button variant="link" onClick={() => handleDelete(department.id!)} className="ml-4 text-red-600 p-0 h-auto">Delete</Button>
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
