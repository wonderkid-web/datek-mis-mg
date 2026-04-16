import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-80 max-w-full" />
    </div>
  );
}

function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function SectionPageSkeleton({ stats = 3 }: { stats?: number }) {
  return (
    <div className="container mx-auto space-y-6 py-10">
      <HeaderSkeleton />
      <StatsSkeleton count={stats} />
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}

export function TrackerPageSkeleton() {
  return <SectionPageSkeleton stats={4} />;
}

export function TabbedPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto space-y-6 p-4 sm:p-8">
        <HeaderSkeleton />
        <div className="flex gap-2 overflow-hidden rounded-md border bg-white p-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-40 shrink-0" />
          ))}
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))}
            </div>
            <TableSkeleton />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <HeaderSkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center"
              >
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center"
              >
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </div>
  );
}
