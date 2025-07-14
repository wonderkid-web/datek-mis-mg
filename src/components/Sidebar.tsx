
"use client";

import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Package, Repeat, LogOut, History } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="flex h-screen flex-col justify-between border-r bg-[#00612c] text-white w-64 p-4">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white mb-6">Datek Holding</h2>
        <Link href="/" className="flex items-center space-x-3 rounded-md px-3 py-2 text-white hover:bg-gray-700 hover:text-white">
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/items" className="flex items-center space-x-3 rounded-md px-3 py-2 text-white hover:bg-gray-700 hover:text-white">
          <Package className="h-5 w-5" />
          <span>Items</span>
        </Link>
        <Link href="/stock-moves" className="flex items-center space-x-3 rounded-md px-3 py-2 text-white hover:bg-gray-700 hover:text-white">
          <Repeat className="h-5 w-5" />
          <span>Stock Moves</span>
        </Link>
        <Link href="/stock-moves/history" className="flex items-center space-x-3 rounded-md px-3 py-2 text-white hover:bg-gray-700 hover:text-white">
          <History className="h-5 w-5" />
          <span>Stock Move History</span>
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}
