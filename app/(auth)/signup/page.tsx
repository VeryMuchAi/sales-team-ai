'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { RESTRICTED_MSG } from '@/lib/auth/whitelist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: allowed, error: rpcError } = await supabase.rpc('is_email_whitelisted', {
      check_email: email.trim(),
    });

    if (rpcError || allowed !== true) {
      toast.error(RESTRICTED_MSG);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
    router.push('/login');
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-sm">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Image
          src="/logo.png"
          alt="Verymuch.Ai"
          width={160}
          height={42}
          className="h-10 w-auto object-contain"
          priority
        />
        <div className="text-center">
          <h1 className="font-jakarta text-2xl font-extrabold text-[#363536]">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Empieza a vender más con IA
          </p>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium text-[#363536]">
            Nombre completo
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Ana García"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="border-[#E5E5E5] bg-white focus-visible:ring-[#AAD4AE]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#363536]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-[#E5E5E5] bg-white focus-visible:ring-[#AAD4AE]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-[#363536]">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="border-[#E5E5E5] bg-white focus-visible:ring-[#AAD4AE]"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A] font-semibold rounded-xl h-10"
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B6B6B]">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-[#5BA66B] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
