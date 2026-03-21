'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { RESTRICTED_MSG } from '@/lib/auth/whitelist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'restricted') {
      toast.error(RESTRICTED_MSG);
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: allowed, error: rpcError } = await supabase.rpc('is_email_whitelisted', {
      check_email: email.trim(),
    });

    if (rpcError || allowed !== true) {
      await supabase.auth.signOut();
      toast.error(RESTRICTED_MSG);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  function openForgotDialog() {
    setResetEmail(email.trim());
    setForgotOpen(true);
  }

  async function handleSendResetLink(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = resetEmail.trim();
    if (!trimmed) {
      toast.error('Introduce tu email');
      return;
    }
    setResetLoading(true);
    const supabase = createClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Si el email existe en el sistema, recibirás un enlace para restablecer la contraseña.');
    setForgotOpen(false);
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
            Bienvenido
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Inicia sesión en tu cuenta
          </p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-[#363536]">
              Contraseña
            </Label>
            <button
              type="button"
              onClick={openForgotDialog}
              className="text-xs font-medium text-[#5BA66B] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-[#E5E5E5] bg-white focus-visible:ring-[#AAD4AE]"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A] font-semibold rounded-xl h-10"
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B6B6B]">
        Acceso restringido al equipo Verymuch.ai
      </p>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="border-[#E5E5E5] sm:max-w-md">
          <form onSubmit={handleSendResetLink}>
            <DialogHeader>
              <DialogTitle className="text-[#363536]">Recuperar contraseña</DialogTitle>
              <DialogDescription className="text-[#6B6B6B]">
                Introduce el email de tu cuenta. Te enviaremos un enlace para elegir una nueva contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <Label htmlFor="reset-email" className="text-[#363536]">
                Email
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="tu@verymuch.ai"
                required
                className="border-[#E5E5E5] focus-visible:ring-[#AAD4AE]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotOpen(false)}
                className="border-[#E5E5E5]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={resetLoading}
                className="bg-[#AAD4AE] text-[#363536] hover:bg-[#95C59A]"
              >
                {resetLoading ? 'Enviando…' : 'Enviar enlace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
