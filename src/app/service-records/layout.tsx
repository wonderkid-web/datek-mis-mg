'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ServiceRecordsLayout({
  children, 
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/service-records/history', label: 'Service History' },
    { href: '/service-records/repetitive', label: 'Repetitive Maintenance' },
    { href: '/service-records/computer-maintenance', label: 'Computer Maintenance' },
    { href: '/service-records/cctv-maintenance', label: 'Repetitive CCTV Maintenance' },
    { href: '/service-records/isp', label: 'ISP History' },
    { href: '/service-records/biling-records', label: 'Biling Records' },
    { href: '/service-records/problem-sequence', label: 'Problem Sequence' },

  ];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">Service Records</h1>
      <div className="flex items-center space-x-2 border-b pb-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} passHref>
              <Button variant={isActive ? 'default' : 'outline'}>
                {link.label}
              </Button>
            </Link>
          );
        })}
      </div>
      <div>{children}</div>
    </div>
  );
}
