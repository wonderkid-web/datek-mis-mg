"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Textarea } from "@/components/ui/textarea";
import { columns, MaintenanceWithDetails } from "./columns";
import { MaintenanceDetailDialog } from "./MaintenanceDetailDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { getCctvChannelCameras } from "@/lib/cctvChannelCameraService";
import { getCctvSpecByChannelCameraId } from "@/lib/cctvService"; // I need to create this function
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
import { createCctvRepetitiveMaintenance, getCctvRepetitiveMaintenances, deleteCctvRepetitiveMaintenance } from "@/lib/cctvRepetitiveMaintenanceService";
import { CctvChannelCamera, CCTVStatus } from "@prisma/client";
import { Package, Fingerprint, Info, MapPin, Tags, Type, GitBranch, Power, Eye, Network as NetworkIcon } from "lucide-react";
import CCTVViewLink from "@/components/cctv";
import ReactSelect from "react-select";

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start space-x-3 py-2 border-b">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="text-md font-semibold">{value}</div>
    </div>
  </div>
);

// A new type for the asset details we'll show

function AddMaintenanceForm({ onSave }: { onSave: () => void }) {
  const [periode, setPeriode] = useState<string>("");
  const [channelCameraId, setChannelCameraId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [channelCameraOptions, setChannelCameraOptions] = useState<CctvChannelCamera[]>([]);
  const [selectedSpecDetails, setSelectedSpecDetails] = useState<any | null>(null);
  const [isAssetLoading, setIsAssetLoading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setChannelCameraOptions(await getCctvChannelCameras());
      } catch (error) {
        toast.error("Failed to load channel camera options.");
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!channelCameraId) {
        setSelectedSpecDetails(null);
        return;
      }
      setIsAssetLoading(true);
      try {
        const specWithDetails = await getCctvSpecByChannelCameraId(Number(channelCameraId));
        setSelectedSpecDetails(specWithDetails);
      } catch (error) {
        toast.error("Failed to fetch asset details for the selected channel.");
        setSelectedSpecDetails(null);
      } finally {
        setIsAssetLoading(false);
      }
    };
    fetchAssetDetails();
  }, [channelCameraId]);

  const handleSubmit = () => {
    if (!periode || !channelCameraId || !status) {
      toast.error("Please fill in all required fields, including status.");
      return;
    }
    if (status !== "GOOD" && !remarks) {
      toast.error("Remarks are required if status is not GOOD.");
      return;
    }
    const selectedChannel = channelCameraOptions.find(c => c.id === Number(channelCameraId));
    if (!selectedChannel || !selectedSpecDetails) {
      toast.error("Invalid Channel Camera or asset details not found.");
      return;
    }

    mutation.mutate({
      periode: new Date(periode),
      channelCameraId: Number(channelCameraId),
      perusahaan: selectedChannel.sbu,
      status: status as CCTVStatus,
      remarks,
      assetId: selectedSpecDetails.asset.id,
    });
  };

  // Reset form in onSuccess
  const mutation = useMutation({
    mutationFn: createCctvRepetitiveMaintenance,
    onSuccess: () => {
      toast.success("Maintenance record added successfully!");
      queryClient.invalidateQueries({ queryKey: ["cctvRepetitiveMaintenances"] });
      queryClient.invalidateQueries({ queryKey: ["cctvSpecs"] }); // Invalidate asset list
      onSave();
      // Reset form
      setPeriode("");
      setChannelCameraId("");
      setStatus("");
      setRemarks("");
      setSelectedSpecDetails(null);
    },
    onError: (error) => {
      toast.error(`Failed to add record: ${error.message}`);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New CCTV Maintenance Record</CardTitle>
        <CardDescription>Select a channel camera to log a new maintenance record.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="periode">Tanggal Pengecekan</Label>
            <Input id="periode" type="date" value={periode} onChange={(e) => setPeriode(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channelCamera">Channel Camera</Label>
            <ReactSelect
                options={channelCameraOptions.map(opt => ({
                    value: String(opt.id),
                    label: `${opt.sbu.replace(/_/g, " ")} - ${opt.lokasi}`
                }))}
                value={channelCameraOptions.map(opt => ({
                    value: String(opt.id),
                    label: `${opt.sbu.replace(/_/g, " ")} - ${opt.lokasi}`
                })).find(opt => opt.value === channelCameraId)}
                onChange={(selectedOption) => setChannelCameraId(selectedOption ? selectedOption.value : "")}
                placeholder="Select or search for a Channel Camera..."
                isClearable
                styles={{
                    control: (base) => ({
                        ...base,
                        borderColor: 'hsl(var(--input))',
                        backgroundColor: 'hsl(var(--background))',
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 50,
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                    }),
                    option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                    }),
                }}
            />
          </div>
        </div>

        {isAssetLoading && <div className="p-4 border rounded-md">Loading asset details...</div>}

        {selectedSpecDetails && (
            <Card className="bg-muted/40">
                <CardHeader>
                    <CardTitle className="text-lg">Asset Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                        <DetailItem icon={<Fingerprint />} label="Nomor Seri" value={selectedSpecDetails.asset.nomorSeri} />
                        <DetailItem icon={<Info />} label="Current Status" value={selectedSpecDetails.asset.statusAsset} />
                        <DetailItem icon={<MapPin />} label="Name Site" value={selectedSpecDetails.nameSite ?? '-'} />
                        <DetailItem icon={<Tags />} label="Brand" value={selectedSpecDetails.brand?.value ?? '-'} />
                        <DetailItem icon={<Package />} label="Model" value={selectedSpecDetails.model?.value ?? '-'} />
                        <DetailItem icon={<Type />} label="Device Type" value={selectedSpecDetails.deviceType?.value ?? '-'} />
                        <DetailItem icon={<GitBranch />} label="System Version" value={selectedSpecDetails.systemVersion ?? '-'} />
                        <DetailItem icon={<Power />} label="Power" value={selectedSpecDetails.power ?? '-'} />
                        <DetailItem icon={<NetworkIcon />} label="IP Address" value={selectedSpecDetails.ipAddress ?? '-'} />
                        <DetailItem icon={<Fingerprint />} label="MAC Address" value={selectedSpecDetails.macAddress ?? '-'} />
                        <DetailItem icon={<Eye />} label="View Camera" value={<CCTVViewLink link={selectedSpecDetails.viewCamera} />} />
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">New Status</Label>
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger>
              <SelectValue placeholder="Select New Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GOOD">GOOD</SelectItem>
              <SelectItem value="TROUBLE">TROUBLE</SelectItem>
              <SelectItem value="BROKEN">BROKEN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status && status !== 'GOOD' && (
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Required)</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter any remarks here..." />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Record"}
        </Button>
      </CardContent>
    </Card>
  );
}


export default function CctvMaintenancePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cctvRepetitiveMaintenances"],
    queryFn: getCctvRepetitiveMaintenances,
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithDetails | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [maintenanceToDeleteId, setMaintenanceToDeleteId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<MaintenanceWithDetails | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCctvRepetitiveMaintenance,
    onSuccess: () => {
      toast.success("Maintenance record deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["cctvRepetitiveMaintenances"] });
    },
    onError: () => {
      toast.error("Failed to delete maintenance record.");
    },
  });

  const handleView = (maintenance: MaintenanceWithDetails) => {
    setSelectedMaintenance(maintenance);
    setIsViewOpen(true);
  };

  const handleEdit = (maintenance: MaintenanceWithDetails) => {
    setMaintenanceToEdit(maintenance);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setMaintenanceToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (maintenanceToDeleteId) {
      deleteMutation.mutate(maintenanceToDeleteId);
      setIsDeleteOpen(false);
      setMaintenanceToDeleteId(null);
    }
  };

  if (isError) {
    return <div className="container mx-auto py-10">Error loading maintenance data.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <AddMaintenanceForm onSave={() => { }} />

      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>History of all repetitive maintenance records for CCTV.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable columns={columns({ handleView, handleEdit, handleDelete })} data={data || []} />
          )}
        </CardContent>
      </Card>

      <MaintenanceDetailDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        maintenance={selectedMaintenance}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              maintenance record.
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

      <EditMaintenanceDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        maintenance={maintenanceToEdit}
      />
    </div>
  );
}
