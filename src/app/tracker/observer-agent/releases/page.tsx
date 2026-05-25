import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentSession } from "@/lib/session";
import {
  getLatestObserverAgentRelease,
  getObserverAgentReleasesDir,
  listObserverAgentReleases,
} from "@/lib/observerAgentReleaseStorage";
import { ReleaseRowActions } from "./ReleaseRowActions";
import { UploadReleaseForm } from "./UploadReleaseForm";

export const dynamic = "force-dynamic";

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function ObserverAgentReleasesPage() {
  const session = await getCurrentSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "administrator";
  let latestRelease: Awaited<ReturnType<typeof getLatestObserverAgentRelease>> = null;
  let releases: Awaited<ReturnType<typeof listObserverAgentReleases>> = [];
  let storageError: string | null = null;

  try {
    [latestRelease, releases] = await Promise.all([
      getLatestObserverAgentRelease(),
      listObserverAgentReleases(20),
    ]);
  } catch (error) {
    storageError =
      error instanceof Error && error.message
        ? error.message
        : "Folder release tidak bisa diakses.";
  }
  const latestVersion = latestRelease?.version ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Observer Agent Releases</h2>
        <p className="text-sm text-muted-foreground">
          Upload dan pantau file `.exe` observer agent terbaru yang disimpan di VPS.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <UploadReleaseForm canUpload={isAdmin} />

        <Card>
          <CardHeader>
            <CardTitle>Storage Info</CardTitle>
            <CardDescription>
              Folder filesystem yang dipakai untuk menyimpan release observer agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Directory</div>
              <div className="break-all rounded-md border bg-slate-50 p-3 font-mono text-xs">
                {getObserverAgentReleasesDir()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground">Latest Release</div>
              {storageError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                  {storageError}
                </div>
              ) : latestRelease ? (
                <div className="space-y-2 rounded-md border bg-slate-50 p-3">
                  <div className="font-medium">{latestRelease.version}</div>
                  <div>{latestRelease.originalName}</div>
                  <div className="text-muted-foreground">
                    {formatBytes(latestRelease.sizeBytes)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded {formatDateTime(latestRelease.uploadedAt)}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border bg-slate-50 p-3 text-muted-foreground">
                  Belum ada release yang diupload.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Upload</CardTitle>
          <CardDescription>
            Metadata release disimpan di database dan tetap disinkronkan ke file manifest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1380px]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Version</TableHead>
                  <TableHead>Stored File</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>SHA256</TableHead>
                  <TableHead>Original File</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Release Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-red-600">
                      {storageError}
                    </TableCell>
                  </TableRow>
                ) : releases.length ? (
                  releases.map((release) => (
                    <TableRow key={`${release.version}-${release.uploadedAt}`} className="even:bg-emerald-50/40">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{release.version}</span>
                          {latestVersion === release.version && (
                            <Badge variant="outline">Latest</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{release.storedName}</TableCell>
                      <TableCell>{formatBytes(release.sizeBytes)}</TableCell>
                      <TableCell className="font-mono text-xs">{release.sha256}</TableCell>
                      <TableCell>{release.originalName}</TableCell>
                      <TableCell>
                        <div>{release.uploadedByName ?? "-"}</div>
                        <div className="text-xs text-muted-foreground">
                          {release.uploadedByEmail ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateTime(release.uploadedAt)}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="line-clamp-3 text-sm">
                          {release.releaseNotes?.trim() ? release.releaseNotes : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <ReleaseRowActions
                          version={release.version}
                          canManage={isAdmin}
                          isLatest={latestVersion === release.version}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      Belum ada file release observer agent yang diupload.
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
