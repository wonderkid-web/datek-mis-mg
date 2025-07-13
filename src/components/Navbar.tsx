
"use client";

import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const auth = getAuth(app);

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  return (
    <nav className="bg-primary p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">
          Datek Holding
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
