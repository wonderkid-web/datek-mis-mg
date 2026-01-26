"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IspReport, Isp, BandwidthType } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
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
import { useSession } from "next-auth/react";
import { format } from "date-fns";

import { columns } from "./columns";
import { getIspReports, createIspReport, deleteIspReport, updateIspReport } from "@/lib/ispReportService"; // Added updateIspReport
import { getIsps } from "@/lib/ispService"; // To fetch ISP names for dropdown
import { SBU_OPTIONS } from "@/lib/constants";
import { ExportActions } from "@/components/ExportActions";
import { ViewIspReportDialog } from "./view-isp-report-dialog";
import { EditIspReportDialog } from "./edit-isp-report-dialog";
import { IspReportForm } from "./isp-report-form"; // Imported IspReportForm


const exportColumns = [
    { header: "Report Date", accessorKey: "reportDate", accessorFn: (row: IspReport) => format(new Date(row.reportDate), "PPP") },
    { header: "SBU", accessorKey: "sbu" },
    { header: "ISP Name", accessorKey: "isp.isp" },
    { header: "Bandwidth", accessorKey: "bandwidth" },
    { header: "Download (Mbps)", accessorKey: "downloadSpeed" },
    { header: "Upload (Mbps)", accessorKey: "uploadSpeed" },
];


export default function IspReportsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<(IspReport & { isp: Isp })[]>({
    queryKey: ["ispReports"],
    queryFn: getIspReports,
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIspReport, setSelectedIspReport] = useState<(IspReport & { isp: Isp }) | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ispReportToDeleteId, setIspReportToDeleteId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [ispReportToEdit, setIspReportToEdit] = useState<(IspReport & { isp: Isp }) | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteIspReport,
    onSuccess: () => {
      toast.success("ISP report deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["ispReports"] });
    },
    onError: () => {
      toast.error("Failed to delete ISP report.");
    },
  });

  const handleView = (ispReport: (IspReport & { isp: Isp })) => {
    setSelectedIspReport(ispReport);
    setIsViewOpen(true);
  };

  const handleEdit = (ispReport: (IspReport & { isp: Isp })) => {
    setIspReportToEdit(ispReport);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setIspReportToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (ispReportToDeleteId) {
      deleteMutation.mutate(ispReportToDeleteId);
      setIsDeleteOpen(false);
      setIspReportToDeleteId(null);
    }
  };
  
  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;

    if (searchTerm) {
        filtered = filtered.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }

    return filtered;
  }, [data, searchTerm]);


  if (isError) {
    return <div className="container mx-auto py-10">Error loading ISP reports data.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8 relative">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New ISP Report</DialogTitle>
          </DialogHeader>
          <IspReportForm onSave={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ISP Speed Test Reports</CardTitle>
              <CardDescription>Daily reports of ISP speed tests.</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create ISP Report
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                 <ExportActions
                  columns={exportColumns}
                  data={filteredData}
                  fileName="ISP_Speed_Reports"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full sm:w-48"
                  />
                </div>
              </div>
              <DataTable columns={columns({ handleView, handleEdit, handleDelete })} data={filteredData} />
            </>
          )}
        </CardContent>
      </Card>

      <ViewIspReportDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        ispReport={selectedIspReport}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ISP report.
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

      <EditIspReportDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        ispReport={ispReportToEdit}
      />
    </div>
  );
}
