'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Phase = 'loading' | 'form' | 'invalid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let resolved = false;

    function markReady() {
      if (cancelled || resolved) return;
      resolved = true;
      setPhase('form');
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        markReady();
      }
    });

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) markReady();
    }

    void checkSession();
    const interval = window.setInterval(() => void checkSession(), 400);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (cancelled || resolved) return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || resolved) return;
        if (session) {
          markReady();
        } else {
          setPhase('invalid');
        }
      });
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Contraseña actualizada');
    router.push('/dashboard');
    router.refresh();
  }

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F7] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#E5E5E5] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-[#6B6B6B]">Validando enlace…</p>
        </div>
      </div>
    );
  }

  if (phase === 'invalid') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F7] px-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#E5E5E5] bg-white p-8 text-center shadow-sm">
          <Image
            src="/logo.png"
            alt="Verymuch.ai"
            width={160}
            height={42}
            className="mx-auto h-10 w-auto object-contain"
          />
          <p className="text-sm text-[#363536]">
            No se pudo validar el enlace. Puede haber expirado o ser inválido.
          </p>
          <p className="text-xs text-[#6B6B6B]">
            Solicita un nuevo enlace desde el inicio de sesión → ¿Olvidaste tu contraseña?
          </p>
          <Button asChild className="w-full bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F7] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="Verymuch.ai"
            width={160}
            height={42}
            className="h-10 w-auto object-contain"
          />
          <h1 className="font-jakarta text-xl font-extrabold text-[#363536]">Nueva contraseña</h1>
          <p className="text-center text-sm text-[#6B6B6B]">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-[#363536]">
              Nueva contraseña
            </Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="border-[#E5E5E5] focus-visible:ring-[#AAD4AE]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-[#363536]">
              Confirmar contraseña
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="border-[#E5E5E5] focus-visible:ring-[#AAD4AE]"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A] font-semibold rounded-xl"
            disabled={loading}
          >
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </Button>
        </form>
      </div>
    </div>
  );
}
