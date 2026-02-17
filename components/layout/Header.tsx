'use client';

import { useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import { Logo } from './Logo';

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <Logo className="text-lg" />
      </div>
      <div className="hidden md:block" />
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
