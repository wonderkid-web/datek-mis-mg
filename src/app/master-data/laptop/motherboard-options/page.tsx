"use client";

import { SimpleOptionManager } from "@/components/master-data/SimpleOptionManager";
import {
  createPcMotherboardOption,
  deletePcMotherboardOption,
  getPcMotherboardOptions,
  updatePcMotherboardOption,
} from "@/lib/pcMotherboardService";

export default function MotherboardOptionsPage() {
  return (
    <SimpleOptionManager
      title="Manage Motherboard Options"
      searchPlaceholder="Search motherboard options..."
      addLabel="Add New Motherboard"
      queryKey="pcMotherboardOptions"
      getOptions={getPcMotherboardOptions}
      createOption={createPcMotherboardOption}
      updateOption={updatePcMotherboardOption}
      deleteOption={deletePcMotherboardOption}
    />
  );
}
