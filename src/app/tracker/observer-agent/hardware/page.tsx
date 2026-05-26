import Link from "next/link";
import {
  CircuitBoard,
  Computer,
  Cpu,
  Factory,
  MemoryStick,
  MonitorCog,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getObserverHardwareDeviceList } from "@/lib/observerAgentService";

export const dynamic = "force-dynamic";

const NOT_REPORTED_KEY = "__not_reported__";

type HardwareType =
  | "cpu"
  | "ram"
  | "manufacturer"
  | "model"
  | "gpu"
  | "motherboard";

type HardwareDevice = Awaited<ReturnType<typeof getObserverHardwareDeviceList>>[number];

type HardwareDefinition = {
  key: HardwareType;
  label: string;
  description: string;
  icon: LucideIcon;
};

type HardwareGroup = {
  key: string;
  label: string;
  devices: HardwareDevice[];
};

const hardwareDefinitions: HardwareDefinition[] = [
  {
    key: "cpu",
    label: "CPU",
    description: "Processor yang terdeteksi",
    icon: Cpu,
  },
  {
    key: "ram",
    label: "RAM",
    description: "Kapasitas memori",
    icon: MemoryStick,
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    description: "Produsen perangkat",
    icon: Factory,
  },
  {
    key: "model",
    label: "Model",
    description: "Model komputer",
    icon: Computer,
  },
  {
    key: "gpu",
    label: "GPU",
    description: "Graphics adapter",
    icon: MonitorCog,
  },
  {
    key: "motherboard",
    label: "Motherboard",
    description: "Mainboard terdeteksi",
    icon: CircuitBoard,
  },
];

function isHardwareType(value: string | undefined): value is HardwareType {
  return hardwareDefinitions.some((definition) => definition.key === value);
}

function getHardwareValue(device: HardwareDevice, type: HardwareType) {
  const spec = device.hardwareSpec;

  if (!spec) return null;
  if (type === "ram") {
    return typeof spec.ramGb === "number" ? `${spec.ramGb} GB` : null;
  }

  const value = spec[type];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function groupDevices(devices: HardwareDevice[], type: HardwareType) {
  const groups = new Map<string, HardwareGroup>();

  for (const device of devices) {
    const value = getHardwareValue(device, type);
    const key = value ? value.toLocaleLowerCase() : NOT_REPORTED_KEY;
    const current = groups.get(key);

    if (current) {
      current.devices.push(device);
      continue;
    }

    groups.set(key, {
      key,
      label: value ?? "Not Reported",
      devices: [device],
    });
  }

  return Array.from(groups.values()).sort((left, right) => {
    if (left.key === NOT_REPORTED_KEY) return 1;
    if (right.key === NOT_REPORTED_KEY) return -1;
    return (
      right.devices.length - left.devices.length ||
      left.label.localeCompare(right.label)
    );
  });
}

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function ObserverHardwarePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; value?: string }>;
}) {
  const params = await searchParams;
  const devices = await getObserverHardwareDeviceList();
  const selectedType = isHardwareType(params.type) ? params.type : null;
  const selectedDefinition = hardwareDefinitions.find(
    (definition) => definition.key === selectedType
  );
  const selectedGroups = selectedType ? groupDevices(devices, selectedType) : [];
  const selectedGroup = selectedGroups.find((group) => group.key === params.value);

  const cardData = hardwareDefinitions.map((definition) => {
    const groups = groupDevices(devices, definition.key);
    const reportedGroups = groups.filter((group) => group.key !== NOT_REPORTED_KEY);
    const reportedDevices = reportedGroups.reduce(
      (total, group) => total + group.devices.length,
      0
    );

    return {
      ...definition,
      uniqueCount: reportedGroups.length,
      reportedDevices,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Observer Hardware</h2>
        <p className="text-sm text-muted-foreground">
          Inventory hardware yang terkumpul dari report Observer Agent.{" "}
          <Link className="underline underline-offset-4" href="/tracker/observer-agent">
            Lihat devices
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cardData.map((item) => {
          const Icon = item.icon;
          const isSelected = item.key === selectedType;

          return (
            <Link
              key={item.key}
              href={{
                pathname: "/tracker/observer-agent/hardware",
                query: { type: item.key },
              }}
              className="block"
            >
              <Card
                className={
                  isSelected
                    ? "h-full border-emerald-300 bg-emerald-50/40 shadow-sm"
                    : "h-full border-slate-200/80 transition-colors hover:border-slate-300"
                }
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{item.label}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/60 p-2.5 text-foreground">
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold">{item.uniqueCount}</p>
                    <p className="text-xs text-muted-foreground">variasi terlapor</p>
                  </div>
                  <Badge variant="secondary">
                    {item.reportedDevices}/{devices.length} devices
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {selectedDefinition ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>{selectedDefinition.label} Inventory</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Pilih satu spesifikasi untuk melihat device pemakainya.
              </p>
            </div>
            <Link
              href="/tracker/observer-agent/hardware"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Tutup
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{selectedDefinition.label}</TableHead>
                    <TableHead className="text-center">Devices</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroups.length ? (
                    selectedGroups.map((group) => (
                      <TableRow key={group.key}>
                        <TableCell className="font-medium">
                          {group.key === NOT_REPORTED_KEY ? (
                            <span className="text-muted-foreground">{group.label}</span>
                          ) : (
                            group.label
                          )}
                        </TableCell>
                        <TableCell className="text-center">{group.devices.length}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={{
                              pathname: "/tracker/observer-agent/hardware",
                              query: { type: selectedDefinition.key, value: group.key },
                            }}
                            className="text-sm underline underline-offset-4"
                          >
                            View devices
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Belum ada device yang mengirim data hardware.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {selectedDefinition && selectedGroup ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>{selectedGroup.label}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedGroup.devices.length} device pada kelompok {selectedDefinition.label}.
              </p>
            </div>
            <Link
              href={{
                pathname: "/tracker/observer-agent/hardware",
                query: { type: selectedDefinition.key },
              }}
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Tutup list
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Hostname</TableHead>
                    <TableHead>Alias</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Local</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroup.devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.hostname}</TableCell>
                      <TableCell>
                        {(device as { aliasName?: string | null }).aliasName ?? "-"}
                      </TableCell>
                      <TableCell>{device.username ?? "-"}</TableCell>
                      <TableCell>{device.ipAddress ?? "-"}</TableCell>
                      <TableCell>{formatDateTime(device.lastSeen)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/tracker/observer-agent/${device.deviceId}`}
                          className="text-sm underline underline-offset-4"
                        >
                          Device detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
