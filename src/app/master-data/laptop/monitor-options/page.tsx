"use client";

import { SimpleOptionManager } from "@/components/master-data/SimpleOptionManager";
import {
  createPcMonitorOption,
  deletePcMonitorOption,
  getPcMonitorOptions,
  updatePcMonitorOption,
} from "@/lib/pcMonitorService";

export default function MonitorOptionsPage() {
  return (
    <SimpleOptionManager
      title="Manage Monitor Options"
      searchPlaceholder="Search monitor options..."
      addLabel="Add New Monitor"
      queryKey="pcMonitorOptions"
      getOptions={getPcMonitorOptions}
      createOption={createPcMonitorOption}
      updateOption={updatePcMonitorOption}
      deleteOption={deletePcMonitorOption}
    />
  );
}
