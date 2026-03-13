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
    <header className="flex h-16 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5 text-[#363536]" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <Logo />
      </div>
      <div className="hidden md:block" />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Sign out"
        className="text-[#6B6B6B] hover:text-[#363536] hover:bg-[#F0EFED]"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
