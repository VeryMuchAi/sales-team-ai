'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  Settings,
  Sparkles,
  Phone,
  GraduationCap,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const baseNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/prospectos', label: 'Prospectos AI', icon: Sparkles },
  { href: '/dashboard/call-intelligence', label: 'Call Intelligence', icon: Phone },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/icp', label: 'ICP', icon: Target },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

const founderNavItems = [
  { href: '/hub/admin', label: 'Hub (Talento)', icon: GraduationCap },
  { href: '/admin/okrs', label: 'OKRs', icon: LineChart },
];

interface SidebarProps {
  /** Si true, muestra los links de founder (Hub admin + OKR center). */
  isFounder?: boolean;
}

export function Sidebar({ isFounder = false }: SidebarProps) {
  const pathname = usePathname();
  const navItems = isFounder ? [...baseNavItems, ...founderNavItems] : baseNavItems;

  return (
    <aside className="hidden w-64 flex-col border-r border-[#E5E5E5] bg-white md:flex">
      <div className="flex h-16 items-center border-b border-[#E5E5E5] px-6">
        <Link href="/dashboard" className="bg-transparent">
          <Logo />
        </Link>
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
      <div className="border-t border-[#E5E5E5] p-4">
        <p className="text-xs text-[#6B6B6B]">Verymuch.Ai © 2026</p>
      </div>
    </aside>
  );
}
