"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Isp } from "@prisma/client";
export type IspClient = Isp
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import ReactSelect from "react-select";
import { useSession } from "next-auth/react";

import { columns } from "./columns";
import { IspDetailDialog } from "./IspDetailDialog";
import { EditIspDialog } from "./EditIspDialog";

import { getIsps, createIsp, deleteIsp } from "@/lib/ispService";
import { ExportActions } from "@/components/ExportActions";
import { SBU_OPTIONS } from "@/lib/constants";

const exportColumns = [
    { header: "SBU", accessorKey: "sbu" },
    { header: "ISP", accessorKey: "isp" },
    { header: "AS Number", accessorKey: "asNumber" },
    { header: "Address", accessorKey: "address" },
    { header: "Maps", accessorKey: "maps" },
    { header: "POP", accessorKey: "pop" },
    { header: "Transmisi", accessorKey: "transmisi" },
    { header: "Product Service", accessorKey: "productService" },
    { header: "IP Public", accessorKey: "ipPublic" },
    { header: "Price", accessorKey: "price" },
    { header: "SLA", accessorKey: "sla" },
    { header: "PIC NOC", accessorKey: "picNoc" },
    { header: "HP NOC", accessorKey: "hpNoc" },
    { header: "PRTG", accessorKey: "prtg" },
    { header: "Username", accessorKey: "username" },
];


function AddIspForm({ onSave }: { onSave: () => void }) {
  const [formData, setFormData] = useState<Partial<Omit<Isp, "id" | "createdAt" | "updatedAt">>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createIsp,
    onSuccess: () => {
      toast.success("ISP record added successfully!");
      queryClient.invalidateQueries({ queryKey: ["isps"] });
      onSave();
      setFormData({});
    },
    onError: (error) => {
      toast.error(`Failed to add record: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.isp) {
      toast.error("Please fill in SBU, ISP, and Price.");
      return;
    }
    
    mutation.mutate({
        ...formData,
    } as Omit<Isp, "id" | "createdAt" | "updatedAt">);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const sbuDropdownOptions = SBU_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, " ") }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New ISP Record</CardTitle>
        <CardDescription>Fill in the form to add a new ISP record.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
            {/* <div className="space-y-2">
                <Label htmlFor="sbu">SBU</Label>
                <ReactSelect
                    options={sbuDropdownOptions}
                    onChange={(opt) => setFormData(prev => ({...prev, sbu: opt?.value}))}
                    placeholder="Select SBU"
                    name="sbu"
                />
            </div> */}
            <div className="space-y-2">
                <Label htmlFor="isp">ISP</Label>
                <Input id="isp" value={formData.isp || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="asNumber">AS Number</Label>
                <Input id="asNumber" value={formData.asNumber || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={formData.address || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maps">Maps</Label>
                <Input id="maps" value={formData.maps || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pop">POP</Label>
                <Input id="pop" value={formData.pop || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="transmisi">Transmisi</Label>
                <Input id="transmisi" value={formData.transmisi || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="productService">Product Service</Label>
                <Input id="productService" value={formData.productService || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ipPublic">IP Public</Label>
                <Input id="ipPublic" value={formData.ipPublic || ''} onChange={handleChange} />
            </div>
            {/* <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" value={formData.price || ''} onChange={handleChange} />
            </div> */}
            <div className="space-y-2">
                <Label htmlFor="sla">SLA</Label>
                <Input id="sla" value={formData.sla || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="picNoc">PIC NOC</Label>
                <Input id="picNoc" value={formData.picNoc || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="hpNoc">HP NOC</Label>
                <Input id="hpNoc" value={formData.hpNoc || ''} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="prtg">PRTG</Label>
                <Input id="prtg" value={formData.prtg || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="text" value={formData.password || ''} onChange={handleChange} />
            </div>
        </div>

        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Record"}
        </Button>
      </CardContent>
    </Card>
  );
}


export default function IspPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<IspClient[]>({
    queryKey: ["isps"],
    queryFn: getIsps,
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIsp, setSelectedIsp] = useState<IspClient | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ispToDeleteId, setIspToDeleteId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [ispToEdit, setIspToEdit] = useState<IspClient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteIsp,
    onSuccess: () => {
      toast.success("ISP record deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["isps"] });
    },
    onError: () => {
      toast.error("Failed to delete ISP record.");
    },
  });

  const handleView = (isp: IspClient) => {
    setSelectedIsp(isp);
    setIsViewOpen(true);
  };

  const handleEdit = (isp: IspClient) => {
    setIspToEdit(isp);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setIspToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (ispToDeleteId) {
      deleteMutation.mutate(ispToDeleteId);
      setIsDeleteOpen(false);
      setIspToDeleteId(null);
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
    return <div className="container mx-auto py-10">Error loading ISP data.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8 relative">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New ISP Record</DialogTitle>
          </DialogHeader>
          <AddIspForm onSave={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ISP History</CardTitle>
              <CardDescription>History of all ISP records.</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create ISP Record
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
                  fileName="ISP_Records"
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

      <IspDetailDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        isp={selectedIsp}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ISP record.
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

      <EditIspDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        isp={ispToEdit}
      />
    </div>
  );
}
