"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PcAssetForm } from "@/components/items/PcAssetForm";
import { createAssetAndPcSpecs } from "@/lib/pcService";

export default function AddPcAssetPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Add New PC Asset</h1>
      <PcAssetForm
        mode="create"
        submitLabel="Add PC Asset"
        onCancel={() => router.back()}
        onSubmit={async (values) => {
          await createAssetAndPcSpecs(
            {
              namaAsset: values.namaAsset.trim(),
              nomorSeri: values.nomorSeri,
              tanggalPembelian: values.tanggalPembelian
                ? new Date(values.tanggalPembelian)
                : null,
              tanggalGaransi: values.tanggalGaransi
                ? new Date(values.tanggalGaransi)
                : null,
              statusAsset: values.statusAsset || "GOOD",
            },
            {
              processorOptionId: values.processorOptionId,
              ramOptionId: values.ramOptionId,
              storageTypeOptionId: values.storageTypeOptionId,
              licenseOptionId: values.licenseOptionId,
              osOptionId: values.osOptionId,
              powerOptionId: values.powerOptionId,
              microsoftOfficeOptionId: values.microsoftOfficeOptionId,
              colorOptionId: values.colorOptionId,
              graphicOptionId: values.graphicOptionId,
              monitorOptionId: values.monitorOptionId,
              motherboardOptionId: values.motherboardOptionId,
              upsOptionId: values.upsOptionId,
              macLan: values.macLan,
            },
            values.hasOfficeAccount
              ? {
                  email: values.officeEmail,
                  password: values.officePassword,
                  licenseExpiry: values.officeLicenseExpiry
                    ? new Date(values.officeLicenseExpiry)
                    : null,
                  isActive: values.officeIsActive,
                }
              : null
          );

          toast.success("PC asset added successfully!");
          router.push("/data-center/assets");
        }}
      />
    </div>
  );
}
