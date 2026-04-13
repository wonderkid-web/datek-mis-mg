'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/tracker/laptop', label: 'Tracker Laptop' },
  { href: '/tracker/intel-nuc', label: 'Tracker Intel NUC' },
  { href: '/tracker/pc', label: 'Tracker PC' },
  { href: '/tracker/sparepart', label: 'Tracker Sparepart' },
];

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto space-y-6 py-6 sm:space-y-8 sm:py-10">
      <h1 className="text-xl font-bold sm:text-2xl">Tracker</h1>
      <div className="flex items-center gap-2 overflow-x-auto border-b pb-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href} passHref>
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
              >
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
