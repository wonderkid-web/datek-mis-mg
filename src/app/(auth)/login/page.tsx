'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Eye, EyeOff, PhoneCallIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from '../../../../public/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error('Password atau E-mail kamu salah nih!');
      } else if (result?.ok) {
        toast.success('Login berhasil Lur..! Selamat datang kembali.');
        router.push('/');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mencoba login. Coba lagi nanti.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 flex-col gap-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center">
          <Image width={175} height={175} src={logo} alt="Company Logo" className='mx-auto border rounded-xl' />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-3"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="*******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground flex gap-2 flex-col">
            <p>
              Belum ada akun lek? klik aja link ini, nanti masuk ke wa dia, cak
              p kan dulu ketua irfan ini{' '}
            </p>
            <Link
              className="text-primary underline flex gap-2 mx-auto"
              href={
                'https://wa.me/6281396369699?text=Siang%20ndan%2C%20mau%20request%20buat%20akun%20Datek%20nih..'
              }
            >
              WA wak cik kita <PhoneCallIcon className="w-5 h-5" />
            </Link>
          </div>
        </CardContent>
      </Card>
      <p className='text-gray-400'>Developed by WonderKid 🐎</p>
    </div>
  );
}
