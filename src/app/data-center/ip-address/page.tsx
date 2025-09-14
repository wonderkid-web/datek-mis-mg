"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIpAddresses, deleteIpAddress } from "@/lib/ipAddressService";
import { columns, type IpAddressRow } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { ExportActions } from "@/components/ExportActions";
import { CreateIpDialog } from "./create-ip-dialog";
import { EditIpDialog } from "./edit-ip-dialog";
import { ViewAssetDialog } from "./view-asset-dialog";
import { toast } from "sonner";

export default function IpAddressPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "administrator";
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selected, setSelected] = useState<IpAddressRow | null>(null);

    const { data, isLoading, isRefetching } = useQuery({
        queryKey: ["ipAddresses"],
        queryFn: getIpAddresses,
        staleTime: 5 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIpAddress,
        onMutate: async (idToDelete: number) => {
            await queryClient.cancelQueries({ queryKey: ["ipAddresses"] });
            const prev = queryClient.getQueryData<IpAddressRow[]>(["ipAddresses"]);
            queryClient.setQueryData<IpAddressRow[]>(["ipAddresses"], (old) =>
                (old || []).filter((i) => i.id !== idToDelete)
            );
            return { prev };
        },
        onError: (_err, _id, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(["ipAddresses"], ctx.prev);
            toast.error("Failed to delete IP");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["ipAddresses"] });
        },
        onSuccess: () => {
            toast.success("IP deleted");
        },
    });

    const filtered = useMemo(() => {
        const s = search.toLowerCase();
        return (data || []).filter((row) => {
            const inUser = row.user?.namaLengkap?.toLowerCase().includes(s);
            const inIp = row.ip.toLowerCase().includes(s);
            const inConn = row.connection.toLowerCase().includes(s);
            const inRole = row.role.toLowerCase().includes(s);
            const inStatus = row.status.toLowerCase().includes(s);
            const inCompany = (row.company || "").toLowerCase().includes(s);
            const assetLabel = [
                row.assetAssignment?.nomorAsset,
                row.assetAssignment?.asset?.namaAsset,
                row.assetAssignment?.asset?.nomorSeri,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const inAsset = assetLabel.includes(s);
            return inUser || inIp || inConn || inRole || inStatus || inCompany || inAsset;
        });
    }, [data, search]);

    const exportColumns = [
        { header: "User", accessorKey: "user.namaLengkap" },
        { header: "IP Address", accessorKey: "ip" },
        { header: "Connection", accessorKey: "connection" },
        { header: "Role", accessorKey: "role" },
        { header: "Status", accessorKey: "status" },
        { header: "Company", accessorKey: "company" },
        { header: "Asset No", accessorKey: "assetAssignment.nomorAsset" },
        { header: "Asset Name", accessorKey: "assetAssignment.asset.namaAsset" },
        { header: "Serial Number", accessorKey: "assetAssignment.asset.nomorSeri" },
    ];

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">IP Address</h1>
                    <Skeleton className="h-10 w-1/3" />
                </div>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">
                IP Address {isRefetching && <span className="text-sm text-gray-500">(Updating...)</span>}
            </h1>
            <div className="flex items-center justify-between mb-4">
                <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                    <ExportActions columns={exportColumns} data={filtered} fileName="IP_Addresses" />
                    {isAdmin && (
                        <Button onClick={() => setOpenCreate(true)}>Create IP Address</Button>
                    )}
                </div>
            </div>
            <DataTable
                columns={columns({
                    onView: (row) => {
                        setSelected(row);
                        setOpenView(true);
                    },
                    onEdit: (row) => {
                        setSelected(row);
                        setOpenEdit(true);
                    },
                    onDelete: (id) => {
                        toast("Delete this IP address?", {
                            description: "This action cannot be undone.",
                            action: {
                                label: "Delete",
                                onClick: () => deleteMutation.mutate(id),
                            },
                            cancel: { label: "Cancel", onClick: () => { return } },
                        });
                    },
                })}
                data={filtered}
            />
            {openCreate && (
                <CreateIpDialog
                    isOpen={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSaved={() => queryClient.invalidateQueries({ queryKey: ["ipAddresses"] })}
                />
            )}
            {selected && openEdit && (
                <EditIpDialog
                    isOpen={openEdit}
                    onClose={() => setOpenEdit(false)}
                    onSaved={() => queryClient.invalidateQueries({ queryKey: ["ipAddresses"] })}
                    item={selected}
                />
            )}
            {openView && (
                <ViewAssetDialog
                    isOpen={openView}
                    onClose={() => setOpenView(false)}
                    item={selected}
                />
            )}
        </div>
    );
}
