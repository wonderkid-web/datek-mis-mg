'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';

function ServiceRecordsContentFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
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

export default function ServiceRecordsLayout({
  children, 
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const navLinks = [
    { href: '/service-records/history', label: 'Service History' },
    { href: '/service-records/repetitive', label: 'Repetitive Maintenance' },
    { href: '/service-records/computer-maintenance', label: 'Computer Maintenance' },
    { href: '/service-records/cctv-maintenance', label: 'Repetitive CCTV Maintenance' },
    { href: '/service-records/isp', label: 'ISP History' },
    { href: '/service-records/biling-records', label: 'Biling Records' },
    { href: '/service-records/problem-sequence', label: 'Problem Sequence' },
    { href: '/service-records/sparepart-tracker', label: 'Sparepart Tracker' },

  ];

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isNavigating = Boolean(pendingHref && pendingHref !== pathname);

  return (
    <div className="container mx-auto space-y-6 py-6 sm:space-y-8 sm:py-10">
      <h1 className="text-xl font-bold sm:text-2xl">Service Records</h1>
      <div className="flex items-center gap-2 overflow-x-auto border-b pb-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pendingHref === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              passHref
              onClick={() => {
                if (pathname !== link.href) {
                  setPendingHref(link.href);
                }
              }}
            >
              <Button variant={isActive ? 'default' : 'outline'} size="sm" className="shrink-0">
                {link.label}
              </Button>
            </Link>
          );
        })}
      </div>
      <div>{isNavigating ? <ServiceRecordsContentFallback /> : children}</div>
    </div>
  );
}
