"use client";

import { useEffect, useState } from "react";
import { AssetAssignment } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "@/app/master-data/laptop/ram-options/data-table"; // Reusing DataTable
import { AddAssignmentDialog } from "./add-assignment-dialog";
import { EditAssignmentDialog } from "./edit-assignment-dialog";
import { getAssignments, deleteAssignment } from "@/lib/assignmentService"; // Import service functions

export default function AssignmentsPage() {
  const [data, setData] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState<AssetAssignment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
  
    setLoading(true);
    try {
      const assignments = await getAssignments(); // Use service function directly
      setData(assignments as AssetAssignment[]); // Cast to AssetAssignment[]
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteAssignment(id); // Use service function directly
      fetchData(); // Refresh data after successful deletion
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleEdit = (assignment: AssetAssignment) => {
    setEditingAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Manage Asset Assignments</h1>
      <div className="flex justify-end mb-4">
        <AddAssignmentDialog onSave={fetchData} />
      </div>
      <DataTable columns={columns({ handleDelete, handleEdit })} data={data} />

      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          onSave={() => {
            fetchData();
            setEditingAssignment(null);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
