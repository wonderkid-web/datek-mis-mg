"use client";

import { SimpleOptionManager } from "@/components/master-data/SimpleOptionManager";
import {
  createPcUpsOption,
  deletePcUpsOption,
  getPcUpsOptions,
  updatePcUpsOption,
} from "@/lib/pcUpsService";

export default function UpsOptionsPage() {
  return (
    <SimpleOptionManager
      title="Manage UPS Options"
      searchPlaceholder="Search UPS options..."
      addLabel="Add New UPS"
      queryKey="pcUpsOptions"
      getOptions={getPcUpsOptions}
      createOption={createPcUpsOption}
      updateOption={updatePcUpsOption}
      deleteOption={deletePcUpsOption}
    />
  );
}
