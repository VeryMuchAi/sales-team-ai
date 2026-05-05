'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Target, Settings, Sparkles, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/prospectos', label: 'Prospectos AI', icon: Sparkles },
  { href: '/dashboard/call-intelligence', label: 'Call Intelligence', icon: Phone },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/icp', label: 'ICP', icon: Target },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center border-b border-[#E5E5E5] px-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#D6EDD8] text-[#363536]'
                  : 'text-[#6B6B6B] hover:bg-[#F0EFED] hover:text-[#363536]'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-[#5BA66B]' : 'text-[#6B6B6B]'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
