import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getObserverSoftwareInventory } from "@/lib/observerAgentService";

export const dynamic = "force-dynamic";

export default async function ObserverAgentSoftwarePage() {
  const inventory = await getObserverSoftwareInventory();

  const totals = inventory.reduce(
    (acc, item) => {
      acc.uniqueApps += 1;
      acc.totalInstalls += item.deviceCount;
      return acc;
    },
    { uniqueApps: 0, totalInstalls: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Observer Software</h2>
        <p className="text-sm text-muted-foreground">
          Inventory software sederhana dari payload report (installed_apps).{" "}
          <Link className="underline underline-offset-4" href="/tracker/observer-agent">
            Lihat devices
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Unique apps</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totals.uniqueApps}</CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm text-muted-foreground">Total installs (devices)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totals.totalInstalls}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Software Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>App</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead className="text-center">Devices</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length ? (
                  inventory.map((row) => (
                    <TableRow
                      key={`${row.appName}|||${row.appVersion ?? ""}|||${row.publisher ?? ""}`}
                      className="even:bg-emerald-50/40"
                    >
                      <TableCell className="font-medium">{row.appName}</TableCell>
                      <TableCell>{row.appVersion ?? "-"}</TableCell>
                      <TableCell>{row.publisher ?? "-"}</TableCell>
                      <TableCell className="text-center">{row.deviceCount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Belum ada data software. Pastikan agent mengirim `installed_apps` pada `POST /api/agent/report`.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
