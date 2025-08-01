"use client";

import { useEffect, useState } from "react";
import { getAssignments, deleteAssignment } from "@/lib/assignmentService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { EditAssignmentDialog } from "./edit-assignment-dialog";
import { ViewAssignmentDialog } from "./view-assignment-dialog";
import { AssetAssignment } from "@prisma/client";
import { Input } from "@/components/ui/input";

import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignedAssetsPage() {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedAssignments = await getAssignments();
      setAssignments(fetchedAssignments);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (assignment: AssetAssignment) => {
    setSelectedAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const handleView = (assignment: AssetAssignment) => {
    setSelectedAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(id);
        fetchData(); // Refresh data
      } catch (error) {
        console.error("Failed to delete assignment:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Assigned Assets</h1>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.nomorAsset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.asset.namaAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.user.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.catatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assigned Assets</h1>
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <DataTable
        columns={columns({ handleEdit, handleView, handleDelete })}
        data={filteredAssignments}
      />
      {selectedAssignment && (
        <EditAssignmentDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={() => {
            setIsEditDialogOpen(false);
            fetchData();
          }}
          assignment={selectedAssignment}
        />
      )}
      {selectedAssignment && (
        <ViewAssignmentDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
}
