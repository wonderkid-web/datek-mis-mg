"use client";

import { useEffect, useState } from "react";
import { getAssignments } from "@/lib/assignmentService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AssetAssignment } from "@prisma/client";
import { EditAssignmentDialog } from "@/app/assignments/edit-assignment-dialog";
import { ReturnAssignmentDialog } from "@/app/assignments/return-assignment-dialog";
import { ViewAssignmentDialog } from "@/app/assignments/view-assignment-dialog"; // New import

export default function AssignedUsersPage() {
  const [assignedAssets, setAssignedAssets] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState<AssetAssignment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [returningAssignment, setReturningAssignment] = useState<AssetAssignment | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<AssetAssignment | null>(null); // New state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // New state

  const fetchData = async () => {
    setLoading(true);
    try {
      const assignments = await getAssignments();
      const filteredAssignedAssets = assignments.filter(assignment => !assignment.tanggalPengembalian);
      setAssignedAssets(filteredAssignedAssets);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (assignment: AssetAssignment) => {
    setEditingAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const handleReturn = (assignment: AssetAssignment) => {
    setReturningAssignment(assignment);
    setIsReturnDialogOpen(true);
  };

  const handleView = (assignment: AssetAssignment) => { // New handler
    setViewingAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return <div>Loading assigned assets...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Assigned Assets</h1>
      <DataTable
        columns={columns({ handleEdit, handleReturn, handleView })} // Pass handleView
        data={assignedAssets}
      />

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

      {returningAssignment && (
        <ReturnAssignmentDialog
          assignment={returningAssignment}
          onSave={() => {
            fetchData();
            setReturningAssignment(null);
          }}
          open={isReturnDialogOpen}
          onOpenChange={setIsReturnDialogOpen}
        />
      )}

      {viewingAssignment && (
        <ViewAssignmentDialog
          assignment={viewingAssignment}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
}