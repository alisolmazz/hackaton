'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, LayoutDashboard, FileText, PieChart, 
  Wallet, Receipt, Settings, Crown, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Panel', href: '/user/dashboard' },
  { icon: FileText, label: 'Firma Bilgileri', href: '/user/firma-bilgileri' },
  { icon: PieChart, label: 'Finansal Rapor', href: '/user/finansal-rapor' },
  { icon: Wallet, label: 'Nakit Akışı', href: '/user/nakit-akis' },
  { icon: Receipt, label: 'Borç / Alacak', href: '/user/borc-alacak', isPremium: true },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-[260px] bg-[#0f4c3a] text-white flex flex-col fixed left-0 top-0 border-r border-[#0a3528] z-40 hidden md:flex shadow-2xl">
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg border border-white/20">
            <Building2 className="h-5 w-5 text-teal-300" />
          </div>
          <span className="text-xl font-bold tracking-tight">Pro Sicht <span className="text-teal-200/70 font-normal">| Firmam</span></span>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-xs font-semibold text-teal-200/50 uppercase tracking-wider mb-4 px-2">MENÜ</div>
        
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative",
                isActive 
                  ? "bg-teal-600/30 text-teal-100 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
                  : "text-teal-100/70 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-teal-400" : "text-teal-400/50 group-hover:text-teal-300")} />
              {item.label}
              
              {item.isPremium && (
                <Lock className="h-3 w-3 ml-auto text-amber-400/70" />
              )}
            </Link>
          );
        })}

      </div>

      {/* ALT MENU (Profil) */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <Link 
          href="/user/profil"
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium",
            pathname === '/user/profil' ? "bg-teal-600/30 text-teal-100 border border-teal-500/30" : "text-teal-100/70 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings className="h-5 w-5 text-teal-400/50" />
          Ayarlar
        </Link>
      </div>
    </div>
  );
}
