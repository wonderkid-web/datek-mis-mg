"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PcAssetForm } from "@/components/items/PcAssetForm";
import { Asset } from "@/lib/types";
import { getAssetById } from "@/lib/assetService";
import { updateAssetAndPcSpecs } from "@/lib/pcService";

export default function EditPcAssetPage() {
  const router = useRouter();
  const params = useParams();
  const pcId = Number(params.pcId);
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      const fetchedAsset = await getAssetById(pcId);
      setAsset(fetchedAsset as Asset | null);
    };

    if (Number.isFinite(pcId)) {
      loadAsset();
    }
  }, [pcId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Edit PC Asset</h1>
      <PcAssetForm
        mode="edit"
        initialAsset={asset}
        submitLabel="Update PC Asset"
        onCancel={() => router.back()}
        onSubmit={async (values) => {
          await updateAssetAndPcSpecs(
            pcId,
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
              licenseKey: values.licenseKey,
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

          toast.success("PC asset updated successfully!");
          router.push("/data-center/assets");
        }}
      />
    </div>
  );
}
