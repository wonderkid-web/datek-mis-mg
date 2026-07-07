import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDefaultObserverRuntimeConfigView,
  getGlobalObserverRuntimeConfig,
  OBSERVER_RUNTIME_CONFIG_LIMITS,
  ObserverRuntimeConfigValidationError,
  updateGlobalObserverRuntimeConfig,
} from "@/lib/observerAgentRuntimeConfigService";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const CONFIG_PAGE_PATH = "/tracker/observer-agent/runtime-config";

function formatDateTime(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function redirectWithMessage(type: "saved" | "error", message: string) {
  redirect(`${CONFIG_PAGE_PATH}?${type}=${encodeURIComponent(message)}`);
}

async function saveGlobalRuntimeConfigAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "administrator";

  if (!isAdmin) {
    redirectWithMessage("error", "Hanya administrator yang boleh mengubah runtime config.");
  }

  try {
    await updateGlobalObserverRuntimeConfig({
      heartbeatIntervalMinutes: formData.get("heartbeat_interval_minutes"),
      fullReportIntervalHours: formData.get("full_report_interval_hours"),
    });
  } catch (error) {
    const message =
      error instanceof ObserverRuntimeConfigValidationError
        ? error.message
        : "Gagal menyimpan runtime config.";
    redirectWithMessage("error", message);
  }

  revalidatePath(CONFIG_PAGE_PATH);
  redirectWithMessage("saved", "Runtime config berhasil disimpan.");
}

export default async function ObserverAgentRuntimeConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [session, params] = await Promise.all([getCurrentSession(), searchParams]);
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "administrator";
  let config = getDefaultObserverRuntimeConfigView();
  let loadError: string | null = null;

  try {
    config = await getGlobalObserverRuntimeConfig();
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : "Runtime config belum bisa dibaca.";
  }

  const heartbeatLimits = OBSERVER_RUNTIME_CONFIG_LIMITS.heartbeat_interval_minutes;
  const reportLimits = OBSERVER_RUNTIME_CONFIG_LIMITS.full_report_interval_hours;
  const message = params.error ?? params.saved ?? null;
  const messageTone = params.error ? "error" : params.saved ? "success" : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Observer Runtime Config</h2>
        <p className="text-sm text-muted-foreground">
          Global interval yang dikirim melalui response heartbeat Observer Agent.
        </p>
      </div>

      {message ? (
        <div
          className={
            messageTone === "error"
              ? "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              : "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          }
        >
          {message}
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active Config</CardTitle>
            <CardDescription>
              Nilai ini dipakai agent pada cycle berikutnya setelah heartbeat.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border bg-slate-50 p-4">
              <div className="text-sm text-muted-foreground">Heartbeat Interval</div>
              <div className="mt-2 text-2xl font-semibold">
                {config.runtimeConfig.heartbeat_interval_minutes}
                <span className="ml-2 text-sm font-normal text-muted-foreground">minutes</span>
              </div>
            </div>
            <div className="rounded-md border bg-slate-50 p-4">
              <div className="text-sm text-muted-foreground">Full Report Interval</div>
              <div className="mt-2 text-2xl font-semibold">
                {config.runtimeConfig.full_report_interval_hours}
                <span className="ml-2 text-sm font-normal text-muted-foreground">hours</span>
              </div>
            </div>
            <div className="rounded-md border bg-slate-50 p-4">
              <div className="text-sm text-muted-foreground">Scope</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{config.scopeType}</Badge>
                <span className="font-mono text-xs">{config.scopeKey}</span>
              </div>
            </div>
            <div className="rounded-md border bg-slate-50 p-4">
              <div className="text-sm text-muted-foreground">Updated At</div>
              <div className="mt-2 font-medium">{formatDateTime(config.updatedAt)}</div>
              {config.isDefault ? (
                <Badge variant="secondary" className="mt-2">
                  Default fallback
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Global Config</CardTitle>
            <CardDescription>
              Berlaku untuk semua agent yang belum punya override spesifik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveGlobalRuntimeConfigAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="heartbeat_interval_minutes">
                  Heartbeat Interval (minutes)
                </Label>
                <Input
                  id="heartbeat_interval_minutes"
                  name="heartbeat_interval_minutes"
                  type="number"
                  min={heartbeatLimits.min}
                  max={heartbeatLimits.max}
                  step={1}
                  defaultValue={config.runtimeConfig.heartbeat_interval_minutes}
                  disabled={!isAdmin}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Range {heartbeatLimits.min}-{heartbeatLimits.max} minutes.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="full_report_interval_hours">
                  Full Report Interval (hours)
                </Label>
                <Input
                  id="full_report_interval_hours"
                  name="full_report_interval_hours"
                  type="number"
                  min={reportLimits.min}
                  max={reportLimits.max}
                  step={1}
                  defaultValue={config.runtimeConfig.full_report_interval_hours}
                  disabled={!isAdmin}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Range {reportLimits.min}-{reportLimits.max} hours.
                </p>
              </div>

              <Button type="submit" disabled={!isAdmin}>
                Save Config
              </Button>

              {!isAdmin ? (
                <p className="text-sm text-muted-foreground">
                  Login sebagai administrator untuk mengubah config.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heartbeat Contract</CardTitle>
          <CardDescription>
            Struktur response aktif untuk agent yang melakukan polling heartbeat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border bg-slate-950 p-4 text-xs text-slate-50">
            {JSON.stringify(
              {
                runtime_config: config.runtimeConfig,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
