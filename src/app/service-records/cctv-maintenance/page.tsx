"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useSession } from "next-auth/react";
import { ExportActions } from "@/components/ExportActions";

const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const exportColumns = [
    { header: "Period", accessorKey: "periode" },
    { header: "SBU", accessorKey: "perusahaan" },
    { header: "Location", accessorKey: "channelCamera.lokasi" },
    { header: "IP Address", accessorKey: "channelCamera.cctv.ipAddress" },
    { header: "Status", accessorKey: "status" },
    { header: "Remarks", accessorKey: "remarks" },
];


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
        <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="periode">Tanggal Pengecekan</Label>
            <Input id="periode" type="date" value={periode} onChange={(e) => setPeriode(e.target.value)} />
          </div>
          <div className="space-y-2 col-span-3">
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
              // styles={{
              //   control: (base) => ({
              //     ...base,
              //     borderColor: 'hsl(var(--input))',
              //     backgroundColor: 'hsl(var(--background))',
              //   }),
              //   menu: (base) => ({
              //     ...base,
              //     zIndex: 50,
              //     backgroundColor: 'hsl(var(--card))',
              //     color: 'hsl(var(--card-foreground))',
              //   }),
              //   option: (base, { isFocused }) => ({
              //     ...base,
              //     backgroundColor: isFocused ? 'hsl(var(--accent))' : 'hsl(var(--card))',
              //     color: 'hsl(var(--card-foreground))',
              //   }),
              // }}
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

        <div className="space-y-2 w-24">
          <Label htmlFor="status">New Status</Label>
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger className="w-60">
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
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<MaintenanceWithDetails[]>({
    queryKey: ["cctvRepetitiveMaintenances"],
    queryFn: getCctvRepetitiveMaintenances,
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithDetails | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [maintenanceToDeleteId, setMaintenanceToDeleteId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<MaintenanceWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

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

  const availableYears = useMemo(() => {
    if (!data) return [];
    const years = data
      .map((record) => new Date(record.periode).getFullYear().toString())
      .filter((year) => !isNaN(parseInt(year)));
    const unique = Array.from(new Set(years));
    unique.sort((a, b) => Number(b) - Number(a));
    return unique;
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const query = searchTerm.trim().toLowerCase();
    return data.filter((record) => {
      const period = new Date(record.periode);
      if (!Number.isNaN(period.getTime())) {
        if (selectedYear !== "all" && period.getFullYear().toString() !== selectedYear) {
          return false;
        }
        if (
          selectedMonth !== "all" &&
          (period.getMonth() + 1).toString() !== selectedMonth
        ) {
          return false;
        }
      }

      if (!query) return true;

      const cctvSpec = record.channelCamera?.cctvSpecs?.[0];

      const corpus = [
        record.perusahaan,
        record.channelCamera?.lokasi,
        cctvSpec?.ipAddress,
        record.status,
        record.remarks,
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(query);
    });
  }, [data, searchTerm, selectedYear, selectedMonth]);


  if (isError) {
    return <div className="container mx-auto py-10">Error loading maintenance data.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8 relative">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] min-w-[1120px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New CCTV Maintenance</DialogTitle>
          </DialogHeader>
          <AddMaintenanceForm onSave={() => { }} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>History of all repetitive maintenance records for CCTV.</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Service
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
                  fileName="CCTV_Maintenance"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full sm:w-48"
                  />
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DataTable columns={columns({ handleView, handleEdit, handleDelete })} data={filteredData} />
            </>
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



